---
description: draft review for the localisation desk.
---

Read CLAUDE.md first. Write the HTML draft to drafts/. Inspect it for accuracy and escaped text. Nothing is sent.

Run `npm run localise -- draft-review` with the required values from the operator. Available flags: none. Use --json for complete records.

For a mutation, require --actor, preview with --dry-run and apply only the requested change. Never invent missing values. Ambiguous names must be resolved to a listed ID. Never send, deploy, delete or claim approval from a draft.
