# Adaptive Diagnostic Engine

A **1-Dimensional Adaptive Testing System** for GRE-style questions built using **FastAPI**, **MongoDB Atlas**, **Item Response Theory (IRT)**, and **Groq LLM**.

The system dynamically adjusts question difficulty based on student performance and generates a **personalized AI study plan** at the end of the test.

---

# Tech Stack

| Component          | Technology                               |
| ------------------ | ---------------------------------------- |
| Backend            | Python, FastAPI                          |
| Database           | MongoDB Atlas                            |
| Async Driver       | Motor                                    |
| Adaptive Algorithm | Item Response Theory (IRT) — Rasch Model |
| AI Integration     | Groq API (`llama-3.3-70b-versatile`)     |
| Package Manager    | uv                                       |
| Data Validation    | Pydantic                                 |

---

# Project Structure

```
adaptive-engine/
│
├── main.py
│   FastAPI application entry point
│
├── database.py
│   MongoDB Atlas connection and session helpers
│
├── models.py
│   Pydantic request and response schemas
│
├── algorithm/
│   └── irt.py
│       Rasch model ability score update logic
│
├── routes/
│   ├── sessions.py
│   │   Handles session creation and retrieval
│   │
│   ├── questions.py
│   │   Handles adaptive question selection and answer submission
│   │
│   └── study_plan.py
│       Endpoint for AI-generated study plans
│
├── ai/
│   └── study_plan.py
│       Groq LLM integration for personalized study plan generation
│
└── seed/
    └── seed_questions.py
        Script to seed GRE-style questions into MongoDB
```

---

# Setup and Installation

## 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/adaptive-engine.git
cd adaptive-engine
```

---

## 2. Install Dependencies

This project uses **uv** for dependency management.

```bash
uv sync
```

---

## 3. Configure Environment Variables

Create a `.env` file in the project root.

```
MONGO_URI=mongodb+srv://<user>:<password>@adaptive-engine.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=adaptive_engine
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
```

---

## 4. Seed the Database

Populate MongoDB with sample GRE-style questions.

```bash
uv run seed/seed_questions.py
```

---

## 5. Start the Server

```bash
uv run uvicorn main:app --reload
```

---

## 6. Open API Documentation

Once the server is running, open:

```
http://127.0.0.1:8000/docs
```

FastAPI automatically generates an interactive **Swagger UI**.

---

# API Endpoints

| Method | Endpoint                          | Description                            |
| ------ | --------------------------------- | -------------------------------------- |
| GET    | `/`                               | Health check                           |
| POST   | `/session/start`                  | Start a new adaptive test session      |
| GET    | `/session/{session_id}`           | Retrieve session information           |
| GET    | `/test/next-question?session_id=` | Fetch next adaptive question           |
| POST   | `/test/submit-answer`             | Submit answer and update ability score |
| GET    | `/test/result?session_id=`        | Get complete performance summary       |
| GET    | `/test/study-plan?session_id=`    | Generate AI study plan                 |

---

# Adaptive Algorithm

This system implements the **Rasch Model**, a 1-parameter IRT model.

```
P(correct) = 1 / (1 + e^(-(ability - difficulty)))
```

### How the Adaptive System Works

1. Each student starts with an **initial ability score of `0.0`**.

2. Questions have a **difficulty value between `0.1` and `1.0`**.

3. After each answer, ability is updated using gradient ascent on the log-likelihood:

```
new_ability = ability + learning_rate × (response − P)
```

Where:

- `response = 1` if correct
- `response = 0` if incorrect
- `P` = predicted probability of correct response

---

### Question Selection Strategy

The next question is selected by choosing the question whose **difficulty is closest to the student's current ability score**.

This ensures:

- Harder questions for stronger students
- Easier questions for weaker students
- Rapid convergence to the student's true ability level

---

### Test Completion

After **10 questions**, the system generates:

- Topic-wise performance summary
- Ability score estimate
- Personalized study recommendations

---

# AI Integration

At the end of the test session, the system generates a **personalized study plan** using the **Groq LLM API**.

Model used:

```
llama-3.3-70b-versatile
```

The LLM analyzes:

- Student ability score
- Topic performance
- Incorrect answers

Then generates a structured **study plan with recommended topics and focus areas**.

---

# AI Development Log

This section documents how AI tools were used during development.

---

## GitHub Copilot

Used for:

- FastAPI route scaffolding
- Pydantic model generation
- Boilerplate code completion

This significantly reduced development time for repetitive tasks.

---

## Claude (Anthropic)

Used for:

- Architectural discussions
- Guidance on IRT algorithm implementation
- MongoDB schema design
- Debugging async Motor driver issues

---

## Groq LLM

Used for:

- Generating personalized study plans
- Summarizing student weaknesses
- Producing structured learning recommendations

---

# Challenges Encountered

### 1. IRT Scale Mapping

MongoDB question difficulty values were stored between:

```
0.1 – 1.0
```

But IRT ability scale normally ranges between:

```
-3.0 – +3.0
```

Mapping these scales consistently required manual testing and mathematical validation.

AI suggestions were inconsistent for this transformation.

---

### 2. Async MongoDB with FastAPI Lifespan

Initializing the **Motor async client** inside FastAPI's lifespan context created connection lifecycle issues.

The correct pattern required careful debugging and manual tracing.

---

### 3. LLM JSON Parsing

Groq responses occasionally returned JSON wrapped in markdown:

````
```json
{ ... }
````

```

This caused parsing errors.

A **fallback cleaning step** was implemented to remove markdown fences before JSON parsing.

---

# Example Test Flow

### 1. Start Session

```

POST /session/start

```

Request:

```

{
"student_name": "Ranjith"
}

```

---

### 2. Fetch Question

```

GET /test/next-question?session_id=<session_id>

```

---

### 3. Submit Answer

```

POST /test/submit-answer

```

Request:

```

{
"session_id": "<session_id>",
"question_id": "<question_id>",
"selected_answer": "5"
}

```

Repeat until **10 questions** are completed.

---

### 4. View Results

```

GET /test/result?session_id=<session_id>

```

---

### 5. Generate Study Plan

```

GET /test/study-plan?session_id=<session_id>

```

---

# Future Improvements

- Add **2-Parameter IRT Model (2PL)** for discrimination
- Implement **adaptive stopping criteria**
- Add **student progress dashboards**
- Deploy using **Docker + AWS/GCP**
- Add **question tagging and topic analytics**

---

# License

This project is intended for **educational and research purposes**.

---

# Author

**Ranjith**

Built as part of an **AI-powered adaptive learning system prototype**.
```
