---
description: compliance for the localisation desk.
---

Read CLAUDE.md first. Read docs/compliance.md. Run the check and cite the rule relevant to each finding. These are record checks, not legal or linguistic certification.

Run `npm run localise -- compliance` with the required values from the operator. Available flags: none. Use --json for complete records.

For a mutation, require --actor, preview with --dry-run and apply only the requested change. Never invent missing values. Ambiguous names must be resolved to a listed ID. Never send, deploy, delete or claim approval from a draft.
