/**
 * MB Engine - Основной JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // ============================================
  // 1. Маска телефона
  // ============================================
  const phoneInput = document.getElementById('phone');

  if (phoneInput) {
    const applyPhoneMask = function(input) {
      let rawValue = input.value.replace(/\D/g, '');
      
      if (rawValue.length === 0) {
        input.value = '';
        return;
      }

      if (rawValue.length <= 4) {
        input.value = '+7 (' + rawValue;
      } else if (rawValue.length <= 8) {
        input.value = '+7 (' + rawValue.slice(0, 3) + ') ' + rawValue.slice(3);
      } else {
        input.value = '+7 (' + rawValue.slice(0, 3) + ') ' + 
                      rawValue.slice(3, 6) + '-' + rawValue.slice(6, 8);
      }
    };

    phoneInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      
      if (value.length > 11) {
        value = value.slice(0, 11);
      }

      if (value.length === 0) {
        e.target.value = '';
      } else if (value.length <= 4) {
        e.target.value = '+7 (' + value;
      } else if (value.length <= 8) {
        e.target.value = '+7 (' + value.slice(0, 3) + ') ' + value.slice(3);
      } else {
        e.target.value = '+7 (' + value.slice(0, 3) + ') ' + 
                          value.slice(3, 6) + '-' + value.slice(6, 8);
      }
    });

    phoneInput.addEventListener('blur', function() {
      if (phoneInput.value === '') {
        phoneInput.value = '';
      } else if (phoneInput.value.length < 12) {
        phoneInput.value = '+7 (' + phoneInput.value.slice(0, 3) + ') ' + 
                          phoneInput.value.slice(3, 6) + '-' + phoneInput.value.slice(6);
      }
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
  // 4. Обработка формы (запись на диагностику)
  // ============================================
  const form = document.querySelector('form[data-form-type="order"]');

  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Валидация
      let isValid = true;
      let errorMessage = '';

      if (!data.name || data.name.trim() === '') {
        isValid = false;
        errorMessage = 'Пожалуйста, введите ваше имя';
      }

      if (!data.phone || data.phone.trim() === '') {
        isValid = false;
        errorMessage = 'Пожалуйста, введите номер телефона';
      } else {
        // Проверка формата телефона (без маски)
        const phoneValue = data.phone.replace(/\D/g, '');
        if (phoneValue.length !== 11 || !phoneValue.startsWith('7')) {
          isValid = false;
          errorMessage = 'Неверный формат телефона';
        }
      }

      if (!isValid) {
        showErrorNotification(errorMessage);
        return;
      }

      try {
        const response = await fetch('/api/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: data.name.trim(),
            phone: data.phone.replace(/\D/g, ''),
            source: 'main_page_form'
          })
        });

        if (response.ok) {
          const result = await response.json();
          
          if (result.success) {
            showSuccessNotification('Ваша заявка отправлена! Мы свяжемся с вами в течение 15 минут.');
            form.reset();
            
            // Сброс маски телефона
            if (phoneInput) {
              phoneInput.value = '';
            }
          } else {
            throw new Error(result.message || 'Ошибка при отправке заявки');
          }
        } else {
          throw new Error('Серверная ошибка: ' + response.status);
        }
      } catch (error) {
        console.error('Ошибка отправки формы:', error);
        showErrorNotification('Произошла ошибка при отправке заявки. Пожалуйста, позвоните нам по телефону: ' + app.locals.contacts.phone);
      }
    });
  }

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
  // Инициализация при загрузке
  // ============================================
  console.log('MB Engine JavaScript загружен успешно');

});
