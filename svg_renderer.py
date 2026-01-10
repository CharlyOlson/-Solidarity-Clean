# hanko/svg_renderer.py
import math
from typing import Dict, Any
from .qr_utils import make_qr_payload, generate_qr_svg_fragment, extract_qr_inner
from .models import UserProfile


class HankoSVGRenderer:
    """
    Renders hanko stamps with:
    - Daily strip (48 segments around border)
    - RGB box (base hash visualization)
    - QR code block (stamp metadata)
    - Grid patch and radial wheel (TODO: from original engine)
    """
    
    def __init__(self, size_px: int = 512):
        self.size_px = size_px
        self.PHI = 1.618033988749
        self.PHI_RECIPROCAL = 0.618

    def render(
        self,
        profile: UserProfile,
        date: str,
        stamp_id: str,
        params: Dict[str, Any],
        base_hash: bytes,
        daily_hash: bytes,
        algo_version: str = "hanko-v1",
    ) -> str:
        size_px = self.size_px
        user_short_id = str(profile.user_id)[:8]

        parts = []
        parts.append(
            f'<svg xmlns="http://www.w3.org/2000/svg" '
            f'width="{size_px}" height="{size_px}" '
            f'viewBox="0 0 {size_px} {size_px}">'
        )

        # Background
        parts.append(
            f'<rect x="0" y="0" width="{size_px}" height="{size_px}" '
            f'fill="#fcfcfc" />'
        )

        # Main outer circle
        half = size_px / 2.0
        outer_r = size_px * 0.42
        parts.append(
            f'<circle cx="{half}" cy="{half}" r="{outer_r}" '
            f'fill="#ffffff" stroke="#111111" stroke-width="3.0" />'
        )

        # Daily strip around border
        parts.append(self._render_daily_strip(size_px, daily_hash))

        # RGB box
        parts.append(self._render_rgb_box(size_px, base_hash))

        # QR block
        parts.append(
            self._render_qr_block(
                size_px, stamp_id, date, user_short_id, algo_version
            )
        )

        # Stamp type indicator (from params)
        stamp_type = params.get('stamp_type', 'personal')
        type_icons = {
            'personal': '個',
            'registered': '実',
            'bank': '銀',
            'company': '社'
        }
        type_icon = type_icons.get(stamp_type, '個')
        parts.append(
            f'<text x="{size_px-40}" y="40" text-anchor="middle" '
            f'font-family="serif" font-size="32" fill="#4CAF50" font-weight="bold">{type_icon}</text>'
        )

        # φ-ratio watermark
        parts.append(
            f'<text x="{half}" y="{half + 10}" text-anchor="middle" '
            f'font-family="serif" font-size="8" fill="#cccccc" opacity="0.3">φ 1.618</text>'
        )

        # Micro-text metadata
        parts.append(
            f'<text x="{half}" y="{size_px-20}" text-anchor="middle" '
            f'font-family="monospace" font-size="10" fill="#333">{user_short_id} {date} {algo_version}</text>'
        )

        parts.append("</svg>")
        return "".join(parts)

    def _render_rgb_box(self, size_px: int, base_hash: bytes) -> str:
        """RGB visualization of first 3 bytes of base_hash"""
        r_raw, g_raw, b_raw = base_hash[0], base_hash[1], base_hash[2]

        def adj(c): return 64 + (c % 160)  # 64..223

        r = adj(r_raw)
        g = adj(g_raw)
        b = adj(b_raw)

        box_w = size_px * 0.10
        box_h = size_px * 0.04
        x0 = size_px * 0.06
        y0 = size_px * 0.90
        cell_w = box_w / 3.0

        svg = []
        svg.append(
            f'<rect x="{x0}" y="{y0}" width="{box_w}" height="{box_h}" '
            f'stroke="#111" stroke-width="0.8" fill="#ffffff" />'
        )
        svg.append(
            f'<rect x="{x0}" y="{y0}" width="{cell_w}" height="{box_h}" '
            f'fill="rgb({r},0,0)" />'
        )
        svg.append(
            f'<rect x="{x0 + cell_w}" y="{y0}" width="{cell_w}" height="{box_h}" '
            f'fill="rgb(0,{g},0)" />'
        )
        svg.append(
            f'<rect x="{x0 + 2*cell_w}" y="{y0}" width="{cell_w}" height="{box_h}" '
            f'fill="rgb(0,0,{b})" />'
        )
        return "".join(svg)

    def _render_daily_strip(
        self,
        size_px: int,
        daily_hash: bytes,
        segments: int = 48,
    ) -> str:
        """Daily-rotating strip of colored segments around border"""
        half = size_px / 2.0
        outer_r = size_px * 0.40
        inner_r = outer_r - 4.0
        palette = ["#111111", "#e63946", "#ffbe0b", "#457b9d", "#1d3557"]

        svg = []
        angle_step = 2 * math.pi / segments
        style_bytes = (daily_hash * ((segments // len(daily_hash)) + 1))[:segments]

        for i in range(segments):
            angle_center = i * angle_step
            angle1 = angle_center - angle_step * 0.40
            angle2 = angle_center + angle_step * 0.40

            b = style_bytes[i]
            color = palette[b % len(palette)]
            opacity = 0.9 if (b & 0b00100000) else 0.55

            x1_inner = half + inner_r * math.cos(angle1)
            y1_inner = half + inner_r * math.sin(angle1)
            x1_outer = half + outer_r * math.cos(angle1)
            y1_outer = half + outer_r * math.sin(angle1)

            x2_inner = half + inner_r * math.cos(angle2)
            y2_inner = half + inner_r * math.sin(angle2)
            x2_outer = half + outer_r * math.cos(angle2)
            y2_outer = half + outer_r * math.sin(angle2)

            path_d = (
                f"M {x1_inner:.2f} {y1_inner:.2f} "
                f"L {x1_outer:.2f} {y1_outer:.2f} "
                f"L {x2_outer:.2f} {y2_outer:.2f} "
                f"L {x2_inner:.2f} {y2_inner:.2f} Z"
            )
            svg.append(
                f'<path d="{path_d}" fill="{color}" fill-opacity="{opacity}" '
                f'stroke="none" />'
            )
        return "".join(svg)

    def _render_qr_block(
        self,
        size_px: int,
        stamp_id: str,
        date: str,
        user_short_id: str,
        algo_version: str = "hanko-v1",
    ) -> str:
        """QR code in top-right corner with stamp metadata"""
        qr_payload = make_qr_payload(stamp_id, date, user_short_id, algo_version)
        qr_svg = generate_qr_svg_fragment(qr_payload)
        inner, vb_w, vb_h = extract_qr_inner(qr_svg)

        qr_size = size_px * 0.22
        margin = size_px * 0.06
        x = size_px - qr_size - margin
        y = margin

        sx = qr_size / vb_w
        sy = qr_size / vb_h
        s = min(sx, sy)

        return (
            f'<g transform="translate({x:.2f},{y:.2f}) scale({s:.4f})" '
            f'fill="#000000" stroke="none">'
            f'{inner}'
            f'</g>'
        )
