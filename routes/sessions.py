# routes/sessions.py
from fastapi import APIRouter, HTTPException
from bson import ObjectId
from datetime import datetime, timezone

from database import create_session, get_session, sessions_col
from models import SessionCreate, SessionOut

router = APIRouter(prefix="/session", tags=["Session"])


@router.post("/start", response_model=SessionOut)
async def start_session(body: SessionCreate):
    """
    POST /session/start
    Create a new test session for a student.
    Returns session_id to use in all subsequent requests.
    """
    session_id = await create_session(body.student_name)
    session    = await get_session(session_id)

    return SessionOut(
        session_id   = session_id,
        student_name = session["student_name"],
        ability_score= session["ability_score"],
        started_at   = session["started_at"],
    )


@router.get("/{session_id}")
async def get_session_status(session_id: str):
    """
    GET /session/{session_id}
    Returns current session state — ability score, questions answered, history.
    """
    session = await get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "session_id":          session_id,
        "student_name":        session["student_name"],
        "ability_score":       session["ability_score"],
        "questions_answered":  session["questions_answered"],
        "is_complete":         session["is_complete"],
        "started_at":          session["started_at"],
        "completed_at":        session.get("completed_at"),
        "answered":            session["answered"],
    }