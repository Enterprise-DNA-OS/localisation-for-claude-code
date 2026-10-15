---
description: add term for the localisation desk.
---

Read CLAUDE.md first. Read the current records before acting. Report the actual result and any unresolved records.

Run `npm run localise -- add-term` with the required values from the operator. Available flags: --project, --locale, --source, --target. Use --json for complete records.

For a mutation, require --actor, preview with --dry-run and apply only the requested change. Never invent missing values. Ambiguous names must be resolved to a listed ID. Never send, deploy, delete or claim approval from a draft.
