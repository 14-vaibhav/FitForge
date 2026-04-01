# 🏋️ FitForge — AI-Powered Workout Planner

> **Tell us your goals. We'll handle the rest.**

FitForge is a **React-based web application** that generates personalized, coach-quality workout plans on demand using **Google Gemini AI**. Users pick their target muscles, available time, and workout location — and the AI builds a complete, structured session with step-by-step instructions, pro tips, and YouTube tutorial links for every exercise.

---

## 📌 Table of Contents

- [Demo Overview](#-demo-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Components Explained](#-components-explained)
- [Services Explained](#-services-explained)
- [How It Works (User Flow)](#-how-it-works-user-flow)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)

---

## 🎥 Demo Overview

FitForge runs entirely in the browser. Here's what a typical session looks like:

1. **Setup** → Choose muscles, duration & location
2. **Session** → Follow AI-generated exercises one by one, log your performance
3. **Summary** → Get an AI evaluation of your workout with scores and recommendations

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 AI Workout Generation | Google Gemini creates a tailored plan with 6–12 exercises |
| 🎯 Target Muscle Selection | Choose from 10 muscle groups (Chest, Back, Core, Cardio, etc.) |
| ⏱️ Flexible Duration | Sessions from 30 minutes to 3 hours |
| 🏠 / 🏋️ Location-Aware | Home (bodyweight) or Gym (full equipment) modes |
| 🔄 AI Exercise Replacement | Don't like an exercise? Swap it with a new AI suggestion |
| 📓 Performance Logging | Log sets, reps, weight, distance, heart rate, and notes |
| ⏩ Skip & Navigate | Skip exercises or jump to any one from the navigator |
| 📊 Session Summary | View completion stats and a detailed exercise log |
| 🧠 AI Evaluation | Gemini analyzes your session and gives a performance score + tips |
| 📺 YouTube Integration | Every exercise links directly to a tutorial video on YouTube |
| 🔒 Privacy First | All session data stays local in your browser |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS 3 |
| **AI Backend** | Google Gemini API (`@google/genai`) |
| **Model Used** | `gemini-3.1-flash-lite-preview` |
| **Language** | JavaScript (JSX) |
| **Fonts** | Syne, DM Sans, Space Mono (Google Fonts) |

---

## 📁 Project Structure

```
FitForge/
├── public/                     # Static assets
├── src/
│   ├── components/             # UI components (screens)
│   │   ├── WorkoutSetup.jsx    # Step 1 — Setup form
│   │   ├── WorkoutSession.jsx  # Step 2 — Active workout screen
│   │   └── WorkoutSummary.jsx  # Step 3 — Post-workout summary
│   ├── services/
│   │   └── gemini.js           # All Gemini AI API calls
│   ├── App.jsx                 # Root component — manages app state & routing
│   ├── index.css               # Global styles & design tokens
│   └── main.jsx                # React entry point
├── index.html                  # HTML shell
├── .env                        # API key (not committed to git)
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 🧩 Components Explained

### 1. `WorkoutSetup.jsx` — The Planner Form
**Purpose:** This is the landing screen of the app. The user configures their workout here before generation.

**What it does:**
- Displays the **FitForge** brand header with the AI-powered badge
- **Step 01 — Target Muscles:** A grid of 10 toggleable muscle group buttons (Chest 🙅‍♂️, Back 🦍, Shoulders 🏋️, Biceps 💪, Triceps 🔱, Legs 🦵, Glutes 🍑, Core ⚡, Cardio 🏃, Full Body 🌟). Multiple selections are allowed.
- **Step 02 — Time Available:** A dropdown to select one of 7 preset durations (30 min → 3 hrs), each with a descriptive sublabel (e.g. "Quick session", "Beast mode")
- **Step 03 — Location:** Two large card buttons — **Home** (bodyweight & bands) or **Gym** (full equipment)
- The submit button dynamically reflects selected muscles (e.g. "Generate Chest + Core Workout") and shows a loading spinner while the AI generates

**Key state:**
```jsx
const [selectedParts, setSelectedParts] = useState([]); // selected muscle groups
const [duration, setDuration]           = useState(60);  // workout duration in minutes
const [location, setLocation]           = useState('Gym'); // Home or Gym
```

---

### 2. `WorkoutSession.jsx` — The Active Workout Screen
**Purpose:** This is the main workout experience. The user follows each exercise one by one.

**What it does:**
- **Top bar:** Shows selected muscle groups, duration, location, and exercises remaining
- **Progress bar:** A visual indicator of session completion (%)
- **Exercise Navigator:** A row of numbered dots — tap any number to jump to that exercise. Color-coded: ⬜ pending | 🟠 current | ✅ done | ➖ skipped
- **Exercise Card:** Displays the current exercise with:
  - Name, target muscle, category badge (Strength / Cardio / Flexibility / HIIT) and difficulty badge (Beginner / Intermediate / Advanced)
  - Stats grid: Duration ⏱, Sets ×, Reps ↕, Rest ⏸
  - Step-by-step instructions
  - Pro tip from the trainer
  - YouTube tutorial link (opens in new tab)
- **Action Buttons:**
  - ✓ **Mark Complete** → opens the Log Modal
  - ↻ **Different Exercise** → triggers AI to suggest a replacement (live swap)
  - **Skip** → marks as skipped and moves on

**Log Modal (sub-component):**  
A pop-up form that captures actual performance. Smart — shows different fields for strength vs cardio:
- Strength: Sets completed, reps per set, weight used, notes
- Cardio: Duration completed, distance (optional), heart rate (optional), notes

**Internal helper components:**
- `CategoryBadge` — color-coded badge for exercise category
- `DifficultyBadge` — color-coded badge for difficulty level
- `StatBox` — reusable stat display card (duration, sets, reps, rest)
- `LogModal` — the performance logging modal

---

### 3. `WorkoutSummary.jsx` — Post-Workout Results
**Purpose:** Shown after all exercises are completed. Gives the user a full breakdown of their session.

**What it does:**
- **Header:** Displays the session date and configured muscle groups/duration/location
- **Stats row:** 3 metrics in cards:
  - **DONE** — number of exercises completed ✅
  - **SKIPPED** — number of exercises skipped ➖
  - **RATE** — completion percentage (e.g. 80%)
- **Exercise Log:** A scrollable list of all exercises with logged stats (sets × reps, weight, distance, heart rate, notes)
- **AI Evaluation panel:** Sends your session data to Gemini for analysis. While loading, shows a pulsing spinner. When ready, displays a full written evaluation including:
  - 🏆 Overall performance score (X/10)
  - 💪 Volume & intensity analysis
  - ✅ What you did well
  - 📈 Areas for improvement
  - 🔥 Recommendations for next session
  - ⚡ Recovery tips for next 24–48 hours
- **"Start New Workout"** button to reset and go back to setup

---

## ⚙️ Services Explained

### `src/services/gemini.js` — The AI Brain

All communication with Google Gemini happens here. This file exports 4 functions:

---

#### `generateWorkout({ bodyParts, duration, location })`
- Called when the user submits the setup form
- Sends a detailed prompt to Gemini specifying muscle groups, duration, location
- Returns a **JSON array of 6–12 exercise objects**, each containing:
  ```
  name, targetMuscle, category, duration, sets, reps, rest,
  difficulty, instructions, youtubeSearchQuery, tips, equipment
  ```
- Always includes a warm-up and cool-down phase
- Location-aware: Home = bodyweight only, Gym = full equipment allowed

---

#### `replaceExercise({ exercise, bodyParts, location, alreadyDone })`
- Called when user taps "↻ Different Exercise"
- Sends the current exercise name and the full list of exercises already in the workout
- Returns **one new exercise** that targets the same muscle group but is not a duplicate
- Respects location constraints (Home vs Gym)

---

#### `evaluateWorkout({ workoutConfig, completedExercises })`
- Called after the user finishes all exercises
- Sends the full session log (what was done, how many sets/reps/weight, what was skipped) to Gemini
- Returns a **detailed motivational evaluation** in plain text with emojis, covering performance, areas to improve, and recovery tips

---

#### `buildYoutubeUrl(searchQuery)`
- A simple utility function (no AI call)
- Takes an exercise name like `"Barbell Bench Press tutorial form"` and returns a YouTube search URL
- Used to generate the "Watch Tutorial" links in the session screen

---

## 🔄 How It Works (User Flow)

```
┌─────────────────────┐
│    WorkoutSetup     │  ← User picks muscles, duration, location
│  (WorkoutSetup.jsx) │
└────────┬────────────┘
         │ onSubmit → generateWorkout() called
         ▼
┌─────────────────────┐
│   Google Gemini AI  │  ← Generates full structured workout plan
│   (gemini.js)       │
└────────┬────────────┘
         │ returns exercises[]
         ▼
┌─────────────────────┐
│   WorkoutSession    │  ← User follows each exercise
│ (WorkoutSession.jsx)│  ← Can replace (replaceExercise()) or skip
│                     │  ← Logs performance per exercise
└────────┬────────────┘
         │ onComplete → evaluateWorkout() called
         ▼
┌─────────────────────┐
│  WorkoutSummary     │  ← Shows stats + AI evaluation
│(WorkoutSummary.jsx) │
└─────────────────────┘
         │ onStartNew
         ▼
    (Back to Setup)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or later
- A Google Gemini API key ([get one here](https://aistudio.google.com/app/apikey))

### Install & Run

```bash
# 1. Clone the repository
git clone <repo-url>
cd FitForge

# 2. Install dependencies
npm install

# 3. Set up your API key (see Environment Variables below)

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🔑 Environment Variables

Create a `.env` file in the root of the project:

```env
VITE_GEMINI_API_KEY=your_google_gemini_api_key_here
```

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

The API key is accessed in the app via `import.meta.env.VITE_GEMINI_API_KEY` (Vite's convention for client-side environment variables).

---

## 👨‍💻 Built With

- **React 19** — UI rendering and state management
- **Vite** — Fast development server and bundler
- **Tailwind CSS** — Utility-first styling
- **Google Gemini API** — AI workout generation and evaluation
- **@google/genai SDK** — Official Google AI JavaScript library

---

*FitForge — Powered by Google Gemini · Data stays local*
