require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Подключение EJS как шаблонизатора
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Статические файлы из папки public
app.use(express.static(path.join(__dirname, 'public')));

// Middleware для парсинга POST данных
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Загрузка JSON данных при старте сервера
let services = [];
let engines = [];
let portfolio = [];

try {
  services = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'services.json'), 'utf8'));
  console.log('Услуг загружено:', services.length);
} catch (error) {
  console.error('Ошибка загрузки services.json:', error.message);
}

try {
  engines = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'engines.json'), 'utf8'));
  console.log('Двигателей загружено:', engines.length);
} catch (error) {
  console.error('Ошибка загрузки engines.json:', error.message);
}

try {
  portfolio = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'portfolio.json'), 'utf8'));
  console.log('Портфолио загружено:', portfolio.length);
} catch (error) {
  console.error('Ошибка загрузки portfolio.json:', error.message);
}

// Функция генерации sitemap динамически
function generateSitemap() {
  const baseUrl = process.env.SITE_URL || 'http://mbengine.ru';
  const lastmod = new Date().toISOString();
  
  let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

    <!-- Главная страница -->
    <url>
      <loc>${baseUrl}/</loc>
      <lastmod>${lastmod}</lastmod>
      <priority>1.00</priority>
    </url>

    <!-- Страница услуг -->
    <url>
      <loc>${baseUrl}/services</loc>
      <lastmod>${lastmod}</lastmod>
      <priority>0.80</priority>
    </url>

    <!-- Страница двигателей -->
    <url>
      <loc>${baseUrl}/engines</loc>
      <lastmod>${lastmod}</lastmod>
      <priority>0.80</priority>
    </url>`;

  // Добавляем страницы портфолио для каждого двигателя
  if (portfolio && portfolio.length > 0) {
    sitemapContent += `\n\n    <!-- Портфолио ремонтов -->`;
    portfolio.forEach((item, index) => {
      const engineName = item.engine || `engine-${index + 1}`;
      sitemapContent += `
    <url>
      <loc>${baseUrl}/portfolio/${encodeURIComponent(engineName)}</loc>
      <lastmod>${lastmod}</lastmod>
      <priority>0.60</priority>
    </url>`;
    });
  }

  sitemapContent += `
  
    <!-- Страница контактов -->
    <url>
      <loc>${baseUrl}/contacts</loc>
      <lastmod>${lastmod}</lastmod>
      <priority>0.70</priority>
    </url>
  </urlset>`;

  return sitemapContent;
}

// API endpoint для получения динамического sitemap
app.get('/sitemap.xml', (req, res) => {
  const sitemap = generateSitemap();
  res.set({
    'Content-Type': 'application/xml',
    'Cache-Control': 'no-cache'
  });
  res.send(sitemap);
});

// API endpoint для получения robots.txt динамически
app.get('/robots.txt', (req, res) => {
  const robotsContent = `User-agent: *
Allow: /

# Карта сайта для поисковых роботов
Sitemap: ${process.env.SITE_URL || 'http://mbengine.ru'}/sitemap/sitemap-index.xml

# Метрики и аналитика (разрешаем)
Allow: /api/order

# Запрещаем доступ к статическим файлам, если они не нужны роботам
Disallow: /images/
Disallow: /js/`;

  res.set({
    'Content-Type': 'text/plain'
  });
  res.send(robotsContent);
});

// Глобальная переменная для хранения данных услуг
app.locals.data = {
  services: services,
  engines: engines,
  portfolio: portfolio
};

// Контакты автосервиса
app.locals.contacts = {
  phone: '+7 (495) 123-45-67',
  email: 'info@mercedes-service.ru',
  address: 'г. Москва, ул. Автомобильная, д. 10',
  workingHours: 'Пн-Пт: 09:00-18:00, Сб: 10:00-16:00, Вс: выходной'
};

// Базовый маршрут GET /
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'views', 'index.ejs');
  const content = fs.readFileSync(indexPath, 'utf8');
  res.render('layout', {
    title: 'Автосервис Mercedes-Benz',
    body: content
  });
});

// API endpoint для обработки заявок с отправкой на почту
app.post('/api/order', async (req, res) => {
  const { name, phone, source } = req.body;

  try {
    // Настройка транспортера для отправки email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.yandex.ru',
      port: process.env.SMTP_PORT || 465,
      secure: true, // true для 465, false для 587
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    });

    // Сообщение с заявкой
    const mailOptions = {
      from: `${process.env.SMTP_USER || 'mbengine.workshop@yandex.ru'}`,
      to: process.env.EMAIL_TO || 'mbengine.workshop@yandex.ru',
      subject: `Новая заявка с сайта (${source || 'Общая'}) - ${name}`,
      html: `
        <h2>Новая заявка с сайта</h2>
        <p><strong>Имя:</strong> ${name}</p>
        <p><strong>Телефон:</strong> ${phone}</p>
        <p><strong>Источник:</strong> ${source || 'Общая'}</p>
        <hr>
        <p class="text-sm text-gray-500">Заявка поступила: ${new Date().toLocaleString()}</p>
      `
    };

    // Отправка email (если SMTP настроен)
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
      console.log('Email отправлен успешно');
    } else {
      console.log('SMTP не настроен. Email не будет отправлен.');
      console.log('Добавьте в .env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_TO');
    }

    res.json({
      success: true,
      message: 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.'
    });
  } catch (error) {
    console.error('Ошибка отправки заявки:', error.message);
    res.status(500).json({
      success: false,
      message: 'Произошла ошибка при обработке заявки'
    });
  }
});

// Маршруты для страниц
app.get('/services', (req, res) => {
  const servicesPath = path.join(__dirname, 'views', 'services.ejs');
  const content = fs.readFileSync(servicesPath, 'utf8');
  res.render('layout', {
    title: 'Услуги',
    body: content
  });
});

app.get('/portfolio', (req, res) => {
  const portfolioPath = path.join(__dirname, 'views', 'portfolio.ejs');
  const content = fs.readFileSync(portfolioPath, 'utf8');
  res.render('layout', {
    title: 'Портфолио ремонтов двигателей',
    body: content
  });
});

app.get('/contacts', (req, res) => {
  const contactsPath = path.join(__dirname, 'views', 'contacts.ejs');
  const content = fs.readFileSync(contactsPath, 'utf8');
  res.render('layout', {
    title: 'Контакты',
    body: content
  });
});

app.get('/engines', (req, res) => {
  const enginesData = app.locals.data.engines || [];
  console.log('Передаем двигателей:', enginesData.length); // Отладка
  
  // Рендерим engines.ejs с данными
  res.render('engines', { engines: enginesData }, (err, enginesHtml) => {
    if (err) {
      console.error('Ошибка рендеринга engines.ejs:', err);
      return res.status(500).send('Ошибка загрузки страницы двигателей');
    }
    
    // Рендерим layout с полученным HTML
    res.render('layout', {
      title: 'Двигатели Mercedes-Benz',
      body: enginesHtml
    });
  });
});

// Обработка ошибок 404
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Страница не найдена</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-[#0a0a0a] text-white min-h-screen flex items-center justify-center">
      <div class="text-center px-4">
        <h1 class="text-6xl font-bold mb-4 text-accent">404</h1>
        <h2 class="text-2xl mb-4">Страница не найдена</h2>
        <p class="text-gray-400 mb-6">Извините, запрошенная страница не существует.</p>
        <a href="/" class="inline-block bg-accent hover:bg-yellow-700 text-black font-bold py-3 px-8 rounded-lg transition-all">
          Вернуться на главную
        </a>
      </div>
    </body>
    </html>
  `);
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Ожидание запросов...`);
});
