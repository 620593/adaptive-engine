# main.py
from fastapi import FastAPI
from contextlib import asynccontextmanager
from database import ping_db, client
from routes import sessions, questions, study_plan


@asynccontextmanager
async def lifespan(app: FastAPI):
    await ping_db()
    yield
    client.close()
    print("🔌 MongoDB connection closed")


app = FastAPI(
    title       = "Adaptive Diagnostic Engine",
    description = "1-Dimension IRT-based adaptive testing system for GRE-style questions",
    version     = "1.0.0",
    lifespan    = lifespan,
)

app.include_router(sessions.router)
app.include_router(questions.router)
app.include_router(study_plan.router)


@app.get("/", tags=["Health"])
async def root():
    return {
        "status":  "running",
        "message": "Adaptive Diagnostic Engine is live 🚀",
        "docs":    "/docs",
    }