---
description: approve for the localisation desk.
---

Read CLAUDE.md first. Read the source, translation and current backlog. Have a competent person judge meaning and context. The reviewer must differ from the last editor. Record evidence of the exact reviewed text. An actor label is not authentication.

Run `npm run localise -- approve` with the required values from the operator. Available flags: --key, --locale, --evidence. Use --json for complete records.

For a mutation, require --actor, preview with --dry-run and apply only the requested change. Never invent missing values. Ambiguous names must be resolved to a listed ID. Never send, deploy, delete or claim approval from a draft.
