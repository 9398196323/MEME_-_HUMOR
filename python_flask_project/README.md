# Meme and Humor Idea Generator

**An AI-Powered Full-Stack Web Application for Creative Meme Concepts, Captions, and Relatable Humor**

Developed for College Computer Science & Engineering Demonstration and Real-World Content Creation.

---

##  1. Project Overview

The **Meme and Humor Idea Generator** is an AI-powered system designed to solve the creative block faced by content creators, students, and meme enthusiasts. Utilizing the **Google Gemini API** (`gemini-2.5-flash`), **Python Flask**, and **SQLite**, the application generates context-aware meme concepts, punchy social media captions, and jokes across multiple humor styles, intensities, and languages (English, Tamil, and Tanglish).

To guarantee **100% uptime and resilience**, the system features an intelligent **Offline Template Fallback Engine** that seamlessly produces structured, hilarious results even when the internet is disconnected, API quota is exhausted, or no API key is provided.

---

##  2. System Architecture & Tech Stack

```
   ┌────────────────────────────────────────────────────────┐
   │                  CLIENT INTERFACE                     │
   │  HTML5 • CSS3 Modern Card UI • Vanilla JS • Responsive │
   └──────────────────────────┬─────────────────────────────┘
                              │ HTTP / JSON REST Calls
   ┌──────────────────────────▼─────────────────────────────┐
   │                 FLASK REST API BACKEND                 │
   │           Routes: /api/generate, /api/captions,        │
   │           /api/jokes, /api/favorites, /api/history     │
   └─────────────┬───────────────────────────┬──────────────┘
                 │                           │
   ┌─────────────▼──────────────┐  ┌─────────▼──────────────┐
   │    GOOGLE GEMINI API       │  │   OFFLINE FALLBACK     │
   │  SDK: google-genai 1.3.0   │  │   Local Templates &    │
   │  Structured JSON Schemas   │  │   Humor Pattern Engine │
   └────────────────────────────┘  └────────────────────────┘
                 │                           │
                 └─────────────┬─────────────┘
                               │
   ┌───────────────────────────▼────────────────────────────┐
   │                 SQLITE3 PERSISTENCE LAYER              │
   │           Tables: 'favorites' and 'history'            │
   └────────────────────────────────────────────────────────┘
```

### Technology Breakdown
- **Backend Framework:** Python 3.10+ / Flask 3.1.0
- **AI Integration:** Google GenAI Python SDK (`google-genai`)
- **Database:** SQLite3 with parameterized queries and index optimization
- **Frontend:** HTML5, CSS3 Custom Theme (Dark Mode, Meme Visual Cards), JavaScript ES6
- **Testing:** Python `unittest` & `pytest`

---

## ️ 3. Installation and Setup Instructions (VS Code)

### Step 1: Open the Project in Visual Studio Code
Open your terminal and navigate to the project directory:
```bash
cd python_flask_project
```

### Step 2: Create and Activate a Virtual Environment
```bash
# On Linux / macOS
python3 -m venv venv
source venv/bin/activate

# On Windows (Command Prompt or PowerShell)
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Required Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables
Copy the example environment configuration:
```bash
# On Linux / macOS
cp .env.example .env

# On Windows
copy .env.example .env
```
Open `.env` and add your Gemini API Key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
FLASK_DEBUG=1
PORT=5000
```
*(Note: If you do not have an API key, leave it blank; the app will automatically run on the offline fallback engine!)*

### Step 5: Run the Application
```bash
python app.py
```
Open your web browser and visit: **http://127.0.0.1:5000**

---

##  4. Running Automated Tests

The project includes an automated test suite verifying database CRUD operations, REST API contracts, input validation, and fallback mechanisms:

```bash
# Run using Python's built-in test runner
python -m unittest discover tests

# Or run using pytest
pytest tests/
```

Expected output:
```
test_database_initialization ... ok
test_save_and_retrieve_favorite ... ok
test_search_and_delete_favorite ... ok
test_history_logging_and_clearing ... ok
test_health_endpoint ... ok
test_generate_meme_ideas_fallback ... ok
test_generate_meme_ideas_validation ... ok
test_tanglish_generation ... ok
test_captions_endpoint ... ok
test_jokes_endpoint ... ok
test_favorites_crud ... ok

----------------------------------------------------------------------
Ran 11 tests in 0.42s

OK
```

---

##  5. REST API Documentation

| Endpoint | Method | Description | Sample Payload |
|---|---|---|---|
| `/api/health` | GET | Health status and AI provider configuration | None |
| `/api/generate` | POST | Generates 5 meme ideas | `{"topic": "Exams", "category": "College", "language": "English"}` |
| `/api/refine` | POST | Refines an idea (funnier/shorter/etc.) | `{"idea": {...}, "instruction": "make it funnier"}` |
| `/api/captions` | POST | Generates 5 social media captions | `{"topic": "Monday Blues", "tone": "Witty"}` |
| `/api/jokes` | POST | Generates 5-10 jokes | `{"category": "Programming", "count": 5}` |
| `/api/favorites` | GET | Lists all saved ideas | Optional `?search=term` |
| `/api/favorites` | POST | Saves an idea to SQLite | `{"topic": "...", "content": {...}}` |
| `/api/favorites/<id>` | DELETE | Deletes a saved idea | None |
| `/api/history` | GET | Returns recent generation history | None |
| `/api/history` | DELETE | Clears generation history | None |

---

##  6. College Project Viva & Evaluation Notes

### Key Highlights for Demonstrators & Evaluators:
1. **Zero-Failure Architecture:** If the Google Gemini API key is missing or quota is exceeded, the fallback service dynamically takes over without throwing a 500 server error.
2. **Multi-Lingual Localization:** Native support for English, Tamil script, and conversational Tanglish (Tamil in Latin script with colloquial phrases like *"Machi"*, *"Semma"*, *"Attendance tension"*).
3. **Meme Visual Preview:** Ideas are rendered as classic top-text / bottom-text cards with scene descriptions, captions, and hashtags.
4. **Data Persistence:** SQLite database automatically creates tables and indexes on first boot, storing favorites and tracking generation history.
