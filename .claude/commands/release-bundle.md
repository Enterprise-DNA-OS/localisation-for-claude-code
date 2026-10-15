---
description: release bundle for the localisation desk.
---

Read CLAUDE.md first. Read release-readiness, backlog and compliance first. Require an explicit project, locale and a new output path. This writes a local file only. Never deploy or send it.

Run `npm run localise -- release-bundle` with the required values from the operator. Available flags: --project, --locale, --out. Use --json for complete records.

For a mutation, require --actor, preview with --dry-run and apply only the requested change. Never invent missing values. Ambiguous names must be resolved to a listed ID. Never send, deploy, delete or claim approval from a draft.
