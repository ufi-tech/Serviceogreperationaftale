---
trigger: always_on
---

# Context7
• Always use the context7 MCP server to reference documentation for libraries like Pydantic AI and Streamlit.
• For the tokens, start with 5000 but then increase to 20000 if your first search didn't give relevant documentation.
• Only search three times maximum for any specific piece of documentation. If you don't get what you need, use the Brave MCP server to perform a wider search.


# Project Awareness & Context
• Always read PLANNING.md at the start of a new conversation to understand the project's architecture, goals, style, and constraints.
• Check TASK.md before starting a new task. If the task isn't listed, add it with a brief description and today's date.
• Use consistent naming conventions, file structure, and architecture patterns as described in PLANNING.md.

# Code Structure & Modularity
• Never create a file longer than 500 lines of code. If a file approaches this limit, refactor by splitting it into modules or helper files.
• Use clear, consistent imports (prefer relative imports within packages).

### ✅ Task Completion
- **Mark completed tasks in `TASK.md`** immediately after finishing them.
- Add new sub-tasks or TODOs discovered during development to `TASK.md` under a “Discovered During Work” section.

### 📎 Style & Conventions
- **Use Python** as the primary language.
- **Follow PEP8**, use type hints, and format with `black`.
- **Use `pydantic` for data validation**.