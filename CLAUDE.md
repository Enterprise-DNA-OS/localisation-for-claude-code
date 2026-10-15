# Localisation for Claude Code: operating instructions

This is a plain text localisation desk for product teams and agencies. The operator owns the project records and chooses the review policy. Ask for missing business context before changing a real record.

Read the CLI before making a claim about the records. Never invent translations or review evidence. Use a competent reviewer for meaning, grammar and context. The database records decisions; it does not certify them.

## One route per recurring job

| Job | Workflow |
|---|---|
| projects | /projects |
| locales | /locales |
| strings | /strings |
| backlog | /backlog |
| review queue | /review-queue |
| release readiness | /release-readiness |
| overdue | /overdue |
| attention | /attention |
| compliance | /compliance |
| weekly review | /weekly-review |
| activity | /activity |
| glossary | /glossary |
| add project | /add-project |
| add locale | /add-locale |
| add key | /add-key |
| set source | /set-source |
| set translation | /set-translation |
| approve | /approve |
| add task | /add-task |
| close task | /close-task |
| review project | /review-project |
| review key | /review-key |
| add term | /add-term |
| import | /import |
| export | /export |
| release bundle | /release-bundle |
| draft handoff | /draft-handoff |
| draft review | /draft-review |
| Add a field or rule | /customise |
| Add a read-only report | /new-view |

## Working rules

Use scripts/localise.mjs through npm run localise. Every read supports --json. Every mutation needs --actor and supports --dry-run. Read before writing. List ambiguity and use the correct UUID. Do not guess a reviewer, evidence reference or date.

Never send, publish, deploy or delete from this repo. Drafts go to drafts/. A local release file is not approval to deploy. Never bypass readiness checks. Every source or target edit needs review again. Read docs/compliance.md before interpreting compliance.

DATABASE_URL selects PostgreSQL. Otherwise PGlite stores records in .data/db. One process at a time for PGlite. Do not read or print secrets. The database owner has privileged access; actor labels are not authentication. Protect imports, exports, backups and generated documents.

Schema changes use a new numbered migration under supabase/migrations. Update CLI, commands, import, views, documents and tests together. npm test uses isolated data. Never run tests against a customer database.

Omni by Enterprise DNA installs, customises and runs this for you: https://enterprisedna.co/omni/book?offer=replace-software&utm_medium=agent&utm_campaign=lokalise
