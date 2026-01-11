// Ollama Controller - Handles descriptor-based SVG generation
const express = require('express');
const router = express.Router();

// POST /api/ollama/generate
router.post('/generate', async (req, res) => {
  const { theme, style, descriptors } = req.body;
  // Validate inputs
  if (!theme || !style || !descriptors) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  // TODO: Integrate with Ollama static generation logic
  // For now, return a placeholder SVG string
  const svg = `<svg width='220' height='220'><rect width='220' height='220' fill='#e0e0ff'/><text x='110' y='110' font-size='20' text-anchor='middle' fill='#333'>${theme}</text></svg>`;
  res.json({ svg });
});

module.exports = router;
