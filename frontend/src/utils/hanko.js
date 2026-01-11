// Utility functions for Hanko Stamps encoding and convergence

export function encodeToGridPositions(text) {
  if (!text) return [];
  const cleaned = text.toUpperCase().replace(/[^A-Z]/g, '');
  const firstSeven = cleaned.slice(0, 7);
  return firstSeven.split('').map((char, idx) => {
    const pos = char.charCodeAt(0) - 64; // A=1, B=2, etc.
    return ((pos - 1) % 7) + 1;
  });
}

export function calculateSudokuConvergence(userInputs, BASE_RATIO) {
  const grids = [];
  const inputValues = Object.values(userInputs).filter(v => v.length > 0);
  if (inputValues.length < 3) return null;
  inputValues.slice(0, 6).forEach((input, gridIdx) => {
    const encoded = encodeToGridPositions(input);
    const grid = Array(9).fill(0);
    encoded.forEach((val, i) => {
      const rotatedPos = (i + gridIdx) % 9;
      grid[rotatedPos] = val;
    });
    for (let i = 0; i < 9; i++) {
      if (grid[i] === 0) {
        grid[i] = ((i + gridIdx + 1) % 7) + 1;
      }
    }
    grids.push(grid);
  });
  const PHI_TARGET = BASE_RATIO * 7;
  let bestPos = 4;
  let bestDiff = Infinity;
  for (let pos = 0; pos < 9; pos++) {
    const sum = grids.reduce((acc, grid) => acc + grid[pos], 0);
    const diff = Math.abs(sum - PHI_TARGET);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestPos = pos;
    }
  }
  const x = bestPos % 3;
  const y = Math.floor(bestPos / 3);
  const totalSum = grids.flat().reduce((a, b) => a + b, 0);
  const spokeCount = (totalSum % 7) + 7;
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
}
