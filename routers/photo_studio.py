from __future__ import annotations
import hmac
import os
from typing import Optional
from fastapi import APIRouter, Depends, Header, HTTPException, status

from core.config import settings
from schemas.photo_studio_schema import (
    StudioCapabilitiesResponse,
    StudioProcessRequest,
    StudioProcessResponse,
    StudioPromptAssistRequest,
    StudioPromptAssistResponse,
    StudioToolCapability,
)
from services import photo_editor_service


def verify_studio_api_key(
    x_studio_key: Optional[str] = Header(default=None, alias="X-Studio-Key"),
) -> Optional[str]:
    """
    Validate the X-Studio-Key header against configured STUDIO_API_KEY or STUDIO_DEV_KEY.
    If REQUIRE_STUDIO_API_KEY=true in .env, requests without a valid key are rejected with 401.
    """
    valid_keys = {
        k for k in (settings.STUDIO_API_KEY, settings.STUDIO_DEV_KEY) if k
    }
    if x_studio_key:
        if any(hmac.compare_digest(x_studio_key, vk) for vk in valid_keys):
            return x_studio_key
        if settings.REQUIRE_STUDIO_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid X-Studio-Key header provided.",
            )
    elif settings.REQUIRE_STUDIO_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-Studio-Key header. Provide STUDIO_API_KEY or STUDIO_DEV_KEY.",
        )
    return x_studio_key


router = APIRouter(
    prefix="/ai/photo-studio",
    tags=["AI Photo Editing Studio (Free Open-Source)"],
    dependencies=[Depends(verify_studio_api_key)],
)


@router.get("/capabilities", response_model=StudioCapabilitiesResponse)
def get_photo_studio_capabilities() -> StudioCapabilitiesResponse:
    """
    Return the status and capabilities of the 100% free open-source AI Photo Studio.
    """
    gemini_configured = bool(os.getenv("GEMINI_API_KEY", "").strip())
    local_sd_configured = bool(os.getenv("LOCAL_SD_URL", "").strip())

    tools = [
        StudioToolCapability(
            id="remove_bg",
            name="Background Removal",
            category="Cutout & Masking",
            description="Isolate products or subjects with transparent alpha backgrounds using rembg (U2Net ONNX) and OpenCV GrabCut.",
            engine="rembg (u2netp ONNX) + OpenCV GrabCut fallback",
        ),
        StudioToolCapability(
            id="replace_bg",
            name="Background Replacement",
            category="Cutout & Masking",
            description="Composite isolated products onto 4K studio backdrops, 3D podiums, custom colors, or uploaded scenes with contact shadows.",
            engine="Pillow Alpha Compositor + NumPy Studio Renderer",
        ),
        StudioToolCapability(
            id="enhance",
            name="Image Enhancement",
            category="Color & Lighting",
            description="Adaptive LAB-space CLAHE contrast, shadow recovery, brightness, vibrance, and color warmth tuning.",
            engine="OpenCV LAB-CLAHE + Pillow ImageEnhance",
        ),
        StudioToolCapability(
            id="sharpen",
            name="Image Sharpening",
            category="Detail & Clarity",
            description="Edge-aware Unsharp Masking and structure detail boost for crisp product and texture clarity.",
            engine="OpenCV Gaussian Unsharp Mask + DetailEnhance",
        ),
        StudioToolCapability(
            id="resize",
            name="Image Resizing",
            category="Geometry & Transform",
            description="High-precision Lanczos resampling with aspect-ratio lock, smart padding, and e-commerce dimension presets.",
            engine="Pillow Lanczos Sinc Resampler",
        ),
        StudioToolCapability(
            id="crop",
            name="Image Cropping",
            category="Geometry & Transform",
            description="Lossless region cropping with interactive bounding box coordinates and aspect-ratio presets (1:1, 4:3, 16:9, 4:5).",
            engine="Pillow Lossless Region Crop",
        ),
        StudioToolCapability(
            id="remove_object",
            name="Object Removal (Inpainting)",
            category="Retouch & Repair",
            description="Erase unwanted objects, cables, blemishes, or marks painted on the interactive mask using Fast Marching or Navier-Stokes inpainting.",
            engine="OpenCV Inpaint (Telea / Navier-Stokes)",
        ),
        StudioToolCapability(
            id="restore",
            name="Image Restoration",
            category="Retouch & Repair",
            description="Repair noisy, compressed, scratched, or color-faded photographs using Non-Local Means denoising and Gray-World neutralization.",
            engine="OpenCV fastNlMeansDenoisingColored + Morphological Filter",
        ),
        StudioToolCapability(
            id="portrait_enhance",
            name="Portrait Enhancement",
            category="Retouch & Repair",
            description="YCrCb skin-tone detection with edge-preserving bilateral skin smoothing, eye/hair sharpening, and warm studio tone lift.",
            engine="OpenCV Bilateral Skin Filter + Unsharp Detail",
        ),
        StudioToolCapability(
            id="generate_scene",
            name="AI Studio Scene Generator",
            category="Creative Synthesis",
            description="Synthesize procedural studio lighting scenes, bokeh backdrops, and product showcases locally at $0 cost.",
            engine="NumPy/Pillow Procedural Studio Engine (+ Optional Local Diffusion)",
        ),
    ]

    return StudioCapabilitiesResponse(
        rembg_available=photo_editor_service.REMBG_AVAILABLE,
        opencv_available=photo_editor_service.OPENCV_AVAILABLE,
        pillow_available=True,
        gemini_text_assist_configured=gemini_configured,
        local_diffusion_configured=local_sd_configured,
        tools=tools,
    )


@router.post("/process", response_model=StudioProcessResponse)
def process_photo_studio_edit(payload: StudioProcessRequest) -> StudioProcessResponse:
    """
    Execute one of the 10 free AI photo-editing operations in memory.
    Validates image format, dimensions, and 10 MB upload limit.
    Does not permanently store uploaded images on disk.
    """
    try:
        result = photo_editor_service.process_studio_operation(
            tool=payload.tool,
            image_b64=payload.image_base64,
            params=payload.params,
            mask_b64=payload.mask_base64,
            custom_bg_b64=payload.custom_bg_base64,
            output_format=payload.output_format,
        )
        return StudioProcessResponse(**result)
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err),
        ) from val_err
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Photo studio processing failed: {exc}",
        ) from exc


@router.post("/assist", response_model=StudioPromptAssistResponse)
def assist_photo_studio_prompt(payload: StudioPromptAssistRequest) -> StudioPromptAssistResponse:
    """
    Analyze a natural-language photo editing instruction and return recommended
    tool and parameters using the zero-cost assistant.
    """
    result = photo_editor_service.assist_photo_prompt(payload.prompt)
    return StudioPromptAssistResponse(**result)
