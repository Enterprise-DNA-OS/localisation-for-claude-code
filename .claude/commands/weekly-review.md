---
description: weekly review for the localisation desk.
---

Read CLAUDE.md first. Run release-readiness, overdue and compliance, then weekly-review. State the release blockers, owners and next decisions. Never call a language ready while records are blocked.

Run `npm run localise -- weekly-review` with the required values from the operator. Available flags: none. Use --json for complete records.

For a mutation, require --actor, preview with --dry-run and apply only the requested change. Never invent missing values. Ambiguous names must be resolved to a listed ID. Never send, deploy, delete or claim approval from a draft.
