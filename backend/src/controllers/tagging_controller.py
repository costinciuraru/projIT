from src.services import openai_service

ALLOWED_TYPES = ("Office", "Casual", "Going Out", "Elegant", "Streetwear")
DEFAULT_TYPE = "Casual"


def suggest_tags(image_url: str, description_hint: str | None) -> dict:
    prompt_text = (
        "Look at this outfit photo and classify it. Respond ONLY with a JSON object of this "
        'exact shape: {"suggestedType": "<one of Office, Casual, Going Out, Elegant, '
        'Streetwear>", "suggestedTags": ["<short lowercase tag>", ...]}. Give 3 to 6 '
        "suggestedTags (style, fabric, color family, vibe)."
    )
    if description_hint:
        prompt_text += f"\nUser-provided hint: {description_hint}"

    result = openai_service.chat_json(
        [
            {"role": "system", "content": "You always respond with valid JSON, nothing else."},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt_text},
                    {"type": "image_url", "image_url": {"url": image_url}},
                ],
            },
        ]
    )

    suggested_type = result.get("suggestedType")
    if suggested_type not in ALLOWED_TYPES:
        suggested_type = DEFAULT_TYPE

    suggested_tags = result.get("suggestedTags", [])
    if not isinstance(suggested_tags, list):
        suggested_tags = []

    return {"suggestedType": suggested_type, "suggestedTags": [str(tag) for tag in suggested_tags]}
