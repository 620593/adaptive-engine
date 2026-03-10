# algorithm/irt.py
import math

def irt_probability(ability: float, difficulty: float, discrimination: float = 1.0) -> float:
    """
    1-Parameter IRT (Rasch Model) — probability of getting question correct.
    
    Formula: P(correct) = 1 / (1 + e^(-discrimination * (ability - difficulty)))
    
    Args:
        ability:        student's current ability score (-3.0 to +3.0, starts at 0.0)
        difficulty:     question difficulty in IRT scale (-3.0 to +3.0)
        discrimination: how well the question separates ability levels (default 1.0)
    
    Returns:
        float: probability between 0 and 1
    """
    exponent = -discrimination * (ability - difficulty)
    return 1.0 / (1.0 + math.exp(exponent))


def update_ability(
    ability: float,
    difficulty: float,
    correct: bool,
    learning_rate: float = 0.5
) -> float:
    """
    Update student ability using gradient ascent on log-likelihood.

    If correct:   ability increases (more if question was hard)
    If incorrect: ability decreases (more if question was easy)

    Args:
        ability:       current ability score
        difficulty:    difficulty of the question just answered
        correct:       True if answered correctly
        learning_rate: step size for update (default 0.5)

    Returns:
        float: updated ability score clamped to [-3.0, +3.0]
    """
    p = irt_probability(ability, difficulty)
    response = 1.0 if correct else 0.0

    # Gradient of log-likelihood: (response - P) 
    # Correct answer above ability → big positive jump
    # Wrong answer below ability  → big negative drop
    delta = learning_rate * (response - p)
    new_ability = ability + delta

    # Clamp to realistic IRT range
    return round(max(-3.0, min(3.0, new_ability)), 4)


def ability_to_difficulty(ability: float) -> float:
    """
    Convert IRT ability score (-3 to +3) → MongoDB difficulty (0.1 to 1.0).
    Used to find the next best-matching question.

    Linear mapping: -3 → 0.1,  0 → 0.55,  +3 → 1.0
    """
    normalized = (ability + 3.0) / 6.0        # 0.0 to 1.0
    return round(0.1 + normalized * 0.9, 4)   # 0.1 to 1.0


def difficulty_to_ability(difficulty: float) -> float:
    """
    Convert MongoDB difficulty (0.1 to 1.0) → IRT ability (-3 to +3).
    Used when initialising ability from a known difficulty.
    """
    normalized = (difficulty - 0.1) / 0.9     # 0.0 to 1.0
    return round(-3.0 + normalized * 6.0, 4)  # -3.0 to +3.0


def select_next_difficulty(ability: float, answered_difficulties: list[float]) -> float:
    """
    Pick the ideal difficulty for the next question based on current ability.
    Avoids repeating questions at the same difficulty already answered.

    Returns target difficulty (0.1 to 1.0).
    """
    target = ability_to_difficulty(ability)

    # Slightly randomise within ±0.1 to avoid getting stuck
    import random
    jitter = random.uniform(-0.08, 0.08)
    target = round(max(0.1, min(1.0, target + jitter)), 4)

    return target


def performance_summary(
    ability: float,
    answered: list[dict]
) -> dict:
    """
    Generate a performance summary after the test ends.
    Used to feed the LLM for study plan generation.

    Args:
        ability:  final ability score
        answered: list of {topic, difficulty, correct} dicts

    Returns:
        dict with stats per topic + overall level
    """
    topic_stats: dict[str, dict] = {}

    for item in answered:
        topic = item["topic"]
        if topic not in topic_stats:
            topic_stats[topic] = {"correct": 0, "total": 0, "difficulties": []}
        topic_stats[topic]["total"] += 1
        topic_stats[topic]["difficulties"].append(item["difficulty"])
        if item["correct"]:
            topic_stats[topic]["correct"] += 1

    # Compute accuracy per topic
    weak_topics = []
    strong_topics = []
    for topic, stats in topic_stats.items():
        accuracy = stats["correct"] / stats["total"]
        stats["accuracy"] = round(accuracy, 2)
        stats["avg_difficulty"] = round(
            sum(stats["difficulties"]) / len(stats["difficulties"]), 2
        )
        if accuracy < 0.5:
            weak_topics.append(topic)
        else:
            strong_topics.append(topic)

    # Map ability to human-readable level
    if ability >= 1.5:
        level = "Advanced"
    elif ability >= 0.0:
        level = "Intermediate"
    elif ability >= -1.5:
        level = "Beginner"
    else:
        level = "Needs Foundational Work"

    return {
        "final_ability": ability,
        "proficiency_level": level,
        "topic_stats": topic_stats,
        "weak_topics": weak_topics,
        "strong_topics": strong_topics,
        "total_questions": len(answered),
    }