import React from 'react';

const HankoStampForm = ({ userInputs, setUserInputs, creationStep, setCreationStep, generatePreview, isGenerating, encodeToGridPositions, calculateSudokuConvergence }) => (
  <>
    <p className="dialog-subtitle">
      📝 Enter 7 identity markers (creates unique stamp pattern):
    </p>
    <div className="identity-inputs-grid">
      {/* 1. Birth Month */}
      <div className="input-group">
        <label>1. Birth Month</label>
        <input 
          type="text" 
          placeholder="e.g., March"
          value={userInputs.birthMonth}
          onChange={e => setUserInputs({ ...userInputs, birthMonth: e.target.value })}
        />
        <span className="encoded-preview">
          → {encodeToGridPositions(userInputs.birthMonth).join('')}
        </span>
      </div>
      {/* 2. Mother's Middle/Last Name */}
      <div className="input-group">
        <label>2. Mother's Middle/Last Name</label>
        <input 
          type="text" 
          placeholder="e.g., Marina"
          value={userInputs.mothersName}
          onChange={e => setUserInputs({ ...userInputs, mothersName: e.target.value })}
        />
        <span className="encoded-preview">
          → {encodeToGridPositions(userInputs.mothersName).join('')}
        </span>
      </div>
      {/* 3. County/District Name */}
      <div className="input-group">
        <label>3. County/District Name</label>
        <input 
          type="text" 
          placeholder="e.g., Johnson"
          value={userInputs.county}
          onChange={e => setUserInputs({ ...userInputs, county: e.target.value })}
        />
        <span className="encoded-preview">
          → {encodeToGridPositions(userInputs.county).join('')}
        </span>
      </div>
      {/* 4. Height (written out) */}
      <div className="input-group">
        <label>4. Height (written out)</label>
        <input 
          type="text" 
          placeholder="e.g., Five Feet Eight Inches"
          value={userInputs.height}
          onChange={e => setUserInputs({ ...userInputs, height: e.target.value })}
        />
        <span className="encoded-preview">
          → {encodeToGridPositions(userInputs.height).join('')}
        </span>
      </div>
      {/* 5. Eye Color */}
      <div className="input-group">
        <label>5. Eye Color</label>
        <input 
          type="text" 
          placeholder="e.g., Brown"
          value={userInputs.eyeColor}
          onChange={e => setUserInputs({ ...userInputs, eyeColor: e.target.value })}
        />
        <span className="encoded-preview">
          → {encodeToGridPositions(userInputs.eyeColor).join('')}
        </span>
      </div>
      {/* 6. Favorite Teacher's Last Name */}
      <div className="input-group">
        <label>6. Favorite Teacher's Last Name</label>
        <input 
          type="text" 
          placeholder="e.g., Jacobson"
          value={userInputs.teachersName}
          onChange={e => setUserInputs({ ...userInputs, teachersName: e.target.value })}
        />
        <span className="encoded-preview">
          → {encodeToGridPositions(userInputs.teachersName).join('')}
        </span>
      </div>
      {/* 7. Favorite Fruit/Veggie */}
      <div className="input-group full-width">
        <label>7. Favorite Fruit/Veggie</label>
        <input 
          type="text" 
          placeholder="e.g., Mango"
          value={userInputs.favoriteFruit}
          onChange={e => setUserInputs({ ...userInputs, favoriteFruit: e.target.value })}
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
          {calculateSudokuConvergence(userInputs)?.grids?.slice(0, 6).map((grid, idx) => (
            <div key={idx} className="mini-sudoku-grid">
              <div className="grid-label">G{idx + 1}</div>
              <div className="grid-cells">
                {grid.map((val, i) => (
                  <div 
                    key={i} 
                    className={`cell ${i === calculateSudokuConvergence(userInputs)?.position ? 'highlight' : ''}`}
                  >
                    {val}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {calculateSudokuConvergence(userInputs) && (
          <div className="convergence-info">
            📍 Convergence Point: ({calculateSudokuConvergence(userInputs).x}, {calculateSudokuConvergence(userInputs).y})
            | Spokes: {calculateSudokuConvergence(userInputs).spokeCount}
            | Rotation: {calculateSudokuConvergence(userInputs).rotation}°
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
      <button className="btn-cancel" onClick={() => setCreationStep(1)}>
        ❌ Cancel
      </button>
    </div>
  </>
);

export default HankoStampForm;
