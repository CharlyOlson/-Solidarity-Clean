/*
 * SOLIDARITY PLATFORM - HANKO STAMPS TAB
 * =======================================
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */
import React, { useState, useRef } from 'react';

const CHAKRA_COLORS = [
	{ name: 'Red', hex: '#FF0000' },
	{ name: 'Yellow', hex: '#FFFF00' },
	{ name: 'Blue', hex: '#0000FF' },
	{ name: 'Magenta', hex: '#FF00FF' },
	{ name: 'Cyan', hex: '#00FFFF' },
];

// Example color amounts (should come from props or state)
const colorAmounts = {
	Red: 30,
	Yellow: 50,
	Blue: 20,
	Magenta: 60,
	Cyan: 10,
};

// Helper to get color points
const getColorPoints = (amounts) => {
	const keys = Object.keys(amounts);
	const total = keys.reduce((sum, k) => sum + amounts[k], 0);
	const angleStep = (2 * Math.PI) / keys.length;
	return keys.map((k, i) => {
		const angle = i * angleStep;
		const radius = 80 + (amounts[k] / total) * 40; // scale radius
		return {
			x: 100 + Math.cos(angle) * radius,
			y: 100 + Math.sin(angle) * radius,
			color: CHAKRA_COLORS.find(c => c.name === k)?.hex || '#000',
			name: k,
			amount: amounts[k],
		};
	});
};

// Center of mass
const getCenterOfMass = (points) => {
	const n = points.length;
	const x = points.reduce((sum, p) => sum + p.x, 0) / n;
	const y = points.reduce((sum, p) => sum + p.y, 0) / n;
	return { x, y };
};

// Farthest point from center
const getFarthestPoint = (center, points) => {
	let maxDist = 0;
	let farthest = points[0];
	points.forEach(p => {
		const dist = Math.hypot(p.x - center.x, p.y - center.y);
		if (dist > maxDist) {
			maxDist = dist;
			farthest = p;
		}
	});
	return { point: farthest, radius: maxDist };
};

// Get color orderings
const getColorOrder = (amounts) => {
	const sorted = Object.entries(amounts).sort((a, b) => a[1] - b[1]);
	return {
		first: sorted[0][0], // lowest
		second: sorted[1][0],
		third: sorted[sorted.length - 1][0], // highest
	};
};

	const HankoStamps = () => {
		// State for whether a stamp exists
		const [stampExists, setStampExists] = useState(false);
		const [showModal, setShowModal] = useState(!stampExists);
		const [theme, setTheme] = useState('');
		const [style, setStyle] = useState('');
		const [descriptors, setDescriptors] = useState('');
		const [stampSVG, setStampSVG] = useState(null);
		const [ollamaVisible, setOllamaVisible] = useState(false);
		const [ollamaChatOpen, setOllamaChatOpen] = useState(false);
		const svgRef = useRef(null);

		// ...existing color logic...
		const points = getColorPoints(colorAmounts);
		const center = getCenterOfMass(points);
		const { point: farthest, radius } = getFarthestPoint(center, points);
		const colorOrder = getColorOrder(colorAmounts);
		const firstColor = CHAKRA_COLORS.find(c => c.name === colorOrder.first);
		const secondColor = CHAKRA_COLORS.find(c => c.name === colorOrder.second);
		const thirdColor = CHAKRA_COLORS.find(c => c.name === colorOrder.third);

		// Bottom corner indicators
		const indicatorShapes = [
			{ color: CHAKRA_COLORS[0], amount: colorAmounts[CHAKRA_COLORS[0].name] },
			{ color: CHAKRA_COLORS[1], amount: colorAmounts[CHAKRA_COLORS[1].name] },
			{ color: CHAKRA_COLORS[2], amount: colorAmounts[CHAKRA_COLORS[2].name] },
		];
		const maxAmount = Math.max(...indicatorShapes.map(s => s.amount));

		// QR segment value (example: sum of first color amount digits)
		const qrValue = String(colorAmounts[colorOrder.first]).split('').reduce((a, b) => a + Number(b), 0);

		// Dot position (half radius)
		const dotAngle = Math.atan2(farthest.y - center.y, farthest.x - center.x);
		const dotX = center.x + Math.cos(dotAngle) * (radius / 2);
		const dotY = center.y + Math.sin(dotAngle) * (radius / 2);

		// M position (full radius)
		const mX = center.x + Math.cos(dotAngle) * radius;
		const mY = center.y + Math.sin(dotAngle) * radius;

		// Border color for dot
		const dotBorder = center.y > 100 ? '#fff' : '#000';

		// Download SVG as file
		const handleDownload = () => {
			const svg = svgRef.current;
			if (!svg) return;
			const serializer = new XMLSerializer();
			const source = serializer.serializeToString(svg);
			const blob = new Blob([source], { type: 'image/svg+xml' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'hanko_stamp.svg';
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		};

		// File upload handler (SVG/PNG only, max 2MB)
		const handleFileUpload = (e) => {
			const file = e.target.files[0];
			if (!file) return;
			const allowedTypes = ['image/svg+xml', 'image/png'];
			if (!allowedTypes.includes(file.type)) {
				alert('Only SVG or PNG files are allowed.');
				return;
			}
			if (file.size > 2 * 1024 * 1024) {
				alert('File too large (max 2MB).');
				return;
			}
			// You can add logic to process or display the uploaded file
			alert(`File uploaded: ${file.name}`);
		};

		// Camera access handler (ask permission, only if secure context)
		const handleCameraCapture = async () => {
			if (window.isSecureContext !== true) {
				alert('Camera access requires a secure (HTTPS) context.');
				return;
			}
			try {
				const stream = await navigator.mediaDevices.getUserMedia({ video: true });
				// You can display the stream in a video element or capture a frame
				alert('Camera access granted.');
				// Always stop tracks after use for security
				stream.getTracks().forEach(track => track.stop());
			} catch (err) {
				alert('Camera access denied.');
			}
		};

		// Questionnaire submit handler (call backend Ollama endpoint)
		const handleSubmit = async (e) => {
			e.preventDefault();
			if (!theme.trim() || !style.trim() || !descriptors.trim()) {
				alert('All fields are required.');
				return;
			}
			try {
				const res = await fetch('/api/ollama/generate', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ theme, style, descriptors })
				});
				const data = await res.json();
				if (data.svg) {
					setStampSVG(data.svg);
					setStampExists(true);
					setShowModal(false);
				} else {
					alert('Failed to generate stamp.');
				}
			} catch (err) {
				alert('Error connecting to backend.');
			}
		};

		return (
			<div style={{ position: 'relative', padding: 16 }}>
				{/* Questionnaire Modal */}
				{showModal && (
					<div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#222c', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<form style={{ background: '#fff', padding: 24, borderRadius: 12, minWidth: 320 }} onSubmit={handleSubmit}>
							<h2>Create Your Hanko Stamp</h2>
							<label htmlFor="theme">Theme:<br />
								<input id="theme" value={theme} onChange={e => setTheme(e.target.value)} required maxLength={64} pattern="[\w\s\-]+" />
							</label><br /><br />
							<label htmlFor="style">Style:<br />
								<input id="style" value={style} onChange={e => setStyle(e.target.value)} required maxLength={64} pattern="[\w\s\-]+" />
							</label><br /><br />
							<label htmlFor="descriptors">Descriptors:<br />
								<input id="descriptors" value={descriptors} onChange={e => setDescriptors(e.target.value)} required maxLength={128} pattern="[\w\s,\-]+" />
							</label><br /><br />
							<button type="submit">Generate Stamp</button>
						</form>
					</div>
				)}

				{/* Ollama Chat/Help Widget (appears on hover, chat opens on click) */}
				<div
					style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 20 }}
					onMouseEnter={() => setOllamaVisible(true)}
					onMouseLeave={() => { if (!ollamaChatOpen) setOllamaVisible(false); }}
				>
					<div style={{ cursor: 'pointer', background: '#222', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0006' }}
						onClick={() => setOllamaChatOpen(v => !v)}
						title="Ollama Help"
					>
						<span role="img" aria-label="Ollama">💬</span>
					</div>
					{(ollamaVisible || ollamaChatOpen) && (
						<div style={{ position: 'absolute', bottom: 70, right: 0, width: 320, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0008', padding: 16 }}>
							<strong>Ollama Help</strong>
							<div style={{ margin: '12px 0' }}>
								{ollamaChatOpen ? (
									<div>
										<p>Hi! I’m Ollama. How can I help you with your Hanko stamp?</p>
										{/* Future: Add chat input and backend integration here */}
									</div>
								) : (
									<p>Hover to preview, click to chat with Ollama for help.</p>
								)}
							</div>
						</div>
					)}
				</div>

				{/* Hanko Stamp SVG or generated SVG from backend */}
				{stampSVG ? (
					<div dangerouslySetInnerHTML={{ __html: stampSVG }} style={{ borderRadius: 16, boxShadow: '0 2px 12px #0004', background: 'linear-gradient(135deg, #00b4d8 0%, #6a89cc 100%)' }} />
				) : (
					<svg ref={svgRef} width={220} height={220} style={{ background: 'linear-gradient(135deg, #00b4d8 0%, #6a89cc 100%)', borderRadius: 16 }}>
						{/* Main shape */}
						<polygon
							points={points.map(p => `${p.x},${p.y}`).join(' ')}
							fill="#6a89cc" /* OLE/OLO blue-green */
							stroke="#00b4d8" /* Cyan-lightning */
							strokeWidth={2}
						/>
						{/* Secondary lock circle */}
						<circle
							cx={center.x}
							cy={center.y}
							r={radius}
							fill="none"
							stroke="#a084ca" /* Amethyst purple */
							strokeWidth={2}
							opacity={0.5}
						/>
						{/* Dot indicator (first color, half radius) */}
						<circle
							cx={dotX}
							cy={dotY}
							r={8}
							fill="#00b894" /* Green for confirmed */
							stroke={dotBorder}
							strokeWidth={3}
						/>
						{/* M indicator (third color, full radius) */}
						<text
							x={mX}
							y={mY}
							fontSize={18}
							fill="#a084ca" /* Amethyst purple for ready/highlight */
							fontWeight="bold"
							textAnchor="middle"
							alignmentBaseline="middle"
						>
							{thirdColor.name[0]}
						</text>
						{/* Bottom corner color indicators */}
						{indicatorShapes.map((s, i) => (
							<rect
								key={s.color.name}
								x={180 + i * 12}
								y={200}
								width={10}
								height={Math.max(10, (s.amount / maxAmount) * 20)}
								fill={i === 0 ? '#00b4d8' : i === 1 ? '#6a89cc' : '#a084ca'}
								stroke="#222"
								strokeWidth={1}
							/>
						))}
						{/* QR code segment (simulated) */}
						<rect
							x={10}
							y={190}
							width={30}
							height={20}
							fill="#a084ca" /* Amethyst purple for highlight */
							stroke="#222"
							strokeWidth={2}
							rx={4}
						/>
						<text
							x={25}
							y={205}
							fontSize={14}
							fill="#00b894" /* Green for confirmed */
							textAnchor="middle"
							alignmentBaseline="middle"
						>
							{qrValue}
						</text>
					</svg>
				)}

				{/* Action Buttons */}
				<div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
					<button onClick={handleDownload}>Save Stamp</button>
					<label style={{ display: 'inline-block' }}>
						Upload File
						<input type="file" style={{ display: 'none' }} onChange={handleFileUpload} accept=".svg,.png,image/svg+xml,image/png" />
					</label>
					<button onClick={handleCameraCapture}>Camera Access</button>
				</div>
			</div>
		);
	};

	export default HankoStamps;
