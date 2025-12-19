/**
 * SOLIDARITY PLATFORM - HARMONIC PHRASE PROCESSOR
 * ================================================
 * 
 * TRADEMARK INFORMATION:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 * 
 * Interactive UI for processing "silly names" (harmonic phrases)
 * and applying focused pass correction
 */

import React, { useState, useEffect } from 'react';
import './HarmonicPhraseProcessor.css';

export const HarmonicPhraseProcessor = () => {
    const [phrases, setPhrases] = useState([]);
    const [inputText, setInputText] = useState('');
    const [processingResult, setProcessingResult] = useState(null);
    const [correctionResult, setCorrectionResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('processor');

    // Fetch available harmonic phrases
    useEffect(() => {
        fetch('/api/mathematical/harmonic-phrases')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setPhrases(data.phrases);
                }
            })
            .catch(err => console.error('Failed to fetch phrases:', err));
    }, []);

    const processHarmonicPhrase = async () => {
        if (!inputText.trim()) return;

        setLoading(true);
        setProcessingResult(null);

        try {
            const response = await fetch('/api/mathematical/harmonic-phrase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phrase: inputText,
                    context: { safetyLevel: 0.618 }
                })
            });

            const data = await response.json();
            setProcessingResult(data);
        } catch (error) {
            console.error('Error processing phrase:', error);
            setProcessingResult({
                success: false,
                error: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const applyFocusedCorrection = async () => {
        if (!inputText.trim()) return;

        setLoading(true);
        setCorrectionResult(null);

        try {
            const response = await fetch('/api/mathematical/correct-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: inputText,
                    passes: 3
                })
            });

            const data = await response.json();
            setCorrectionResult(data);
        } catch (error) {
            console.error('Error correcting text:', error);
            setCorrectionResult({
                success: false,
                error: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const selectPhrase = (phrase) => {
        setInputText(phrase);
        setProcessingResult(null);
        setCorrectionResult(null);
    };

    return (
        <div className="harmonic-phrase-processor">
            <header className="processor-header">
                <h1>🎵 Harmonic Phrase Processor</h1>
                <p>Process "silly names" into mathematical solutions</p>
            </header>

            <div className="tab-navigation">
                <button
                    className={`tab-button ${activeTab === 'processor' ? 'active' : ''}`}
                    onClick={() => setActiveTab('processor')}
                >
                    Phrase Processor
                </button>
                <button
                    className={`tab-button ${activeTab === 'library' ? 'active' : ''}`}
                    onClick={() => setActiveTab('library')}
                >
                    Phrase Library ({phrases.length})
                </button>
            </div>

            {activeTab === 'processor' && (
                <div className="processor-content">
                    {/* Input Section */}
                    <section className="input-section">
                        <h2>Input Text</h2>
                        <textarea
                            className="phrase-input"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder='Enter a harmonic phrase like "Too fours" or text to correct...'
                            rows={6}
                        />
                        <div className="action-buttons">
                            <button
                                className="action-button process"
                                onClick={processHarmonicPhrase}
                                disabled={loading || !inputText.trim()}
                            >
                                {loading ? '⏳ Processing...' : '🎵 Process Harmonic Phrase'}
                            </button>
                            <button
                                className="action-button correct"
                                onClick={applyFocusedCorrection}
                                disabled={loading || !inputText.trim()}
                            >
                                {loading ? '⏳ Correcting...' : '✏️ Apply Focused Correction'}
                            </button>
                            <button
                                className="action-button clear"
                                onClick={() => {
                                    setInputText('');
                                    setProcessingResult(null);
                                    setCorrectionResult(null);
                                }}
                                disabled={loading}
                            >
                                🗑️ Clear
                            </button>
                        </div>
                    </section>

                    {/* Processing Result */}
                    {processingResult && (
                        <section className="result-section processing-result">
                            <h2>🎯 Processing Result</h2>
                            {processingResult.success ? (
                                <div className="result-content">
                                    <div className="result-header">
                                        <span className={`recognition-badge ${processingResult.recognized ? 'recognized' : 'unrecognized'}`}>
                                            {processingResult.recognized ? '✅ Recognized' : '❌ Not Recognized'}
                                        </span>
                                        {processingResult.recognized && (
                                            <span className="phrase-name">{processingResult.phrase}</span>
                                        )}
                                    </div>

                                    {processingResult.recognized && processingResult.solution && (
                                        <div className="solution-details">
                                            <div className="solution-item">
                                                <strong>Solution Type:</strong>
                                                <span className="solution-type">{processingResult.solution.type}</span>
                                            </div>
                                            <div className="solution-item">
                                                <strong>Sacred Node:</strong>
                                                <span className="node-value">{processingResult.solution.node}</span>
                                            </div>
                                            
                                            {/* Display specific solution data */}
                                            {processingResult.solution.type === 'bridging_stabilization' && (
                                                <>
                                                    <div className="solution-item">
                                                        <strong>Bridge Strength:</strong>
                                                        <span>{(processingResult.solution.bridgeStrength * 100).toFixed(2)}%</span>
                                                    </div>
                                                    <div className="solution-item">
                                                        <strong>Stabilization Factor:</strong>
                                                        <span>{processingResult.solution.stabilizationFactor.toFixed(6)}</span>
                                                    </div>
                                                </>
                                            )}

                                            {processingResult.solution.type === 'value_recalibration' && (
                                                <>
                                                    <div className="solution-item">
                                                        <strong>Baseline Adjustment:</strong>
                                                        <span>{processingResult.solution.baselineAdjustment.toFixed(6)}</span>
                                                    </div>
                                                    <div className="solution-item">
                                                        <strong>Coil Multiplier:</strong>
                                                        <span>{processingResult.solution.coilMultiplier.toLocaleString()} coils/USD</span>
                                                    </div>
                                                </>
                                            )}

                                            {processingResult.solution.type === 'force_equilibrium' && (
                                                <>
                                                    <div className="solution-item">
                                                        <strong>Angel Force (Constructive):</strong>
                                                        <span>{processingResult.solution.angelForce.toFixed(6)}</span>
                                                    </div>
                                                    <div className="solution-item">
                                                        <strong>Daemon Force (Destructive):</strong>
                                                        <span>{processingResult.solution.daemonForce.toFixed(6)}</span>
                                                    </div>
                                                    <div className="solution-item">
                                                        <strong>Balance Ratio:</strong>
                                                        <span className={processingResult.solution.isStable ? 'stable' : 'unstable'}>
                                                            {processingResult.solution.balance.toFixed(6)}
                                                            {processingResult.solution.isStable ? ' ✅' : ' ⚠️'}
                                                        </span>
                                                    </div>
                                                </>
                                            )}

                                            {processingResult.solution.recommendation && (
                                                <div className="recommendation">
                                                    <strong>💡 Recommendation:</strong>
                                                    <p>{processingResult.solution.recommendation}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {!processingResult.recognized && (
                                        <div className="unrecognized-message">
                                            <p>This phrase is not recognized as a harmonic signature.</p>
                                            <p>Try one of the phrases from the library, or apply focused correction instead.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="error-message">
                                    ❌ Error: {processingResult.error}
                                </div>
                            )}
                        </section>
                    )}

                    {/* Correction Result */}
                    {correctionResult && (
                        <section className="result-section correction-result">
                            <h2>✏️ Focused Correction Result</h2>
                            {correctionResult.success ? (
                                <div className="result-content">
                                    <div className="correction-comparison">
                                        <div className="correction-box original">
                                            <h3>Original Text</h3>
                                            <pre>{correctionResult.original}</pre>
                                        </div>
                                        <div className="correction-arrow">→</div>
                                        <div className="correction-box corrected">
                                            <h3>Corrected Text</h3>
                                            <pre>{correctionResult.final}</pre>
                                        </div>
                                    </div>

                                    <div className="correction-stats">
                                        <h3>Correction Statistics</h3>
                                        <div className="stats-grid">
                                            <div className="stat-item">
                                                <strong>Passes:</strong> {correctionResult.passes}
                                            </div>
                                            <div className="stat-item">
                                                <strong>Symbol Corrections:</strong> {correctionResult.statistics.totalSymbolCorrections}
                                            </div>
                                            <div className="stat-item">
                                                <strong>Word Corrections:</strong> {correctionResult.statistics.totalWordCorrections}
                                            </div>
                                            <div className="stat-item">
                                                <strong>Line Corrections:</strong> {correctionResult.statistics.totalLineCorrections}
                                            </div>
                                        </div>
                                    </div>

                                    {correctionResult.corrections && correctionResult.corrections.length > 0 && (
                                        <div className="correction-details">
                                            <h3>Detailed Corrections</h3>
                                            {correctionResult.corrections.map((correction, i) => (
                                                <div key={i} className="correction-pass">
                                                    <strong>Pass {i + 1} ({correction.unit}):</strong>
                                                    <ul>
                                                        {correction.changes.map((change, j) => (
                                                            <li key={j}>
                                                                <code>{change.from}</code> → <code>{change.to}</code>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="error-message">
                                    ❌ Error: {correctionResult.error}
                                </div>
                            )}
                        </section>
                    )}
                </div>
            )}

            {activeTab === 'library' && (
                <div className="library-content">
                    <section className="phrase-library">
                        <h2>Available Harmonic Phrases</h2>
                        <p className="library-description">
                            These "silly names" are mathematical problem signatures that trigger
                            automated φ-based solutions.
                        </p>
                        <div className="phrases-grid">
                            {phrases.map((phrase, i) => (
                                <div key={i} className="phrase-card" onClick={() => selectPhrase(phrase.phrase)}>
                                    <div className="phrase-title">"{phrase.phrase}"</div>
                                    <div className="phrase-meta">
                                        <span className="trigger-badge">{phrase.trigger}</span>
                                        <span className="node-badge">Node {phrase.node}</span>
                                    </div>
                                    <div className="phrase-description">{phrase.description}</div>
                                    <div className="phrase-details">
                                        <div className="detail-item">
                                            <strong>Mirror Number:</strong> {phrase.mirrorNumber}
                                        </div>
                                        <div className="detail-item">
                                            <strong>Golden Ratio:</strong> {typeof phrase.goldenRatio === 'number' 
                                                ? phrase.goldenRatio.toFixed(6) 
                                                : phrase.goldenRatio}
                                        </div>
                                    </div>
                                    <button className="try-button">Try This Phrase →</button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};

export default HarmonicPhraseProcessor;
