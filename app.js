require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');

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
} catch (error) {
  console.error('Ошибка загрузки services.json:', error.message);
}

try {
  engines = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'engines.json'), 'utf8'));
} catch (error) {
  console.error('Ошибка загрузки engines.json:', error.message);
}

try {
  portfolio = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'portfolio.json'), 'utf8'));
} catch (error) {
  console.error('Ошибка загрузки portfolio.json:', error.message);
}

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

// API endpoint для обработки заявок
app.post('/api/order', (req, res) => {
  const { name, phone, source } = req.body;

  // Сохраняем заявку в консоль (в реальном проекте — в БД или email)
  console.log('Новая заявка:', { name, phone, source });

  res.json({
    success: true,
    message: 'Заявка успешно отправлена!'
  });
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
    title: 'Портфолио',
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
