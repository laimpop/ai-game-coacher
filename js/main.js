// js/main.js - ПОЛНОСТЬЮ ЗАМЕНИТЕ ВЕСЬ ФАЙЛ

document.addEventListener('DOMContentLoaded', () => {

    // ... (весь код для champion.html, coaching.html, learn.html остается здесь без изменений) ...
    // Я его скрыл для краткости, но в вашем файле он должен быть!
    
    // =================================================================
    // --- ЛОГИКА ДЛЯ СТРАНИЦЫ "ЧЕМПИОНЫ" (champion.html) ---
    // =================================================================
    if (document.getElementById('championGrid')) {
        // ... весь ваш код для страницы чемпионов ...
    }

    // =================================================================
    // --- ЛОГИКА ДЛЯ СТРАНИЦЫ "СОВЕТЫ" (coaching.html) ---
    // =================================================================
    const coachingForm = document.getElementById('coachingForm');
    if (coachingForm) {
        // ... весь ваш код для страницы советов ...
    }

    // =================================================================
    // --- ЛОГИКА ДЛЯ СТРАНИЦЫ "ОБУЧЕНИЕ" (learn.html) С ВИДЕО ---
    // =================================================================
    const guideModal = document.getElementById('guideModal');
    if (guideModal) {
        // ... весь ваш код для страницы обучения ...
    }


    // =================================================================
    // --- НОВАЯ ЛОГИКА ДЛЯ СТРАНИЦЫ "КОНТАКТЫ" (contact.html) ---
    // =================================================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const formStatus = document.getElementById('formStatus');

        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Останавливаем стандартную отправку

            const formData = new FormData(contactForm);
            formStatus.innerHTML = `<p>Отправка сообщения...</p>`;

            try {
                const response = await fetch(contactForm.action, {
                    method: contactForm.method,
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    formStatus.innerHTML = `<p style="color:var(--success-green)">Спасибо! Ваше сообщение успешно отправлено.</p>`;
                    contactForm.reset(); // Очищаем поля формы
                } else {
                    // Formspree может вернуть ошибку, если что-то пошло не так
                    const data = await response.json();
                    throw new Error(data.error || 'Не удалось отправить сообщение.');
                }
            } catch (error) {
                console.error('Ошибка отправки формы:', error);
                formStatus.innerHTML = `<p style="color:var(--error-red)">Произошла ошибка: ${error.message}</p>`;
            }
        });
    }

}); // Конец всего скрипта