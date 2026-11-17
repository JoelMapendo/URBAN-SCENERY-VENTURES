import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Wand2,
  Sliders,
  Check,
  RefreshCw,
  Eye,
  Layers,
  ShieldCheck,
  Download,
  Image as ImageIcon,
  Zap,
  Scissors,
  Maximize2,
  Crop,
  Eraser,
  UserCheck,
  Undo2,
  Redo2,
  UploadCloud,
  FolderOpen,
  AlertCircle,
  CheckCircle2,
  SplitSquareHorizontal,
  History,
  Trash2,
  Sun,
} from 'lucide-react';
import { api } from '../../services/api';
import { StudioToolType } from '../../types';

export type MockupStyle = 'studio_white' | 'tech_podium' | 'cyber_neon' | 'flagship_glass' | 'warm_editorial' | 'solid_color';

interface NanoBananaAiStudioProps {
  sourceImage: string | null;
  productName?: string;
  onApplyMockup: (beautifiedImage: string) => void;
  onCancel?: () => void;
  standalone?: boolean;
}

interface HistoryEntry {
  id: string;
  label: string;
  tool: StudioToolType | 'original';
  imageDataUrl: string;
  width: number;
  height: number;
  processingMs: number;
  engine: string;
  timestamp: string;
}

const TOOL_DEFINITIONS: {
  id: StudioToolType;
  label: string;
  shortLabel: string;
  desc: string;
  badge: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  {
    id: 'remove_bg',
    label: '1. Background Removal',
    shortLabel: 'Remove BG',
    desc: 'Neural salient-object cutout (rembg U2Net ONNX + OpenCV GrabCut) with transparent PNG alpha output.',
    badge: 'rembg U2Net',
    icon: Scissors,
  },
  {
    id: 'replace_bg',
    label: '2. Background Replacement',
    shortLabel: 'Replace BG',
    desc: 'Composite isolated products onto 4K studio backdrops, 3D podiums, custom colors, or uploaded scenes.',
    badge: 'Alpha Compositor',
    icon: Layers,
  },
  {
    id: 'enhance',
    label: '3. Image Enhancement',
    shortLabel: 'Enhance',
    desc: 'Adaptive LAB-space CLAHE contrast, shadow recovery, brightness, vibrance, and warmth tuning.',
    badge: 'OpenCV CLAHE',
    icon: Sun,
  },
  {
    id: 'sharpen',
    label: '4. Image Sharpening',
    shortLabel: 'Sharpen',
    desc: 'Edge-aware Unsharp Masking and structure detail boost for crisp product and texture clarity.',
    badge: 'Unsharp Mask',
    icon: Zap,
  },
  {
    id: 'resize',
    label: '5. Image Resizing',
    shortLabel: 'Resize',
    desc: 'High-precision Lanczos resampling with aspect-ratio lock, smart padding, and e-commerce presets.',
    badge: 'Pillow Lanczos',
    icon: Maximize2,
  },
  {
    id: 'crop',
    label: '6. Image Cropping',
    shortLabel: 'Crop',
    desc: 'Lossless region cropping with interactive selection box and aspect-ratio presets (1:1, 4:3, 16:9, 4:5).',
    badge: 'Lossless Crop',
    icon: Crop,
  },
  {
    id: 'remove_object',
    label: '7. Object Removal',
    shortLabel: 'Erase Object',
    desc: 'Paint over unwanted objects, wires, or blemishes to reconstruct textures via OpenCV Telea / Navier-Stokes inpainting.',
    badge: 'OpenCV Inpaint',
    icon: Eraser,
  },
  {
    id: 'restore',
    label: '8. Image Restoration',
    shortLabel: 'Restore',
    desc: 'Repair noisy, compressed, scratched, or color-faded photos using Non-Local Means denoising & Gray-World balance.',
    badge: 'NL-Means Restore',
    icon: RefreshCw,
  },
  {
    id: 'portrait_enhance',
    label: '9. Portrait Enhancement',
    shortLabel: 'Portrait',
    desc: 'YCrCb skin-tone detection with edge-preserving bilateral skin smoothing and eye/hair detail sharpening.',
    badge: 'Bilateral Skin',
    icon: UserCheck,
  },
  {
    id: 'generate_scene',
    label: '10. AI Scene Generator',
    shortLabel: 'AI Scene',
    desc: 'Synthesize procedural studio lighting backdrops, bokeh orbs, and showcase compositions at $0 cost.',
    badge: 'Free Procedural',
    icon: Sparkles,
  },
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const NanoBananaAiStudio: React.FC<NanoBananaAiStudioProps> = ({
  sourceImage,
  productName = 'Electronics Hardware',
  onApplyMockup,
  onCancel,
  standalone = false,
}) => {
  // Active tool selection
  const [activeTool, setActiveTool] = useState<StudioToolType>('replace_bg');

  // Editing History Stack
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // View & Comparison State
  const [viewMode, setViewMode] = useState<'edited' | 'split' | 'original'>('edited');
  const [splitPosition, setSplitPosition] = useState<number>(50); // 0 to 100%
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'webp'>('png');

  // Processing & Notification State
  const [processing, setProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isDraggingUpload, setIsDraggingUpload] = useState<boolean>(false);

  // File input refs
  const mainFileInputRef = useRef<HTMLInputElement | null>(null);
  const customBgInputRef = useRef<HTMLInputElement | null>(null);

  // --- Tool 1: Remove BG params ---
  const [rmBgFeather, setRmBgFeather] = useState<number>(1);
  const [rmBgThreshold, setRmBgThreshold] = useState<number>(0);
  const [rmBgAlphaMatting, setRmBgAlphaMatting] = useState<boolean>(false);

  // --- Tool 2: Replace BG params ---
  const [bgPreset, setBgPreset] = useState<MockupStyle>('studio_white');
  const [bgSolidColor, setBgSolidColor] = useState<string>('#E6007E');
  const [bgCustomImage, setBgCustomImage] = useState<string | null>(null);
  const [bgAddShadow, setBgAddShadow] = useState<boolean>(true);
  const [bgSubjectScale, setBgSubjectScale] = useState<number>(78);
  const [bgBlur, setBgBlur] = useState<number>(0);

  // --- Tool 3: Enhance params ---
  const [enhBrightness, setEnhBrightness] = useState<number>(104); // %
  const [enhContrast, setEnhContrast] = useState<number>(115);     // %
  const [enhSaturation, setEnhSaturation] = useState<number>(112); // %
  const [enhWarmth, setEnhWarmth] = useState<number>(5);           // -50..50
  const [enhShadows, setEnhShadows] = useState<number>(15);        // -50..50
  const [enhAutoClahe, setEnhAutoClahe] = useState<boolean>(true);

  // --- Tool 4: Sharpen params ---
  const [sharpStrength, setSharpStrength] = useState<number>(65);
  const [sharpRadius, setSharpRadius] = useState<number>(2.0);
  const [sharpDetailBoost, setSharpDetailBoost] = useState<boolean>(true);

  // --- Tool 5: Resize params ---
  const [resizeWidth, setResizeWidth] = useState<number>(1000);
  const [resizeHeight, setResizeHeight] = useState<number>(1000);
  const [resizeMaintainAspect, setResizeMaintainAspect] = useState<boolean>(true);
  const [resizeFitMode, setResizeFitMode] = useState<'contain' | 'pad' | 'cover' | 'stretch'>('pad');
  const [resizePadColor, setResizePadColor] = useState<string>('#FFFFFF');

  // --- Tool 6: Crop params ---
  const [cropPreset, setCropPreset] = useState<'free' | '1:1' | '4:3' | '16:9' | '4:5'>('1:1');
  const [cropNormX, setCropNormX] = useState<number>(0.1);
  const [cropNormY, setCropNormY] = useState<number>(0.1);
  const [cropNormW, setCropNormW] = useState<number>(0.8);
  const [cropNormH, setCropNormH] = useState<number>(0.8);

  // --- Tool 7: Object Removal (Inpainting) brush mask state ---
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPaintingMask, setIsPaintingMask] = useState<boolean>(false);
  const [brushSize, setBrushSize] = useState<number>(24);
  const [inpaintMethod, setInpaintMethod] = useState<'telea' | 'ns'>('telea');
  const [inpaintRadius, setInpaintRadius] = useState<number>(7);
  const [hasPaintedMask, setHasPaintedMask] = useState<boolean>(false);

  // --- Tool 8: Restore params ---
  const [restoreDenoise, setRestoreDenoise] = useState<number>(12);
  const [restoreScratches, setRestoreScratches] = useState<boolean>(true);
  const [restoreContrast, setRestoreContrast] = useState<boolean>(true);
  const [restoreColorCast, setRestoreColorCast] = useState<boolean>(true);

  // --- Tool 9: Portrait Enhance params ---
  const [portraitSkinSmooth, setPortraitSkinSmooth] = useState<number>(60);
  const [portraitEyeSharpen, setPortraitEyeSharpen] = useState<number>(50);
  const [portraitWarmth, setPortraitWarmth] = useState<number>(10);
  const [portraitBrightness, setPortraitBrightness] = useState<number>(8);

  // --- Tool 10: AI Scene Generator & Prompt Assistant params ---
  const [scenePrompt, setScenePrompt] = useState<string>(
    `Luxury studio showcase for ${productName} with dual-tone magenta and cyan rim lighting`
  );
  const [sceneStyle, setSceneStyle] = useState<string>('cyber_neon');
  const [sceneCompositeSubject, setSceneCompositeSubject] = useState<boolean>(true);
  const [assistInput, setAssistInput] = useState<string>('');
  const [assistExplanation, setAssistExplanation] = useState<string | null>(null);

  // Initialize history when sourceImage changes
  const initWithImage = useCallback((dataUrl: string, label = 'Original Upload') => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const initialEntry: HistoryEntry = {
        id: `step-${Date.now()}`,
        label,
        tool: 'original',
        imageDataUrl: dataUrl,
        width: img.width || 1000,
        height: img.height || 1000,
        processingMs: 0,
        engine: 'source-file',
        timestamp: new Date().toLocaleTimeString(),
      };
      setHistory([initialEntry]);
      setHistoryIndex(0);
      setResizeWidth(img.width || 1000);
      setResizeHeight(img.height || 1000);
      setErrorNotice(null);
    };
    img.onerror = () => {
      const fallbackEntry: HistoryEntry = {
        id: `step-${Date.now()}`,
        label,
        tool: 'original',
        imageDataUrl: dataUrl,
        width: 1000,
        height: 1000,
        processingMs: 0,
        engine: 'source-file',
        timestamp: new Date().toLocaleTimeString(),
      };
      setHistory([fallbackEntry]);
      setHistoryIndex(0);
    };
    img.src = dataUrl;
  }, []);

  useEffect(() => {
    if (sourceImage) {
      initWithImage(sourceImage, 'Original Photo');
    }
  }, [sourceImage, initWithImage]);

  const currentEntry: HistoryEntry | null =
    historyIndex >= 0 && historyIndex < history.length ? history[historyIndex] : null;
  const originalEntry: HistoryEntry | null = history.length > 0 ? history[0] : null;

  // Validate and load a user-selected image file
  const handleValidateAndLoadFile = (file: File, isCustomBg = false) => {
    setErrorNotice(null);
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      setErrorNotice(`Unsupported file type "${file.type || 'unknown'}". Please upload a PNG, JPEG, or WebP image.`);
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorNotice(
        `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 10 MB security limit.`
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const res = ev.target?.result as string;
      if (isCustomBg) {
        setBgCustomImage(res);
        setSuccessNotice('Custom background image loaded! Click "Run Background Replacement" to composite.');
        setTimeout(() => setSuccessNotice(null), 3500);
      } else {
        initWithImage(res, file.name || 'Uploaded Photo');
        setSuccessNotice(`Loaded "${file.name}" into AI Photo Studio.`);
        setTimeout(() => setSuccessNotice(null), 3000);
      }
    };
    reader.onerror = () => {
      setErrorNotice('Failed to read image file from your device.');
    };
    reader.readAsDataURL(file);
  };

  // Clear or initialize the object-removal paint mask canvas when switching to 'remove_object'
  const clearMaskCanvas = useCallback(() => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasPaintedMask(false);
  }, []);

  useEffect(() => {
    if (activeTool === 'remove_object' && currentEntry) {
      const canvas = maskCanvasRef.current;
      if (canvas) {
        canvas.width = currentEntry.width || 800;
        canvas.height = currentEntry.height || 800;
        clearMaskCanvas();
      }
    }
  }, [activeTool, currentEntry, clearMaskCanvas]);

  // Paint stroke handler for Object Removal mask canvas
  const paintAtEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'rgba(230, 0, 126, 0.85)';
    ctx.beginPath();
    ctx.arc(x, y, brushSize * ((scaleX + scaleY) / 2), 0, Math.PI * 2);
    ctx.fill();
    setHasPaintedMask(true);
  };

  // Execute the currently selected AI Photo Studio operation
  const handleRunTool = async (overrideTool?: StudioToolType, overrideParams?: Record<string, any>) => {
    const toolToRun = overrideTool || activeTool;
    const inputImage = currentEntry?.imageDataUrl || sourceImage;

    if (!inputImage && toolToRun !== 'generate_scene') {
      setErrorNotice('Please upload or select a photograph first before running an editing tool.');
      return;
    }

    setProcessing(true);
    setErrorNotice(null);
    setSuccessNotice(null);

    const toolMeta = TOOL_DEFINITIONS.find((t) => t.id === toolToRun);
    setStatusMessage(`Running ${toolMeta?.label || toolToRun} via Free Open-Source Engine...`);

    try {
      let params: Record<string, any> = {};
      let maskBase64: string | null = null;
      let customBgBase64: string | null = null;

      if (overrideParams) {
        params = overrideParams;
      } else {
        switch (toolToRun) {
          case 'remove_bg':
            params = {
              feather: rmBgFeather,
              threshold: rmBgThreshold,
              alpha_matting: rmBgAlphaMatting,
            };
            break;
          case 'replace_bg':
            params = {
              preset: bgPreset,
              bg_color: bgSolidColor,
              add_shadow: bgAddShadow,
              scale: bgSubjectScale / 100,
              bg_blur: bgBlur,
            };
            if (bgCustomImage) {
              customBgBase64 = bgCustomImage;
            }
            break;
          case 'enhance':
            params = {
              brightness: enhBrightness / 100,
              contrast: enhContrast / 100,
              saturation: enhSaturation / 100,
              warmth: enhWarmth,
              shadows: enhShadows,
              auto_clahe: enhAutoClahe,
            };
            break;
          case 'sharpen':
            params = {
              strength: sharpStrength,
              radius: sharpRadius,
              detail_boost: sharpDetailBoost,
            };
            break;
          case 'resize':
            params = {
              width: resizeWidth,
              height: resizeHeight,
              maintain_aspect: resizeMaintainAspect,
              fit_mode: resizeFitMode,
              pad_color: resizePadColor,
            };
            break;
          case 'crop':
            if (cropPreset === 'free') {
              params = {
                norm_x: cropNormX,
                norm_y: cropNormY,
                norm_w: cropNormW,
                norm_h: cropNormH,
              };
            } else {
              params = { aspect_preset: cropPreset };
            }
            break;
          case 'remove_object': {
            const mCanvas = maskCanvasRef.current;
            if (mCanvas && hasPaintedMask) {
              maskBase64 = mCanvas.toDataURL('image/png');
            } else {
              throw new Error(
                'Please paint over the unwanted object on the preview image first using the pink brush.'
              );
            }
            params = {
              method: inpaintMethod,
              radius: inpaintRadius,
            };
            break;
          }
          case 'restore':
            params = {
              denoise_strength: restoreDenoise,
              remove_scratches: restoreScratches,
              restore_contrast: restoreContrast,
              color_correct: restoreColorCast,
            };
            break;
          case 'portrait_enhance':
            params = {
              skin_smooth: portraitSkinSmooth,
              eye_sharpen: portraitEyeSharpen,
              warmth: portraitWarmth,
              brightness: portraitBrightness,
            };
            break;
          case 'generate_scene':
            params = {
              prompt: scenePrompt,
              style: sceneStyle,
              width: 1024,
              height: 1024,
              composite_subject: sceneCompositeSubject && Boolean(inputImage),
            };
            break;
        }
      }

      const response = await api.processPhotoStudio({
        image_base64: inputImage,
        tool: toolToRun,
        params,
        mask_base64: maskBase64,
        custom_bg_base64: customBgBase64,
        output_format: toolToRun === 'remove_bg' ? 'png' : exportFormat,
      });

      const newEntry: HistoryEntry = {
        id: `step-${Date.now()}`,
        label: toolMeta?.shortLabel || toolToRun,
        tool: toolToRun,
        imageDataUrl: response.image_base64,
        width: response.width,
        height: response.height,
        processingMs: response.processing_ms,
        engine: response.engine,
        timestamp: new Date().toLocaleTimeString(),
      };

      const nextHistory = [...history.slice(0, historyIndex + 1), newEntry];
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
      setSuccessNotice(
        `${toolMeta?.shortLabel || toolToRun} completed in ${response.processing_ms} ms (${response.width}×${response.height}px via ${response.engine}).`
      );
      if (toolToRun === 'remove_object') {
        clearMaskCanvas();
      }
    } catch (err: any) {
      setErrorNotice(err?.message || 'Failed to process image. Please check your parameters and try again.');
    } finally {
      setProcessing(false);
      setStatusMessage('');
    }
  };

  // Smart Prompt Assistant
  const handleRunPromptAssist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistInput.trim()) return;
    setErrorNotice(null);
    try {
      const res = await api.assistPhotoStudioPrompt(assistInput.trim());
      setActiveTool(res.recommended_tool);
      setAssistExplanation(res.explanation);
      await handleRunTool(res.recommended_tool, res.recommended_params);
    } catch (err: any) {
      setErrorNotice(err?.message || 'Could not interpret instruction.');
    }
  };

  // Download edited image
  const handleDownloadImage = () => {
    if (!currentEntry) return;
    const link = document.createElement('a');
    link.href = currentEntry.imageDataUrl;
    const ext = currentEntry.tool === 'remove_bg' ? 'png' : exportFormat;
    link.download = `urban-scenery-${currentEntry.label.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex >= 0 && historyIndex < history.length - 1;

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-xl space-y-6 animate-in fade-in">
      {/* Hidden File Inputs */}
      <input
        ref={mainFileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleValidateAndLoadFile(f, false);
        }}
        className="hidden"
      />
      <input
        ref={customBgInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleValidateAndLoadFile(f, true);
        }}
        className="hidden"
      />

      {/* ===================================================================== */}
      {/* TOP BAR: Studio Branding, Zero-Cost Guarantee Badge & Quick Actions */}
      {/* ===================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-500 flex-shrink-0">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-black text-slate-950 dark:text-white font-heading">
                URBAN SCENERY • AI Photo-Editing Studio
              </h3>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                100% Free Open-Source Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Powered by rembg (U2Net), OpenCV, and Pillow • Zero API fees, accessible anytime with your data connection.
            </p>
          </div>
        </div>

        {/* Upload New Photo & History Undo/Redo Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => mainFileInputRef.current?.click()}
            className="py-2 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5 text-brand-500" />
            <span>Upload Photo</span>
          </button>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button
              type="button"
              disabled={!canUndo || processing}
              onClick={() => setHistoryIndex((i) => Math.max(0, i - 1))}
              title="Undo last edit"
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-35 transition-all"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={!canRedo || processing}
              onClick={() => setHistoryIndex((i) => Math.min(history.length - 1, i + 1))}
              title="Redo edit"
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-35 transition-all"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={!canUndo || processing}
              onClick={() => setHistoryIndex(0)}
              title="Reset to original photo"
              className="px-2 py-1 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-35 transition-all"
            >
              Reset
            </button>
          </div>

          {/* View Mode Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('edited')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === 'edited'
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Edited
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                viewMode === 'split'
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <SplitSquareHorizontal className="w-3 h-3" />
              <span>Before/After</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('original')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === 'original'
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Original
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SMART NATURAL-LANGUAGE AI INSTRUCTION BAR (Zero-Cost Assistant) */}
      {/* ===================================================================== */}
      <form
        onSubmit={handleRunPromptAssist}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800"
      >
        <div className="flex items-center gap-2 flex-1 px-2">
          <Sparkles className="w-4 h-4 text-brand-500 flex-shrink-0" />
          <input
            type="text"
            value={assistInput}
            onChange={(e) => setAssistInput(e.target.value)}
            placeholder='Try typing: "Remove background", "Place on 3D tech podium", "Denoise & restore old photo", or "Crop 1:1 square"...'
            className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={processing || !assistInput.trim()}
          className="py-2 px-4 rounded-xl bg-black hover:bg-brand-500 text-white text-xs font-bold transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Auto-Run AI Command</span>
        </button>
      </form>

      {assistExplanation && (
        <div className="px-3.5 py-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-700 dark:text-brand-300 flex items-center justify-between">
          <span>
            <strong>AI Studio Assistant:</strong> {assistExplanation}
          </span>
          <button
            type="button"
            onClick={() => setAssistExplanation(null)}
            className="text-[10px] underline ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Notifications (Error & Success) */}
      {errorNotice && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{errorNotice}</span>
          </div>
          <button type="button" onClick={() => setErrorNotice(null)} className="text-[11px] underline">
            Dismiss
          </button>
        </div>
      )}

      {successNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button type="button" onClick={() => setSuccessNotice(null)} className="text-[11px] underline">
            Dismiss
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 10 AI TOOLS SELECTOR RIBBON */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5">
        {TOOL_DEFINITIONS.map((t) => {
          const IconComponent = t.icon;
          const isSelected = activeTool === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTool(t.id)}
              className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                isSelected
                  ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-sm font-bold'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-brand-500/50'
              }`}
            >
              <IconComponent className={`w-4 h-4 ${isSelected ? 'text-brand-400 dark:text-brand-600' : 'text-brand-500'}`} />
              <span className="text-[11px] leading-tight line-clamp-1">{t.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* MAIN STUDIO WORKSPACE: Left Preview & Canvas | Right Tool Controls */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (7 cols): Interactive Preview, Before/After Curtain, Crop/Brush Overlays & History */}
        <div className="lg:col-span-7 space-y-4">
          {!currentEntry ? (
            /* Drag-and-Drop Upload Zone when no image is loaded yet */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingUpload(true);
              }}
              onDragLeave={() => setIsDraggingUpload(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingUpload(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handleValidateAndLoadFile(f, false);
              }}
              className={`aspect-square max-h-[460px] w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 text-center transition-all ${
                isDraggingUpload
                  ? 'border-brand-500 bg-brand-500/10'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Drag & Drop Your Photograph Here
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Supports PNG, JPEG, and WebP up to 10 MB. Or click below to browse from your computer files.
              </p>
              <button
                type="button"
                onClick={() => mainFileInputRef.current?.click()}
                className="mt-4 py-2.5 px-5 rounded-xl bg-black hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Browse Computer Files</span>
              </button>
            </div>
          ) : (
            /* Active Image Preview Container with Checkerboard Transparency Grid */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingUpload(true);
              }}
              onDragLeave={() => setIsDraggingUpload(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingUpload(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handleValidateAndLoadFile(f, false);
              }}
              className="relative aspect-square max-h-[480px] w-full rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center shadow-inner select-none"
              style={{
                backgroundImage:
                  'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                backgroundColor: '#f8fafc',
              }}
            >
              {/* Processing Spinner Overlay */}
              {processing && (
                <div className="absolute inset-0 z-30 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full border-4 border-brand-500/30 border-t-brand-500 animate-spin" />
                  <p className="text-xs font-bold text-white">{statusMessage || 'Processing photograph...'}</p>
                  <p className="text-[10px] text-slate-300 font-mono">
                    OpenCV + Pillow + rembg Zero-Cost Pipeline
                  </p>
                </div>
              )}

              {/* View Mode 1: Split Before/After Comparison Slider */}
              {viewMode === 'split' && originalEntry ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Underneath: Edited Image */}
                  <img
                    src={currentEntry.imageDataUrl}
                    alt="Edited After"
                    className="w-full h-full object-contain"
                  />
                  {/* Clipped Overlay: Original Image */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - splitPosition}% 0 0)` }}
                  >
                    <img
                      src={originalEntry.imageDataUrl}
                      alt="Original Before"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {/* Divider Line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-brand-500 shadow-lg pointer-events-none"
                    style={{ left: `${splitPosition}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                      ↔
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={splitPosition}
                    onChange={(e) => setSplitPosition(Number(e.target.value))}
                    aria-label="Before and after comparison slider"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                  />
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[10px] font-mono font-bold">
                    BEFORE (Original)
                  </span>
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-brand-600/90 text-white text-[10px] font-mono font-bold">
                    AFTER ({currentEntry.label})
                  </span>
                </div>
              ) : viewMode === 'original' && originalEntry ? (
                <img
                  src={originalEntry.imageDataUrl}
                  alt="Original Upload"
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={currentEntry.imageDataUrl}
                  alt={currentEntry.label}
                  className="w-full h-full object-contain"
                />
              )}

              {/* Interactive Brush Canvas Overlay when Tool 7 (Object Removal) is active */}
              {activeTool === 'remove_object' && viewMode === 'edited' && (
                <canvas
                  ref={maskCanvasRef}
                  onMouseDown={(e) => {
                    setIsPaintingMask(true);
                    paintAtEvent(e);
                  }}
                  onMouseMove={(e) => {
                    if (isPaintingMask) paintAtEvent(e);
                  }}
                  onMouseUp={() => setIsPaintingMask(false)}
                  onMouseLeave={() => setIsPaintingMask(false)}
                  className="absolute inset-0 w-full h-full cursor-crosshair z-20"
                />
              )}

              {/* Interactive Visual Crop Box Guide when Tool 6 (Crop) with 'free' preset is active */}
              {activeTool === 'crop' && cropPreset === 'free' && viewMode === 'edited' && (
                <div
                  className="absolute border-2 border-brand-500 bg-brand-500/10 pointer-events-none z-20"
                  style={{
                    left: `${cropNormX * 100}%`,
                    top: `${cropNormY * 100}%`,
                    width: `${cropNormW * 100}%`,
                    height: `${cropNormH * 100}%`,
                  }}
                >
                  <span className="absolute -top-5 left-0 bg-brand-500 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                    Crop Region
                  </span>
                </div>
              )}

              {/* Top Telemetry Pill */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-mono font-bold shadow">
                <Sparkles className="w-3 h-3 text-brand-400" />
                <span>
                  {currentEntry.label} • {currentEntry.width}×{currentEntry.height}px
                  {currentEntry.processingMs > 0 ? ` • ${currentEntry.processingMs}ms` : ''}
                </span>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* EDITING HISTORY TIMELINE BAR */}
          {/* ================================================================= */}
          {history.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-brand-500" />
                  <span>Editing History ({history.length} Step{history.length > 1 ? 's' : ''})</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Click any step to branch or inspect
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {history.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setHistoryIndex(idx)}
                    className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl border text-left flex-shrink-0 transition-all ${
                      idx === historyIndex
                        ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white font-bold shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                    }`}
                  >
                    <img
                      src={item.imageDataUrl}
                      alt={item.label}
                      className="w-8 h-8 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                    />
                    <div>
                      <div className="text-[11px] leading-tight">
                        {idx === 0 ? '0. Original' : `${idx}. ${item.label}`}
                      </div>
                      <div className="text-[9px] opacity-70 font-mono">
                        {item.width}×{item.height}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN (5 cols): Active Tool Controls, Download & Apply */}
        {/* =================================================================== */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-5">
          {(() => {
            const meta = TOOL_DEFINITIONS.find((t) => t.id === activeTool)!;
            const IconComp = meta.icon;
            return (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComp className="w-4 h-4 text-brand-500" />
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">{meta.label}</h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold">
                      {meta.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{meta.desc}</p>
                </div>

                {/* TOOL 1: REMOVE BACKGROUND CONTROLS */}
                {activeTool === 'remove_bg' && (
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Edge Feathering Smoothness</span>
                        <span className="font-mono">{rmBgFeather}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={5}
                        value={rmBgFeather}
                        onChange={(e) => setRmBgFeather(Number(e.target.value))}
                        className="w-full accent-brand-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Alpha Matte Cutoff Threshold</span>
                        <span className="font-mono">{rmBgThreshold}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={120}
                        value={rmBgThreshold}
                        onChange={(e) => setRmBgThreshold(Number(e.target.value))}
                        className="w-full accent-brand-500"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer font-semibold pt-1">
                      <input
                        type="checkbox"
                        checked={rmBgAlphaMatting}
                        onChange={(e) => setRmBgAlphaMatting(e.target.checked)}
                        className="rounded text-brand-500"
                      />
                      <span>Enable Deep Alpha Matting (Fine Hair / Fur Edges)</span>
                    </label>
                  </div>
                )}

                {/* TOOL 2: REPLACE BACKGROUND CONTROLS */}
                {activeTool === 'replace_bg' && (
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-bold mb-1.5">Select Studio Scene or Backdrop:</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'studio_white', label: 'Studio Clean White', icon: '🏢' },
                          { id: 'tech_podium', label: '3D Tech Stand', icon: '🏆' },
                          { id: 'cyber_neon', label: 'Urban Cyber Neon', icon: '⚡' },
                          { id: 'flagship_glass', label: 'Glass Reflection', icon: '✨' },
                          { id: 'warm_editorial', label: 'Warm Sandstone', icon: '☀️' },
                          { id: 'solid_color', label: 'Solid Custom Color', icon: '🎨' },
                        ].map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => {
                              setBgPreset(st.id as MockupStyle);
                              setBgCustomImage(null);
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                              bgPreset === st.id && !bgCustomImage
                                ? 'bg-brand-500/10 border-brand-500 font-bold text-slate-950 dark:text-white'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <span>{st.icon}</span>
                            <span className="truncate">{st.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {bgPreset === 'solid_color' && !bgCustomImage && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="font-semibold">Pick Backdrop Color:</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={bgSolidColor}
                            onChange={(e) => setBgSolidColor(e.target.value)}
                            className="w-7 h-7 rounded cursor-pointer border-0"
                          />
                          <span className="font-mono text-[11px]">{bgSolidColor}</span>
                        </div>
                      </div>
                    )}

                    {/* Custom Background Image Upload */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => customBgInputRef.current?.click()}
                        className="flex-1 py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-brand-500" />
                        <span>{bgCustomImage ? 'Change Custom Backdrop' : 'Upload Custom Backdrop Image'}</span>
                      </button>
                      {bgCustomImage && (
                        <button
                          type="button"
                          onClick={() => setBgCustomImage(null)}
                          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                          title="Clear custom backdrop"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Subject Scale</span>
                        <span className="font-mono">{bgSubjectScale}%</span>
                      </div>
                      <input
                        type="range"
                        min={45}
                        max={95}
                        value={bgSubjectScale}
                        onChange={(e) => setBgSubjectScale(Number(e.target.value))}
                        className="w-full accent-brand-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Background Bokeh Depth Blur</span>
                        <span className="font-mono">{bgBlur}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={25}
                        value={bgBlur}
                        onChange={(e) => setBgBlur(Number(e.target.value))}
                        className="w-full accent-brand-500"
                      />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer font-semibold">
                      <input
                        type="checkbox"
                        checked={bgAddShadow}
                        onChange={(e) => setBgAddShadow(e.target.checked)}
                        className="rounded text-brand-500"
                      />
                      <span>Render 3D Contact Drop Shadow</span>
                    </label>
                  </div>
                )}

                {/* TOOL 3: IMAGE ENHANCEMENT CONTROLS */}
                {activeTool === 'enhance' && (
                  <div className="space-y-3 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-brand-600 dark:text-brand-400">
                      <input
                        type="checkbox"
                        checked={enhAutoClahe}
                        onChange={(e) => setEnhAutoClahe(e.target.checked)}
                        className="rounded text-brand-500"
                      />
                      <span>Auto LAB-CLAHE Dynamic Contrast Equalization</span>
                    </label>
                    <div>
                      <div className="flex justify-between font-semibold mb-0.5">
                        <span>Brightness</span>
                        <span className="font-mono">{enhBrightness}%</span>
                      </div>
                      <input
                        type="range"
                        min={50}
                        max={160}
                        value={enhBrightness}
                        onChange={(e) => setEnhBrightness(Number(e.target.value))}
                        className="w-full accent-brand-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold mb-0.5">
                        <span>Contrast</span>
                        <span className="font-mono">{enhContrast}%</span>
                      </div>
                      <input
                        type="range"
                        min={50}
                        max={170}
                        value={enhContrast}
                        onChange={(e) => setEnhContrast(Number(e.target.value))}
                        className="w-full accent-brand-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold mb-0.5">
                        <span>Vibrance & Saturation</span>
                        <span className="font-mono">{enhSaturation}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={180}
                        value={enhSaturation}
                        onChange={(e) => setEnhSaturation(Number(e.target.value))}
                        className="w-full accent-brand-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold mb-0.5">
                        <span>Shadow Lift Recovery</span>
                        <span className="font-mono">{enhShadows > 0 ? `+${enhShadows}` : enhShadows}</span>
                      </div>
                      <input
                        type="range"
                        min={-30}
                        max={50}
                        value={enhShadows}
                        onChange={(e) => setEnhShadows(Number(e.target.value))}
                        className="w-full accent-brand-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold mb-0.5">
                        <span>Color Temperature (Warmth)</span>
                        <span className="font-mono">{enhWarmth > 0 ? `+${enhWarmth}` : enhWarmth}</span>
                      </div>
                      <input
                        type="range"
                        min={-40}
                        max={40}
                        value={enhWarmth}
                        onChange={(e) => setEnhWarmth(Number(e.target.value))}
                        className="w-full accent-brand-500"
                      />
                    </div>
                  </div>
                )}

                {/* TOOL 4: IMAGE SHARPENING CONTROLS */}
                {activeTool === 'sharpen' && (
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Unsharp Mask Strength</span>
                        <span className="font-mono">{sharpStrength}%</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        value={sharpStrength}
                        onChange={(e) => setSharpStrength(Number(e.target.value))}
                        className="w-full accent-brand-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Edge Radius (Sigma)</span>
                        <span className="font-mono">{sharpRadius.toFixed(1)}px</span>
                      </div>
                      <input
                        type="range"
                        min={0.5}
                        max={5.0}
                        step={0.5}
                        value={sharpRadius}
                        onChange={(e) => setSharpRadius(Number(e.target.value))}
                        className="w-full accent-brand-500"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer font-semibold pt-1">
                      <input
                        type="checkbox"
                        checked={sharpDetailBoost}
                        onChange={(e) => setSharpDetailBoost(e.target.checked)}
                        className="rounded text-brand-500"
                      />
                      <span>Enable OpenCV High-Frequency Structure Detail Boost</span>
                    </label>
                  </div>
                )}

                {/* TOOL 5: IMAGE RESIZING CONTROLS */}
                {activeTool === 'resize' && (
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-bold mb-1.5">Quick E-Commerce Presets:</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { label: '1000×1000 Square', w: 1000, h: 1000 },
                          { label: '1200×900 Catalog', w: 1200, h: 900 },
                          { label: '1920×1080 Full HD', w: 1920, h: 1080 },
                          { label: '1080×1350 Social', w: 1080, h: 1350 },
                        ].map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => {
                              setResizeWidth(p.w);
                              setResizeHeight(p.h);
                            }}
                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-500 text-[11px] font-semibold"
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Width (px)</label>
                        <input
                          type="number"
                          min={32}
                          max={4096}
                          value={resizeWidth}
                          onChange={(e) => setResizeWidth(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Height (px)</label>
                        <input
                          type="number"
                          min={32}
                          max={4096}
                          value={resizeHeight}
                          onChange={(e) => setResizeHeight(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Resampling Fit Mode</label>
                      <select
                        value={resizeFitMode}
                        onChange={(e) => setResizeFitMode(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                      >
                        <option value="pad">Smart Pad (Preserve Aspect & Pad Canvas)</option>
                        <option value="contain">Fit Inside (Proportional Thumbnail)</option>
                        <option value="cover">Center Cover Crop</option>
                        <option value="stretch">Exact Stretch</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* TOOL 6: IMAGE CROPPING CONTROLS */}
                {activeTool === 'crop' && (
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-bold mb-1.5">Aspect Ratio Preset:</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['1:1', '4:3', '16:9', '4:5', 'free'] as const).map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setCropPreset(preset)}
                            className={`py-2 px-2.5 rounded-xl border font-bold uppercase ${
                              cropPreset === preset
                                ? 'bg-black dark:bg-white text-white dark:text-black border-black'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            {preset === 'free' ? 'Custom Box' : preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {cropPreset === 'free' && (
                      <div className="space-y-2.5 pt-1">
                        <div>
                          <div className="flex justify-between font-semibold">
                            <span>Horizontal Offset (X)</span>
                            <span className="font-mono">{Math.round(cropNormX * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={0.8}
                            step={0.02}
                            value={cropNormX}
                            onChange={(e) => setCropNormX(Number(e.target.value))}
                            className="w-full accent-brand-500"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between font-semibold">
                            <span>Vertical Offset (Y)</span>
                            <span className="font-mono">{Math.round(cropNormY * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={0.8}
                            step={0.02}
                            value={cropNormY}
                            onChange={(e) => setCropNormY(Number(e.target.value))}
                            className="w-full accent-brand-500"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between font-semibold">
                            <span>Crop Width</span>
                            <span className="font-mono">{Math.round(cropNormW * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min={0.15}
                            max={1 - cropNormX}
                            step={0.02}
                            value={cropNormW}
                            onChange={(e) => setCropNormW(Number(e.target.value))}
                            className="w-full accent-brand-500"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between font-semibold">
                            <span>Crop Height</span>
                            <span className="font-mono">{Math.round(cropNormH * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min={0.15}
                            max={1 - cropNormY}
                            step={0.02}
                            value={cropNormH}
                            onChange={(e) => setCropNormH(Number(e.target.value))}
                            className="w-full accent-brand-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TOOL 7: OBJECT REMOVAL (INPAINTING) CONTROLS */}
                {activeTool === 'remove_object' && (
                  <div className="space-y-3.5 text-xs">
                    <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-slate-800 dark:text-slate-200">
                      <strong>How to use:</strong> Drag your cursor directly over the image on the left to paint a pink mask over any unwanted object, cable, or blemish, then click <strong>Apply</strong> below.
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Brush Size</span>
                        <span className="font-mono">{brushSize}px</span>
                      </div>
                      <input
                        type="range"
                        min={6}
                        max={65}
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-full accent-brand-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Inpaint Neighborhood Radius</span>
                        <span className="font-mono">{inpaintRadius}px</span>
                      </div>
                      <input
                        type="range"
                        min={3}
                        max={20}
                        value={inpaintRadius}
                        onChange={(e) => setInpaintRadius(Number(e.target.value))}
                        className="w-full accent-brand-500"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <select
                        value={inpaintMethod}
                        onChange={(e) => setInpaintMethod(e.target.value as 'telea' | 'ns')}
                        className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                      >
                        <option value="telea">OpenCV Telea (Fast Marching)</option>
                        <option value="ns">OpenCV Navier-Stokes (Fluid)</option>
                      </select>
                      <button
                        type="button"
                        onClick={clearMaskCanvas}
                        className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                      >
                        Clear Brush
                      </button>
                    </div>
                  </div>
                )}

                {/* TOOL 8: IMAGE RESTORATION CONTROLS */}
                {activeTool === 'restore' && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Non-Local Means Denoising Strength</span>
                        <span className="font-mono">{restoreDenoise}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={25}
                        value={restoreDenoise}
                        onChange={(e) => setRestoreDenoise(Number(e.target.value))}
                        className="w-full accent-brand-500"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer font-semibold">
                      <input
                        type="checkbox"
                        checked={restoreScratches}
                        onChange={(e) => setRestoreScratches(e.target.checked)}
                        className="rounded text-brand-500"
                      />
                      <span>Morphological Dust & Scratch Impulse Repair</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-semibold">
                      <input
                        type="checkbox"
                        checked={restoreColorCast}
                        onChange={(e) => setRestoreColorCast(e.target.checked)}
                        className="rounded text-brand-500"
                      />
                      <span>Gray-World Color Cast Neutralization</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-semibold">
                      <input
                        type="checkbox"
                        checked={restoreContrast}
                        onChange={(e) => setRestoreContrast(e.target.checked)}
                        className="rounded text-brand-500"
                      />
                      <span>Faded Dynamic Range Recovery (LAB CLAHE)</span>
                    </label>
                  </div>
                )}

                {/* TOOL 9: PORTRAIT ENHANCEMENT CONTROLS */}
                {activeTool === 'portrait_enhance' && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Bilateral Skin Smoothing (Edge-Preserving)</span>
                        <span className="font-mono">{portraitSkinSmooth}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={portraitSkinSmooth}
                        onChange={(e) => setPortraitSkinSmooth(Number(e.target.value))}
                        className="w-full accent-brand-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Eyes, Lashes & Hair Detail Clarity</span>
                        <span className="font-mono">{portraitEyeSharpen}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={portraitEyeSharpen}
                        onChange={(e) => setPortraitEyeSharpen(Number(e.target.value))}
                        className="w-full accent-brand-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Skin Tone Warmth</span>
                        <span className="font-mono">{portraitWarmth > 0 ? `+${portraitWarmth}` : portraitWarmth}</span>
                      </div>
                      <input
                        type="range"
                        min={-25}
                        max={25}
                        value={portraitWarmth}
                        onChange={(e) => setPortraitWarmth(Number(e.target.value))}
                        className="w-full accent-brand-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Studio Fill-Light Lift</span>
                        <span className="font-mono">+{portraitBrightness}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={30}
                        value={portraitBrightness}
                        onChange={(e) => setPortraitBrightness(Number(e.target.value))}
                        className="w-full accent-brand-500"
                      />
                    </div>
                  </div>
                )}

                {/* TOOL 10: AI SCENE GENERATOR CONTROLS */}
                {activeTool === 'generate_scene' && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold mb-1">Scene & Lighting Prompt</label>
                      <textarea
                        rows={2}
                        value={scenePrompt}
                        onChange={(e) => setScenePrompt(e.target.value)}
                        placeholder="Describe your desired studio backdrop and lighting mood..."
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Atmosphere Preset</label>
                      <select
                        value={sceneStyle}
                        onChange={(e) => setSceneStyle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                      >
                        <option value="cyber_neon">Cyberpunk Magenta & Cyan Bokeh Studio</option>
                        <option value="tech_podium">Brushed Aluminum 3D Podium Showcase</option>
                        <option value="flagship_glass">Editorial Mirrored Glass Horizon</option>
                        <option value="warm_editorial">Sunlit Sandstone Architectural Studio</option>
                        <option value="studio_white">Pure Commercial White Infinity Cove</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer font-semibold">
                      <input
                        type="checkbox"
                        checked={sceneCompositeSubject}
                        onChange={(e) => setSceneCompositeSubject(e.target.checked)}
                        className="rounded text-brand-500"
                      />
                      <span>Composite Current Product Cutout into Generated Scene</span>
                    </label>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Note: Uses the 100% free local procedural studio engine. Paid cloud text-to-image APIs (such as billed Imagen/DALL-E) are disabled under the strict Zero-Cost Policy.
                    </p>
                  </div>
                )}

                {/* Primary Run Tool Button */}
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleRunTool()}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-pink-500 hover:from-brand-700 hover:to-pink-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>{processing ? 'Processing...' : `Apply ${meta.shortLabel}`}</span>
                </button>
              </div>
            );
          })()}

          {/* ================================================================= */}
          {/* EXPORT / DOWNLOAD & APPLY TO PRODUCT FOOTER */}
          {/* ================================================================= */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Format:</span>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as 'png' | 'jpeg' | 'webp')}
                  className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
                >
                  <option value="png">PNG (Lossless / Alpha)</option>
                  <option value="jpeg">JPEG (Compact)</option>
                  <option value="webp">WebP (Modern)</option>
                </select>
              </div>

              <button
                type="button"
                disabled={!currentEntry || processing}
                onClick={handleDownloadImage}
                className="py-2 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5 text-brand-500" />
                <span>Download Image</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={processing || !currentEntry}
                onClick={() => {
                  if (currentEntry) {
                    onApplyMockup(currentEntry.imageDataUrl);
                  }
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-black hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{standalone ? 'Save Edited Photo to Product Upload' : 'Apply Edited Photo to Product'}</span>
              </button>

              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
