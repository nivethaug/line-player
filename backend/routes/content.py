"""
Content routes — JSON-file storage backend for the videojs-audit site.

Endpoints (all under /api, nginx strips the prefix):
  GET  /api/showcase          — showcase feature cards
  GET  /api/player            — player page video config
  GET  /api/settings          — saved skin/player settings
  PUT  /api/settings          — save skin/player settings (primary write)
  GET  /api/integrations      — real status of DREAMAGENT_* integrations
"""
import json
import os
import threading
import time
from pathlib import Path

import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["content"])

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)
_LOCK = threading.Lock()

DEFAULT_SETTINGS = {
    "accent": "#7c3aed",
    "radius": "14",
    "preload": "auto",
    "autoplay": False,
}

SHOWCASE_FEATURES = [
    {
        "id": "scoped-packages",
        "title": "Scoped packages",
        "body": "Video.js v10 ships as @videojs scoped packages. Import exactly the video preset — VideoPlayer, VideoSkin and Video — with tree-shaken CSS, no legacy v8 bundle.",
    },
    {
        "id": "skin-theming",
        "title": "Skin theming",
        "body": "The default skin is driven by CSS custom properties. This showcase sets --media-accent-color to violet #7c3aed and --media-border-radius to 14px on the wrapper.",
    },
    {
        "id": "accessible-controls",
        "title": "Accessible controls",
        "body": "VideoSkin renders keyboard-navigable, screen-reader-labelled controls with a 16/9 aspect-ratio container, playsInline media and auto preload out of the box.",
    },
]

PLAYER_CONFIG = {
    "title": "Big Buck Bunny",
    "src": "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
    "accent": "#7c3aed",
    "radius": "14",
    "description": "H.264 · 720p · 10s · 1MB demo clip",
}


def _read_json(name: str, default):
    path = DATA_DIR / f"{name}.json"
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text())
    except Exception:
        return default


def _write_json(name: str, data) -> None:
    path = DATA_DIR / f"{name}.json"
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, indent=2))
    tmp.replace(path)


class SettingsPayload(BaseModel):
    accent: str = "#7c3aed"
    radius: int = 14
    preload: str = "auto"
    autoplay: bool = False


@router.get("/showcase")
async def get_showcase():
    """Feature cards for the Showcase page (real saved data)."""
    return {"success": True, "data": _read_json("showcase", SHOWCASE_FEATURES)}


@router.get("/player")
async def get_player_config():
    """Video config for the Player page (real saved data)."""
    saved = _read_json("player", {})
    merged = {**PLAYER_CONFIG, **saved}
    return {"success": True, "data": merged}


@router.get("/settings")
async def get_settings():
    """Currently saved skin/player settings."""
    return {"success": True, "data": _read_json("settings", DEFAULT_SETTINGS)}


@router.put("/settings")
async def save_settings(payload: SettingsPayload):
    """Primary write endpoint — persists skin/player settings."""
    if not payload.accent.startswith("#") or len(payload.accent) != 7:
        raise HTTPException(status_code=422, detail="accent must be a #rrggbb hex color")
    if not (0 <= int(payload.radius) <= 48):
        raise HTTPException(status_code=422, detail="radius must be 0-48")
    if payload.preload not in ("auto", "metadata", "none"):
        raise HTTPException(status_code=422, detail="preload must be auto|metadata|none")
    data = {
        "accent": payload.accent,
        "radius": str(payload.radius),
        "preload": payload.preload,
        "autoplay": payload.autoplay,
        "updated_at": time.time(),
    }
    with _LOCK:
        _write_json("settings", data)
    return {"success": True, "message": "Settings saved", "data": data}


@router.get("/integrations")
async def integrations_status():
    """REAL integration check: lists outputs from the DreamAgent tools API
    using DREAMAGENT_PROJECT_SECRET / DREAMAGENT_TOOLS_URL from the env."""
    secret = os.getenv("DREAMAGENT_PROJECT_SECRET")
    tools_url = os.getenv("DREAMAGENT_TOOLS_URL")
    project_id = os.getenv("PROJECT_ID", "2194")
    result = {
        "dreamagent_project_secret": bool(secret),
        "dreamagent_tools_url": bool(tools_url),
        "live_call": None,
    }
    if secret and tools_url:
        try:
            r = requests.get(
                f"{tools_url}/tools/projects/{project_id}/outputs",
                headers={"X-Project-Secret": secret},
                timeout=15,
            )
            result["live_call"] = {
                "ok": r.status_code < 400,
                "status": r.status_code,
                "outputs": len(r.json().get("outputs", [])) if r.ok else 0,
            }
        except Exception as e:
            result["live_call"] = {"ok": False, "error": str(e)}
    return {"success": True, "data": result}
