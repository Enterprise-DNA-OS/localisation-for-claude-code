---
description: import for the localisation desk.
---

Read CLAUDE.md first. Read docs/replace-lokalise.md. Use import lokalise with --project, --source, --dir and --actor. Preview with --dry-run. Explain all count differences before applying. Never treat imported text as locally approved.

Run `npm run localise -- import lokalise` with the required values from the operator. Available flags: --project, --source, --dir, --replace-source. Use --json for complete records.

For a mutation, require --actor, preview with --dry-run and apply only the requested change. Never invent missing values. Ambiguous names must be resolved to a listed ID. Never send, deploy, delete or claim approval from a draft.
