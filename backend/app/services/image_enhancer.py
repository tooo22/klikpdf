import logging
import urllib.request
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)

MODEL_URL = "https://huggingface.co/Heliosoph/realesrgan-onnx/resolve/main/realesr-general-x4v3.onnx"
DEFAULT_MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "realesr-general-x4v3.onnx"

class ImageEnhancerService:
    def __init__(self, model_path: Path = DEFAULT_MODEL_PATH):
        self.model_path = model_path
        self._session = None
        self._session_initialized = False

    def ensure_model_available(self) -> bool:
        """Check if ONNX model exists, or attempt downloading it once."""
        if self.model_path.exists() and self.model_path.stat().st_size > 1_000_000:
            return True
        try:
            self.model_path.parent.mkdir(parents=True, exist_ok=True)
            logger.info("Downloading Real-ESRGAN ONNX model (~4.8MB)...")
            req = urllib.request.Request(MODEL_URL, headers={"User-Agent": "KlikPDF/1.0"})
            with urllib.request.urlopen(req, timeout=30) as resp, open(self.model_path, "wb") as f:
                f.write(resp.read())
            logger.info("Real-ESRGAN model downloaded successfully.")
            return True
        except Exception as e:
            logger.warning(f"Could not download Real-ESRGAN model: {e}. Falling back to algorithmic enhancement.")
            return False

    def get_session(self):
        """Lazy-initialize onnxruntime session for CPU execution."""
        if not self._session_initialized:
            self._session_initialized = True
            if self.ensure_model_available():
                try:
                    import onnxruntime as ort
                    opts = ort.SessionOptions()
                    opts.intra_op_num_threads = 4
                    opts.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
                    opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
                    self._session = ort.InferenceSession(
                        str(self.model_path),
                        sess_options=opts,
                        providers=["CPUExecutionProvider"]
                    )
                    logger.info("Real-ESRGAN ONNX session initialized.")
                except Exception as e:
                    logger.error(f"Failed to load ONNX session: {e}")
                    self._session = None
        return self._session

    def enhance(
        self,
        image_path: Path,
        output_path: Path,
        scale: int = 2,
        quality: str = "hd",
        mode: str = "photo"
    ) -> Path:
        """
        Enhance image using Real-ESRGAN AI Super-Resolution with algorithmic fallback.
        Preserves alpha channel, protects dynamic range, and eliminates halo/noise artifacts.
        """
        scale_factor = 4 if quality == "ultra" else min(max(scale or 2, 1), 4)

        # 1. Read input image (support unicode paths on Windows via numpy fromfile)
        img = None
        try:
            raw_bytes = np.fromfile(str(image_path), dtype=np.uint8)
            img = cv2.imdecode(raw_bytes, cv2.IMREAD_UNCHANGED)
        except Exception:
            pass

        if img is None:
            # Fallback to PIL reader
            pil_img = Image.open(image_path)
            img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR if pil_img.mode == "RGB" else cv2.COLOR_RGBA2BGRA)

        if img is None:
            raise ValueError("Format gambar tidak didukung atau berkas rusak.")

        # 2. Extract and preserve Alpha channel if present
        has_alpha = len(img.shape) == 3 and img.shape[2] == 4
        alpha_channel = None
        if has_alpha:
            alpha_channel = img[:, :, 3]
            img = img[:, :, :3]
        elif len(img.shape) == 2:
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)

        h, w = img.shape[:2]

        # 3. Guard against excessive output resolution (cap output at 4096px on long edge)
        max_dim = max(h, w)
        if max_dim * scale_factor > 4096:
            down_scale = 4096.0 / (max_dim * scale_factor)
            new_in_w = max(16, int(w * down_scale))
            new_in_h = max(16, int(h * down_scale))
            img = cv2.resize(img, (new_in_w, new_in_h), interpolation=cv2.INTER_AREA)
            if has_alpha:
                alpha_channel = cv2.resize(alpha_channel, (new_in_w, new_in_h), interpolation=cv2.INTER_AREA)
            h, w = img.shape[:2]

        # 4. Try AI super-resolution first
        session = self.get_session()
        enhanced_bgr = None
        if session is not None:
            try:
                enhanced_bgr = self._enhance_ai(img, session, target_scale=scale_factor, mode=mode)
            except Exception as e:
                logger.warning(f"AI upscale failed: {e}. Falling back to algorithmic enhancement.")
                enhanced_bgr = None

        # 5. Algorithmic fallback if AI unavailable
        if enhanced_bgr is None:
            enhanced_bgr = self._enhance_algorithmic(img, scale_factor=scale_factor, quality=quality, mode=mode)

        # 6. Recombine Alpha channel if present
        target_h, target_w = enhanced_bgr.shape[:2]
        if has_alpha and alpha_channel is not None:
            alpha_scaled = cv2.resize(alpha_channel, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
            result_img = cv2.merge([enhanced_bgr, alpha_scaled])
        else:
            result_img = enhanced_bgr

        # 7. Save output safely
        ext = output_path.suffix.lower()
        save_params = []
        if ext in (".jpg", ".jpeg"):
            save_params = [cv2.IMWRITE_JPEG_QUALITY, 96]
            if len(result_img.shape) == 3 and result_img.shape[2] == 4:
                # Discard alpha on JPEG to prevent black artifacts
                result_img = cv2.cvtColor(result_img, cv2.COLOR_BGRA2BGR)
        elif ext == ".png":
            save_params = [cv2.IMWRITE_PNG_COMPRESSION, 4]
        elif ext == ".webp":
            save_params = [cv2.IMWRITE_WEBP_QUALITY, 96]

        success, encoded = cv2.imencode(ext if ext else ".png", result_img, save_params)
        if success:
            encoded.tofile(str(output_path))
        else:
            cv2.imwrite(str(output_path), result_img)

        return output_path

    def _enhance_ai(self, img_bgr: np.ndarray, session, target_scale: int, mode: str) -> np.ndarray:
        """
        Runs Real-ESRGAN 4x with seamless sinusoidal overlapping tiles.
        If target_scale is 2, performs supersampled anti-aliased Lanczos downscale.
        """
        h, w = img_bgr.shape[:2]
        input_name = session.get_inputs()[0].name
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0

        tile_size = 384
        tile_pad = 24
        stride = tile_size - (2 * tile_pad)

        def predict_tile(tile_rgb: np.ndarray) -> np.ndarray:
            blob = np.transpose(tile_rgb, (2, 0, 1))[np.newaxis, :, :, :]
            out = session.run(None, {input_name: blob})[0]
            out_clamped = np.clip(np.squeeze(out), 0.0, 1.0)
            return np.transpose(out_clamped, (1, 2, 0))

        if h <= tile_size and w <= tile_size:
            ai_out_rgb = predict_tile(img_rgb)
        else:
            model_scale = 4
            out_h, out_w = h * model_scale, w * model_scale
            ai_out_rgb = np.zeros((out_h, out_w, 3), dtype=np.float32)
            weights = np.zeros((out_h, out_w, 3), dtype=np.float32)

            def get_window(th: int, tw: int) -> np.ndarray:
                wy = np.sin(np.linspace(0, np.pi, th))[:, None]
                wx = np.sin(np.linspace(0, np.pi, tw))[None, :]
                w_2d = np.clip(wy * wx, 0.01, 1.0)
                return np.repeat(w_2d[:, :, None], 3, axis=2).astype(np.float32)

            for y in range(0, h, stride):
                for x in range(0, w, stride):
                    y1 = max(0, y - tile_pad)
                    y2 = min(h, y + stride + tile_pad)
                    x1 = max(0, x - tile_pad)
                    x2 = min(w, x + stride + tile_pad)

                    tile = img_rgb[y1:y2, x1:x2]
                    tile_out = predict_tile(tile)

                    oy1, oy2 = y1 * model_scale, y2 * model_scale
                    ox1, ox2 = x1 * model_scale, x2 * model_scale
                    th, tw = oy2 - oy1, ox2 - ox1

                    w_tile = get_window(th, tw)
                    ai_out_rgb[oy1:oy2, ox1:ox2] += tile_out * w_tile
                    weights[oy1:oy2, ox1:ox2] += w_tile

            ai_out_rgb = np.divide(ai_out_rgb, np.maximum(weights, 1e-5))
            ai_out_rgb = np.clip(ai_out_rgb, 0.0, 1.0)

        out_bgr_4x = cv2.cvtColor((ai_out_rgb * 255.0).astype(np.uint8), cv2.COLOR_RGB2BGR)

        # Micro-enhancement in LAB space (enhances depth without creating halos)
        lab = cv2.cvtColor(out_bgr_4x, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)

        if mode == "document":
            clahe = cv2.createCLAHE(clipLimit=1.6, tileGridSize=(8, 8))
            l = clahe.apply(l)
        else:
            clahe = cv2.createCLAHE(clipLimit=1.1, tileGridSize=(8, 8))
            l = clahe.apply(l)

        out_bgr_4x = cv2.cvtColor(cv2.merge([l, a, b]), cv2.COLOR_LAB2BGR)

        if target_scale == 2:
            # Supersampled 2x downscale gives crystal-clear, razor-sharp results
            return cv2.resize(out_bgr_4x, (w * 2, h * 2), interpolation=cv2.INTER_LANCZOS4)
        elif target_scale == 3:
            return cv2.resize(out_bgr_4x, (w * 3, h * 3), interpolation=cv2.INTER_LANCZOS4)
        return out_bgr_4x

    def _enhance_algorithmic(self, img_bgr: np.ndarray, scale_factor: int, quality: str, mode: str) -> np.ndarray:
        """
        High-grade computer vision pipeline:
        1. Bilateral filter pre-denoising (erases JPEG block artifacts while keeping edges razor-sharp)
        2. High-precision Lanczos-4 resampling
        3. LAB luminance separation to eliminate chromatic aberration and color fringing
        4. Subtle CLAHE micro-contrast
        5. Halo-free, soft-clamped unsharp masking with thresholding
        """
        h, w = img_bgr.shape[:2]

        # 1. Bilateral pre-denoise
        denoised = cv2.bilateralFilter(img_bgr, d=5, sigmaColor=20, sigmaSpace=20)

        # 2. Resampling
        new_w, new_h = int(w * scale_factor), int(h * scale_factor)
        if scale_factor == 4:
            # Progressive 2-stage Lanczos
            mid_w, mid_h = int(w * 2), int(h * 2)
            step1 = cv2.resize(denoised, (mid_w, mid_h), interpolation=cv2.INTER_LANCZOS4)
            step1_clean = cv2.bilateralFilter(step1, d=3, sigmaColor=12, sigmaSpace=12)
            upscaled = cv2.resize(step1_clean, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
        else:
            upscaled = cv2.resize(denoised, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)

        # 3. LAB color space (process luminance only)
        lab = cv2.cvtColor(upscaled, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)

        # 4. Adaptive contrast on luminance
        clip_limit = 1.3 if quality == "ultra" else 1.15
        if mode == "document":
            clip_limit = 1.8
        clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=(8, 8))
        l_clahe = clahe.apply(l)

        # 5. Halo-free smart edge sharpening
        l_float = l_clahe.astype(np.float32)
        blur = cv2.GaussianBlur(l_float, (0, 0), sigmaX=1.1)
        detail = l_float - blur

        # Ignore tiny flat sensor noise (threshold = 2.5)
        mask = np.abs(detail) > 2.5
        detail = detail * mask

        # Soft clamp to eliminate halo rings
        max_halo = 22.0 if quality == "ultra" else 16.0
        detail = np.clip(detail, -max_halo, max_halo)

        strength = 0.6 if quality == "ultra" else 0.45
        l_enhanced = l_float + (strength * detail)
        l_final = np.clip(l_enhanced, 0, 255).astype(np.uint8)

        # Clean color channels to eliminate chroma noise
        a_clean = cv2.bilateralFilter(a, d=3, sigmaColor=10, sigmaSpace=10)
        b_clean = cv2.bilateralFilter(b, d=3, sigmaColor=10, sigmaSpace=10)

        lab_out = cv2.merge([l_final, a_clean, b_clean])
        return cv2.cvtColor(lab_out, cv2.COLOR_LAB2BGR)

image_enhancer = ImageEnhancerService()
