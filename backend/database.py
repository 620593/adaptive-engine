# database.py
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime, timezone
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME   = os.getenv("DB_NAME", "adaptive_engine")

client = AsyncIOMotorClient(MONGO_URI)
db     = client[DB_NAME]

# ─── Collections ──────────────────────────────────────────────────────────────
questions_col = db["questions"]
sessions_col  = db["user_sessions"]


# ─── Session Schema (what gets stored in MongoDB) ─────────────────────────────
# {
#   "_id":              ObjectId,
#   "student_name":     str,
#   "ability_score":    float,        # IRT score, starts at 0.0
#   "questions_answered": int,        # counter 0–10
#   "answered": [                     # history of every question
#       {
#           "question_id":  str,
#           "topic":        str,
#           "difficulty":   float,
#           "correct":      bool,
#           "selected":     str,
#           "answered_at":  datetime
#       }
#   ],
#   "is_complete":      bool,         # True after 10 questions
#   "started_at":       datetime,
#   "completed_at":     datetime | None
# }

async def create_session(student_name: str) -> str:
    """Insert a new session document and return its string ID."""
    doc = {
        "student_name":       student_name,
        "ability_score":      0.0,
        "questions_answered": 0,
        "answered":           [],
        "is_complete":        False,
        "started_at":         datetime.now(timezone.utc),
        "completed_at":       None,
    }
    result = await sessions_col.insert_one(doc)
    return str(result.inserted_id)


async def get_session(session_id: str) -> dict | None:
    """Fetch a session by its string ID."""
    from bson import ObjectId
    return await sessions_col.find_one({"_id": ObjectId(session_id)})


async def ping_db():
    await client.admin.command("ping")
    print("✅ Connected to MongoDB Atlas successfully!")