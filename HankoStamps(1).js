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

import React, { useState, useEffect, useCallback } from 'react';
import { BASE_RATIO } from '../config/constants';
import './HankoStamps.css';
import { API_BASE_URL } from '../config/api';

const HankoStamps = () => {
  const [stamps, setStamps] = useState([]);
  const [selectedStamp, setSelectedStamp] = useState(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestType, setRequestType] = useState('personal');
  const [creationStep, setCreationStep] = useState(1); // 1: type, 2: inputs, 3: preview
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState(null);
  // Removed unused convergencePoint state
  
  // ============================================================================
  // 7 USER INPUTS (Hanko Stamp Identity Data)
  // Based on the encoding system: Birth Month, Mother's Name, County, Height, 
  // Eye Color, Teacher's Name, Favorite Fruit
  // ============================================================================
  const [userInputs, setUserInputs] = useState({
    birthMonth: '',        // 1. Birth month (e.g., "March")
    mothersName: '',       // 2. Mother's middle or last name (e.g., "Marina")
    county: '',            // 3. County/district/municipal name (e.g., "Johnson")
    height: '',            // 4. Height in words (e.g., "Five Feet Eight Inches")
    eyeColor: '',          // 5. Eye color (e.g., "Brown")
    teachersName: '',      // 6. Favorite teacher's last name (e.g., "Jacobson")
    favoriteFruit: ''      // 7. Favorite fruit/veggie (e.g., "Mango")
  });

  // ============================================================================
  // ENCODING ALGORITHM: Convert text inputs to numerical grid positions
  // First 7 characters → alphabet positions → grid coordinates
  // ============================================================================
  const encodeToGridPositions = useCallback((text) => {
    if (!text) return [];
    const cleaned = text.toUpperCase().replace(/[^A-Z]/g, '');
    const firstSeven = cleaned.slice(0, 7);
    
    // Map to alphabet position (A=1, B=2, ... M=13 for first half)
    // Then apply the transformation: position → (position % 7) + 1
    return firstSeven.split('').map((char, idx) => {
      const pos = char.charCodeAt(0) - 64; // A=1, B=2, etc.
      // Apply Henry 7-based modular transformation
      return ((pos - 1) % 7) + 1;
    });
  }, []);

  // ============================================================================
  // SUDOKU GRID CONVERGENCE: 6 grids that find a single point
  // Each input creates a 3x3 grid, grids interact to find convergence
  // ============================================================================
  const calculateSudokuConvergence = useCallback(() => {
    const grids = [];
    const inputValues = Object.values(userInputs).filter(v => v.length > 0);
    
    if (inputValues.length < 3) return null;

    // Create 6 grids from the first 6 non-empty inputs
    inputValues.slice(0, 6).forEach((input, gridIdx) => {
      const encoded = encodeToGridPositions(input);
      const grid = Array(9).fill(0);
      
      // Fill grid using encoded values with rotation based on grid index
      encoded.forEach((val, i) => {
        const rotatedPos = (i + gridIdx) % 9;
        grid[rotatedPos] = val;
      });
      
      // Fill remaining cells using φ-ratio distribution
      for (let i = 0; i < 9; i++) {
        if (grid[i] === 0) {
          grid[i] = ((i + gridIdx + 1) % 7) + 1;
        }
      }
      
      grids.push(grid);
    });

    // Find convergence point: intersect row/col patterns across grids
    // Rule: Sum each position across all grids, find the position with value closest to φ×7
    const PHI_TARGET = BASE_RATIO * 7; // ≈ 11.326
    let bestPos = 4; // Center (0-indexed)
    let bestDiff = Infinity;

    for (let pos = 0; pos < 9; pos++) {
      const sum = grids.reduce((acc, grid) => acc + grid[pos], 0);
      const diff = Math.abs(sum - PHI_TARGET);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestPos = pos;
      }
    }

    // Convert position to x,y coordinates (0-2, 0-2)
    const x = bestPos % 3;
    const y = Math.floor(bestPos / 3);
    
    // Calculate spoke count and rotation based on convergence
    const totalSum = grids.flat().reduce((a, b) => a + b, 0);
    const spokeCount = (totalSum % 7) + 7; // 7-14 spokes
    const rotation = (totalSum * BASE_RATIO) % 360;

    return {
      x,
      y,
      position: bestPos,
      spokeCount,
      rotation: rotation.toFixed(1),
      grids,
      gridSums: grids.map(g => g.reduce((a, b) => a + b, 0))
    };
  }, [userInputs, encodeToGridPositions]);

  // ============================================================================
  // OLLAMA AI INTEGRATION: Generate stamp description/guidance
  // ============================================================================
  const generateWithOllama = async (convergence) => {
    try {
      const prompt = `Generate a brief artistic description for a Hanko stamp with these properties:
- Convergence point: (${convergence.x}, ${convergence.y})
- Spoke count: ${convergence.spokeCount}
- Rotation: ${convergence.rotation}°
- Grid energy sums: ${convergence.gridSums.join(', ')}

Describe the stamp's visual characteristics in 2-3 sentences focusing on:
1. The radial wheel pattern
2. Color distribution (B/W ratio, R/Y/B accents)
3. The central symbol shape`;

      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: prompt })
      });

      if (response.ok) {
        const data = await response.json();
        return data.response || data.message || 'Radial stamp with φ-ratio proportions';
      }
    } catch (error) {
      console.log('Ollama not available, using default description');
    }
    return 'Quantum-aligned radial stamp with φ-ratio proportions and sacred geometry';
  };

  // Hanko stamp types with Japanese characters and descriptions
  const stampTypes = {
    personal: {
      name: 'Personal Seal',
      japanese: '個人印',
      romaji: 'kojin-in',
      description: 'For general authentication and platform access',
      color: '#4CAF50',
      icon: '🟢',
      visual: '○'
    },
    registered: {
      name: 'Registered Seal',
      japanese: '実印',
      romaji: 'jitsuin',
      description: 'For high-security transactions and contracts',
      color: '#F44336',
      icon: '🔴',
      visual: '◉'
    },
    bank: {
      name: 'Bank Seal',
      japanese: '銀行印',
      romaji: 'ginkoin',
      description: 'For financial transactions and wallet operations',
      color: '#2196F3',
      icon: '🔵',
      visual: '◎'
    },
    company: {
      name: 'Company Seal',
      japanese: '社印',
      romaji: 'shain',
      description: 'For business-related authorizations',
      color: '#FF9800',
      icon: '🟠',
      visual: '◈'
    }
  };

  // Fetch user's Hanko stamps
  useEffect(() => {
    fetchStamps();
  }, []);

  const fetchStamps = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/hanko/my-stamps`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setStamps(data.stamps || []);
    } catch (error) {
      console.error('Failed to fetch stamps:', error);
    }
  };

  // Request new Hanko stamp with 7-input encoding system
  const requestNewStamp = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Calculate convergence from user inputs
      const convergence = calculateSudokuConvergence();
      
      // Generate AI description if available
      let aiDescription = '';
      if (convergence) {
        aiDescription = await generateWithOllama(convergence);
      }

      const response = await fetch(`${API_BASE_URL}/api/hanko/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          type: requestType,
          // 7 User Inputs for encoding
          userInputs: userInputs,
          // Sudoku convergence data
          convergence: convergence,
          // AI-generated description
          aiDescription: aiDescription,
          // Encoded grid positions from first input
          encodedPositions: encodeToGridPositions(userInputs.birthMonth + userInputs.mothersName)
        })
      });

      if (response.ok) {
        alert(`✅ ${stampTypes[requestType].name} created successfully!`);
        fetchStamps();
        handleCloseDialog();
      } else {
        alert('❌ Failed to create stamp');
      }
    } catch (error) {
      console.error('Stamp creation error:', error);
      alert('❌ Failed to create stamp');
    }
  };

  // Handle dialog close and reset
  const handleCloseDialog = () => {
    setShowRequestDialog(false);
    setCreationStep(1);
    setGeneratedPreview(null);
    // setConvergencePoint(null); // Removed unused state
  };

  // Generate preview based on inputs
  const generatePreview = async () => {
    setIsGenerating(true);
    const convergence = calculateSudokuConvergence();
    // setConvergencePoint(convergence); // Removed unused state
    
    if (convergence) {
      const aiDesc = await generateWithOllama(convergence);
      setGeneratedPreview({
        convergence,
        description: aiDesc,
        colorRatios: calculateColorRatios(convergence)
      });
    }
    setIsGenerating(false);
    setCreationStep(3);
  };

  // Calculate B/W and R/Y/B color ratios from convergence
  const calculateColorRatios = (convergence) => {
    if (!convergence) return { bw: 50, r: 33, y: 33, b: 34 };
    
    // Removed unused total and phi variables
    
    // B/W ratio based on convergence position
    const bw = Math.round((convergence.position + 1) / 9 * 100 * BASE_RATIO) % 100;
    
    // R/Y/B ratios based on grid sums
    const rybTotal = convergence.gridSums.slice(0, 3).reduce((a, b) => a + b, 0);
    const r = Math.round(convergence.gridSums[0] / rybTotal * 100) || 33;
    const y = Math.round(convergence.gridSums[1] / rybTotal * 100) || 33;
    const b = Math.round(convergence.gridSums[2] / rybTotal * 100) || 34;
    
    return { bw, r, y, b };
  };

  // Revoke stamp
  const revokeStamp = async (stampId) => {
    if (!window.confirm('⚠️ Are you sure you want to revoke this stamp? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/hanko/revoke/${stampId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchStamps();
      setSelectedStamp(null);
    } catch (error) {
      console.error('Revoke error:', error);
    }
  };

  // View stamp details
  const viewStampDetails = (stamp) => {
    setSelectedStamp(stamp);
  };

  return (
    <div className="hanko-stamps-container">
      {/* Header */}
      <div className="hanko-header">
        <div className="hanko-title">
          <h1>🎴 Hanko Stamps</h1>
          <p className="hanko-subtitle">Japanese-Style Digital Authentication Seals</p>
        </div>
        <button 
          className="btn-request-stamp"
          onClick={() => setShowRequestDialog(true)}
        >
          ➕ Request New Stamp
        </button>
      </div>

      {/* Stamp Types Info */}
      <div className="stamp-types-info">
        <h3>📘 Stamp Types</h3>
        <div className="stamp-types-grid">
          {Object.entries(stampTypes).map(([key, type]) => (
            <div key={key} className="stamp-type-card" style={{ borderColor: type.color }}>
              <div className="stamp-visual" style={{ color: type.color }}>
                {type.visual}
              </div>
              <div className="stamp-type-info">
                <div className="stamp-name" style={{ color: type.color }}>
                  {type.name}
                </div>
                <div className="stamp-japanese">
                  {type.japanese} ({type.romaji})
                </div>
                <div className="stamp-description">
                  {type.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User's Stamps */}
      <div className="user-stamps-section">
        <h3>🎴 Your Stamps ({stamps.filter(s => !s.revoked).length} Active)</h3>
        
        {stamps.length === 0 ? (
          <div className="no-stamps">
            <div className="no-stamps-icon">🎴</div>
            <p>You don't have any Hanko stamps yet</p>
            <button 
              className="btn-create-first"
              onClick={() => setShowRequestDialog(true)}
            >
              Create Your First Stamp
            </button>
          </div>
        ) : (
          <div className="stamps-grid">
            {stamps.map((stamp) => {
              const type = stampTypes[stamp.stamp_type] || stampTypes.personal;
              return (
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

                import React, { useState } from 'react';

                function HankoStamps() {
                  const [username, setUsername] = useState('');
                  const [descriptor, setDescriptor] = useState('');
                  const [result, setResult] = useState(null);
                  const [loading, setLoading] = useState(false);
                  const [error, setError] = useState(null);

                  async function generateHankoStamp() {
                    setLoading(true);
                    setError(null);
                    setResult(null);
                    try {
                      const response = await fetch('/api/hanko/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, descriptor })
                      });
                      const data = await response.json();
                      if (data.success) {
                        setResult(data.result || data.output);
                      } else {
                        setError(data.error || 'Unknown error');
                      }
                    } catch (e) {
                      setError(e.message);
                    }
                    setLoading(false);
                  }

                  return (
                    <div className="hanko-stamps-container">
                      <h1>Hanko Stamp Generator</h1>
                      <div style={{ marginBottom: 16 }}>
                        <input
                          type="text"
                          placeholder="Username"
                          value={username}
                          onChange={e => setUsername(e.target.value)}
                          style={{ marginRight: 8 }}
                        />
                        <input
                          type="text"
                          placeholder="Descriptor (optional)"
                          value={descriptor}
                          onChange={e => setDescriptor(e.target.value)}
                        />
                        <button onClick={generateHankoStamp} disabled={loading || !username} style={{ marginLeft: 8 }}>
                          {loading ? 'Generating...' : 'Generate Stamp'}
                        </button>
                      </div>
                      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
                      {result && (
                        <div style={{ marginTop: 24 }}>
                          <h2>Stamp Result</h2>
                          <pre style={{ background: '#f4f4f4', padding: 12, borderRadius: 4, maxWidth: 600, overflowX: 'auto' }}>
                            {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                }

                export default HankoStamps;
                  ) : (
                    <div className="stamp-badge" style={{ backgroundColor: type.color }}>
                      <div className="stamp-visual-large">
                        {type.visual}
                      </div>
                      <div className="stamp-japanese-text">
                        {type.japanese}
                      </div>
                    </div>
                  )}
                  
                  <div className="stamp-card-info">
                    <div className="stamp-card-name">
                      {type.name}
                    </div>
                    <div className="stamp-card-meta">
                      <span>🔢 ID: {stamp.stamp_id.substring(0, 8)}...</span>
                      <span>📅 {stamp.date}</span>
                    </div>
                    <div className="stamp-usage-stats">
                      <div className="usage-stat">
                        <span className="stat-label">Times Used:</span>
                        <span className="stat-value">{stamp.usage_count || 0}</span>
                      </div>
                      {stamp.last_used && (
                        <div className="usage-stat">
                          <span className="stat-label">Last Used:</span>
                          <span className="stat-value">
                            {new Date(stamp.last_used).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="stamp-crypto-badge">
                      🔐 Quantum-Resistant SHA-3
                    </div>
                    {stamp.revoked && (
                      <div className="revoked-badge">
                        ❌ REVOKED
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Request New Stamp Dialog - 3 Step Process */}
      {showRequestDialog && (
        <div className="request-dialog-overlay">
          <div className="request-dialog expanded">
            <h2>➕ Create Hanko Stamp</h2>
            
            {/* Progress Steps */}
            <div className="creation-steps">
              <div className={`step ${creationStep >= 1 ? 'active' : ''}`}>
                <span className="step-num">1</span>
                <span>Type</span>
              </div>
              <div className="step-line"></div>
              <div className={`step ${creationStep >= 2 ? 'active' : ''}`}>
                <span className="step-num">2</span>
                <span>Identity</span>
              </div>
              <div className="step-line"></div>
              <div className={`step ${creationStep >= 3 ? 'active' : ''}`}>
                <span className="step-num">3</span>
                <span>Preview</span>
              </div>
            </div>

            {/* Step 1: Type Selection */}
            {creationStep === 1 && (
              <>
                <p className="dialog-subtitle">Select stamp type:</p>
                <div className="stamp-type-selector">
                  {Object.entries(stampTypes).map(([key, type]) => (
                    <div 
                      key={key}
                      className={`stamp-type-option ${requestType === key ? 'selected' : ''}`}
                      onClick={() => setRequestType(key)}
                      style={{ 
                        borderColor: requestType === key ? type.color : 'rgba(255,255,255,0.2)',
                        backgroundColor: requestType === key ? `${type.color}20` : 'transparent'
                      }}
                    >
                      <div className="option-visual" style={{ color: type.color }}>
                        {type.visual}
                      </div>
                      <div className="option-name" style={{ color: type.color }}>
                        {type.name}
                      </div>
                      <div className="option-japanese">
                        {type.japanese}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="dialog-actions">
                  <button className="btn-next" onClick={() => setCreationStep(2)}>
                    Next: Enter Identity Data →
                  </button>
                  <button className="btn-cancel" onClick={handleCloseDialog}>
                    ❌ Cancel
                  </button>
                </div>
              </>
            )}

            {/* Step 2: 7-Input Identity Encoding System */}
            {creationStep === 2 && (
              <>
                <p className="dialog-subtitle">
                  📝 Enter 7 identity markers (creates unique stamp pattern):
                </p>
                
                <div className="identity-inputs-grid">
                  <div className="input-group">
                    <label>1. Birth Month</label>
                    <input 
                      type="text" 
                      placeholder="e.g., March"
                      value={userInputs.birthMonth}
                      onChange={(e) => setUserInputs({...userInputs, birthMonth: e.target.value})}
                    />
                    <span className="encoded-preview">
                      → {encodeToGridPositions(userInputs.birthMonth).join('')}
                    </span>
                  </div>

                  <div className="input-group">
                    <label>2. Mother's Middle/Last Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Marina"
                      value={userInputs.mothersName}
                      onChange={(e) => setUserInputs({...userInputs, mothersName: e.target.value})}
                    />
                    <span className="encoded-preview">
                      → {encodeToGridPositions(userInputs.mothersName).join('')}
                    </span>
                  </div>

                  <div className="input-group">
                    <label>3. County/District Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Johnson"
                      value={userInputs.county}
                      onChange={(e) => setUserInputs({...userInputs, county: e.target.value})}
                    />
                    <span className="encoded-preview">
                      → {encodeToGridPositions(userInputs.county).join('')}
                    </span>
                  </div>

                  <div className="input-group">
                    <label>4. Height (written out)</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Five Feet Eight Inches"
                      value={userInputs.height}
                      onChange={(e) => setUserInputs({...userInputs, height: e.target.value})}
                    />
                    <span className="encoded-preview">
                      → {encodeToGridPositions(userInputs.height).join('')}
                    </span>
                  </div>

                  <div className="input-group">
                    <label>5. Eye Color</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Brown"
                      value={userInputs.eyeColor}
                      onChange={(e) => setUserInputs({...userInputs, eyeColor: e.target.value})}
                    />
                    <span className="encoded-preview">
                      → {encodeToGridPositions(userInputs.eyeColor).join('')}
                    </span>
                  </div>

                  <div className="input-group">
                    <label>6. Favorite Teacher's Last Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Jacobson"
                      value={userInputs.teachersName}
                      onChange={(e) => setUserInputs({...userInputs, teachersName: e.target.value})}
                    />
                    <span className="encoded-preview">
                      → {encodeToGridPositions(userInputs.teachersName).join('')}
                    </span>
                  </div>

                  <div className="input-group full-width">
                    <label>7. Favorite Fruit/Veggie</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Mango"
                      value={userInputs.favoriteFruit}
                      onChange={(e) => setUserInputs({...userInputs, favoriteFruit: e.target.value})}
                    />
                    <span className="encoded-preview">
                      → {encodeToGridPositions(userInputs.favoriteFruit).join('')}
                    </span>
                  </div>
                </div>

                {/* Live Sudoku Grid Preview */}
                {Object.values(userInputs).filter(v => v.length > 2).length >= 3 && (
                  <div className="sudoku-preview-section">
                    <h4>🔢 Convergence Grid Preview</h4>
                    <div className="mini-grids-row">
                      {calculateSudokuConvergence()?.grids?.slice(0, 6).map((grid, idx) => (
                        <div key={idx} className="mini-sudoku-grid">
                          <div className="grid-label">G{idx + 1}</div>
                          <div className="grid-cells">
                            {grid.map((val, i) => (
                              <div 
                                key={i} 
                                className={`cell ${i === calculateSudokuConvergence()?.position ? 'highlight' : ''}`}
                              >
                                {val}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {calculateSudokuConvergence() && (
                      <div className="convergence-info">
                        📍 Convergence Point: ({calculateSudokuConvergence().x}, {calculateSudokuConvergence().y})
                        | Spokes: {calculateSudokuConvergence().spokeCount}
                        | Rotation: {calculateSudokuConvergence().rotation}°
                      </div>
                    )}
                  </div>
                )}

                <div className="dialog-actions">
                  <button className="btn-back" onClick={() => setCreationStep(1)}>
                    ← Back
                  </button>
                  <button 
                    className="btn-next"
                    onClick={generatePreview}
                    disabled={Object.values(userInputs).filter(v => v.length > 0).length < 3 || isGenerating}
                  >
                    {isGenerating ? '⏳ Generating...' : 'Generate Preview →'}
                  </button>
                  <button className="btn-cancel" onClick={handleCloseDialog}>
                    ❌ Cancel
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Preview and Create */}
            {creationStep === 3 && generatedPreview && (
              <>
                <p className="dialog-subtitle">✨ Your unique stamp preview:</p>
                
                <div className="stamp-preview-container">
                  {/* Radial Wheel Preview SVG */}
                  <svg viewBox="0 0 200 200" className="preview-svg">
                    {/* Background */}
                    <circle cx="100" cy="100" r="95" fill="#1a1a2e" stroke={stampTypes[requestType].color} strokeWidth="2"/>
                    
                    {/* Spokes based on convergence */}
                    {[...Array(generatedPreview.convergence.spokeCount)].map((_, i) => {
                      const angle = (i * 360 / generatedPreview.convergence.spokeCount + parseFloat(generatedPreview.convergence.rotation)) * Math.PI / 180;
                      return (
                        <line 
                          key={i}
                          x1="100" y1="100"
                          x2={100 + 80 * Math.cos(angle)}
                          y2={100 + 80 * Math.sin(angle)}
                          stroke={stampTypes[requestType].color}
                          strokeWidth={i % 2 === 0 ? 2 : 1}
                          opacity={0.6 + (i % 3) * 0.2}
                        />
                      );
                    })}
                    
                    {/* Center point marker */}
                    <circle cx="100" cy="100" r="15" fill={stampTypes[requestType].color} opacity="0.8"/>
                    <text x="100" y="105" textAnchor="middle" fill="white" fontSize="12">
                      {stampTypes[requestType].visual}
                    </text>
                    
                    {/* Convergence coordinates text */}
                    <text x="100" y="175" textAnchor="middle" fill="#888" fontSize="8">
                      ({generatedPreview.convergence.x},{generatedPreview.convergence.y})
                    </text>
                  </svg>
                  
                  {/* Color Ratio Display */}
                  <div className="color-ratios">
                    <div className="ratio-bar bw-bar">
                      <span>B/W: {generatedPreview.colorRatios.bw}%</span>
                      <div className="bar" style={{
                        background: `linear-gradient(to right, #000 ${generatedPreview.colorRatios.bw}%, #fff ${generatedPreview.colorRatios.bw}%)`
                      }}></div>
                    </div>
                    <div className="ratio-bar ryb-bar">
                      <span>R/Y/B: {generatedPreview.colorRatios.r}/{generatedPreview.colorRatios.y}/{generatedPreview.colorRatios.b}%</span>
                      <div className="bar" style={{
                        background: `linear-gradient(to right, 
                          #f44336 0%, #f44336 ${generatedPreview.colorRatios.r}%, 
                          #ffeb3b ${generatedPreview.colorRatios.r}%, #ffeb3b ${generatedPreview.colorRatios.r + generatedPreview.colorRatios.y}%, 
                          #2196f3 ${generatedPreview.colorRatios.r + generatedPreview.colorRatios.y}%)`
                      }}></div>
                    </div>
                  </div>
                  
                  {/* AI Description */}
                  <div className="ai-description">
                    <span className="ai-label">🤖 AI Description:</span>
                    <p>{generatedPreview.description}</p>
                  </div>
                </div>

                <div className="dialog-actions">
                  <button className="btn-back" onClick={() => setCreationStep(2)}>
                    ← Modify Inputs
                  </button>
                  <button 
                    className="btn-create-stamp"
                    onClick={requestNewStamp}
                  >
                    🎴 Create This Stamp
                  </button>
                  <button className="btn-cancel" onClick={handleCloseDialog}>
                    ❌ Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Stamp Details Modal */}
      {selectedStamp && (
        <div className="stamp-details-overlay">
          <div className="stamp-details-modal">
            <button 
              className="close-details"
              onClick={() => setSelectedStamp(null)}
            >
              ✕
            </button>

            <div className="stamp-details-header">
              {/* Display SVG stamp */}
              {selectedStamp.svg && (
                <div 
                  className="details-svg-large"
                  dangerouslySetInnerHTML={{ __html: selectedStamp.svg }}
                />
              )}
              <div className="details-title">
                <h2>{stampTypes[selectedStamp.stamp_type].name}</h2>
                <p className="details-romaji">
                  {stampTypes[selectedStamp.stamp_type].romaji} - {stampTypes[selectedStamp.stamp_type].japanese}
                </p>
                <div className="crypto-info">
                  🔐 Quantum-Resistant • φ 1.618 • SHA-3-512
                </div>
              </div>
            </div>

            <div className="stamp-details-content">
              <div className="detail-section">
                <label>Stamp ID</label>
                <div className="detail-value monospace">{selectedStamp.stamp_id}</div>
              </div>

              <div className="detail-section">
                <label>Date Created</label>
                <div className="detail-value">{selectedStamp.date}</div>
              </div>

              <div className="detail-section">
                <label>Base Hash (SHA3-512)</label>
                <div className="detail-value monospace small-text">
                  {selectedStamp.base_hash_b64}
                </div>
              </div>

              <div className="detail-section">
                <label>SVG Hash (SHA3-256)</label>
                <div className="detail-value monospace small-text">
                  {selectedStamp.svg_hash_b64}
                </div>
              </div>

              <div className="detail-section">
                <label>Digital Signature (Ed25519)</label>
                <div className="detail-value monospace small-text">
                  {selectedStamp.signature_b64}
                </div>
              </div>

              <div className="detail-section">
                <label>Algorithm Version</label>
                <div className="detail-value">
                  {selectedStamp.algo_version || 'hanko-v1'}
                </div>
              </div>

              <div className="detail-section">
                <label>Usage Statistics</label>
                <div className="usage-details">
                  <div>Times Used: <strong>{selectedStamp.usage_count || 0}</strong></div>
                  {selectedStamp.last_used && (
                    <div>
                      Last Used: <strong>{new Date(selectedStamp.last_used).toLocaleString()}</strong>
                    </div>
                  )}
                  <div>Created: <strong>{new Date(selectedStamp.created_at).toLocaleString()}</strong></div>
                </div>
              </div>

              {!selectedStamp.revoked && (
                <button 
                  className="btn-revoke"
                  onClick={() => revokeStamp(selectedStamp.stamp_id)}
                >
                  🚫 Revoke This Stamp
                </button>
              )}

              {selectedStamp.revoked && (
                <div className="revoked-warning">
                  ❌ This stamp has been revoked on {new Date(selectedStamp.revoked_at).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HankoStamps;

