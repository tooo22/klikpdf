from PIL import Image
from app.services.ocr_service import OCRService
import tempfile
import os

img = Image.new("RGB", (100, 100), color=(100, 150, 200))
with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as f:
    img.save(f.name)
    out = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
    out.close()
    result = OCRService.enhance_image(f.name, out.name, scale=2, sharpness=1.5, contrast=1.1)
    assert os.path.exists(result)
    res_img = Image.open(result)
    assert res_img.width == 200
    assert res_img.height == 200
    print("✅ enhance_image passed")

os.unlink(f.name)
os.unlink(out.name)