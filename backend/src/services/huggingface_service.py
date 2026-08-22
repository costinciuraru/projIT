from gradio_client import Client, file

from src.config.env import get_settings

_client: Client | None = None


def _get_client() -> Client:
    global _client
    if _client is None:
        settings = get_settings()
        _client = Client(settings.hf_tryon_space, token=settings.hf_api_key)
    return _client


def run_virtual_tryon(user_photo_url: str, garment_image_url: str, garment_description: str = "") -> str:
    """Calls the IDM-VTON Hugging Face Space and returns the URL of the generated result image.

    `user_photo_url` / `garment_image_url` must be publicly reachable URLs (e.g. Supabase Storage
    public URLs) — the Space downloads them itself via `gradio_client.file(...)`.
    """
    client = _get_client()

    try:
        result = client.predict(
            dict={
                "background": file(user_photo_url),
                "layers": [],
                "composite": None,
            },
            garm_img=file(garment_image_url),
            garment_des=garment_description,
            is_checked=True,
            is_checked_crop=False,
            denoise_steps=30,
            seed=42,
            api_name="/tryon",
        )
    except Exception as exc:
        raise RuntimeError(f"Hugging Face try-on call failed: {exc}") from exc

    # The Space's /tryon endpoint returns a tuple: (result_image_path, masked_image_path)
    return result[0] if isinstance(result, (list, tuple)) else result
