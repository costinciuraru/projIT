import json

from src.services import openai_service, supabase_service

MOCK_CANDIDATES = [
    {"id": "mock-1", "title": "Modern Minimalist", "description": "Clean lines and neutral tones.", "tag": "Office"},
    {"id": "mock-2", "title": "Chic & Confident", "description": "Balanced and sophisticated.", "tag": "Elegant"},
    {"id": "mock-3", "title": "Smart Casual", "description": "Relaxed yet put-together.", "tag": "Casual"},
    {"id": "mock-4", "title": "Golden Hour Date", "description": "Soft tones for a romantic evening.", "tag": "Elegant"},
]


def _fetch_candidate_outfits(budget_min: int, budget_max: int) -> list[dict]:
    supabase = supabase_service.get_supabase_client()

    # The applied schema (supabase/migrations/0001_init_schema.sql) has no price column
    # on `outfits` yet, so a budget-filtered query may fail — degrade step by step
    # instead of crashing: filtered query -> unfiltered query -> hardcoded mock.
    try:
        response = (
            supabase.table("outfits")
            .select("id, title, description, tag, rating")
            .gte("price_total", budget_min)
            .lte("price_total", budget_max)
            .limit(30)
            .execute()
        )
        if response.data:
            return response.data
    except Exception:
        pass

    try:
        response = (
            supabase.table("outfits").select("id, title, description, tag, rating").limit(30).execute()
        )
        if response.data:
            return response.data
    except Exception:
        pass

    return MOCK_CANDIDATES


def get_recommendations(mood: str, occasion: str, budget_min: int, budget_max: int, style: str) -> list[dict]:
    candidates = _fetch_candidate_outfits(budget_min, budget_max)

    prompt = (
        "You are a fashion recommendation engine for the DressCode app. Given a user's "
        "preferences and a list of candidate outfits, score each outfit from 0 to 100 on how "
        "well it matches, and give a short one-sentence reason for each. Respond ONLY with a "
        'JSON object of this exact shape: {"recommendations": [{"outfitId": "<id>", '
        '"matchPercent": <integer 0-100>, "reason": "<short text>"}]}. Include every candidate '
        "outfit exactly once, ordered from best to worst match.\n\n"
        f"User preferences: mood={mood}, occasion={occasion}, budget={budget_min}-{budget_max} RON, "
        f"style={style}.\n"
        f"Candidate outfits (JSON): {json.dumps(candidates)}"
    )

    result = openai_service.chat_json(
        [
            {"role": "system", "content": "You always respond with valid JSON, nothing else."},
            {"role": "user", "content": prompt},
        ]
    )

    cleaned = []
    for item in result.get("recommendations", []):
        try:
            cleaned.append(
                {
                    "outfitId": str(item["outfitId"]),
                    "matchPercent": max(0, min(100, int(item["matchPercent"]))),
                    "reason": str(item["reason"]),
                }
            )
        except (KeyError, ValueError, TypeError):
            continue
    return cleaned
