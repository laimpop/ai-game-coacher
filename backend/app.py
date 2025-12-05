import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv
load_dotenv()
app = Flask(__name__)
CORS(app)
try:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY не найден! Пожалуйста, добавьте его в файл .env")
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-pro')
    print("Модель Gemini успешно инициализирована.")
except Exception as e:
    print(f"Ошибка при инициализации Gemini: {e}")
    model = None
@app.route('/api/analyze', methods=['GET'])
def analyze_champion():
    if not model:
        return jsonify({"error": "Модель AI не инициализирована. Проверьте API ключ и конфигурацию сервера."}), 500
    champion_name = request.args.get('champion')
    if not champion_name:
        return jsonify({"error": "Имя чемпиона не указано"}), 400
    prompt = f"""
Ты — элитный AI-тренер по игре League of Legends с многолетним опытом анализа. 
Твоя задача — дать четкий, структурированный и полезный анализ чемпиона.
Проанализируй чемпиона: {champion_name}.
Предоставь ответ СТРОГО в формате JSON, без каких-либо дополнительных слов или markdown-форматирования (```json ... ```).
Структура JSON должна быть следующей:
{{
  "highlights": ["Ключевой момент 1", "Ключевой момент 2", "Ключевой момент 3"],
  "strengths": ["Сильная сторона 1", "Сильная сторона 2", "Сильная сторона 3"],
  "weaknesses": ["Слабость 1", "Слабость 2", "Слабость 3"]
}}
"""
    try:
        print(f"Отправка запроса для анализа чемпиона: {champion_name}")
        response = model.generate_content(prompt)
        cleaned_response_text = response.text.strip().replace('```json', '').replace('```', '').strip()
        ai_data = json.loads(cleaned_response_text)

        print(f"Получен успешный ответ от AI для: {champion_name}")
        return jsonify(ai_data)

    except json.JSONDecodeError:
        print(f"Ошибка декодирования JSON от AI: {cleaned_response_text}")
        return jsonify({"error": "Не удалось обработать ответ от AI. Ответ не является валидным JSON."}), 500
    except Exception as e:
        print(f"Произошла ошибка при обращении к Gemini API: {e}")
        return jsonify({"error": f"Внутренняя ошибка сервера при обращении к AI: {e}"}), 500


# ДОБАВЬТЕ ЭТО В КОНЕЦ ФАЙЛА backend/app.py

@app.route('/api/coaching-tip', methods=['GET'])
def get_coaching_tip():
    if not model:
        return jsonify({"error": "Модель AI не инициализирована."}), 500

    # Получаем все параметры из запроса
    role = request.args.get('role')
    champion = request.args.get('champion')
    focus = request.args.get('focus')

    if not all([role, champion, focus]):
        return jsonify({"error": "Необходимо указать все параметры: роль, чемпион и аспект для улучшения"}), 400

    # --- Создаем новый, супер-точечный промпт для AI ---
    prompt = f"""
Ты — тренер по League of Legends уровня "Челленджер". 
К тебе обратился игрок за одним конкретным, действенным советом.

Его данные:
- Роль: {role}
- Чемпион: {champion}
- Хочет улучшить: {focus}

Твоя задача: Дай один короткий (2-3 предложения), но очень мощный и практический совет. Говори прямо и по делу. Никакой воды.

Предоставь ответ СТРОГО в формате JSON, без каких-либо дополнительных слов или markdown.
Структура JSON:
{{
  "tip": "Твой сгенерированный совет здесь."
}}
"""
    try:
        print(f"Запрос на совет: Роль={role}, Чемпион={champion}, Фокус={focus}")
        response = model.generate_content(prompt)

        cleaned_response_text = response.text.strip().replace('```json', '').replace('```', '').strip()

        ai_data = json.loads(cleaned_response_text)

        print(f"Совет сгенерирован успешно.")
        return jsonify(ai_data)

    except Exception as e:
        print(f"Ошибка при генерации совета: {e}")
        return jsonify({"error": f"Внутренняя ошибка сервера при генерации совета: {e}"}), 500

# --- 6. Запуск сервера ---

if __name__ == '__main__':
    # debug=True позволяет автоматически перезагружать сервер при изменениях в коде
    app.run(host='0.0.0.0', port=5000, debug=True)