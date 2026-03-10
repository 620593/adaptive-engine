# routes/study_plan.py
from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone

from database import get_session
from algorithm.irt import performance_summary
from ai.study_plan import generate_study_plan

router = APIRouter(prefix="/test", tags=["Study Plan"])


@router.get("/study-plan")
async def get_study_plan(session_id: str):
    """
    GET /test/study-plan?session_id=xxx
    Generates a personalised 3-step study plan using Groq LLM.
    Only available after test is complete (10 questions answered).
    """
    # 1. Validate session
    session = await get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if not session["is_complete"]:
        raise HTTPException(
            status_code=400,
            detail=f"Complete the test first. {session['questions_answered']}/10 answered."
        )

    # 2. Build performance summary
    summary = performance_summary(
        ability  = session["ability_score"],
        answered = session["answered"],
    )

    # 3. Call Groq LLM
    plan = await generate_study_plan(session, summary)

    # 4. Return full response
    return {
        "session_id":        session_id,
        "student_name":      session["student_name"],
        "proficiency_level": summary["proficiency_level"],
        "final_ability":     summary["final_ability"],
        "weak_topics":       summary["weak_topics"],
        "strong_topics":     summary["strong_topics"],
        "study_plan":        plan.get("study_plan", []),
        "motivational_note": plan.get("motivational_note", ""),
        "generated_at":      datetime.now(timezone.utc),
    }