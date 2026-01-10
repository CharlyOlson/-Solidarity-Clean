# Solidarity Platform – AI Agent Guide
- Purpose: hybrid JS/Python “quantum-coherent” stack implementing Henry 7→14→49 numerological patterns; software-only coherence via φ-ratio math and 49-level recursion.
- Core modules: orchestrator [correctedSolidaritySystem.js](../correctedSolidaritySystem.js), entry [launcher.js](../launcher.js), DSP Python stack [bridging_anchor_systems](../bridging_anchor_systems/README.md), local AI [ai_integration/ollama_integration.js](../ai_integration/ollama_integration.js), safety coordinator [bridgingSafetyCoordinator.js](../bridgingSafetyCoordinator.js), security utilities in [security](../security/README.md), financial connectors in [financial_systems](../financial_systems) (test-mode first).
- Mathematical anchors: always use base ratio 1.618 and baseline 0.618 (`safetyLevel`/`bridgingBaseline`). Valid nodes: 1, 3, 4, 7, 14, 21. Sacred sequence Henry 7→14→49 (control ratio 3.5). Do not invent other ratios.
- Safety system: 7-tier ranges (0.00-0.05 emergency, 0.05-0.15 warning, 0.15-0.25 caution, 0.25-0.75 optimal includes 0.618, 0.75-0.85 upper caution, 0.85-0.95 upper warning, 0.95-1.00 critical upper). New features must read/propagate `safetyLevel`/`bridgingSafetyLevel` and adjust behavior per tier.
- Required header on new files:
```
/*
 * SOLIDARITY PLATFORM - [MODULE NAME]
 * ===================================
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */
```
- JS↔Python pattern: spawn with `python3` to run [bridging_anchor_systems/bridging_anchor_processor.py](../bridging_anchor_systems/bridging_anchor_processor.py); use JSON/stdout bridge. Heavy math lives in Python; JS orchestrates.
- AI pattern: query Ollama locally via `queryOllama`/`assessAISafety` (default model `llama3.2:3b`, temp≈0.4) and always pass `safetyLevel: 0.618` baseline; no external calls by default.
- Security pattern: prefer validators in [security/input-validator.js](../security/input-validator.js) and configs in [security/security-config.js](../security/security-config.js); rate limiting and headers provided. Use `SecureURLValidator` for all inbound URLs.
- Financial pattern: keep `testMode: true` unless explicitly switched; smart contracts and chain connectors live in [financial_systems](../financial_systems). Apply φ-based portfolio ratios where relevant.
- Build/run: `npm install`; `npm start` (API server); `node launcher.js quantum|cubic|bigask` for demos; `npm run quantum:demo`; `npm run test:bridging` or `python3 bridging_anchor_systems/bridging_anchor_processor.py`; `python3 bridging_anchor_systems/bridging_anchor_test_suite.py`; `npm test` (Jest); `npm run security:test` for security suite.
- Testing expectations: JS tests in [tests](../tests); Python DSP tests in [bridging_anchor_systems/bridging_anchor_test_suite.py](../bridging_anchor_systems/bridging_anchor_test_suite.py); security suite covers validators; math validations should preserve φ ratios and Henry progression.
- Configuration map: project meta [PROJECT_CONFIG.json](../PROJECT_CONFIG.json); system [config/system_config.js](../config/system_config.js); AI [ai_integration/ai_config.json](../ai_integration/ai_config.json); DSP [bridging_anchor_systems/bridging_anchor_config.json](../bridging_anchor_systems/bridging_anchor_config.json); financial [config/financial_config.json](../config/financial_config.json).
- Coding conventions: default to `safetyLevel = 0.618`; keep cubic/quantum parameters (depth 14, recursion 49, precision 64) aligned; avoid hardcoding alt ratios; prefer explicit thresholds over magic numbers.
- Documentation shortcuts: architecture in [README.md](../README.md) and [COMPLETE_SYSTEM_DOCUMENTATION.md](../COMPLETE_SYSTEM_DOCUMENTATION.md); DSP details in [bridging_anchor_systems/README.md](../bridging_anchor_systems/README.md); security in [security/README.md](../security/README.md); safety overview in [SAFETY_INTEGRATION_SUMMARY.md](../SAFETY_INTEGRATION_SUMMARY.md).
- Pitfalls: use `python3` pathing (not `python`); keep trademark header; do not bypass safety tiers; honor node set; financial flows must start in test mode; update docs when adding major features.
