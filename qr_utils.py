# hanko/qr_utils.py
import json
import re
from typing import Dict


def make_qr_payload(
    stamp_id: str,
    date: str,
    user_short_id: str,
    algo_version: str = "hanko-v1",
) -> str:
    payload: Dict[str, str] = {
        "v": algo_version,
        "sid": stamp_id,
        "d": date,
        "u": user_short_id,
    }
    return json.dumps(payload, separators=(",", ":"))


def generate_qr_svg_fragment(data: str) -> str:
    """
    Generate QR code as SVG fragment.
    Requires: pip install qrcode[pil]
    """
    try:
        import qrcode
        import qrcode.image.svg
        
        factory = qrcode.image.svg.SvgPathImage
        qr = qrcode.QRCode(
            version=None,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=4,
            border=0,
            image_factory=factory,
        )
        qr.add_data(data)
        qr.make(fit=True)
        img = qr.make_image()
        svg_bytes = img.to_string(encoding="utf-8")
        svg_str = svg_bytes.decode("utf-8")

        if svg_str.startswith("<?xml"):
            svg_str = svg_str.split("?>", 1)[1].strip()

        return svg_str
    except ImportError:
        # Fallback: simple text placeholder
        return f'<text x="10" y="20" font-size="8" fill="#000">{data[:50]}</text>'


def extract_qr_inner(svg_str: str):
    """
    Returns (inner_svg_content, viewbox_w, viewbox_h)
    """
    viewbox_match = re.search(r'viewBox="([^"]+)"', svg_str)
    if viewbox_match:
        viewbox = viewbox_match.group(1)
        _, _, vb_w, vb_h = map(float, viewbox.split())
    else:
        w_match = re.search(r'width="([^"]+)"', svg_str)
        h_match = re.search(r'height="([^"]+)"', svg_str)
        vb_w = float(w_match.group(1)) if w_match else 33.0
        vb_h = float(h_match.group(1)) if h_match else 33.0

    inner = re.sub(r"^<svg[^>]*>|</svg>\s*$", "", svg_str, flags=re.DOTALL).strip()
    return inner, vb_w, vb_h
