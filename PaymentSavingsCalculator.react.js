// PaymentSavingsCalculator.react.js
// React component for payment savings calculator UI

import React, { useState } from 'react';
import PaymentSavingsCalculatorCore from './PaymentSavingsCalculator.core';

const calculator = new PaymentSavingsCalculatorCore();

export function PaymentCalculatorWidget() {
  const [volume, setVolume] = useState('');
  const [results, setResults] = useState(null);

  function calculate() {
    const numericVolume = parseFloat(volume || 0);
    if (!numericVolume || numericVolume <= 0) {
      setResults(null);
      return;
    }
    const res = calculator.quickCalculate(numericVolume);
    setResults(res);
  }

  return (
    <div>
      <input 
        type="number" 
        value={volume}
        onChange={e => setVolume(e.target.value)}
        placeholder="Annual payment volume"
      />
      <button onClick={calculate}>Calculate</button>
      {results && (
        <div>
          <h2>Save ${results.annualSavings.toLocaleString()}/year</h2>
          <p>{results.savingsPercentage.toFixed(1)}% reduction</p>
          <p>Break-even: {results.breakEvenMonths.toFixed(1)} months</p>
        </div>
      )}
    </div>
  );
}
