# seed/seed_questions.py
import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import questions_col, client
from datetime import datetime, timezone

questions = [
    # ── ALGEBRA (5 questions) ─────────────────────────────────────
    {
        "question": "If 3x + 7 = 22, what is the value of x?",
        "options": ["3", "5", "7", "9"],
        "correct_answer": "5",
        "difficulty": 0.2,
        "topic": "Algebra",
        "tags": ["linear equations", "solving for x"],
        "created_at": datetime.now(timezone.utc)
    },
    {
        "question": "If f(x) = x² - 4x + 4, what is f(3)?",
        "options": ["1", "3", "5", "7"],
        "correct_answer": "1",
        "difficulty": 0.4,
        "topic": "Algebra",
        "tags": ["functions", "quadratic"],
        "created_at": datetime.now(timezone.utc)
    },
    {
        "question": "For what values of x is x² - 5x + 6 < 0?",
        "options": ["x < 2", "2 < x < 3", "x > 3", "x < 2 or x > 3"],
        "correct_answer": "2 < x < 3",
        "difficulty": 0.6,
        "topic": "Algebra",
        "tags": ["inequalities", "quadratic"],
        "created_at": datetime.now(timezone.utc)
    },
    {
        "question": "If log₂(x) + log₂(x-2) = 3, find x.",
        "options": ["2", "4", "6", "8"],
        "correct_answer": "4",
        "difficulty": 0.75,
        "topic": "Algebra",
        "tags": ["logarithms", "equations"],
        "created_at": datetime.now(timezone.utc)
    },
    {
        "question": "The roots of ax² + bx + c = 0 are real and distinct when:",
        "options": ["b² - 4ac = 0", "b² - 4ac < 0", "b² - 4ac > 0", "b² + 4ac > 0"],
        "correct_answer": "b² - 4ac > 0",
        "difficulty": 0.85,
        "topic": "Algebra",
        "tags": ["discriminant", "quadratic", "roots"],
        "created_at": datetime.now(timezone.utc)
    },

    # ── VOCABULARY (5 questions) ──────────────────────────────────
    {
        "question": "What does 'BENEVOLENT' most nearly mean?",
        "options": ["Hostile", "Kind-hearted", "Indifferent", "Arrogant"],
        "correct_answer": "Kind-hearted",
        "difficulty": 0.2,
        "topic": "Vocabulary",
        "tags": ["GRE words", "adjectives"],
        "created_at": datetime.now(timezone.utc)
    },
    {
        "question": "EPHEMERAL most nearly means:",
        "options": ["Eternal", "Short-lived", "Powerful", "Ancient"],
        "correct_answer": "Short-lived",
        "difficulty": 0.4,
        "topic": "Vocabulary",
        "tags": ["GRE words", "adjectives"],
        "created_at": datetime.now(timezone.utc)
    },
    {
        "question": "OBSEQUIOUS : FAWNING :: LACONIC : ___",
        "options": ["Verbose", "Brief", "Emotional", "Decisive"],
        "correct_answer": "Brief",
        "difficulty": 0.6,
        "topic": "Vocabulary",
        "tags": ["analogies", "GRE words"],
        "created_at": datetime.now(timezone.utc)
    },
    {
        "question": "The professor's PELLUCID explanation made the complex topic easy to grasp. PELLUCID means:",
        "options": ["Confusing", "Lengthy", "Perfectly clear", "Overly technical"],
        "correct_answer": "Perfectly clear",
        "difficulty": 0.75,
        "topic": "Vocabulary",
        "tags": ["context clues", "GRE words"],
        "created_at": datetime.now(timezone.utc)
    },
    {
        "question": "Which word is most opposite in meaning to GARRULOUS?",
        "options": ["Talkative", "Reticent", "Boisterous", "Candid"],
        "correct_answer": "Reticent",
        "difficulty": 0.9,
        "topic": "Vocabulary",
        "tags": ["antonyms", "GRE words"],
        "created_at": datetime.now(timezone.utc)
    },

    # ── GEOMETRY (5 questions) ────────────────────────────────────
    {
        "question": "What is the area of a circle with radius 7?",
        "options": ["49π", "14π", "7π", "21π"],
        "correct_answer": "49π",
        "difficulty": 0.2,
        "topic": "Geometry",
        "tags": ["circle", "area"],
        "created_at": datetime.now(timezone.utc)
    },
    {
        "question": "A right triangle has legs of length 6 and 8. What is the hypotenuse?",
        "options": ["10", "12", "14", "16"],
        "correct_answer": "10",
        "difficulty": 0.35,
        "topic": "Geometry",
        "tags": ["Pythagorean theorem", "right triangle"],
        "created_at": datetime.now(timezone.utc)
    },
    {
        "question": "Two parallel lines are cut by a transversal. If one interior angle is 65°, what is the co-interior (same-side interior) angle?",
        "options": ["65°", "115°", "25°", "90°"],
        "correct_answer": "115°",
        "difficulty": 0.55,
        "topic": "Geometry",
        "tags": ["parallel lines", "angles", "transversal"],
        "created_at": datetime.now(timezone.utc)
    },
    {
        "question": "The diagonal of a square is 8√2. What is the area of the square?",
        "options": ["32", "64", "128", "16"],
        "correct_answer": "64",
        "difficulty": 0.7,
        "topic": "Geometry",
        "tags": ["square", "diagonal", "area"],
        "created_at": datetime.now(timezone.utc)
    },
    {
        "question": "A cone has radius r and height h. If both r and h are doubled, by what factor does the volume increase?",
        "options": ["2", "4", "6", "8"],
        "correct_answer": "8",
        "difficulty": 0.85,
        "topic": "Geometry",
        "tags": ["cone", "volume", "scaling"],
        "created_at": datetime.now(timezone.utc)
    },

    # ── READING COMPREHENSION (5 questions) ───────────────────────
    {
        "question": "A passage states: 'The committee tabled the motion.' In American English, this means the committee:",
        "options": ["Approved the motion", "Postponed the motion", "Debated the motion", "Rejected the motion"],
        "correct_answer": "Postponed the motion",
        "difficulty": 0.3,
        "topic": "Reading Comprehension",
        "tags": ["inference", "language"],
        "created_at": datetime.now(timezone.utc)
    },
    {
        "question": "An author who uses IRONY intends to:",
        "options": [
            "State facts directly",
            "Express the opposite of the literal meaning",
            "Use metaphors extensively",
            "Avoid emotional language"
        ],
        "correct_answer": "Express the opposite of the literal meaning",
        "difficulty": 0.4,
        "topic": "Reading Comprehension",
        "tags": ["literary devices", "inference"],
        "created_at": datetime.now(timezone.utc)
    },
    {
        "question": "If a passage argues 'correlation does not imply causation', what logical fallacy does it warn against?",
        "options": ["Ad hominem", "False cause", "Straw man", "Slippery slope"],
        "correct_answer": "False cause",
        "difficulty": 0.6,
        "topic": "Reading Comprehension",
        "tags": ["logical reasoning", "critical thinking"],
        "created_at": datetime.now(timezone.utc)
    },
    {
        "question": "A passage's PRIMARY purpose is best identified by examining:",
        "options": [
            "The title only",
            "The first and last paragraphs and the overall argument",
            "The vocabulary used",
            "The number of examples provided"
        ],
        "correct_answer": "The first and last paragraphs and the overall argument",
        "difficulty": 0.65,
        "topic": "Reading Comprehension",
        "tags": ["main idea", "reading strategy"],
        "created_at": datetime.now(timezone.utc)
    },
    {
        "question": "When an author presents a counterargument and then refutes it, this technique is called:",
        "options": ["Anecdote", "Concession and rebuttal", "Circular reasoning", "Analogy"],
        "correct_answer": "Concession and rebuttal",
        "difficulty": 0.8,
        "topic": "Reading Comprehension",
        "tags": ["argumentation", "rhetoric"],
        "created_at": datetime.now(timezone.utc)
    },
]

async def seed():
    # Drop existing to avoid duplicates on re-run
    await questions_col.drop()
    result = await questions_col.insert_many(questions)
    print(f"✅ Seeded {len(result.inserted_ids)} questions successfully!")

    # Create index on difficulty for fast adaptive queries
    await questions_col.create_index("difficulty")
    await questions_col.create_index("topic")
    print("✅ Indexes created on difficulty and topic")

    client.close()

if __name__ == "__main__":
    asyncio.run(seed())