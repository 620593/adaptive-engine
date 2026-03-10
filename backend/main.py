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


from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title       = "Adaptive Diagnostic Engine",
    description = "1-Dimension IRT-based adaptive testing system for GRE-style questions",
    version     = "1.0.0",
    lifespan    = lifespan,
)

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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