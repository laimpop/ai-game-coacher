// js/main.js - ПОЛНОСТЬЮ ЗАМЕНИТЕ ВЕСЬ ФАЙЛ

document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // --- ЛОГИКА ДЛЯ СТРАНИЦЫ "ЧЕМПИОНЫ" (champion.html) ---
    // =================================================================
    if (document.getElementById('championGrid')) {

        const championInput = document.getElementById('championInput');
        const championGrid = document.getElementById('championGrid');
        const resultArea = document.getElementById('resultArea');
        const suggestionsContainer = document.getElementById('championSuggestions');

        let ALL_CHAMPIONS = [];
        let LATEST_VERSION = '';

        async function fetchAndInitializeChampions() {
            try {
                championGrid.innerHTML = '<p>Загрузка чемпионов из Ущелья Призывателей...</p>';
                const versionsResponse = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
                if (!versionsResponse.ok) throw new Error('Не удалось получить версии игры');
                const versions = await versionsResponse.json();
                LATEST_VERSION = versions[0];

                const championsResponse = await fetch(`https://ddragon.leagueoflegends.com/cdn/${LATEST_VERSION}/data/ru_RU/champion.json`);
                if (!championsResponse.ok) throw new Error('Не удалось получить список чемпионов');
                const championData = await championsResponse.json();

                ALL_CHAMPIONS = Object.values(championData.data).map(champ => ({
                    id: champ.id, name: champ.name, title: champ.title
                }));

                populateChampionGrid();
            } catch (error) {
                console.error("Ошибка при загрузке данных чемпионов:", error);
                championGrid.innerHTML = `<p style="color:var(--error-red)">${error.message}. Попробуйте обновить страницу.</p>`;
            }
        }

        function populateChampionGrid() {
            championGrid.innerHTML = '';
            ALL_CHAMPIONS.forEach(champ => {
                const img = document.createElement('img');
                img.src = `https://ddragon.leagueoflegends.com/cdn/${LATEST_VERSION}/img/champion/${champ.id}.png`;
                img.alt = champ.name;
                img.title = `${champ.name} - ${champ.title}`;
                img.className = 'champion-icon';
                img.dataset.championName = champ.name;

                img.addEventListener('click', () => {
                    document.querySelectorAll('.champion-icon.selected').forEach(el => el.classList.remove('selected'));
                    img.classList.add('selected');
                    championInput.value = champ.name;
                    startAnalysis(champ.name);
                });
                championGrid.appendChild(img);
            });
        }

        function showSuggestions(filteredChamps) {
            suggestionsContainer.innerHTML = '';
            if (filteredChamps.length === 0) {
                suggestionsContainer.style.display = 'none'; return;
            }
            filteredChamps.slice(0, 5).forEach(champ => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.innerHTML = `<img src="https://ddragon.leagueoflegends.com/cdn/${LATEST_VERSION}/img/champion/${champ.id}.png" alt="${champ.name}"><span>${champ.name}</span>`;
                item.addEventListener('click', () => {
                    championInput.value = champ.name;
                    suggestionsContainer.style.display = 'none';
                    startAnalysis(champ.name);
                });
                suggestionsContainer.appendChild(item);
            });
            suggestionsContainer.style.display = 'block';
        }

        async function startAnalysis(championName) {
            if (!championName) {
                resultArea.innerHTML = `<p style="color:var(--error-red)">Введите или выберите имя чемпиона!</p>`; return;
            }
            resultArea.innerHTML = `<p>Подключаюсь к AI... Анализ боевых паттернов для <strong>${championName}</strong>...</p><div class="loader"></div>`;
            try {
                const response = await fetch(`https://ai-game-coacher.onrender.com/api/analyze?champion=${encodeURIComponent(championName)}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Ошибка сервера: ${response.status}`);
                }
                const analysisData = await response.json();
                displayAnalysisResult(championName, analysisData);
            } catch (error) {
                console.error("Ошибка при запросе к бэкенду:", error);
                resultArea.innerHTML = `<p style="color:var(--error-red)">Не удалось получить анализ от AI. Ошибка: ${error.message}</p>`;
            }
        }

        function displayAnalysisResult(championName, data) {
            const highlightsHtml = data.highlights.map(item => `<li>${item}</li>`).join('');
            const strengthsHtml = data.strengths.map(item => `<li>${item}</li>`).join('');
            const weaknessesHtml = data.weaknesses.map(item => `<li>${item}</li>`).join('');
            const analysisHTML = `<h3>${championName} — Детальный анализ от AI</h3><h4 class="highlights">Основные моменты</h4><ul>${highlightsHtml}</ul><h4 class="strengths">Сильные стороны</h4><ul class="strengths">${strengthsHtml}</ul><h4 class="weaknesses">Слабости</h4><ul class="weaknesses">${weaknessesHtml}</ul>`;
            resultArea.innerHTML = analysisHTML;
        }

        championInput.addEventListener('input', () => {
            const query = championInput.value.toLowerCase();
            if (query.length === 0) {
                suggestionsContainer.style.display = 'none'; return;
            }
            const filtered = ALL_CHAMPIONS.filter(champ => champ.name.toLowerCase().startsWith(query));
            showSuggestions(filtered);
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-wrapper')) {
                suggestionsContainer.style.display = 'none';
            }
        });

        fetchAndInitializeChampions();
    }
    const coachingForm = document.getElementById('coachingForm');
    if (coachingForm) {
        const adviceOutput = document.getElementById('adviceOutput');

        coachingForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const champion = document.getElementById('championName').value;
            const role = document.getElementById('roleSelect').value;
            const focus = document.getElementById('focusSelect').value;
            if (!champion) {
                adviceOutput.innerHTML = `<p style="color:var(--error-red)">Пожалуйста, введите имя чемпиона!</p>`; return;
            }
            adviceOutput.innerHTML = `<p>AI-тренер думает над вашим запросом...</p><div class="loader"></div>`;
            try {
                const response = await fetch(`https://ai-game-coacher.onrender.com/api/coaching-tip?role=${role}&champion=${encodeURIComponent(champion)}&focus=${focus}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Ошибка сервера: ${response.status}`);
                }
                const data = await response.json();
                adviceOutput.innerHTML = `<h4>Ваш персональный совет:</h4><p style="font-size: 1.2rem; color: var(--hextech-blue);">${data.tip}</p>`;
            } catch (error) {
                 console.error("Ошибка при запросе совета:", error);
                 adviceOutput.innerHTML = `<p style="color:var(--error-red)">Не удалось получить совет от AI. Ошибка: ${error.message}</p>`;
            }
        });
    }
    const guideModal = document.getElementById('guideModal');
    if (guideModal) {
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        const modalVideoContainer = document.getElementById('modalVideoContainer');
        const closeButton = document.querySelector('.modal-close');
        const guideCards = document.querySelectorAll('.guide-card');

        guideCards.forEach(card => {
            card.addEventListener('click', () => {
                const title = card.getAttribute('data-title');
                const content = card.getAttribute('data-content');
                const videoId = card.getAttribute('data-video-id');

                // 2. Заполняем текстовую часть
                modalTitle.innerHTML = title;
                modalBody.innerHTML = content;

                // 3. Если у карточки есть ID видео, создаем и вставляем плеер
                if (videoId) {
                    modalVideoContainer.innerHTML = `
                        <div class="video-responsive-container">
                            <iframe
                                src="https://www.youtube.com/embed/${videoId}"
                                title="YouTube video player"
                                frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen>
                            </iframe>
                        </div>
                    `;
                } else {
                    // Если видео нет, очищаем контейнер
                    modalVideoContainer.innerHTML = '';
                }

                // 4. Показываем модальное окно
                guideModal.style.display = 'block';
            });
        });

        const closeModal = () => {
            guideModal.style.display = 'none';
            modalVideoContainer.innerHTML = '';
        }

        closeButton.addEventListener('click', closeModal);
        window.addEventListener('click', (event) => {
            if (event.target == guideModal) {
                closeModal();
            }
        });
    }
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const formStatus = document.getElementById('formStatus');

        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();

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
                    contactForm.reset();
                } else {
                    const data = await response.json();
                    throw new Error(data.error || 'Не удалось отправить сообщение.');
                }
            } catch (error) {
                console.error('Ошибка отправки формы:', error);
                formStatus.innerHTML = `<p style="color:var(--error-red)">Произошла ошибка: ${error.message}</p>`;
            }
        });
    }

});