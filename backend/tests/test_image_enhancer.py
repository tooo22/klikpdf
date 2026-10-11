import pytest
from pathlib import Path
from PIL import Image
import numpy as np
import cv2
from app.services.image_enhancer import image_enhancer

@pytest.fixture
def sample_rgb_image(tmp_path):
    p = tmp_path / "photo_sample.jpg"
    # Create realistic test image with gradients and shapes
    arr = np.zeros((120, 120, 3), dtype=np.uint8)
    for y in range(120):
        arr[y, :, 0] = int(y * 2)
        arr[y, :, 1] = int(120 - y)
        arr[y, :, 2] = 180
    cv2.circle(arr, (60, 60), 25, (255, 255, 255), -1)
    cv2.putText(arr, "HD", (45, 65), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (20, 20, 20), 2)
    cv2.imwrite(str(p), arr)
    return p

@pytest.fixture
def sample_rgba_image(tmp_path):
    p = tmp_path / "transparent_sample.png"
    arr = np.zeros((100, 100, 4), dtype=np.uint8)
    arr[:, :, :3] = (50, 120, 220)
    arr[20:80, 20:80, 3] = 255  # Solid in center
    arr[:20, :, 3] = 0          # Transparent top
    cv2.imwrite(str(p), arr)
    return p

def test_enhance_2x_hd(tmp_path, sample_rgb_image):
    out_path = tmp_path / "out_2x.jpg"
    image_enhancer.enhance(
        image_path=sample_rgb_image,
        output_path=out_path,
        scale=2,
        quality="hd",
        mode="photo"
    )
    assert out_path.exists()
    res = cv2.imread(str(out_path))
    assert res.shape[0] == 240
    assert res.shape[1] == 240
    # Verify no massive clipping
    clipped_pct = np.sum((res == 0) | (res == 255)) / res.size * 100
    assert clipped_pct < 12.0

def test_enhance_4x_ultra(tmp_path, sample_rgb_image):
    out_path = tmp_path / "out_4x.jpg"
    image_enhancer.enhance(
        image_path=sample_rgb_image,
        output_path=out_path,
        scale=4,
        quality="ultra",
        mode="photo"
    )
    assert out_path.exists()
    res = cv2.imread(str(out_path))
    assert res.shape[0] == 480
    assert res.shape[1] == 480

def test_enhance_preserves_transparency(tmp_path, sample_rgba_image):
    out_path = tmp_path / "out_alpha.png"
    image_enhancer.enhance(
        image_path=sample_rgba_image,
        output_path=out_path,
        scale=2,
        quality="hd"
    )
    assert out_path.exists()
    res = cv2.imread(str(out_path), cv2.IMREAD_UNCHANGED)
    assert res.shape[2] == 4
    assert res.shape[0] == 200
    assert res.shape[1] == 200
    # Top region before boundary must remain fully transparent
    assert np.mean(res[:30, :, 3]) == 0
    # Center region must be opaque
    assert np.mean(res[60:140, 60:140, 3]) > 250

def test_algorithmic_fallback(tmp_path, sample_rgb_image):
    out_path = tmp_path / "out_algorithmic.jpg"
    img = cv2.imread(str(sample_rgb_image))
    res = image_enhancer._enhance_algorithmic(img, scale_factor=2, quality="hd", mode="photo")
    assert res.shape[0] == 240
    assert res.shape[1] == 240
