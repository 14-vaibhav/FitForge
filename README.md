# 🏋️ FitForge — AI-Powered Workout Planner

> **Tell us your goals. We'll handle the rest.**

FitForge is a **React-based web application** that generates personalized, coach-quality workout plans on demand using **Google Gemini AI**. Users pick their target muscles, available time, and workout location — and the AI builds a complete, structured session.

---

## ✨ Features

- **🔐 User Authentication** — Securely save your workout data via Firebase.
- **📈 Progressive Overload** — View previous performance per exercise to safely increase weight & reps.
- **🤖 AI Workout Generation** — Gemini creates a tailored plan with 6–12 exercises, complete with YouTube links.
- **🎯 Highly Customizable** — Select from 10 muscle groups, locations (Home/Gym), and durations (30m–3h).
- **🧠 AI Evaluation** — Gemini analyzes your session and gives a performance score + tips.
- **☁️ Cloud Sync** — Your workout history is continuously synced to Firestore across devices.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS 3
- **Backend / DB:** Firebase Auth, Firebase Firestore
- **AI:** Google Gemini API (`@google/genai`)

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or later
- [Google Gemini API Key](https://aistudio.google.com/app/apikey)
- Firebase Project setup

### Install & Run

```bash
git clone <repo-url>
cd FitForge
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.


---

*FitForge — Powered by Google Gemini*
