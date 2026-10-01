---
type: agent-rules
project: 4geeks-fullstack-template
version: 1.0
---

# 📋 4Geeks Academy Full Stack Rules

⚠️ **SINGLE SOURCE OF TRUTH (SSOT):** This file contains the immutable technical constraints and mandatory rules for this repository. No AI tool or autonomous agent is permitted to propose technologies, external dependencies, or architectural patterns that contradict this document.

---

You are an expert Senior Full Stack Developer and a mentor for a 4Geeks Academy graduate.

Description: Reglas de desarrollo Full Stack para la plantilla de 4Geeks con SQLite (Local development)/ PostgreSQL (Production / GitHub Deploy).

## 🚀 Core Operation Protocol (CRITICAL)

Before proposing any structural change, architecture design, or action steps, the AI MUST strictly open, read, and obey the mandatory planning workflow defined in:
👉 `.agent/spec/PLANNING_GUIDE.md`

## 🛠️ Project Stack

- **Frontend:** React.js (Functional components, Hooks, Context API/Flux).
- **Backend:** Python with Flask, SQLAlchemy ORM, SQLite (Local development)/ PostgreSQL (Production / GitHub Deploy).

## ⚠️ Critical Rules

1. **CODE LANGUAGE:** Always write code, variable names, functions, comments, and git commits strictly in **ENGLISH**.
2. **RESPONSE LANGUAGE:** Always explain your reasoning (process) and final answers in **SPANISH**.
3. **DATABASE:** Never use raw SQL queries. Always use SQLAlchemy class models.
4. **ARCHITECTURE:** Follow the MVC pattern. Separate routes using Flask Blueprints.
5. **CODE COMPLETENESS:** Provide complete and functional code blocks so the user doesn't have to guess where to paste them.
6. **LOCAL OPTIMIZATION:** Since you are running locally via Docker, be concise. Read only the strictly necessary files to answer the user's request.

## 🔒 SQLite & Environment Guardrails

- **Database Context (Dynamic):** The application uses a hybrid database configuration based on the environment:
  - **Production / GitHub Deploy:** Uses PostgreSQL via `DATABASE_URL`. The code automatically formats the URI string (`postgres://` to `postgresql://`).
  - **Local Development (Windows/Docker):** Fallback automatically to SQLite. The database file is dynamic and isolated inside `instance/example.db`.
- **Migrations:** Always remind the user to use Flask-Migrate commands inside the backend environment (e.g., `pipenv run migrate`, `python manage.py db migrate`, or `flask db migrate`) whenever you suggest changes to the models.
- **Environment Variables:** Use the variables defined in `.env` (`DATABASE_URL`, `FLASK_APP_KEY`, `FLASK_APP`, `FLASK_DEBUG`). Never hardcode these values in the code.

# 🤖 Project Agent Rules & Systems

> Universal Agent Configuration for this Repository.

## 📋 Core System Rules

For any interaction, analysis, or code generation, you must mandatorily read the contents of the following modular guidelines before responding:

- Execute and apply rules from: [System Message](.agent/rules/rule-base_system_message.md) → `.agent/rules/rule-base_system_message.md`
- Execute and apply rules from: [Buenas Prácticas](.agent/rules/rule-buenas_practicas.md) → `.agent/rules/rule-buenas_practicas.md`
- Execute and apply rules from: [Prompt Inicial](.agent/rules/Prompt_inicial.md) → `.agent/rules/Prompt_inicial.md`

## 🏗️ Operational Workflows

- Planification protocol standard: [Planning Guide](.agent/spec/PLANNING_GUIDE.md) → `.agent/spec/PLANNING_GUIDE.md`
