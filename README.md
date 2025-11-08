# Talent Co-Pilot

Talent Co-Pilot is an **AI-powered talent recommendation assistant** that helps Project Managers quickly identify the best employees for new projects. Instead of manually checking spreadsheets or asking internal referrals, the manager simply **describes the project in natural language**, and the system uses the **Gemini AI API** to suggest the most suitable employees with clear reasoning.

This project is **frontend-only** and does **not use any backend or database**. Employee data is stored in a local `data.json` file and processed through Gemini for analysis and recommendations.

---

## 🎯 Problem Statement

Project Managers often face challenges such as:

- Manually searching for employees with the right skills
- Bias based on familiarity or limited knowledge of talent pool
- Difficulty matching projects with employee growth aspirations
- Time pressure during staffing decisions

**Talent Co-Pilot** makes this process faster, fairer, and more transparent by turning staffing into a simple AI-assisted workflow.

---

## 👤 User Persona

**Priya**, a Project Manager at a consulting firm.

She wants:

- Quick and accurate talent suggestions
- Transparent reasoning (not a black-box recommendation)
- A simple interface that doesn’t overwhelm her

Talent Co-Pilot is designed **exactly** for her workflow.

---

## ✨ Key Features

| Feature | Description |
|--------|-------------|
| 🧠 Natural Language Input | No forms — the PM just describes what they need |
| 🤖 AI Recommendations | Gemini analyzes employee profiles and finds the best fit |
| 💬 Explainable Output | Shows *why* each employee is recommended |
| 📈 Growth Alignment | Highlights opportunities that support an employee’s development |
| 🚀 No Backend / No Database | Everything runs in the browser using local data + AI |

---

## 🧠 How It Works

1. User types a project requirement (e.g. *“Need a senior Python + AWS engineer for migration”*).
2. The app sends:
   - The project description
   - The employee dataset (skills, experience, aspirations)
   to the **Gemini API**.
3. Gemini analyzes and returns:
   - Top matching employees
   - Match scores
   - Key skill/experience overlap explanation
4. The UI displays the ranked recommendations with reasoning.

---

## 🛠️ Tech Stack

| Component | Technology |
|----------|------------|
| Framework | React (Vite) |
| Styling | Material UI |
| AI Model | Google Gemini API |
| Data Source | Local `data.json` file |
---
