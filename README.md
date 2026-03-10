# Adaptive Diagnostic Engine

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=flat-square&logo=vercel)](https://adaptive-engine.vercel.app)
[![API Docs](https://img.shields.io/badge/API_Docs-Render-black?style=flat-square&logo=render)](https://adaptive-engine.onrender.com/docs)
[![Python](https://img.shields.io/badge/Python-3.11-blue?style=flat-square&logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-00a393?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/atlas)
[![Groq](https://img.shields.io/badge/Groq-llama--3.3--70b--versatile-f55036?style=flat-square&logo=groq)](https://groq.com/)

An AI-powered 1-Dimensional Adaptive Testing system for GRE-style questions. Built as an internship screening assignment, the system mathematically adjusts question difficulty in real time based on student performance using Item Response Theory (IRT) and generates a personalized AI study plan at the end of the test via the Groq LLM.

---

## 🎯 Evaluation Criteria Addressed

This project directly answers the core evaluation criteria for the internship assessment:

| Criterion             | Implementation & Justification                                                                                                                                                                                                                                                                                                                                                                                                            |
| :-------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **System Design**     | MongoDB schema features two distinct collections (`questions` and `user_sessions`) with proper indexing on `difficulty` and `topic` fields ensuring O(log n) query speeds. Session documents embed answer history as an array for safe, atomic updates. Complex aggregation pipelines are utilized to identify the closest-difficulty questions efficiently without full table scans.                                                     |
| **Algorithmic Logic** | Implements a mathematically sound Rasch Model (1-Parameter IRT)—an industry standard in psychometrics. The ability score updates via gradient ascent on the log-likelihood function. Rather than a simple if/else model, updates are proportional to the mathematical prediction error, allowing the system to rapidly converge on a student's true ability.                                                                              |
| **AI Proficiency**    | The Groq LLM (llama-3.3-70b-versatile) receives strictly structured performance data (accuracy, avg difficulty, and IRT parameters) rather than raw text. Prompt engineering strictly enforces JSON schema output, leverages system/user message separation, and utilizes a temperature of 0.7 for creative yet consistent study plans. A robust fallback parser handles any markdown fence-stripping if the model hallucinated wrappers. |
| **Code Hygiene**      | Environment variables securely manage secrets (never committed). Pydantic v2 ensures comprehensive request/response validation. All asynchronous operations employ try/catch blocks. The system strictly utilizes the `Motor` async driver to prevent blocking event loops. Fastidious separation of concerns isolates routing, algorithm logic, database operations, and AI integration.                                                 |

---

## 🏛️ Architecture & Tech Stack

### Backend

- **Framework:** Python 3.11, FastAPI, Uvicorn
- **Database:** MongoDB Atlas (Motor async driver, M0 Free Tier)
- **AI Integration:** Groq API (`llama-3.3-70b-versatile`)
- **Data Validation:** Pydantic v2
- **Environment Management:** `python-dotenv`
- **Package Manager:** `uv`
- **Deployment:** Render.com

### Frontend

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS (Dark Mode optimized)
- **Animations:** Framer Motion
- **Data Visualization:** Recharts
- **Routing & Networking:** React Router v6, Axios
- **Toast Notifications:** `react-hot-toast`
- **Deployment:** Vercel

---

## 🔄 How it Works: The Adaptive Flow

```text
 ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
 │               │      │               │      │  IRT scoring  │
 │ Start Session ├─────►│ Fetch Target  ├─────►│    Submit     │
 │               │      │   Question    │      │    Answer     │
 └───────────────┘      └──────┬────────┘      └───────┬───────┘
                               │                       │
                               │      Loop 10x         │
                               ◄───────────────────────┘
                                       │
                        ┌──────────────▼────────┐
                        │                       │
                        │    View Results &     │
                        │  AI Generated Study   │
                        │         Plan          │
                        │                       │
                        └───────────────────────┘
```

---

## 🧠 Algorithmic Logic: Item Response Theory (IRT)

This application uses the **Rasch Model (1-Parameter IRT)** to dynamically evaluate difficulty and ability levels.

### Formula

```text
P(correct) = 1 / (1 + e^(-(ability - difficulty)))
```

### Ability Update (Gradient Ascent)

```text
new_ability = ability + learning_rate × (response − P)
```

- **Response:** `1` if correct, `0` if incorrect.
- **P:** Predicted probability from the Rasch formula.
- **Learning Rate:** Optimally tuned to `0.5` after empirical testing to prevent slow convergence and oscillation.
- **Scale Mapping:** MongoDB difficulty (`0.1` to `1.0`) maps linearly to the IRT standard ability scale (`-3.0` to `+3.0`) via the mathematical transform: `irt_ability = -3.0 + ((difficulty - 0.1) / 0.9) × 6.0`.

### Question Selection Strategy

The system selects the next question by identifying the difficulty closest to the student's current ability score. Questions already answered are actively filtered out (`$nin`).

### Proficiency Tiers

| Ability Score Range | Classification          |
| :------------------ | :---------------------- |
| `≥  1.5`            | Advanced                |
| `≥  0.0`            | Intermediate            |
| `≥ -1.5`            | Beginner                |
| `< -1.5`            | Needs Foundational Work |

> **Why IRT over simple if/else?** It mathematically accounts for question difficulty. Updates are proportional—answering a hard question correctly raises ability more than an easy one. It enables rapid convergence to true ability and is an industry-standard model evaluated in exams like the GRE, GMAT, and SAT.

---

## 🗄️ Database Schema & Data Modeling

The MongoDB instance is designed for rapid read operations (needed for real-time question serving) and atomic write operations (needed for session updating).

<details>
<summary><b>View Schema Definitions</b></summary>

### Collection: `questions`

Indexed on `difficulty` (ascending) and `topic` (ascending).

```json
{
  "_id": "ObjectId",
  "question": "String",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correct_answer": "String",
  "difficulty": 0.4,
  "topic": "Algebra",
  "tags": ["Polynomials", "Factoring"],
  "created_at": "DateTime"
}
```

### Collection: `user_sessions`

```json
{
  "_id": "ObjectId",
  "student_name": "String",
  "ability_score": 0.0,
  "questions_answered": 5,
  "answered": [
    {
      "question_id": "String",
      "topic": "String",
      "difficulty": 0.4,
      "correct": true,
      "selected": "String",
      "answered_at": "DateTime"
    }
  ],
  "is_complete": false,
  "started_at": "DateTime",
  "completed_at": null
}
```

</details>

---

## 🔌 API Endpoints

<details>
<summary><b>View Complete API Reference</b></summary>

| Method | Endpoint                              | Description                                                             |
| :----- | :------------------------------------ | :---------------------------------------------------------------------- |
| `POST` | `/session/start`                      | Creates a new adaptive test session. Expects `{"student_name": "Name"}` |
| `GET`  | `/session/{session_id}`               | Retrieves current session state and metadata.                           |
| `GET`  | `/test/next-question?session_id=<ID>` | Fetches the next mathematically optimal question.                       |
| `POST` | `/test/submit-answer`                 | Submits an answer, updates IRT score, and increments session.           |
| `GET`  | `/test/result?session_id=<ID>`        | Returns the full performance summary, accuracy, and proficiency.        |
| `GET`  | `/test/study-plan?session_id=<ID>`    | Calls the Groq LLM to generate a personalized study plan in JSON.       |

</details>

---

## 🤖 AI Integration & Development Log

### AI Feature Workflow

The `llama-3.3-70b-versatile` model evaluates the user's final IRT score, topic distribution, accuracy vectors, and explicit weaknesses. The strict prompt engineering enforces a response strictly mapped to a 3-step action plan format wrapped tightly into parsable JSON, alongside motivational feedback.

### Development Assistance & Challenges Solved Manually

1. **Groq JSON Parsing Robustness:** While the prompt engineered the model to return raw JSON, LLMs predictably hallucinated Markdown fences (`json ... `). I implemented a custom manual fallback parser to strip markdown wrappers out of the string before feeding it to Python's `json.loads()`.
2. **IRT Scale Mapping:** Standardizing the database difficulty scale (`0.1 - 1.0`) against traditional IRT bounding constants (`-3.0 to +3.0`) required careful mathematical mapping that AI models failed to suggest accurately, ultimately requiring a linear equation derivation and heavy testing.
3. **Async MongoDB + FastAPI Lifespan:** Initializing the Motor async client inside FastAPI's modern `@asynccontextmanager` lifespan inherently posed connection lifecycle bugs. LLMs kept referencing deprecated logic blocking standard drivers—manual debugging traced back a clean resolution into the async generator lifecycle.
4. **IRT Convergence Tuning:** The step/learning rate was strictly fine-tuned manually to `0.5`. After analyzing AI-suggested values of `0.3` and `1.0`, testing empirically found they caused respectively sluggish adaptation and severe ability score oscillation.

### Copilot Use

- **GitHub Copilot:** Accelerated the process by handling FastAPI route scaffolding and boilerplate Pydantic schema generation, estimated at saving 40% typing time.
- **Claude (Anthropic):** Leveraged for high-level architectural sanity checks against REST principles and MongoDB document modeling strategies prior to building.

---

## 🚀 Setup Instructions (Local Development)

**Prerequisites:** Python 3.11+, Node.js 18+, `uv` installed, MongoDB Atlas account.

### 1. Backend

```bash
# Clone and enter directory
git clone https://github.com/620593/adaptive-engine.git
cd adaptive-engine/backend

# Install dependencies rapidly using uv
uv sync

# Setup environment variables
echo "MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority" > .env
echo "DB_NAME=adaptive_engine" >> .env
echo "GROQ_API_KEY=gsk_your_key_here" >> .env

# Seed the database (20 GRE Questions)
uv run seed/seed_questions.py

# Start the local server
uv run uvicorn main:app --reload
```

### 2. Frontend

```bash
# Navigate to frontend package
cd ../frontend

# Install node dependencies
npm install

# Setup local environment targeting the FastAPI backend
echo "VITE_API_URL=http://127.0.0.1:8000" > .env.local

# Run Vite dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔮 Future Improvements

- **2-Parameter IRT (2PL):** Implementing a discrimination parameter to gauge how effectively a question differentiates between true mathematical abilities.
- **Adaptive Stopping Criteria:** Terminating tests automatically once the Standard Error of Measurement (SEM) declines below a confidence threshold.
- **Authentication:** Incorporating JWT-based SSO to natively persist long-term student metrics.
- **Dockerization:** Fully containerizing frontend and backend for a seamless 1-command architecture bootstrap.
- **CI/CD Pipeline:** Implementing GitHub Actions for automated linting and pre-flight tests ahead of Vercel/Render pushes.
- **Analytics Dashboard for Educators:** Aggregate view of question effectiveness across cohorts.

---

## 👨‍💻 Author

**Pathivada Ranjith Kumar**  
_B.Tech CSE, RGUKT Nuzvid_  
GitHub: [620593](https://github.com/620593)

Built as an adaptive diagnostic system showcasing backend performance, data modeling, psychometric algorithms, and real-time structured LLM integration.
