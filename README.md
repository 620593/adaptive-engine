# Adaptive Diagnostic Engine

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-00a393.svg)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg)](https://www.mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A **1-Dimensional Adaptive Testing System** for GRE-style questions. Built with FastAPI, MongoDB Atlas, Item Response Theory (IRT), and the Groq LLM API.

The system dynamically adjusts question difficulty based on student performance using the Rasch Model, and generates a personalized AI study plan upon test completion.

## Table of Contents

- [Adaptive Diagnostic Engine](#adaptive-diagnostic-engine)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Architecture \& Tech Stack](#architecture--tech-stack)
  - [Project Structure](#project-structure)
  - [Prerequisites](#prerequisites)
  - [Installation \& Setup](#installation--setup)
  - [Configuration](#configuration)
  - [Database Seeding](#database-seeding)
  - [Running the Application](#running-the-application)
  - [Usage \& API Endpoints](#usage--api-endpoints)
    - [Core Endpoints](#core-endpoints)
    - [Typical Test Flow](#typical-test-flow)
  - [Core Workflows](#core-workflows)
    - [Adaptive Algorithm (IRT)](#adaptive-algorithm-irt)
    - [AI Integration](#ai-integration)
  - [Development Log \& Challenges](#development-log--challenges)
    - [Implementation Highlights](#implementation-highlights)
    - [Key Challenges](#key-challenges)
  - [Future Roadmap](#future-roadmap)
  - [License \& Author](#license--author)

## Features

- **Dynamic Difficulty Adjustment:** Uses 1-Parameter Item Response Theory (Rasch Model) to adapt question difficulty in real-time.
- **Personalized AI Study Plans:** Integrates with `llama-3.3-70b-versatile` via Groq to provide actionable feedback based on performance.
- **Asynchronous Execution:** Built with FastAPI and Motor for high-performance, non-blocking database queries.

## Architecture & Tech Stack

| Component              | Technology                               |
| :--------------------- | :--------------------------------------- |
| **Backend Framework**  | Python, FastAPI                          |
| **Database**           | MongoDB Atlas                            |
| **Async Driver**       | Motor                                    |
| **Adaptive Algorithm** | Item Response Theory (IRT) — Rasch Model |
| **AI/LLM Integration** | Groq API (`llama-3.3-70b-versatile`)     |
| **Package Management** | `uv`                                     |
| **Validation**         | Pydantic                                 |

## Project Structure

```text
adaptive-engine/
├── ai/                 # Groq LLM integration for study plans
├── algorithm/          # IRT Rasch model and ability score logic
├── routes/             # FastAPI routers (sessions, questions, study_plan)
├── seed/               # DB seeding script for sample GRE questions
├── database.py         # MongoDB Atlas connection and session managers
├── main.py             # FastAPI application entry point
└── models.py           # Pydantic schemas for requests and responses
```

## Prerequisites

- Python 3.10+
- `uv` package manager
- MongoDB Atlas cluster
- Groq API Key

## Installation & Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/adaptive-engine.git
   cd adaptive-engine
   ```

2. **Install Dependencies**
   This project relies on `uv` for lightning-fast dependency management.
   ```bash
   uv sync
   ```

## Configuration

Create a `.env` file in the project root directory and add the following environment variables:

```ini
MONGO_URI=mongodb+srv://<user>:<password>@<cluster-url>/?retryWrites=true&w=majority
DB_NAME=adaptive_engine
GROQ_API_KEY=gsk_your_groq_api_key_here
```

## Database Seeding

Before running the application, populate the database with sample GRE-style questions:

```bash
uv run seed/seed_questions.py
```

## Running the Application

Start the development server:

```bash
uv run uvicorn main:app --reload
```

The comprehensive API documentation (Swagger UI) will be available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

## Usage & API Endpoints

### Core Endpoints

| Method | Endpoint                | Description                                   |
| :----- | :---------------------- | :-------------------------------------------- |
| `GET`  | `/`                     | Health check endpoint                         |
| `POST` | `/session/start`        | Initializes a new adaptive test session       |
| `GET`  | `/session/{session_id}` | Retrieves metadata for a specific session     |
| `GET`  | `/test/next-question`   | Fetches the next target adaptive question     |
| `POST` | `/test/submit-answer`   | Submits an answer and recalculates ability    |
| `GET`  | `/test/result`          | Returns the comprehensive performance summary |
| `GET`  | `/test/study-plan`      | Triggers the AI to generate a study plan      |

### Typical Test Flow

1. **Start Session:**
   ```bash
   curl -X POST "http://localhost:8000/session/start" \
     -H "Content-Type: application/json" \
     -d '{"student_name": "Ranjith"}'
   ```
2. **Fetch Question:**
   ```bash
   curl -X GET "http://localhost:8000/test/next-question?session_id=<SESSION_ID>"
   ```
3. **Submit Answer:**
   ```bash
   curl -X POST "http://localhost:8000/test/submit-answer" \
     -H "Content-Type: application/json" \
     -d '{
       "session_id": "<SESSION_ID>",
       "question_id": "<QUESTION_ID>",
       "selected_answer": "5"
     }'
   ```
4. **View Results & Generate Study Plan:**
   Proceed to call `/test/result` and `/test/study-plan` once the test (typically 10 questions) concludes.

## Core Workflows

### Adaptive Algorithm (IRT)

The engine employs the **Rasch Model** (a 1-parameter Item Response Theory model) to evaluate the probability of a correct response:

> `P(correct) = 1 / (1 + e^-(ability - difficulty))`

1. **Initialization:** Students begin with an ability score of `0.0`.
2. **Question Difficulty:** Questions range from `0.1` to `1.0`.
3. **Ability Re-estimation:** After every answer, the user's ability score is recalibrated using gradient ascent:
   > `new_ability = ability + learning_rate * (response - P)`
4. **Targeting:** The subsequent question is curated to possess a difficulty index closest to the updated ability score, ensuring maximum psychometric efficiency.

### AI Integration

Upon test completion (10 questions), a rich text study plan is formulated via the Groq LLM API. The model contextualizes the following artifacts:

- The finalized IRT ability score.
- Topic-level performance and distributions.
- Erroneous questions and misconception patterns.

## Development Log & Challenges

### Implementation Highlights

- **GitHub Copilot:** Accelerated boilerplate generation, Pydantic modeling, and routing.
- **Claude (Anthropic):** Assisted with overarching architecture, IRT mathematical validation, and Motor async driver debugging.
- **Groq LLM:** Powering real-time analytical responses and feedback structuring.

### Key Challenges

1. **IRT Scale Mapping:** Standardizing MongoDB difficulty parameters (`0.1` - `1.0`) against canonical IRT ability bounds (`-3.0` - `+3.0`) required careful mathematical mapping.
2. **Asynchronous Connection Lifecycles:** Properly managing the initial Motor async connection states within FastAPI lifespan blocks to avoid premature closures.
3. **LLM Output Sanitization:** Parsing LLM responses effectively bypassing unpredictable markdown injections (i.e., cleaning nested ````json` code blocks before parsing the underlying JSON object).

## Future Roadmap

- [ ] Upgrade to a **2-Parameter IRT Model (2PL)** to factor in question discrimination bounds.
- [ ] Establish **adaptive stopping criteria** (Standard Error termination thresholds) in lieu of fixed-length structures.
- [ ] Design intuitive **student progress dashboards**.
- [ ] Dockerize the environment for streamlined deployments (AWS/GCP).
- [ ] Introduce rigorous **question tagging and analytics**.

## License & Author

This project is intended for **educational and research purposes**.

Built as part of an **AI-powered adaptive learning system prototype**.  
**Author:** Ranjith
