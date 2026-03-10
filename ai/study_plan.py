# ai/study_plan.py
import os
import json
import asyncio
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def build_prompt(session: dict, summary: dict) -> str:
    """Build a structured prompt from the student's performance data."""

    answered_lines = []
    for i, a in enumerate(session["answered"], 1):
        status = "✓" if a["correct"] else "✗"
        answered_lines.append(
            f"  Q{i}. [{status}] Topic: {a['topic']} | "
            f"Difficulty: {a['difficulty']} | "
            f"Selected: {a['selected']}"
        )
    answered_text = "\n".join(answered_lines)

    topic_lines = []
    for topic, stats in summary["topic_stats"].items():
        topic_lines.append(
            f"  - {topic}: {stats['correct']}/{stats['total']} correct "
            f"({int(stats['accuracy']*100)}%) | "
            f"Avg difficulty: {stats['avg_difficulty']}"
        )
    topic_text = "\n".join(topic_lines)

    return f"""You are an expert GRE tutor and learning coach.

A student just completed an adaptive GRE diagnostic test. Here is their performance data:

STUDENT: {session['student_name']}
FINAL ABILITY SCORE: {summary['final_ability']} (scale: -3.0 to +3.0)
PROFICIENCY LEVEL: {summary['proficiency_level']}
QUESTIONS ANSWERED: {summary['total_questions']}

PERFORMANCE BY TOPIC:
{topic_text}

QUESTION-BY-QUESTION LOG:
{answered_text}

WEAK TOPICS: {', '.join(summary['weak_topics']) if summary['weak_topics'] else 'None'}
STRONG TOPICS: {', '.join(summary['strong_topics']) if summary['strong_topics'] else 'None'}

Based on this data, generate a personalized 3-step study plan.

Respond ONLY with a valid JSON object in exactly this format, no preamble, no extra text:
{{
  "study_plan": [
    {{
      "step": 1,
      "topic": "<topic name>",
      "action": "<specific actionable task>",
      "resources": ["<resource 1>", "<resource 2>"]
    }},
    {{
      "step": 2,
      "topic": "<topic name>",
      "action": "<specific actionable task>",
      "resources": ["<resource 1>", "<resource 2>"]
    }},
    {{
      "step": 3,
      "topic": "<topic name>",
      "action": "<specific actionable task>",
      "resources": ["<resource 1>", "<resource 2>"]
    }}
  ],
  "motivational_note": "<one encouraging sentence for the student>"
}}"""


async def generate_study_plan(session: dict, summary: dict) -> dict:
    """
    Call Groq API with student performance data.
    Returns parsed study plan dict.
    """
    prompt = build_prompt(session, summary)

    # Groq client is sync — run in executor for async FastAPI
    def call_api():
        response = client.chat.completions.create(
            model       = "llama-3.3-70b-versatile",  # free, fast, smart
            messages    = [
                {
                    "role":    "system",
                    "content": "You are a GRE tutor. Always respond with valid JSON only. No markdown, no explanation."
                },
                {
                    "role":    "user",
                    "content": prompt
                }
            ],
            temperature = 0.7,
            max_tokens  = 1024,
        )
        return response.choices[0].message.content

    loop = asyncio.get_event_loop()
    raw_response = await loop.run_in_executor(None, call_api)

    # Parse JSON safely
    try:
        clean = raw_response.strip()
        # Strip markdown fences if model adds them
        if "```" in clean:
            clean = clean.split("```")[1]
            if clean.startswith("json"):
                clean = clean[4:]
        parsed = json.loads(clean.strip())

    except json.JSONDecodeError:
        # Fallback plan if parsing fails
        parsed = {
            "study_plan": [
                {
                    "step": 1,
                    "topic": summary["weak_topics"][0] if summary["weak_topics"] else "General Review",
                    "action": "Review core concepts and practice 10 questions daily",
                    "resources": ["GRE Official Guide", "Khan Academy"]
                },
                {
                    "step": 2,
                    "topic": summary["weak_topics"][1] if len(summary["weak_topics"]) > 1 else "Vocabulary",
                    "action": "Learn 20 new GRE words per day using flashcards",
                    "resources": ["Magoosh GRE Vocab App", "Quizlet GRE Flashcards"]
                },
                {
                    "step": 3,
                    "topic": "Mixed Practice",
                    "action": "Take one full adaptive practice test per week",
                    "resources": ["ETS PowerPrep", "Manhattan Prep GRE"]
                }
            ],
            "motivational_note": "Every question you practice brings you closer to your goal!"
        }

    return parsed