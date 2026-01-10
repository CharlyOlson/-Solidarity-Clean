// Minimal Express backend for Hanko CLI integration
const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
app.use(express.json());

// High-priority: Hanko stamp generation endpoint
app.post('/api/hanko/generate', (req, res) => {
    const userInput = req.body || {};
    const cliPath = path.join(__dirname, '../bridging_anchor_systems/hanko_cli.py');
    const pythonExe = process.env.PYTHON_PATH || 'python';
    // Pass JSON as a single argument, as required by hanko_cli.py
    const child = spawn(pythonExe, [cliPath, 'generate', JSON.stringify(userInput)]);

    let output = '';
    let error = '';
    child.stdout.on('data', (data) => { output += data.toString(); });
    child.stderr.on('data', (data) => { error += data.toString(); });
    child.on('close', (code) => {
        if (code === 0) {
            // Try to parse output as JSON, fallback to string
            try {
                res.json({ success: true, result: JSON.parse(output) });
            } catch {
                res.json({ success: true, output });
            }
        } else {
            res.status(500).json({ success: false, error });
        }
    });
});

app.get('/', (req, res) => {
    res.send('Express backend is running.');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
});
