---
trigger: always_on
---

# Context7
• Always use the context7 MCP server to reference documentation for libraries like Pydantic AI and Streamlit.
• For the tokens, start with 5000 but then increase to 20000 if your first search didn't give relevant documentation.
• Only search three times maximum for any specific piece of documentation. If you don't get what you need, use the Brave MCP server to perform a wider search.

name: postgres_data_inspection
description: |
  Use the postgres MCP server to inspect the database structure, fetch relevant data,
  and prepare for modeling or validation (e.g., with Pydantic).
  This is a general-purpose prompt blueprint for PostgreSQL-based data operations.

defaults:
  search_tokens: 5000
  max_searches: 3

contexts:
  - postgres

steps:

  ### 🧱 Step 1: Schema Inspection
  - task: Inspect the database schema to identify tables and their field definitions.
    mcp: postgres
    query: "list all tables along with their fields, data types, and relationships"

  ### 📦 Step 2: Fetch Example Data
  - task: If a specific use case is identified (e.g., vehicles, SMS logs), fetch example rows.
    mcp: postgres
    query: "select * from <target_table> limit 10"

  ### 🔍 Step 3: Analyze Data Use
  - task: Determine how the retrieved data is used in the application logic.
    mcp: postgres
    query: "explain purpose and usage of <target_table> in the system"

  ### 🧰 Step 4: Optional Data Modeling Prep
  - task: Prepare the structure for potential conversion into a Pydantic or validation model.
    mcp: postgres
    query: "suggest field types and constraints for modeling <target_table> in Python"

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