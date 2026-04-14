/**
 * SOLIDARITY PLATFORM - SACRED GEOMETRY DASHBOARD
 * ================================================
 * 
 * TRADEMARK INFORMATION:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 * 
 * Interactive visualization of golden ratio mathematics,
 * Fibonacci sequences, and sacred geometric patterns
 */

import React, { useState, useEffect, useRef } from 'react';
import './SacredGeometryDashboard.css';

export const SacredGeometryDashboard = () => {
    const [phiData, setPhiData] = useState(null);
    const [fibonacci, setFibonacci] = useState([]);
    const [selectedNode, setSelectedNode] = useState(7);
    const [spiralData, setSpiralData] = useState(null);
    const canvasRef = useRef(null);

    // Fetch golden ratio constants on mount
    useEffect(() => {
        fetch('/api/mathematical/golden-ratio')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setPhiData(data.constants);
                }
            })
            .catch(err => console.error('Failed to fetch phi data:', err));
    }, []);

    // Fetch Fibonacci sequence
    useEffect(() => {
        fetch('/api/mathematical/fibonacci/15')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setFibonacci(data.sequence);
                }
            })
            .catch(err => console.error('Failed to fetch Fibonacci:', err));
    }, []);

    // Fetch and render golden spiral
    useEffect(() => {
        fetch('/api/mathematical/golden-spiral?turns=5&pointsPerTurn=50')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSpiralData(data);
                    renderGoldenSpiral(data.coordinates);
                }
            })
            .catch(err => console.error('Failed to fetch spiral:', err));
    }, []);

    const renderGoldenSpiral = (coordinates) => {
        const canvas = canvasRef.current;
        if (!canvas || !coordinates) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Dark background with gradient
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width/2);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#0f0f1e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Find coordinate bounds for scaling
        const xCoords = coordinates.map(c => c[0]);
        const yCoords = coordinates.map(c => c[1]);
        const maxCoord = Math.max(...xCoords.map(Math.abs), ...yCoords.map(Math.abs));
        const scale = (Math.min(width, height) * 0.4) / maxCoord;

        // Draw spiral with φ-based color gradient
        ctx.beginPath();
        coordinates.forEach((coord, i) => {
            const x = centerX + coord[0] * scale;
            const y = centerY - coord[1] * scale; // Invert Y for screen coordinates

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            // Draw node points at sacred indices
            if (i % 7 === 0 || i % 14 === 0) {
                ctx.save();
                ctx.fillStyle = i % 14 === 0 ? '#ffd700' : '#4CAF50';
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        });

        // Golden gradient stroke
        const spiralGradient = ctx.createLinearGradient(0, 0, width, height);
        spiralGradient.addColorStop(0, '#4CAF50');
        spiralGradient.addColorStop(0.618, '#ffd700');
        spiralGradient.addColorStop(1, '#ff6b6b');
        
        ctx.strokeStyle = spiralGradient;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw center point
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Draw golden angle indicator
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(-(137.508 * Math.PI / 180));
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(100, 0);
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    };

    if (!phiData) {
        return (
            <div className="sacred-geometry-dashboard loading">
                <div className="spinner">🌀</div>
                <p>Loading sacred geometry...</p>
            </div>
        );
    }

    return (
        <div className="sacred-geometry-dashboard">
            <header className="dashboard-header">
                <h1>🌟 Sacred Geometry Dashboard</h1>
                <p>φ-based Mathematics & Golden Ratio Visualization</p>
            </header>

            <div className="dashboard-grid">
                {/* Golden Ratio Constants */}
                <section className="dashboard-card constants-card">
                    <h2>φ (Phi) Constants</h2>
                    <div className="constants-grid">
                        <div className="constant">
                            <span className="constant-label">φ (Golden Ratio)</span>
                            <span className="constant-value phi-primary">
                                {phiData.PHI.toFixed(15)}
                            </span>
                        </div>
                        <div className="constant">
                            <span className="constant-label">1/φ (Reciprocal)</span>
                            <span className="constant-value phi-secondary">
                                {phiData.PHI_RECIPROCAL.toFixed(15)}
                            </span>
                        </div>
                        <div className="constant">
                            <span className="constant-label">φ² (Squared)</span>
                            <span className="constant-value phi-tertiary">
                                {phiData.PHI_SQUARED.toFixed(15)}
                            </span>
                        </div>
                        <div className="constant">
                            <span className="constant-label">Golden Angle</span>
                            <span className="constant-value golden-angle">
                                {phiData.GOLDEN_ANGLE_DEGREES.toFixed(6)}°
                            </span>
                        </div>
                    </div>
                </section>

                {/* Golden Spiral Visualization */}
                <section className="dashboard-card spiral-card">
                    <h2>Golden Spiral Visualization</h2>
                    <canvas
                        ref={canvasRef}
                        width={600}
                        height={600}
                        className="golden-spiral-canvas"
                    />
                    {spiralData && (
                        <div className="spiral-stats">
                            <span>Turns: {spiralData.turns}</span>
                            <span>Points: {spiralData.totalPoints}</span>
                            <span>Angle: {spiralData.goldenAngle.toFixed(3)}°</span>
                        </div>
                    )}
                </section>

                {/* Fibonacci Sequence */}
                <section className="dashboard-card fibonacci-card">
                    <h2>Fibonacci Sequence → φ</h2>
                    <div className="fibonacci-display">
                        {fibonacci.map((num, i) => {
                            const ratio = i > 0 ? fibonacci[i] / fibonacci[i-1] : 0;
                            const deviation = Math.abs(ratio - phiData.PHI);
                            const accuracy = i > 0 ? (1 - deviation / phiData.PHI) * 100 : 0;
                            
                            return (
                                <div key={i} className="fibonacci-item">
                                    <div className="fib-number">{num}</div>
                                    {i > 0 && (
                                        <div className="fib-ratio">
                                            <span className="ratio-value">
                                                {ratio.toFixed(6)}
                                            </span>
                                            <div 
                                                className="accuracy-bar"
                                                style={{ 
                                                    width: `${accuracy}%`,
                                                    backgroundColor: `hsl(${accuracy * 1.2}, 70%, 50%)`
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="convergence-note">
                        ✨ Converges to φ = {phiData.PHI.toFixed(6)}
                    </div>
                </section>

                {/* Sacred Nodes */}
                <section className="dashboard-card nodes-card">
                    <h2>Sacred Nodes [1, 3, 4, 7, 14, 21, 49]</h2>
                    <div className="nodes-grid">
                        {phiData.SACRED_NODES.map(node => (
                            <button
                                key={node}
                                className={`node-button ${selectedNode === node ? 'active' : ''}`}
                                onClick={() => setSelectedNode(node)}
                            >
                                <div className="node-number">{node}</div>
                                <div className="node-detail">
                                    Node {phiData.SACRED_NODES.indexOf(node) + 1}
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className="node-info">
                        <h3>Selected Node: {selectedNode}</h3>
                        <p>
                            {selectedNode === 1 && "Base unit - Foundation of all calculations"}
                            {selectedNode === 3 && "Trinity node - Force balance point"}
                            {selectedNode === 4 && "Identity node - Telephone password carousel"}
                            {selectedNode === 7 && "Henry base - Primary sacred number"}
                            {selectedNode === 14 && "Henry double - Secondary harmonic"}
                            {selectedNode === 21 && "Fibonacci node - Golden sequence marker"}
                            {selectedNode === 49 && "Henry square - Maximum recursion depth"}
                        </p>
                    </div>
                </section>

                {/* Henry Progression */}
                <section className="dashboard-card progression-card">
                    <h2>Henry 7→14→49 Progression</h2>
                    <div className="progression-visual">
                        <div className="progression-step">
                            <div className="step-number" style={{fontSize: '2rem'}}>7</div>
                            <div className="step-label">Base</div>
                        </div>
                        <div className="progression-arrow">→</div>
                        <div className="progression-step">
                            <div className="step-number" style={{fontSize: '3rem'}}>14</div>
                            <div className="step-label">Double (7×2)</div>
                        </div>
                        <div className="progression-arrow">→</div>
                        <div className="progression-step">
                            <div className="step-number" style={{fontSize: '4rem'}}>49</div>
                            <div className="step-label">Square (7²)</div>
                        </div>
                    </div>
                    <div className="progression-details">
                        <p><strong>Control Ratio:</strong> {phiData.CONTROL_RATIO.toFixed(6)} (49÷14)</p>
                        <p><strong>Purpose:</strong> Quantum recursion depth and system scaling</p>
                    </div>
                </section>

                {/* Live Statistics */}
                <section className="dashboard-card stats-card">
                    <h2>📊 System Statistics</h2>
                    <div className="stats-grid">
                        <div className="stat">
                            <div className="stat-value">{phiData.SACRED_NODES.length}</div>
                            <div className="stat-label">Sacred Nodes</div>
                        </div>
                        <div className="stat">
                            <div className="stat-value">{fibonacci.length}</div>
                            <div className="stat-label">Fibonacci Terms</div>
                        </div>
                        <div className="stat">
                            <div className="stat-value">
                                {spiralData ? spiralData.totalPoints : '---'}
                            </div>
                            <div className="stat-label">Spiral Points</div>
                        </div>
                        <div className="stat">
                            <div className="stat-value">1.618</div>
                            <div className="stat-label">φ Baseline</div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SacredGeometryDashboard;
