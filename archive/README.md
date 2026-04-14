# Archive

Non-financial modules preserved for reference. These are not active in the financial system.

## Contents

- **audio/** — Audio processing modules (TIMBRCompressionSystem, AudioStudioCommands, ColorMotionTracking). Not part of the financial platform.
- **legacy_ai_integration/** — Original ai_integration/ directory with older Ollama integration code. Replaced by src/ai/ (OllamaProvider, PerplexityProvider, AIRouter).
- **legacy_ai_providers/** — Original OllamaIntegration.js and PerplexityIntegration.js with coherence-aware safety thresholds baked in. Replaced by cleaner OllamaProvider.js + AIRouter.js (coherence gating now in router).
- **legacy_ai_src/** — Older AI source files from src/ai/ before the rewrite.
- **legacy_demos/** — Example scripts and demos (core_engine_demo, critical_analysis, etc.).
- **legacy_frontend_scaffold/** — Old Create React App scaffold (frontend/app.npm/). The active frontend is in frontend/src/.
- **non_financial_components/** — React components removed from the active frontend: FractalCanvas, HarmonicPhraseProcessor, SacredGeometryDashboard, QuipNotes.

## Why archived (not deleted)

These modules represent work and ideas. Some may be reactivated later. The financial system doesn't need them to operate, so they're separated to keep the active codebase focused.
