//
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

import React, { useState, useEffect } from 'react';
import { BASE_RATIO } from '../config/constants';
import './HankoStamps.css';
import { encodeToGridPositions, calculateSudokuConvergence } from '../../utils/hanko';
import { stampTypes } from '../../utils/stampTypes';
import { API_BASE_URL } from '../config/api';
import HankoStampForm from './hanko/HankoStampForm';
import HankoStampList from './hanko/HankoStampList';
import HankoStampDetails from './hanko/HankoStampDetails';

const HankoStamps = () => {
  const [stamps, setStamps] = useState([]);
  const [userInputs, setUserInputs] = useState({
    birthMonth: '',
    mothersName: '',
    county: '',
    height: '',
    eyeColor: '',
    teachersName: '',
    favoriteFruit: ''
  });
  const [selectedStamp, setSelectedStamp] = useState(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestType, setRequestType] = useState('personal');
  const [creationStep, setCreationStep] = useState(1); // 1: type, 2: inputs, 3: preview
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState(null);
  // Removed unused convergencePoint state
  
  // Fetch stamps from backend
  const fetchStamps = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/hanko/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStamps(data.stamps || []);
    } catch (error) {
      console.error('Fetch stamps error:', error);
    }
  };

  // Handle dialog close and reset
  const handleCloseDialog = () => {
    setShowRequestDialog(false);
    setCreationStep(1);
    setGeneratedPreview(null);
    setUserInputs({
      birthMonth: '',
      mothersName: '',
      county: '',
      height: '',
      eyeColor: '',
      teachersName: '',
      favoriteFruit: ''
    });
  };

  // Generate preview based on inputs
  const generatePreview = async () => {
    setIsGenerating(true);
    const convergence = calculateSudokuConvergence(userInputs, BASE_RATIO);
    if (convergence) {
      // Placeholder for AI description
      const aiDesc = 'AI-generated description';
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
    const bw = Math.round((convergence.position + 1) / 9 * 100 * BASE_RATIO) % 100;
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
        headers: { 'Authorization': `Bearer ${token}` }
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

  // Initial fetch
  React.useEffect(() => {
    fetchStamps();
  }, []);

  // ============================================================================
  // 7 USER INPUTS (Hanko Stamp Identity Data)
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
              onClick={() => setShowRequestDialog(true)}
            >
              Create Your First Stamp
            </button>
          </div>
        ) : (
          <HankoStampList stamps={stamps} stampTypes={stampTypes} viewStampDetails={viewStampDetails} />
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
              <HankoStampForm
                userInputs={userInputs}
                setUserInputs={setUserInputs}
                creationStep={creationStep}
                setCreationStep={setCreationStep}
                generatePreview={generatePreview}
                isGenerating={isGenerating}
                encodeToGridPositions={encodeToGridPositions}
                calculateSudokuConvergence={calculateSudokuConvergence}
              />
            )}
            {/* Step 3: Preview and Create */}
            {creationStep === 3 && generatedPreview && (
              // ...existing preview and create logic...
              <div>Preview and create logic here</div>
            )}
          </div>
        </div>
      )}
      {/* Stamp Details Modal */}
      {selectedStamp && (
        <HankoStampDetails
          selectedStamp={selectedStamp}
          stampTypes={stampTypes}
          revokeStamp={revokeStamp}
          onClose={() => setSelectedStamp(null)}
        />
      )}
    </div>
  );
}
