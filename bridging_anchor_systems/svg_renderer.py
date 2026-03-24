    def render_svg(
        self,
        profile,
        date: str,
        stamp_id: str,
        params: dict,
        algo_version: str = "hanko-v1",
        size_px: int = 512,
    ) -> str:
        g = params["grid_size"]
        gd = params["grid_digits"]
        spokes = params["spokes"]
        rotation = params["rotation_deg"]
        radial = params["radial_levels"]
        thick = params["thickness_levels"]
        stamp_type = params.get("stamp_type", "personal")
        half = size_px / 2
        radius = size_px * 0.38 * self.PHI_RECIPROCAL
        palettes = {
            'personal': ["#111111", "#4CAF50", "#8BC34A", "#CDDC39", "#FFC107"],
            'registered': ["#111111", "#e63946", "#d62828", "#9d0208", "#370617"],
            'bank': ["#111111", "#457b9d", "#1d3557", "#14213d", "#0077b6"],
            'company': ["#111111", "#FF9800", "#F57C00", "#E65100", "#BF360C"]
        }
        palette = palettes.get(stamp_type, palettes['personal'])
        svg_parts = []
        svg_parts.append(
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{size_px}" height="{size_px}" viewBox="0 0 {size_px} {size_px}">' 
        )
        svg_parts.append(f'<rect x="0" y="0" width="{size_px}" height="{size_px}" fill="#fdfcf8"/>')
        border_width = int(4 * self.PHI_RECIPROCAL)
        svg_parts.append(
            f'<rect x="8" y="8" width="{size_px-16}" height="{size_px-16}" '
            f'stroke="#111" stroke-width="{border_width}" fill="none" />'
        )
        cell = size_px * 0.12 / g
        offset_x = size_px * 0.08
        offset_y = size_px * 0.72
        for row in range(g):
            for col in range(g):
                idx = row * g + col
                d = gd[idx]
                cx = offset_x + col * cell
                cy = offset_y + row * cell
                svg_parts.append(
                    f'<rect x="{cx}" y="{cy}" width="{cell}" height="{cell}" '
                    f'stroke="#111" stroke-width="0.5" fill="#ffffff"/>'
                )
                if d >= 7:
                    svg_parts.append(
                        f'<rect x="{cx+1}" y="{cy+1}" width="{cell-2}" height="{cell-2}" '
                        f'fill="{palette[d % len(palette)]}" opacity="0.85"/>'
                    )
                elif 4 <= d <= 6:
                    svg_parts.append(
                        f'<path d="M {cx} {cy+cell} L {cx+cell} {cy} " '
                        f'stroke="{palette[(d+1) % len(palette)]}" stroke-width="1.2"/>'
                    )
                else:
                    svg_parts.append(
                        f'<circle cx="{cx + cell/2}" cy="{cy + cell/2}" r="{cell*0.15}" '
                        f'fill="{palette[(d+2) % len(palette)]}"/>'
                    )
        svg_parts.append(
            f'<circle cx="{half}" cy="{half}" r="{radius}" stroke="#111" stroke-width="3" fill="none"/>'
        )
        import math
        for i in range(spokes):
            angle_deg = rotation + (360.0 / spokes) * i
            angle_rad = math.radians(angle_deg)
            inner = radius * 0.15 * radial[i % len(radial)] * self.PHI_RECIPROCAL
            outer = radius * (0.6 + 0.05 * (radial[i % len(radial)])) * self.PHI
            x1 = half + inner * math.cos(angle_rad)
            y1 = half + inner * math.sin(angle_rad)
            x2 = half + outer * math.cos(angle_rad)
            y2 = half + outer * math.sin(angle_rad)
            width = 1.0 + thick[i % len(thick)]
            color = palette[i % len(palette)]
            svg_parts.append(
                f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
                f'stroke="{color}" stroke-width="{width}" stroke-linecap="round"/>'
            )
        type_icons = {
            'personal': '個',
            'registered': '実',
            'bank': '銀',
            'company': '社'
        }
        type_icon = type_icons.get(stamp_type, '個')
        svg_parts.append(
            f'<text x="{size_px-40}" y="40" text-anchor="middle" '
            f'font-family="serif" font-size="32" fill="{palette[1]}" font-weight="bold">{type_icon}</text>'
        )
        short_user = profile.user_id[:8]
        short_stamp = stamp_id[:8]
        meta_text = f"{short_user} {date} {algo_version} {short_stamp}"
        svg_parts.append(
            f'<text x="{size_px/2}" y="{size_px-20}" text-anchor="middle" '
            f'font-family="monospace" font-size="10" fill="#333">{meta_text}</text>'
        )
        svg_parts.append(
            f'<text x="{size_px/2}" y="{half + 10}" text-anchor="middle" '
            f'font-family="serif" font-size="8" fill="#cccccc" opacity="0.3">φ 1.618</text>'
        )
        svg_parts.append("</svg>")
        return "".join(svg_parts)
"""
SVG rendering and visual parameter derivation for Hanko stamps.
"""
from typing import Dict, Any

class HankoSVGRenderer:
    def __init__(self, phi: float, phi_reciprocal: float):
        self.PHI = phi
        self.PHI_RECIPROCAL = phi_reciprocal

    def derive_visual_params(self, base_hash: bytes, grid_size: int = 3, stamp_type: str = "personal") -> Dict[str, Any]:
        stream_int = int.from_bytes(base_hash, "big")
        digits = []
        temp = stream_int
        for _ in range(grid_size * grid_size + 64):
            digits.append(temp % 10)
            temp //= 10
        grid_digits = digits[: grid_size * grid_size]
        wheel_digits = digits[grid_size * grid_size :]
        base_spokes = int(8 * self.PHI_RECIPROCAL)
        spokes = base_spokes + (wheel_digits[0] % 9)
        rotation_deg = (wheel_digits[1] * 13) % 360
        radial_levels = [1 + int((d % 3) * self.PHI_RECIPROCAL) for d in wheel_digits[2 : 2 + spokes]]
        thickness_levels = [1 + (d % 3) for d in wheel_digits[2 + spokes : 2 + 2 * spokes]]
        type_modifiers = {
            'personal': {'grid_complexity': 1.0, 'wheel_density': 1.0},
            'registered': {'grid_complexity': 1.2, 'wheel_density': 1.3},
            'bank': {'grid_complexity': 0.8, 'wheel_density': 1.5},
            'company': {'grid_complexity': 1.5, 'wheel_density': 1.2}
        }
        modifier = type_modifiers.get(stamp_type, type_modifiers['personal'])
        return {
            "grid_size": grid_size,
            "grid_digits": grid_digits,
            "spokes": spokes,
            "rotation_deg": rotation_deg,
            "radial_levels": radial_levels,
            "thickness_levels": thickness_levels,
            "type_modifier": modifier,
            "stamp_type": stamp_type
        }
