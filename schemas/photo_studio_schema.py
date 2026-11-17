from __future__ import annotations
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field

StudioToolType = Literal[
    "remove_bg",
    "replace_bg",
    "enhance",
    "sharpen",
    "resize",
    "crop",
    "remove_object",
    "restore",
    "portrait_enhance",
    "generate_scene",
]


class StudioProcessRequest(BaseModel):
    image_base64: Optional[str] = Field(
        None,
        description="Base64-encoded source image (Data URL or raw base64). Optional only when tool='generate_scene' without a subject.",
    )
    tool: StudioToolType = Field(..., description="The AI photo-editing tool to execute.")
    params: Dict[str, Any] = Field(
        default_factory=dict,
        description="Tool-specific parameters (e.g., brightness, contrast, bg_preset, crop coordinates, etc.).",
    )
    mask_base64: Optional[str] = Field(
        None,
        description="Base64-encoded binary/alpha mask image for object removal (inpainting).",
    )
    custom_bg_base64: Optional[str] = Field(
        None,
        description="Base64-encoded custom background image for background replacement.",
    )
    output_format: Literal["png", "jpeg", "webp"] = Field(
        default="png",
        description="Desired output image format.",
    )


class StudioProcessResponse(BaseModel):
    status: str = "success"
    tool: StudioToolType
    image_base64: str = Field(..., description="Processed image as a Data URL (data:image/...;base64,...)")
    width: int
    height: int
    format: str
    processing_ms: int
    engine: str
    details: Dict[str, Any] = Field(default_factory=dict)


class StudioPromptAssistRequest(BaseModel):
    prompt: str = Field(..., min_length=2, max_length=1000, description="User instruction or creative prompt")


class StudioPromptAssistResponse(BaseModel):
    prompt: str
    enhanced_prompt: str
    recommended_tool: StudioToolType
    recommended_params: Dict[str, Any]
    explanation: str
    provider: str = "local-zero-cost-assistant"


class StudioToolCapability(BaseModel):
    id: StudioToolType
    name: str
    category: str
    description: str
    engine: str
    cost_tier: str = "FREE (Open-Source Local)"
    available: bool = True


class StudioCapabilitiesResponse(BaseModel):
    studio_name: str = "Urban Scenery AI Photo Studio"
    zero_cost_enforced: bool = True
    max_upload_mb: int = 10
    allowed_mime_types: List[str] = ["image/jpeg", "image/png", "image/webp"]
    rembg_available: bool
    opencv_available: bool
    pillow_available: bool
    gemini_text_assist_configured: bool
    local_diffusion_configured: bool
    tools: List[StudioToolCapability]
