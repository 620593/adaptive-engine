# models.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone


# ─── Question Models ──────────────────────────────────────────────────────────

class QuestionOut(BaseModel):
    """What the API returns when serving a question to the student."""
    id: str
    question: str
    options: list[str]
    difficulty: float
    topic: str
    tags: list[str]


class AnswerSubmit(BaseModel):
    """What the student sends when submitting an answer."""
    session_id: str
    question_id: str
    selected_answer: str


class AnswerResult(BaseModel):
    """What the API returns after evaluating the answer."""
    correct: bool
    correct_answer: str
    ability_score: float
    proficiency_level: str
    questions_answered: int
    test_complete: bool


# ─── Session Models ───────────────────────────────────────────────────────────

class SessionCreate(BaseModel):
    """Request body to start a new session."""
    student_name: str = Field(..., min_length=1, max_length=100)


class SessionOut(BaseModel):
    """Response when a session is created."""
    session_id: str
    student_name: str
    ability_score: float
    started_at: datetime


# ─── Study Plan Models ────────────────────────────────────────────────────────

class StudyPlanRequest(BaseModel):
    """Internal model — passed to LLM generator."""
    session_id: str


class StudyStep(BaseModel):
    step: int
    topic: str
    action: str
    resources: list[str]


class StudyPlanOut(BaseModel):
    """What the API returns as the final study plan."""
    student_name: str
    proficiency_level: str
    weak_topics: list[str]
    strong_topics: list[str]
    study_plan: list[StudyStep]
    generated_at: datetime