# Governance Model

## Authority structure

### Scott Charles Olson (Project Lead)
- Final override on all decisions
- Screens and approves core contributors
- Resolves deadlocks
- Sets long-term direction
- Has demonstrated trustworthiness by not exploiting override power for personal profit

### AI Agent (Copilot / automated review)
- Flags misalignment with project purpose
- Detects unsafe patterns (hardcoded secrets, financial bypasses, consent violations)
- Objective, not swayed by social pressure
- May recommend rejection even if consensus favors a change
- Acts as ruthless but fair counterweight to people-pleasing

### Screened Code Contributors (Minimum 3)
- Must be individually approved and screened by Scott
- Vote on non-trivial changes
- Represent different perspectives and skill areas
- Consensus required (all 3+ must agree) for approval
- Provide human judgment and diverse voices

## Decision flow

### Change proposed (PR)

1. **AI review** → checks alignment, safety, boundaries
   - Flags: unsafe patterns, boundary violations, consent issues, financial logic errors
   - Never blocks, always advisable

2. **Contributor consensus** → 3+ screened coders review
   - All 3+ must approve for consensus
   - If unanimous → can merge (subject to Scott/AI concerns)
   - If split → escalates to Scott for decision

3. **Scott decision** → final authority
   - Can override consensus
   - Can override AI concerns (with reason logged in PR)
   - Can merge or reject any change

## Protected paths (require extra scrutiny)

These areas always require review from multiple perspectives:

- `/auth/`, `/security/` — identity and access control
- `/financialsystems/`, `/wallet/`, `/payments/`, `/contracts/` — money movement and settlement
- `/migrations/` — database schema changes involving identity, money, or consent
- `DISCLAIMER.md`, `NOTICE`, `SECURITY.md` — legal and safety guardrails
- `docs/LEGAL_AND_PRIVACY_NOTES.md`, `docs/ARCHITECTURE.md`, `docs/SOURCE_OF_TRUTH.md` — governance and policy

For these paths, expect:
- Scott always reviews
- AI flags any novel risks
- All 3+ contributors weigh in (or change blocked)

## Ordinary changes (lower friction)

These paths can move faster:

- `README.md`, docs improvements
- Tests and test fixtures
- Non-security UI/UX
- Examples and demos (using synthetic data only)
- Refactors with comprehensive test coverage
- Error message improvements

For ordinary changes:
- AI approval + 1 contributor approval sufficient to unblock
- Scott does not need to review individually
- Faster iteration without sacrificing safety

## Conflict resolution

### If AI says "unsafe" but contributors agree

- Scott makes final call
- Decision is logged in PR comments with reasoning
- If Scott overrides AI concern, the rationale becomes part of project record

### If contributors split (not unanimous)

- Scott decides
- Minority voice is preserved in PR record (do not delete dissenting comments)
- Scott explains reasoning

### If all parties agree but Scott disagrees

- Scott can reject or request changes
- Scott must provide reasoning in PR comment
- Final decision is Scott's

## Trust model

This governance works because:

1. **Scott has skin in the game** and has not exploited override power for personal profit — trust is earned and can be revoked if behavior changes

2. **AI is ruthless and objective** — cannot be socially pressured, guilt-tripped, or people-pleased into bad decisions; balanced by human judgment when AI misjudges

3. **3+ coders provide human judgment and diverse perspective** — no single person (except Scott) can unilaterally merge risky code; multiple viewpoints catch blind spots

4. **Structured escalation** — conflicts are resolved predictably, not through drama or force

5. **Decisions are logged** — reasoning is recorded; this creates accountability and helps the model evolve

## Evolution and improvement

This model is expected to change:

- As Scott's judgment is tested, the model may shift (more/less delegation)
- As contributors earn trust, the friction for their areas can decrease
- As project maturity changes, protected paths may expand or contract
- AI review scope may sharpen as we learn what matters most

When changing the governance model:
- Scott initiates or approves the change
- Must be documented in `docs/GOVERNANCE.md`
- Change is logged as a decision, not a quiet drift

## No implicit affiliation

See `NOTICE` and `LEGAL_AND_PRIVACY_NOTES.md` for rules around:
- Who can claim to represent Solidarity-Clean
- Personal relationships and authority
- Name/image use without permission

Screened contributors are not automatically employees, advisers, owners, or sponsors. A written agreement is required for any such relationship.
