import asyncio
import json
import re

import httpx

from src.config.env import get_settings

_ENDPOINT_HOST_RE = re.compile(r"\.endpoints\.huggingface\.cloud")
_SPACE_HOST_RE = re.compile(r"\.hf\.space")

POLL_TIMEOUT_SECONDS = 120.0


def _is_dedicated_endpoint(url: str) -> bool:
    return bool(_ENDPOINT_HOST_RE.search(url))


def _is_public_space(url: str) -> bool:
    return bool(_SPACE_HOST_RE.search(url))


def _file_ref(url: str, filename: str) -> dict:
    """Gradio's FileData schema — passing a public URL in `path`/`url` lets the Space
    fetch it itself, same as gradio_client.file(url) does under the hood."""
    return {
        "path": url,
        "url": url,
        "orig_name": filename,
        "meta": {"_type": "gradio.FileData"},
    }


async def run_virtual_tryon(user_photo_url: str, garment_image_url: str, garment_description: str = "") -> str:
    """Calls the IDM-VTON model and returns the URL of the generated result image.

    Picks the protocol based on HF_TRYON_ENDPOINT_URL's shape:
    - `*.endpoints.huggingface.cloud` -> dedicated Inference Endpoint, single POST.
    - `*.hf.space` -> public Gradio Space, submit-then-poll queue protocol.
    """
    settings = get_settings()
    url = settings.hf_tryon_endpoint_url

    if _is_dedicated_endpoint(url):
        return await _call_dedicated_endpoint(
            url, settings.hf_api_key, user_photo_url, garment_image_url, garment_description
        )

    if _is_public_space(url):
        return await _call_public_space(
            url, settings.hf_api_key, user_photo_url, garment_image_url, garment_description
        )

    raise RuntimeError(
        f"HF_TRYON_ENDPOINT_URL '{url}' doesn't look like a dedicated Inference Endpoint "
        "(*.endpoints.huggingface.cloud) or a public Space (*.hf.space)."
    )


async def _call_dedicated_endpoint(
    url: str,
    api_key: str | None,
    user_photo_url: str,
    garment_image_url: str,
    garment_description: str,
) -> str:
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    payload = {
        "user_photo_url": user_photo_url,
        "garment_image_url": garment_image_url,
        "garment_description": garment_description,
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPError as exc:
        raise RuntimeError(f"Inference Endpoint call failed: {exc}") from exc

    result_image_url = data.get("result_image_url") or data.get("resultImageUrl") or data.get("image")
    if not result_image_url:
        raise RuntimeError(f"Unexpected response shape from Inference Endpoint: {data}")
    return result_image_url


async def _call_public_space(
    url: str,
    api_key: str | None,
    user_photo_url: str,
    garment_image_url: str,
    garment_description: str,
) -> str:
    base_url = url.rstrip("/")
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    # Positional inputs, matching the Space's /tryon signature exactly (confirmed via
    # its public /info schema): dict, garm_img, garment_des, is_checked, is_checked_crop,
    # denoise_steps, seed.
    payload = {
        "data": [
            {
                "background": _file_ref(user_photo_url, "user_photo.jpg"),
                "layers": [],
                "composite": None,
            },
            _file_ref(garment_image_url, "garment.jpg"),
            garment_description,
            True,
            False,
            30,
            42,
        ]
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            submit_response = await client.post(f"{base_url}/call/tryon", json=payload, headers=headers)
            submit_response.raise_for_status()
            event_id = submit_response.json()["event_id"]

            result_data = await _poll_space_event(client, base_url, "tryon", event_id, headers)
    except httpx.HTTPError as exc:
        raise RuntimeError(f"Try-on Space call failed: {exc}") from exc

    if not result_data:
        raise RuntimeError("Try-on Space returned no result data.")

    result_image = result_data[0]
    if isinstance(result_image, dict):
        return result_image.get("url") or result_image.get("path")
    return result_image


async def _poll_space_event(
    client: httpx.AsyncClient,
    base_url: str,
    api_name: str,
    event_id: str,
    headers: dict,
) -> list | None:
    async def _read_stream() -> list | None:
        event_type: str | None = None
        async with client.stream("GET", f"{base_url}/call/{api_name}/{event_id}", headers=headers) as stream:
            async for line in stream.aiter_lines():
                if not line:
                    continue
                if line.startswith("event:"):
                    event_type = line.removeprefix("event:").strip()
                elif line.startswith("data:"):
                    raw_data = line.removeprefix("data:").strip()
                    if event_type == "error":
                        raise RuntimeError(f"Try-on Space returned an error: {raw_data}")
                    if event_type == "complete":
                        return json.loads(raw_data)
        return None

    try:
        return await asyncio.wait_for(_read_stream(), timeout=POLL_TIMEOUT_SECONDS)
    except asyncio.TimeoutError as exc:
        raise RuntimeError(
            f"Timed out after {POLL_TIMEOUT_SECONDS:.0f}s waiting for the try-on result "
            "(likely no ZeroGPU capacity available right now)."
        ) from exc
