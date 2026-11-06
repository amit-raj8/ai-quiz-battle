# ⚡ AI QUIZ BATTLE

> **High-Octane AI Cyber Trivia Arena, Real-Time 1v1 PvP Engine & Deterministic Combat Tier Progression**  
> An esports-inspired quiz battlefield engineered with **React 19**, **Vite 8**, **Tailwind CSS v4**, **Express 5**, **Google Gemini AI (@google/genai)**, and **Firebase Cloud Firestore**.

---

## 🏎️ Overview & Design Philosophy

**AI QUIZ BATTLE** is a high-performance trivia arena engineered for technical depth, competitive esports thrills, and real-time multiplayer duels. Designed around the relentless visual language of supercar aerodynamics (inspired by the Lamborghini design philosophy):

- **Absolute Jet Black Canvas (`#000000`)**: Deep void backdrop maximizing focus and visual contrast.
- **Lamborghini Gold Accents (`#FFC000`)**: Amber-gold deployed selectively on primary CTAs, active states, score telemetry, and streak badges.
- **Angular Geometry**: Uncompromising `0px` border-radius on cards, buttons, HUD meters, and combat crests.
- **Monospace Telemetry HUD**: Live reaction-time readouts, round countdown timers, real-time score counters, and streak multipliers.
- **Deterministic Combat Badge Crests**: Distinctive angular military cyber insignia representing pilot victory ranks from Bronze to Grandmaster with Roman numerals.
- **Interactive 3D Robot Mascot**: Embedded via `@splinetool/react-spline` for real-time 3D canvas interaction.

---

## 🌟 Core Features

### 1. 🤖 Resilient AI Question Engine (Google Gemini)
- **Multi-Model Resilient Generation**: Powered by `@google/genai` with automatic retry, exponential backoff, and dynamic model rotation (`gemini-3.5-flash-lite`, `gemini-3.5-flash`, `gemini-flash-latest`) to withstand transient quota spikes (`429`) and high demand (`503`).
- **Two-Pass Self-Healing Pipeline**:
  - **Pass 1**: High-diversity generation with tuned temperature (`0.85`) and dynamic subtopic pool injection (3–5 rotating sub-areas per round).
  - **Pass 2 (Correction Feedback)**: If initial output fails schema validation, the engine automatically triggers a corrective retry pass feeding exact structural errors back to Gemini.
- **Fisher-Yates Option Randomization**: Strict uniform 25% answer distribution across options A, B, C, and D (`server/utils/quizValidator.js` & `src/utils/questionRandomizer.js`), completely eliminating positional bias (e.g., correct answers clustering at Option B).
- **Domain Calibration Engine**: Curated technical tokens, difficulty calibration, and subtopic rotations across 11 technical categories (`server/config/domainCalibration.js`).
- **Novelty Guarantee & Rolling Concept Memory**: Maintains a rolling cache of the last 50 generated concepts per category, preventing repeated or cliché questions across consecutive battles.
- **Strict Quality Validation**:
  - Exactly 4 distinct, non-empty options per question.
  - Verbatim `correctAnswer` matching against the option array.
  - Mandatory non-empty educational technical explanations.
  - Server-enforced canonical point weighting: **Easy = 100 PTS**, **Medium = 150 PTS**, **Hard = 200 PTS**.
  - In-flight Promise deduplication via `generationId` guarding against concurrent duplicate requests.
- **Zero Client Key Exposure**: Server-side proxy isolation ensures the `GEMINI_API_KEY` is strictly confined to the backend.

### 2. 🎖️ Deterministic Combat Tier Badge System
Integrated deterministic combat crest progression based on verified arena victories (`src/utils/badgeSystem.js`, `src/components/BadgeCrest.jsx`, `src/components/PilotBadge.jsx`):

| Combat Tier | Icon & Color | Victory Requirement | Progression Rules |
|---|---|---|---|
| **Unranked** | Gray (`#7D7D7D`) | 0 Wins | Initial status for recruited pilots |
| **Bronze** | Bronze (`#CD7F32`) | 1 – 4 Wins | Awarded immediately upon securing 1st arena victory |
| **Silver** | Silver (`#E0E0E0`) | 5 – 9 Wins | Unlocks at 5 arena victories |
| **Gold** | Gold (`#FFC000`) | 10 – 14 Wins | Unlocks at 10 arena victories |
| **Diamond** | Cyan Diamond (`#00F0FF`) | 15 – 34 Wins | Unlocks at 15 arena victories |
| **Master** | Amethyst Purple (`#C084FC`) | 35 – 49 Wins | Unlocks at 35 arena victories |
| **Grandmaster** | Crimson Apex (`#FF2D55`) | 50+ Wins | Unlocks at 50 victories; advances continuously in Roman numerals (50 = **Grandmaster I**, 51 = **Grandmaster II**, etc.) |

- **Live Countdown Telemetry**: Pilot profiles and badges display real-time wins remaining until the next tier advancement.
- **Universal Badge Synchronization**: Crests and badge pills are displayed consistently across Leaderboards, Navbar, Pilot Profiles, Duel Arenas, and Home Roster previews.

### 3. ⚔️ Real-Time 1v1 Head-to-Head Duel Arena (PvP)
- **Instant Lobby Creation**: Create customized challenge rooms with selectable question counts and countdown timers.
- **Live Challenge Alerts**: Real-time Firebase Firestore snapshot listeners (`onSnapshot`) prompt opponents with instant duel invitations (`DuelInviteModal.jsx`).
- **Synchronized Multiplayer**: Both pilots compete on identical question pools with real-time score, progress, and telemetry synchronization.
- **Autonomous AI Bot Sparring Partner**: Instant fallback bot opponent with calibrated humanized reaction delays (2.5s–5.0s) and accuracy for solo training or offline sparring.
- **Speed Bonus & Tiebreaker Mechanics**: Points scale based on submission speed; ties are settled by cumulative response times down to tenths of a second.

### 4. 🎯 Solo Battle Arena & Streak Mechanics
- **Stage Progression**: 5 to 15 question gauntlet with animated telemetry progress bars.
- **Hot Streaks**: Exponential streak multipliers (1x to 4x) rewarding consecutive correct answers.
- **Dynamic Scoring Rules**:
  - **Easy**: 100 PTS per question
  - **Medium**: 150 PTS per question
  - **Hard**: 200 PTS per question
- **Interactive Feedback**: Sound and vibration toggles, instant answer color-coding, and celebratory confetti via `canvas-confetti`.
- **Seamless Firestore Fallback**: If the Gemini API is unreachable or unconfigured, the arena gracefully falls back to curated Firestore offline question banks without interrupting gameplay.

### 5. 🏆 Grand Prix Leaderboards
- **Dense Global Rankings**: Sorts pilots by cumulative score, total victories, accuracy percentage, and win streaks.
- **Combat Tier Filtering**: Filter rankings by tier (Bronze, Silver, Gold, Diamond, Master, Grandmaster).
- **Pilot Callsign Search**: Instant live search by pilot username or email callsign.
- **Category Filter Tabs**: Drill down into specific tech domains to view specialized category champions.
- **Podium Highlights**: Distinctive cyber podium showcasing top 3 champions with custom gold, silver, and bronze cyber crests.
- **Real-Time Pilot Position**: Authenticated pilots see their live standings dynamically injected into the leaderboard roster.

### 6. 🧑‍✈️ Pilot Profile & Telemetry Progression
- **XP Curve & Rank Titles**: Gain XP with every completed quiz to progress from *Rookie Cadet* to *Veteran*, *Master*, and *Apex Legend*.
- **Comprehensive Match History**: Stores every completed battle in Firestore subcollections with accuracy, score, date, and domain metadata.
- **Performance Breakdown**: Track win/loss rates, career accuracy, highest score, best hot streak, and domain mastery percentages.

### 7. 🔒 Authentication & Guest Mode
- **Firebase Authentication**: Email/password registration and login with input validation.
- **Guest Access**: Explore the homepage, categories, and public leaderboards without signing in.
- **Feature Guarding**: Protected routes and actions prompt an auth modal (`AuthModal.jsx`) before launching ranked arena sessions.

---

## 📚 Supported Knowledge Domains

The AI calibration and question generation engine natively supports **11 calibrated technical domains**:

| Domain | Slug | Core Topics & Syllabus |
|---|---|---|
| **Python** | `python` | Dunder data models, generators, `asyncio`, decorators, GIL, memory optimization (`__slots__`), OOP & MRO |
| **JavaScript** | `javascript` | V8 engine internals, Event Loop (micro/macrotasks), closures, prototypes, `Proxy`/`Reflect`, ES6+ |
| **Java** | `java` | JVM architecture (Heap vs Stack, Metaspace), garbage collection (G1, ZGC), Java Memory Model, Spring Boot |
| **C++** | `cpp` | RAII, smart pointers, Rule of Five, move semantics, template metaprogramming, memory alignment, modern C++20 |
| **DSA & Algorithms** | `dsa` | Trees, graphs (Dijkstra, BFS/DFS), dynamic programming, binary search, sorting algorithms, Big-O complexity |
| **SQL & Databases** | `sql` | Complex joins, indexing (B-Tree/Hash), ACID transactions, isolation levels, normalization, window functions |
| **React & Web Dev** | `react` | Virtual DOM, Fiber reconciliation, React hooks internals, `useMemo`/`useCallback`, state management |
| **AI & Machine Learning** | `ai_ml` | Transformer self-attention, loss functions, AdamW optimization, diffusion models, RLHF, model quantization |
| **Data Science & Analytics** | `data_science` | Pandas vectorization, NumPy broadcasting/strides, hypothesis testing, PCA/t-SNE, feature engineering, time series |
| **Technology & Cloud Systems** | `technology` | Distributed systems (CAP/PACELC, Raft), Kubernetes, cloud networking (VPC/BGP), storage engines (LSM/B+ Tree), OS internals |
| **Aptitude & Reasoning** | `aptitude` | Time-Speed-Distance, probability, work-rate formulas, syllogisms, permutations & combinations |

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19.2.8](https://react.dev/)
- **Build Tool**: [Vite 8.2.2](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4.3.3](https://tailwindcss.com/) with `@tailwindcss/vite`
- **Icons**: [Lucide React 1.37.0](https://lucide.dev/)
- **Effects**: [canvas-confetti 1.9.4](https://www.npmjs.com/package/canvas-confetti)
- **3D Interactive**: [@splinetool/react-spline 4.1.0](https://spline.design/) & `@splinetool/runtime 2.0.54`
- **Linter**: [Oxlint 1.79.0](https://oxc.rs/docs/guide/usage/linter.html)

### Backend & AI
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Server**: [Express 5.2.1](https://expressjs.com/)
- **AI SDK**: [@google/genai 2.19.0](https://www.npmjs.com/package/@google/genai) (Google Gemini API)
- **CORS & Environment**: `cors 2.8.6`, `dotenv 17.4.2`

### Cloud & Database
- **Auth**: [Firebase Authentication 12.18.0](https://firebase.google.com/docs/auth)
- **Database**: [Firebase Cloud Firestore 12.18.0](https://firebase.google.com/docs/firestore)
- **Architecture Spec**: Distributed MongoDB schema specification documented in [`mongodb_design.md`](./mongodb_design.md)

---

## 📁 Project Directory Structure

```plaintext
AI QUIZ BATTLE/
├── .env                      # Local server environment configuration (not committed)
├── .env.example              # Sample server environment configuration
├── firebase.json             # Firebase configuration file
├── firestore.rules           # Production Cloud Firestore security rules
├── getdesign.md              # Lamborghini-inspired UI/UX design specification
├── index.html                # Vite HTML entry point
├── mongodb_design.md         # Enterprise MongoDB architecture & schema design
├── package.json              # NPM dependencies and run scripts
├── vite.config.js            # Vite configuration with embedded backend middleware
├── scripts/                  # Automated verification and integration test suites
│   ├── test-fresh-generation.js   # Fresh generation vs duplicate cache tests
│   ├── test-live-generations.js   # Live Gemini generation verification
│   ├── test-step-p1-python.js     # End-to-end Python category tests
│   ├── test-step10a-domains.js    # Multi-domain calibration test suite across 11 categories
│   ├── test-step9-hardening.js    # 50-check reliability, validation & anti-duplicate suite
│   ├── testAiEndpoint.js          # HTTP API endpoint test suite
│   └── testValidator.js           # Unit tests for JSON schema validation
├── server/                   # Backend Express API
│   ├── app.js                # Express app setup, middleware, and error handlers
│   ├── index.js              # Standalone HTTP server listener (port 5000)
│   ├── config/
│   │   └── domainCalibration.js   # 11-category prompt rules, tokens & calibration
│   ├── routes/
│   │   └── aiRoutes.js       # AI generation route handlers (/api/ai)
│   ├── services/
│   │   └── geminiService.js  # Gemini SDK integration, retry, model rotation & prompt engine
│   └── utils/
│       └── quizValidator.js  # JSON schema validator, sanitizer & option randomizer
└── src/                      # Frontend React Application
    ├── App.jsx               # Top-level shell, notification banner, screen router
    ├── firebase.js           # Firebase app, auth, and firestore initialization
    ├── main.jsx              # React DOM render entry
    ├── assets/               # Static image assets
    │   ├── hero.png          # Hero banner graphic
    │   ├── react.svg         # React logo
    │   └── vite.svg          # Vite logo
    ├── components/           # Reusable UI components
    │   ├── AuthModal.jsx         # Guest feature guard modal
    │   ├── Avatar.jsx            # Pilot avatar with level badges
    │   ├── BadgeCrest.jsx        # Deterministic combat tier badge crest (Bronze to Grandmaster)
    │   ├── Button.jsx            # Sharp angular buttons (Gold, Ghost, Dark)
    │   ├── CategoryCard.jsx      # Domain selector cards with glow accents
    │   ├── DifficultySelector.jsx# Easy / Medium / Hard selector pills
    │   ├── DuelInviteModal.jsx   # Real-time incoming PvP invite dialog
    │   ├── Footer.jsx            # Dark cyber footer
    │   ├── GuestBanner.jsx       # Auth prompt banner for guest pilots
    │   ├── Navbar.jsx            # Sticky minimal cyber navigation with live pilot badge
    │   ├── PilotBadge.jsx        # Compact combat tier badge pill
    │   ├── ProgressBar.jsx       # Round progress telemetry indicator
    │   ├── ProtectedRoute.jsx    # Auth boundary wrapper
    │   ├── QuizOption.jsx        # Question answer option button
    │   ├── ScoreDisplay.jsx      # Real-time score readout
    │   ├── SplineRobot.jsx       # 3D interactive robot mascot
    │   ├── StatCard.jsx          # HUD metric card
    │   ├── StreakDisplay.jsx     # Active streak multiplier indicator
    │   └── Timer.jsx             # Circular/linear countdown timer
    ├── context/              # Global React Context providers
    │   ├── AuthContext.jsx       # Firebase auth session state & login/register
    │   └── QuizContext.jsx       # Live match state, telemetry, and room sync
    ├── data/                 # Curated fallback banks & metadata
    │   ├── mockCategories.js     # Category configurations & icons
    │   ├── mockLeaderboard.js    # Initial leaderboard seed data
    │   ├── mockQuestions.js      # Offline fallback question pools
    │   └── mockUserProfile.js    # Profile templates
    ├── pages/                # Screen views
    │   ├── DuelArena.jsx         # Live 1v1 PvP real-time battle arena with AI bot fallback
    │   ├── Home.jsx              # Hero landing page with 3D robot & roster preview
    │   ├── Leaderboard.jsx       # Global & category Grand Prix rankings with tier filters
    │   ├── Login.jsx             # Pilot sign-in portal
    │   ├── Profile.jsx           # Pilot telemetry profile, badge progression & match history
    │   ├── QuizGame.jsx          # Solo battle arena runner
    │   ├── QuizResult.jsx        # Post-match telemetry & review screen
    │   ├── QuizSetup.jsx         # Match configuration & domain selector
    │   └── Register.jsx          # Pilot recruitment portal
    ├── services/             # Client data services
    │   ├── aiQuizService.js      # Client for POST /api/ai/generate-quiz
    │   ├── authService.js        # Firebase user registration & authentication
    │   ├── battleHistoryService.js# Match history persistence in Firestore
    │   ├── categoryService.js    # Domain query service
    │   ├── duelService.js        # 1v1 room creation, invitations & answer sync
    │   ├── friendService.js      # Social challenges
    │   ├── leaderboardService.js # Leaderboard snapshot queries
    │   ├── questionService.js    # Firestore question query service
    │   ├── quizService.js        # Core battle gameplay logic
    │   └── userService.js        # Pilot stats, XP recalculation & ranking
    └── utils/
        ├── badgeSystem.js        # Deterministic combat tier system & win progression formulas
        ├── questionRandomizer.js # Fisher-Yates uniform option shuffling & anti-bias utility
        └── scoring.js            # Score formulas, accuracy, and badge awards
```

---

## ⚙️ Environment Configuration

1. Copy the example configuration to create your local `.env`:
   ```bash
   cp .env.example .env
   ```

2. Populate the required environment keys in `.env`:
   ```ini
   # =============================================================================
   # AI QUIZ BATTLE - SERVER ENVIRONMENT CONFIGURATION
   # =============================================================================

   # Google Gemini API Key (Server-Side Only - Never exposed to frontend)
   # Get a key at: https://aistudio.google.com/
   GEMINI_API_KEY=your_actual_gemini_api_key_here

   # Optional: Primary Gemini Model Selection (Defaults to gemini-3.5-flash-lite)
   # Supported: gemini-3.5-flash-lite, gemini-3.6-flash, gemini-2.5-flash
   GEMINI_MODEL=gemini-3.5-flash-lite

   # Backend API Port (Defaults to 5000)
   PORT=5000

   # Optional: Spline 3D Scene Export URL
   VITE_SPLINE_SCENE_URL=https://prod.spline.design/your_scene_code/scene.splinecode
   ```

> ⚠️ **Security Warning**: The `GEMINI_API_KEY` is read strictly by the Express backend (`server/services/geminiService.js`). It is never prefixed with `VITE_` and is never bundled into client-side code.

---

## 🚀 Quickstart & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) version **18.0.0 or higher**
- [npm](https://www.npmjs.com/) (bundled with Node.js)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
> **Vite Middleware Integration**: In development mode, `vite.config.js` automatically mounts the Express API (`server/app.js`) as internal middleware. You get both the frontend client and the AI backend on a single port (`http://localhost:5173`) with zero CORS complications.

### 3. Run Standalone Backend Server (Optional)
If you wish to run the backend API as an independent service on port `5000`:
```bash
npm run server
```

### 4. Build for Production
```bash
npm run build
```
Creates an optimized production bundle in the `dist/` directory with code splitting across Firebase, React, icons, and vendor dependencies.

### 5. Preview Production Build
```bash
npm run preview
```

### 6. Lint Codebase
```bash
npm run lint
```
Runs [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) for fast static analysis across all files.

---

## 📡 API Reference

### 1. Health Check
Checks backend service availability and connectivity.

- **URL**: `/api/health`
- **Method**: `GET`
- **Response `200 OK`**:
  ```json
  {
    "status": "online",
    "service": "AI QUIZ BATTLE Core Server",
    "timestamp": "2026-11-06T21:30:00.000Z"
  }
  ```

---

### 2. Generate AI Quiz Questions
Generates calibrated, validated multiple-choice questions for the requested domain.

- **URL**: `/api/ai/generate-quiz`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "categoryId": "python",
    "categoryName": "Python",
    "difficulty": "Medium",
    "questionCount": 10,
    "generationId": "gen_unique_battle_id"
  }
  ```
  - `categoryId` *(string, required)*: Domain slug (`python`, `javascript`, `java`, `cpp`, `dsa`, `sql`, `react`, `ai_ml`, `data_science`, `technology`, `aptitude`).
  - `categoryName` *(string, optional)*: Domain display name.
  - `difficulty` *(string, required)*: `'Easy'`, `'Medium'`, or `'Hard'`.
  - `questionCount` *(integer, required)*: Number of questions (5 to 15).
  - `generationId` *(string, optional)*: Unique identifier to deduplicate concurrent requests.

- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "generationId": "gen_unique_battle_id",
    "categoryId": "python",
    "categoryName": "Python",
    "difficulty": "Medium",
    "questionCount": 10,
    "questions": [
      {
        "id": "ai_1730900000_0_a1b2c",
        "question": "What is the primary role of the __slots__ attribute in a Python class?",
        "options": [
          "It restricts class inheritance to final subclasses.",
          "It explicitly defines allowed instance attributes to prevent the creation of __dict__ and save memory.",
          "It defines automatic property getters and setters for all class variables.",
          "It marks instance methods as thread-safe synchronized routines."
        ],
        "correctAnswer": "It explicitly defines allowed instance attributes to prevent the creation of __dict__ and save memory.",
        "explanation": "By eliminating instance __dict__ overhead, __slots__ saves memory when instantiating thousands of objects.",
        "points": 150,
        "difficulty": "Medium"
      }
    ]
  }
  ```

- **Error Codes**:
  - `400 Bad Request`: Invalid difficulty, question count outside 5–15, or missing category.
  - `429 Too Many Requests`: Gemini API rate limit exceeded (handled by automatic backoff retries on backend).
  - `502 Bad Gateway`: AI response failed JSON parsing or quality validation standards.
  - `503 Service Unavailable`: Missing or invalid Gemini API key.

---

## 🧪 Automated Test Suites

The repository contains automated unit and integration verification suites located in the [`scripts/`](./scripts/) folder:

### Offline / Unit Tests (No Server Required)
| Test Script | Command | Purpose |
|---|---|---|
| **JSON Schema Validator** | `node scripts/testValidator.js` | Unit tests verifying that `quizValidator.js` catches duplicate options, mismatched answers, empty fields, and structural errors. |
| **Step 9 Hardening Suite** | `node scripts/test-step9-hardening.js` | 50 comprehensive tests verifying score overrides (100/150/200), duplicate detection, double-generation locks, and telemetry calculations. |

### Live Integration Tests (Requires `npm run server` or `npm run dev`)
| Test Script | Command | Purpose |
|---|---|---|
| **API Parameter Hardening** | `node scripts/testAiEndpoint.js` | Verifies HTTP status codes on `/api/health`, invalid counts, invalid difficulties, and missing payload fields. |
| **Fresh vs Cache Deduplication** | `node scripts/test-fresh-generation.js` | Confirms that new battle requests receive fresh questions while identical in-flight `generationId` requests are safely deduplicated. |
| **Python Category E2E** | `node scripts/test-step-p1-python.js` | End-to-end Python generation across Easy, Medium, and Hard, validating structure, points, and uniqueness. |
| **Multi-Domain Calibration** | `node scripts/test-step10a-domains.js` | Tests question generation across all 11 technical categories across Easy, Medium, and Hard. |
| **Live Generations Check** | `node scripts/test-live-generations.js` | Verifies live endpoint generation against Gemini for Easy, Medium, and Hard stages. |

---

## 🛡️ Cloud Firestore Security Rules

Production rules are declared in [`firestore.rules`](./firestore.rules):
- **`users/{userId}`**: Publicly readable (to view leaderboard pilots and champions preview); mutations restricted strictly to the authenticated owner (`request.auth.uid == userId`).
- **`users/{userId}/battleHistory/{battleId}`**: Append-only telemetry records. Modifications and deletions from the client are forbidden.
- **`battleRooms/{roomId}`**: Real-time 1v1 rooms synchronized between host and guest pilots.
- **`categories` & `questions`**: Publicly readable, immutable from clients.

---

## 📄 License & Attribution

This project is built and maintained for high-performance esports trivia competitions.  
UI/UX aesthetic developed with reference to the **Lamborghini Design System** (see [`getdesign.md`](./getdesign.md)).  
Distributed database architecture specification available in [`mongodb_design.md`](./mongodb_design.md).
