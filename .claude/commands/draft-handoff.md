---
description: draft handoff for the localisation desk.
---

Read CLAUDE.md first. Choose a project and read its strings and backlog. Write the HTML draft to drafts/. Inspect it. Nothing is sent.

Run `npm run localise -- draft-handoff` with the required values from the operator. Available flags: --project. Use --json for complete records.

For a mutation, require --actor, preview with --dry-run and apply only the requested change. Never invent missing values. Ambiguous names must be resolved to a listed ID. Never send, deploy, delete or claim approval from a draft.
