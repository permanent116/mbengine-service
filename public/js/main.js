/**
 * MB Engine - Основной JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // ============================================
  // 1. Маска телефона (без автоматического добавления +7)
  // ============================================
  const phoneInput = document.getElementById('phone');

  if (phoneInput) {
    // Обработчик input - применяем маску к уже введённым цифрам
    phoneInput.addEventListener('input', function(e) {
      // Получаем только цифры из значения
      let digits = e.target.value.replace(/\D/g, '');
      
      // Если поле пустое - ничего не делаем
      if (digits.length === 0) {
        return;
      }

      // Ограничение длины до 18 цифр (для +7 (000) 000-00-00)
      if (digits.length > 19) {
        digits = digits.slice(0, 19);
      }

      // Применяем маску только к уже введённым цифрам, без добавления +7
      let formattedValue = '';
      
      if (digits.length <= 3) {
        formattedValue = digits;
      } else if (digits.length <= 6) {
        formattedValue = '(' + digits.slice(0, 3) + ') ' + digits.slice(3);
      } else if (digits.length <= 9) {
        formattedValue = '(' + digits.slice(0, 3) + ') ' +
                            digits.slice(3, 6) + '-' + digits.slice(6, 9);
      } else if (digits.length <= 12) {
        formattedValue = '(' + digits.slice(0, 3) + ') ' +
                            digits.slice(3, 6) + '-' + digits.slice(6, 8) + '-' + digits.slice(8, 10);
      } else if (digits.length <= 14) {
        formattedValue = '(' + digits.slice(0, 3) + ') ' +
                            digits.slice(3, 6) + '-' + digits.slice(6, 8) + '-' + digits.slice(8, 12);
      } else if (digits.length <= 18) {
        formattedValue = '(' + digits.slice(0, 3) + ') ' +
                            digits.slice(3, 6) + '-' + digits.slice(6, 8) + '-' + digits.slice(8, 14);
      }
      
      e.target.value = formattedValue;
    });

    // Обработчик focus - удаляем +7 при возврате фокуса (как в contacts.ejs)
    phoneInput.addEventListener('focus', function(e) {
      const value = this.value;
      // Удаляем +7 из начала значения
      this.value = value.replace(/^\+7\s*/, '');
      // Сбрасываем курсор в конец
      this.setSelectionRange(this.value.length, this.value.length);
    });

    // Обработчик paste - удаляем +7 из вставленного текста (как в contacts.ejs)
    phoneInput.addEventListener('paste', function(e) {
      e.preventDefault();
      const clipboardData = (e.originalEvent || e).clipboardData.getData('text');
      this.value = this.value.replace(/^\+7\s*/, '') + clipboardData;
    });
  }

  // ============================================
  // 2. Мобильное меню
  // ============================================
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      const isHidden = mobileMenu.classList.contains('hidden');
      
      if (isHidden) {
        mobileMenu.classList.remove('hidden');
        mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
      } else {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
      }
    });

    // Закрыть меню при клике на ссылку
    const menuLinks = mobileMenu.querySelectorAll('a');
    menuLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
      });
    });
  }

  // ============================================
  // 3. Плавная прокрутка к якорям
  // ============================================
  const smoothScrollSelectors = [
    'a[href^="#"]',
    'a[href="/#"]'
  ];

  smoothScrollSelectors.forEach(function(selector) {
    document.querySelectorAll(selector).forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        const href = anchor.getAttribute('href');
        
        // Пропускаем # и /#
        if (href === '#' || href === '/#') {
          return;
        }

        e.preventDefault();

        const targetId = href === '/' + href ? href.slice(1) : href.slice(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          const headerOffset = 80;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  });


  // ============================================
  // 5. Анимация при скролле (Intersection Observer)
  // ============================================
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Наблюдать за элементами с классом .fade-in
  document.querySelectorAll('.fade-in').forEach(function(element) {
    element.classList.remove('fade-in'); // Убираем fade-in, чтобы не конфликтовало
    element.classList.add('animate-on-scroll'); // Добавляем наш класс
    observer.observe(element);
  });

  // ============================================
  // 6. Модальное окно для видео в портфолио
  // ============================================
  const videoPreviews = document.querySelectorAll('[data-video-type="modal"]');

  if (videoPreviews.length > 0) {
    videoPreviews.forEach(function(preview) {
      preview.addEventListener('click', function() {
        const videoUrl = this.getAttribute('data-video-url');
        openVideoModal(videoUrl);
      });
    });
  }

  // ============================================
  // Вспомогательные функции
  // ============================================

  /**
   * Показать уведомление об ошибке
   */
  function showErrorNotification(message) {
    // Удаляем существующие уведомления
    removeNotifications();

    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 z-[100] bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg fade-in';
    notification.innerHTML = `
      <div class="flex items-center">
        <i class="fas fa-exclamation-circle mr-3"></i>
        <span>${message}</span>
      </div>
    `;

    document.body.appendChild(notification);

    // Удалить через 5 секунд
    setTimeout(function() {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(function() {
        notification.remove();
      }, 300);
    }, 5000);
  }

  /**
   * Показать уведомление об успехе
   */
  function showSuccessNotification(message) {
    // Удаляем существующие уведомления
    removeNotifications();

    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 z-[100] bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg fade-in';
    notification.innerHTML = `
      <div class="flex items-center">
        <i class="fas fa-check-circle mr-3"></i>
        <span>${message}</span>
      </div>
    `;

    document.body.appendChild(notification);

    // Удалить через 4 секунды
    setTimeout(function() {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(function() {
        notification.remove();
      }, 300);
    }, 4000);
  }

  /**
   * Удалить все уведомления
   */
  function removeNotifications() {
    const existingNotifications = document.querySelectorAll('.notification-toast');
    existingNotifications.forEach(function(el) {
      el.remove();
    });
  }

  /**
   * Открыть модальное окно с видео
   */
  function openVideoModal(videoUrl) {
    // Проверка, является ли URL YouTube embed
    const isYouTubeEmbed = videoUrl.startsWith('https://www.youtube.com/embed/') || 
                          videoUrl.startsWith('https://youtu.be/');

    if (isYouTubeEmbed) {
      // Для YouTube нужно извлечь ID видео
      let videoId = videoUrl;
      
      if (videoUrl.includes('/embed/')) {
        videoId = videoUrl.split('/embed/')[1].split('?')[0];
      } else if (videoUrl.includes('/watch?v=')) {
        videoId = videoUrl.split('v=')[1].split('&')[0];
      } else if (videoUrl.startsWith('youtu.be/')) {
        videoId = videoUrl.split('/').pop();
      }

      const modalContent = `
        <div class="relative w-full h-full bg-black">
          <iframe 
            src="${videoUrl}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            class="w-full h-full"
          ></iframe>
        </div>
      `;
    } else {
      // Для других видео используем заглушку
      const modalContent = `
        <div class="relative w-full h-full flex items-center justify-center bg-gray-900">
          <p class="text-white text-lg">Видео не доступно</p>
        </div>
      `;
    }

    // Показать модальное окно (простая реализация)
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[200] bg-black/80 flex items-center justify-center fade-in';
    overlay.innerHTML = `
      <div class="relative w-full max-w-4xl h-[90vh] bg-black rounded-lg overflow-hidden">
        ${modalContent}
        
        <button 
          class="absolute top-4 right-4 text-white hover:text-red-500 transition-colors z-10"
          onclick="closeVideoModal()"
        >
          <i class="fas fa-times text-2xl"></i>
        </button>
      </div>
    `;

    document.body.appendChild(overlay);

    // Закрыть при клике вне контента
    overlay.querySelector('div').addEventListener('click', function(e) {
      if (e.target === overlay) {
        closeVideoModal();
      }
    });
  }

  /**
   * Закрыть модальное окно видео
   */
  window.closeVideoModal = function() {
    const existingModals = document.querySelectorAll('.video-modal-overlay');
    existingModals.forEach(function(modal) {
      modal.remove();
    });
  };

  // ============================================
  // 4. Обработчик формы заявки на главной странице
  // ============================================
  const quickOrderForm = document.getElementById('quickOrderForm');

  if (quickOrderForm) {
    quickOrderForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const form = this;
      const nameInput = form.querySelector('#name');
      const phoneInput = form.querySelector('#phone');
      const loadingSpinner = form.querySelector('#loadingSpinner');
      const successMessage = form.querySelector('#successMessage');
      const errorMessage = form.querySelector('#errorMessage');
      
      // Сброс состояний
      removeNotifications();
      successMessage.classList.add('hidden');
      errorMessage.classList.add('hidden');
      
      // Получаем данные формы
      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      
      // Показываем спиннер загрузки
      loadingSpinner.classList.remove('hidden');
      
      try {
        // Отправляем данные на сервер
        const response = await fetch('/api/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: name,
            phone: phone,
            source: 'Главная страница'
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Показываем сообщение об успехе
          successMessage.classList.remove('hidden');
          
          // Очищаем форму
          form.reset();
        } else {
          // Показываем сообщение об ошибке
          const errorMsg = data.message || 'Произошла ошибка при отправке заявки';
          errorMessage.querySelector('#errorMessageText').textContent = errorMsg;
          errorMessage.classList.remove('hidden');
        }
      } catch (error) {
        console.error('Ошибка отправки:', error);
        const errorMsg = 'Не удалось отправить заявку. Пожалуйста, попробуйте позже или свяжитесь с нами по телефону.';
        errorMessage.querySelector('#errorMessageText').textContent = errorMsg;
        errorMessage.classList.remove('hidden');
      } finally {
        // Скрываем спиннер
        loadingSpinner.classList.add('hidden');
      }
    });
  }

  // ============================================
  // Инициализация при загрузке
  // ============================================
  console.log('MB Engine JavaScript загружен успешно');

});
