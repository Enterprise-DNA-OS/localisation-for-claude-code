---
description: set source for the localisation desk.
---

Read CLAUDE.md first. Read the current string first. Explain that changing the source invalidates translation reviews and source evidence. Capture a reason using --evidence.

Run `npm run localise -- set-source` with the required values from the operator. Available flags: --key, --text, --evidence. Use --json for complete records.

For a mutation, require --actor, preview with --dry-run and apply only the requested change. Never invent missing values. Ambiguous names must be resolved to a listed ID. Never send, deploy, delete or claim approval from a draft.
