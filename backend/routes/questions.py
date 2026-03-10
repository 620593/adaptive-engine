# routes/questions.py
from fastapi import APIRouter, HTTPException
from bson import ObjectId
from datetime import datetime, timezone

from database import get_session, sessions_col, questions_col
from models import QuestionOut, AnswerSubmit, AnswerResult
from algorithm.irt import (
    update_ability, ability_to_difficulty,
    select_next_difficulty, performance_summary
)

router = APIRouter(prefix="/test", tags=["Adaptive Test"])

MAX_QUESTIONS = 10


# ─── Helper: pick next question ───────────────────────────────────────────────
async def fetch_next_question(ability: float, answered_ids: list[str]) -> dict | None:
    """
    Find the question whose difficulty is closest to the student's current ability.
    Excludes already-answered questions.
    """
    target_difficulty = ability_to_difficulty(ability)

    # Exclude already answered question IDs
    exclude = [ObjectId(qid) for qid in answered_ids if qid]

    # Find 5 closest questions by difficulty, not already answered
    pipeline = [
        {"$match": {"_id": {"$nin": exclude}}},
        {"$addFields": {
            "diff_distance": {
                "$abs": {"$subtract": ["$difficulty", target_difficulty]}
            }
        }},
        {"$sort": {"diff_distance": 1}},
        {"$limit": 5},
    ]

    candidates = await questions_col.aggregate(pipeline).to_list(5)
    if not candidates:
        return None

    # Pick the closest one (first after sort)
    return candidates[0]


# ─── GET /test/next-question ──────────────────────────────────────────────────
@router.get("/next-question", response_model=QuestionOut)
async def next_question(session_id: str):
    """
    GET /test/next-question?session_id=xxx
    Returns the next adaptive question for the student.
    """
    session = await get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session["is_complete"]:
        raise HTTPException(status_code=400, detail="Test already complete. Call /test/result")

    # IDs of already answered questions
    answered_ids = [a["question_id"] for a in session["answered"]]

    question = await fetch_next_question(session["ability_score"], answered_ids)
    if not question:
        raise HTTPException(status_code=404, detail="No more questions available")

    return QuestionOut(
        id         = str(question["_id"]),
        question   = question["question"],
        options    = question["options"],
        difficulty = question["difficulty"],
        topic      = question["topic"],
        tags       = question["tags"],
    )


# ─── POST /test/submit-answer ─────────────────────────────────────────────────
@router.post("/submit-answer", response_model=AnswerResult)
async def submit_answer(body: AnswerSubmit):
    """
    POST /test/submit-answer
    Evaluate the student's answer and update their ability score via IRT.
    """
    # 1. Validate session
    session = await get_session(body.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session["is_complete"]:
        raise HTTPException(status_code=400, detail="Test already complete")

    # 2. Fetch the question
    question = await questions_col.find_one({"_id": ObjectId(body.question_id)})
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # 3. Check answer
    correct = body.selected_answer.strip().lower() == question["correct_answer"].strip().lower()

    # 4. Update ability score via IRT
    new_ability = update_ability(
        ability    = session["ability_score"],
        difficulty = question["difficulty"],
        correct    = correct,
    )

    # 5. Determine proficiency label
    if new_ability >= 1.5:
        level = "Advanced"
    elif new_ability >= 0.0:
        level = "Intermediate"
    elif new_ability >= -1.5:
        level = "Beginner"
    else:
        level = "Needs Foundational Work"

    # 6. Build answer history entry
    history_entry = {
        "question_id": body.question_id,
        "topic":       question["topic"],
        "difficulty":  question["difficulty"],
        "correct":     correct,
        "selected":    body.selected_answer,
        "answered_at": datetime.now(timezone.utc),
    }

    # 7. Check if test is complete after this answer
    new_count    = session["questions_answered"] + 1
    is_complete  = new_count >= MAX_QUESTIONS

    # 8. Update session in MongoDB
    update_data = {
        "$set":  {
            "ability_score":      new_ability,
            "questions_answered": new_count,
            "is_complete":        is_complete,
        },
        "$push": {"answered": history_entry},
    }
    if is_complete:
        update_data["$set"]["completed_at"] = datetime.now(timezone.utc)

    await sessions_col.update_one(
        {"_id": ObjectId(body.session_id)},
        update_data,
    )

    return AnswerResult(
        correct            = correct,
        correct_answer     = question["correct_answer"],
        ability_score      = new_ability,
        proficiency_level  = level,
        questions_answered = new_count,
        test_complete      = is_complete,
    )


# ─── GET /test/result ─────────────────────────────────────────────────────────
@router.get("/result")
async def get_result(session_id: str):
    """
    GET /test/result?session_id=xxx
    Returns full performance summary after the test is complete.
    """
    session = await get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if not session["is_complete"]:
        raise HTTPException(
            status_code=400,
            detail=f"Test not complete yet. {session['questions_answered']}/{MAX_QUESTIONS} answered."
        )

    summary = performance_summary(
        ability  = session["ability_score"],
        answered = session["answered"],
    )

    return {
        "session_id":    session_id,
        "student_name":  session["student_name"],
        "started_at":    session["started_at"],
        "completed_at":  session["completed_at"],
        **summary,
    }