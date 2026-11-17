import { StudioProcessRequest, StudioProcessResponse } from '../types';

/**
 * Load a Data URL or external URL into an HTMLImageElement.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to decode source image in browser.'));
    img.src = src;
  });
}

function clampByte(val: number): number {
  return val < 0 ? 0 : val > 255 ? 255 : Math.round(val);
}

function parseHex(hex: string): [number, number, number] {
  const clean = (hex || '#F8FAFC').replace('#', '').trim();
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16) || 248,
      parseInt(clean[1] + clean[1], 16) || 250,
      parseInt(clean[2] + clean[2], 16) || 252,
    ];
  }
  if (clean.length === 6) {
    return [
      parseInt(clean.slice(0, 2), 16) || 248,
      parseInt(clean.slice(2, 4), 16) || 250,
      parseInt(clean.slice(4, 6), 16) || 252,
    ];
  }
  return [248, 250, 252];
}

/**
 * Remove background in-browser using corner-sampled chromatic distance + flood-connected edge matting.
 */
function removeBgImageData(imgData: ImageData, feather: number = 1, threshold: number = 28): ImageData {
  const { width: w, height: h, data } = imgData;
  const out = new ImageData(new Uint8ClampedArray(data), w, h);
  const d = out.data;

  // Sample border corners to determine background color
  const samples: [number, number, number][] = [];
  const step = Math.max(1, Math.floor(Math.min(w, h) / 25));
  for (let x = 0; x < w; x += step) {
    const topIdx = x * 4;
    const botIdx = ((h - 1) * w + x) * 4;
    samples.push([d[topIdx], d[topIdx + 1], d[topIdx + 2]]);
    samples.push([d[botIdx], d[botIdx + 1], d[botIdx + 2]]);
  }
  for (let y = 0; y < h; y += step) {
    const leftIdx = y * w * 4;
    const rightIdx = (y * w + (w - 1)) * 4;
    samples.push([d[leftIdx], d[leftIdx + 1], d[leftIdx + 2]]);
    samples.push([d[rightIdx], d[rightIdx + 1], d[rightIdx + 2]]);
  }

  samples.sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
  const mid = samples[Math.floor(samples.length / 2)] || [255, 255, 255];
  const [bgR, bgG, bgB] = mid;

  const tol = Math.max(14, threshold || 32);
  const softRange = Math.max(10, feather * 12);

  const alphaMap = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const dr = d[i] - bgR;
      const dg = d[i + 1] - bgG;
      const db = d[i + 2] - bgB;
      const colorDist = Math.sqrt(dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11);

      // Center bias helps preserve interior product highlights that match background color
      const nx = (x / w - 0.5) * 2;
      const ny = (y / h - 0.5) * 2;
      const edgeProximity = Math.max(Math.abs(nx), Math.abs(ny));
      const adjustedDist = colorDist + (1 - edgeProximity) * 14;

      if (adjustedDist < tol) {
        alphaMap[y * w + x] = 0;
      } else if (adjustedDist < tol + softRange) {
        alphaMap[y * w + x] = ((adjustedDist - tol) / softRange) * 255;
      } else {
        alphaMap[y * w + x] = 255;
      }
    }
  }

  // Smooth alpha channel if feather > 0
  if (feather > 0) {
    const smoothed = new Float32Array(w * h);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = y * w + x;
        smoothed[idx] =
          (alphaMap[idx] * 4 +
            alphaMap[idx - 1] +
            alphaMap[idx + 1] +
            alphaMap[idx - w] +
            alphaMap[idx + w]) /
          8;
      }
    }
    for (let i = 0; i < w * h; i++) {
      d[i * 4 + 3] = clampByte(smoothed[i] || alphaMap[i]);
    }
  } else {
    for (let i = 0; i < w * h; i++) {
      d[i * 4 + 3] = clampByte(alphaMap[i]);
    }
  }

  return out;
}

/**
 * Draw studio backdrop onto a 2D canvas context.
 */
function renderStudioBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  preset: string,
  bgColor: string
) {
  if (preset === 'cyber_neon') {
    const bgGrad = ctx.createRadialGradient(width * 0.5, height * 0.5, width * 0.08, width * 0.5, height * 0.5, width * 0.7);
    bgGrad.addColorStop(0, '#0F172A');
    bgGrad.addColorStop(0.7, '#070A12');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.5, width * 0.34, 0, Math.PI * 2);
    const neonGrad = ctx.createRadialGradient(width * 0.5, height * 0.5, width * 0.05, width * 0.5, height * 0.5, width * 0.34);
    neonGrad.addColorStop(0, 'rgba(230, 0, 126, 0.28)');
    neonGrad.addColorStop(0.6, 'rgba(56, 189, 248, 0.08)');
    neonGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = neonGrad;
    ctx.fill();
    ctx.restore();
    return;
  }

  if (preset === 'tech_podium') {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#F1F5F9');
    bgGrad.addColorStop(1, '#CBD5E1');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(width * 0.5, height * 0.78, width * 0.3, height * 0.055, 0, 0, Math.PI * 2);
    const standGrad = ctx.createLinearGradient(width * 0.2, height * 0.75, width * 0.8, height * 0.82);
    standGrad.addColorStop(0, '#E2E8F0');
    standGrad.addColorStop(0.5, '#FFFFFF');
    standGrad.addColorStop(1, '#94A3B8');
    ctx.fillStyle = standGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(width * 0.5, height * 0.83, width * 0.3, height * 0.045, 0, 0, Math.PI);
    ctx.lineTo(width * 0.2, height * 0.78);
    ctx.ellipse(width * 0.5, height * 0.78, width * 0.3, height * 0.055, 0, Math.PI, 0, true);
    ctx.closePath();
    const baseGrad = ctx.createLinearGradient(width * 0.2, height * 0.78, width * 0.8, height * 0.85);
    baseGrad.addColorStop(0, '#64748B');
    baseGrad.addColorStop(0.5, '#475569');
    baseGrad.addColorStop(1, '#334155');
    ctx.fillStyle = baseGrad;
    ctx.fill();
    ctx.restore();
    return;
  }

  if (preset === 'warm_editorial') {
    const bgGrad = ctx.createRadialGradient(width * 0.5, height * 0.45, width * 0.05, width * 0.5, height * 0.5, width * 0.65);
    bgGrad.addColorStop(0, '#FFFDF9');
    bgGrad.addColorStop(0.65, '#F5EBE0');
    bgGrad.addColorStop(1, '#E3D5CA');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
    return;
  }

  if (preset === 'solid_color') {
    const [r, g, b] = parseHex(bgColor);
    const bgGrad = ctx.createRadialGradient(width * 0.5, height * 0.5, width * 0.1, width * 0.5, height * 0.5, width * 0.7);
    bgGrad.addColorStop(0, `rgb(${r}, ${g}, ${b})`);
    bgGrad.addColorStop(1, `rgb(${Math.max(0, r - 28)}, ${Math.max(0, g - 28)}, ${Math.max(0, b - 28)})`);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
    return;
  }

  // Default: studio_white or flagship_glass
  const bgGrad = ctx.createRadialGradient(width * 0.5, height * 0.48, width * 0.05, width * 0.5, height * 0.5, width * 0.65);
  bgGrad.addColorStop(0, '#FFFFFF');
  bgGrad.addColorStop(0.7, '#F8FAFC');
  bgGrad.addColorStop(1, '#E2E8F0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  if (preset === 'flagship_glass') {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, height * 0.75);
    ctx.lineTo(width, height * 0.75);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Zero-cost client-side photo studio processor fallback.
 */
export async function processPhotoStudioClientFallback(
  payload: StudioProcessRequest
): Promise<StudioProcessResponse> {
  const startTime = performance.now();
  const { tool, params = {}, image_base64, mask_base64, custom_bg_base64, output_format = 'png' } = payload;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Browser 2D canvas context unavailable.');
  }

  let img: HTMLImageElement | null = null;
  if (image_base64) {
    img = await loadImage(image_base64);
  } else if (tool !== 'generate_scene') {
    throw new Error(`Tool '${tool}' requires an input image.`);
  }

  if (tool === 'remove_bg' && img) {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const cutData = removeBgImageData(imgData, Number(params.feather ?? 1), Number(params.threshold ?? 28));
    ctx.putImageData(cutData, 0, 0);
  } else if (tool === 'replace_bg' && img) {
    const w = Number(params.width || Math.max(1000, img.width));
    const h = Number(params.height || Math.max(1000, img.height));
    canvas.width = w;
    canvas.height = h;

    const preset = String(params.preset || 'studio_white');
    const bgColor = String(params.bg_color || '#F8FAFC');
    const addShadow = params.add_shadow !== false;
    const scale = Math.max(0.35, Math.min(0.95, Number(params.scale ?? 0.76)));

    if (custom_bg_base64) {
      const bgImg = await loadImage(custom_bg_base64);
      ctx.save();
      if (Number(params.bg_blur) > 0) {
        ctx.filter = `blur(${Number(params.bg_blur)}px)`;
      }
      ctx.drawImage(bgImg, 0, 0, w, h);
      ctx.restore();
    } else {
      renderStudioBackdrop(ctx, w, h, preset, bgColor);
    }

    // Isolate foreground on offscreen canvas
    const off = document.createElement('canvas');
    off.width = img.width;
    off.height = img.height;
    const offCtx = off.getContext('2d')!;
    offCtx.drawImage(img, 0, 0);
    const cut = removeBgImageData(offCtx.getImageData(0, 0, off.width, off.height), 1, 26);
    offCtx.putImageData(cut, 0, 0);

    const maxDim = Math.min(w, h) * scale;
    const ratio = Math.min(maxDim / img.width, maxDim / img.height);
    const drawW = img.width * ratio;
    const drawH = img.height * ratio;
    const drawX = (w - drawW) / 2;
    const drawY = (h - drawH) * 0.45;

    if (addShadow) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(w * 0.5, drawY + drawH - 6, drawW * 0.38, Math.max(14, h * 0.028), 0, 0, Math.PI * 2);
      ctx.fillStyle = preset === 'cyber_neon' ? 'rgba(230, 0, 126, 0.32)' : 'rgba(15, 23, 42, 0.26)';
      ctx.filter = 'blur(12px)';
      ctx.fill();
      ctx.restore();
    }

    ctx.drawImage(off, drawX, drawY, drawW, drawH);
  } else if (tool === 'enhance' && img) {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;

    const brightness = Number(params.brightness ?? 1.0);
    const contrast = Number(params.contrast ?? 1.1);
    const saturation = Number(params.saturation ?? 1.1);
    const warmth = Number(params.warmth ?? 0);
    const shadows = Number(params.shadows ?? 0);

    const contrastFactor = contrast;
    for (let i = 0; i < d.length; i += 4) {
      let r = d[i] * brightness;
      let g = d[i + 1] * brightness;
      let b = d[i + 2] * brightness;

      // Shadow recovery
      if (shadows !== 0) {
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const lift = Math.pow(1 - Math.min(1, lum), 2) * shadows * 1.1;
        r += lift;
        g += lift;
        b += lift;
      }

      // Contrast around midpoint 128
      r = (r - 128) * contrastFactor + 128;
      g = (g - 128) * contrastFactor + 128;
      b = (b - 128) * contrastFactor + 128;

      // Saturation
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray + (r - gray) * saturation;
      g = gray + (g - gray) * saturation;
      b = gray + (b - gray) * saturation;

      // Warmth
      r += warmth * 0.65;
      g += warmth * 0.15;
      b -= warmth * 0.65;

      d[i] = clampByte(r);
      d[i + 1] = clampByte(g);
      d[i + 2] = clampByte(b);
    }
    ctx.putImageData(imgData, 0, 0);
  } else if (tool === 'sharpen' && img) {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const w = canvas.width;
    const h = canvas.height;
    const srcData = ctx.getImageData(0, 0, w, h);
    const src = srcData.data;
    const outData = new ImageData(new Uint8ClampedArray(src), w, h);
    const dst = outData.data;

    const amount = Math.max(0, Math.min(2.2, (Number(params.strength ?? 60) / 100) * 1.6));
    // 3x3 Unsharp convolution kernel
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4;
        for (let c = 0; c < 3; c++) {
          const center = src[idx + c];
          const neighbors =
            (src[((y - 1) * w + x) * 4 + c] +
              src[((y + 1) * w + x) * 4 + c] +
              src[(y * w + (x - 1)) * 4 + c] +
              src[(y * w + (x + 1)) * 4 + c]) *
            0.25;
          dst[idx + c] = clampByte(center + (center - neighbors) * amount * 2.2);
        }
      }
    }
    ctx.putImageData(outData, 0, 0);
  } else if (tool === 'resize' && img) {
    const targetW = Math.max(32, Math.min(4096, Number(params.width || 1000)));
    const targetH = Math.max(32, Math.min(4096, Number(params.height || 1000)));
    const maintain = params.maintain_aspect !== false;
    const fitMode = String(params.fit_mode || 'contain');

    if (!maintain || fitMode === 'stretch') {
      canvas.width = targetW;
      canvas.height = targetH;
      ctx.drawImage(img, 0, 0, targetW, targetH);
    } else if (fitMode === 'pad') {
      canvas.width = targetW;
      canvas.height = targetH;
      ctx.fillStyle = String(params.pad_color || '#FFFFFF');
      ctx.fillRect(0, 0, targetW, targetH);
      const ratio = Math.min(targetW / img.width, targetH / img.height);
      const dw = Math.round(img.width * ratio);
      const dh = Math.round(img.height * ratio);
      ctx.drawImage(img, Math.round((targetW - dw) / 2), Math.round((targetH - dh) / 2), dw, dh);
    } else {
      const ratio = Math.min(targetW / img.width, targetH / img.height);
      canvas.width = Math.max(1, Math.round(img.width * ratio));
      canvas.height = Math.max(1, Math.round(img.height * ratio));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  } else if (tool === 'crop' && img) {
    const w = img.width;
    const h = img.height;
    let left = 0;
    let top = 0;
    let cropW = w;
    let cropH = h;

    if (params.norm_x !== undefined && params.norm_y !== undefined) {
      left = Math.round(Number(params.norm_x) * w);
      top = Math.round(Number(params.norm_y) * h);
      cropW = Math.max(16, Math.round(Number(params.norm_w) * w));
      cropH = Math.max(16, Math.round(Number(params.norm_h) * h));
    } else if (params.aspect_preset && params.aspect_preset !== 'free') {
      const map: Record<string, number> = {
        '1:1': 1,
        '4:3': 4 / 3,
        '3:4': 3 / 4,
        '16:9': 16 / 9,
        '4:5': 4 / 5,
      };
      const targetRatio = map[String(params.aspect_preset)] || 1;
      const currRatio = w / h;
      if (currRatio > targetRatio) {
        cropW = Math.round(h * targetRatio);
        cropH = h;
      } else {
        cropW = w;
        cropH = Math.round(w / targetRatio);
      }
      left = Math.round((w - cropW) / 2);
      top = Math.round((h - cropH) / 2);
    }
    canvas.width = cropW;
    canvas.height = cropH;
    ctx.drawImage(img, left, top, cropW, cropH, 0, 0, cropW, cropH);
  } else if (tool === 'remove_object' && img) {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const w = canvas.width;
    const h = canvas.height;
    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;

    // Build mask array from mask_base64
    const maskFlag = new Uint8Array(w * h);
    if (mask_base64) {
      const mImg = await loadImage(mask_base64);
      const mCanvas = document.createElement('canvas');
      mCanvas.width = w;
      mCanvas.height = h;
      const mCtx = mCanvas.getContext('2d')!;
      mCtx.drawImage(mImg, 0, 0, w, h);
      const mData = mCtx.getImageData(0, 0, w, h).data;
      for (let i = 0; i < w * h; i++) {
        if (mData[i * 4 + 3] > 25 && (mData[i * 4] > 35 || mData[i * 4 + 1] > 35 || mData[i * 4 + 2] > 35)) {
          maskFlag[i] = 1;
        }
      }
    }

    // Iterative boundary diffusion inpainting from unmasked exterior inward
    const passes = 32;
    for (let p = 0; p < passes; p++) {
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = y * w + x;
          if (!maskFlag[idx]) continue;
          let sr = 0, sg = 0, sb = 0, count = 0;
          const neighbors = [idx - 1, idx + 1, idx - w, idx + w, idx - w - 1, idx - w + 1, idx + w - 1, idx + w + 1];
          for (const n of neighbors) {
            // Weight unmasked pixels higher so boundary propagates cleanly inward
            const weight = maskFlag[n] === 0 ? 3 : 1;
            sr += d[n * 4] * weight;
            sg += d[n * 4 + 1] * weight;
            sb += d[n * 4 + 2] * weight;
            count += weight;
          }
          if (count > 0) {
            d[idx * 4] = Math.round(sr / count);
            d[idx * 4 + 1] = Math.round(sg / count);
            d[idx * 4 + 2] = Math.round(sb / count);
          }
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  } else if ((tool === 'restore' || tool === 'portrait_enhance') && img) {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const w = canvas.width;
    const h = canvas.height;
    const srcData = ctx.getImageData(0, 0, w, h);
    const src = srcData.data;
    const outData = new ImageData(new Uint8ClampedArray(src), w, h);
    const dst = outData.data;

    const smoothAmt = tool === 'portrait_enhance' ? Number(params.skin_smooth ?? 55) / 100 : Number(params.denoise_strength ?? 12) / 30;
    const warmth = Number(params.warmth ?? (tool === 'portrait_enhance' ? 10 : 0));

    // Edge-preserving 3x3 bilateral neighborhood filter
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4;
        const r0 = src[idx], g0 = src[idx + 1], b0 = src[idx + 2];
        let sr = 0, sg = 0, sb = 0, wSum = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nIdx = ((y + dy) * w + (x + dx)) * 4;
            const nr = src[nIdx], ng = src[nIdx + 1], nb = src[nIdx + 2];
            const diff = Math.abs(nr - r0) + Math.abs(ng - g0) + Math.abs(nb - b0);
            const weight = diff < 65 ? 1.0 : 0.15;
            sr += nr * weight;
            sg += ng * weight;
            sb += nb * weight;
            wSum += weight;
          }
        }
        const br = sr / wSum;
        const bg = sg / wSum;
        const bb = sb / wSum;
        dst[idx] = clampByte(r0 * (1 - smoothAmt) + br * smoothAmt + warmth * 0.45);
        dst[idx + 1] = clampByte(g0 * (1 - smoothAmt) + bg * smoothAmt + warmth * 0.1);
        dst[idx + 2] = clampByte(b0 * (1 - smoothAmt) + bb * smoothAmt - warmth * 0.45);
      }
    }
    ctx.putImageData(outData, 0, 0);
  } else if (tool === 'generate_scene') {
    const w = Number(params.width || 1024);
    const h = Number(params.height || 1024);
    canvas.width = w;
    canvas.height = h;
    const style = String(params.style || 'cyber_neon');
    renderStudioBackdrop(ctx, w, h, style, '#0F172A');

    if (img && params.composite_subject !== false) {
      const maxDim = Math.min(w, h) * 0.72;
      const ratio = Math.min(maxDim / img.width, maxDim / img.height);
      const dw = img.width * ratio;
      const dh = img.height * ratio;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) * 0.45, dw, dh);
    }
  }

  const mime =
    output_format === 'jpeg'
      ? 'image/jpeg'
      : output_format === 'webp'
      ? 'image/webp'
      : 'image/png';
  const resultDataUrl = canvas.toDataURL(mime, 0.94);
  const elapsed = Math.max(1, Math.round(performance.now() - startTime));

  return {
    status: 'success',
    tool,
    image_base64: resultDataUrl,
    width: canvas.width,
    height: canvas.height,
    format: output_format,
    processing_ms: elapsed,
    engine: 'browser-zero-cost-cv-engine',
    details: params,
  };
}
