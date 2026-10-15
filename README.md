# Localisation for Claude Code

Own your source strings, translations and review decisions. A database and a coding agent run the weekly localisation desk. No hosted editor or runtime service is required for the supported plain text workflow.

## Three ways to use it

- **Do it yourself:** free MIT software. Clone it, install Node 20+, run `npm install` and `npm run demo`, then open it in Claude Code, Codex, OpenCode or Cursor. Hosting and agent subscriptions have separate costs.
- **We customise it:** Enterprise DNA brings your Lokalise exports across, adds your fields and review rules, and builds the screens or integrations your team needs. Your preferred stack is part of the scope.
- **We run it for you:** Omni by Enterprise DNA installs, connects and operates your version. One setup fee, then a monthly retainer. [Book a call](https://enterprisedna.co/omni/book?offer=replace-software&utm_medium=readme&utm_campaign=lokalise).

## Start with the demo

```bash
npm install
npm run demo
npm run localise -- weekly-review
npm run view
npm run docs
```

The demo is fictional. Harbour booking has a missing German placeholder, a refund promise with overdue evidence, and a late follow-up. Dates are relative to the first seed. Seeding is idempotent. Start a fresh database for real data.

PGlite stores data in `.data/db` without a database installation. Set DATABASE_URL for PostgreSQL. Use one process at a time with PGlite. PostgreSQL supports shared operation with serialized CLI mutations. Database credentials are privileged: there is no user sign-in or tenant separation in this free version. Keep each business in a separate protected database. RLS denies public-role access; the database owner operates this CLI.

## The weekly desk

/backlog assigns missing or blocked translations. /review-queue checks edited source strings. /release-readiness checks each language. /overdue follows up late work. /weekly-review combines readiness, overdue tasks and evidence checks. /draft-handoff and /draft-review write HTML drafts without sending. /compliance lists evidence and record issues.

```bash
npm run localise -- set-translation --key=booking.welcome --locale=de --text="Willkommen {name}" --actor=Theo --dry-run
npm run localise -- approve --key=booking.welcome --locale=de --evidence="Reviewed against booking confirmation" --actor=Luc --dry-run
```

First remove --dry-run from the translation change. Then preview the approval and apply it. All mutations require an actor and support --dry-run. A reviewer must differ from the last editor. Actor labels record attribution, not authenticated identity. Source edits invalidate prior review and evidence; translation edits remove approval. The event record keeps before and after facts. The database owner can bypass these protections.

Names match without case sensitivity, UUID prefixes work, and ambiguous matches list candidates and fail. Use IDs for identical names in different projects. Every read supports --json. `npm run localise -- help` lists the supported flags. Unknown flags and positional arguments fail.

## Ten questions answered today

These are working questions, not unsupported claims that Lokalise cannot answer them with configuration.

1. Which languages are blocked for the next release? Use `release-readiness`.
2. Which translations are missing? Use `backlog`.
3. Which reviewed words became stale after a source edit? Use `review-queue`.
4. Which placeholders no longer match the source? Use `backlog`.
5. Which labels exceed our character limits? Use `backlog`.
6. Which terms break our chosen wording? Use `backlog`.
7. Which claims have overdue supporting evidence? Use `compliance`.
8. Who owns the overdue translator follow-ups? Use `overdue`.
9. What changed and who recorded it? Use `activity`.
10. What decisions belong in the Monday review? Use `weekly-review`.

## Bring your history

The importer reads Lokalise Expert Web and mobile project CSV exports, one headerless file per language named `en.csv`, `fr.csv` and so on. It imports plain text keys, values, descriptions and comments, preserves the source rows, and requires a fresh local review. Vantage does not offer this CSV format.

```bash
npm run localise -- add-project --name="Our product" --source=en --owner=Mara --actor=Mara
npm run localise -- import lokalise --project="Our product" --source=en --dir=imports/lokalise --actor=Mara --dry-run
```

Inspect the preview, then remove --dry-run. [The switching guide](docs/replace-lokalise.md) covers exact export settings, repeat imports, changed source records and what needs separate mapping. The included fixtures are authored examples of the documented format, not customer exports. Review the project purpose and review date before relying on readiness.

## Documents, views and release files

Edit brand.json for your business name, logo and colours. `npm run docs` produces a translator handoff and a release checklist for each project. `npm run view` produces three read-only HTML views. /new-view adds another report; /customise adds fields or changes rules through a migration.

`release-bundle` writes a local flat JSON language file only when every string passes the current review checks. It never deploys, sends or replaces an existing file. Rendered documents are drafts. Protect generated files and backups as carefully as the database. `export --out=exports/archive.json` preserves every record and event in a readable archive; it is not a restore command. Test database backups separately.

## Your first hour: ten things to ask for

1. Put our name and colours on the translator brief.
2. Preview our Lokalise language files.
3. Compare source and target key counts.
4. Set the purpose and next review date for the project.
5. Find missing language variants.
6. Restore a broken placeholder.
7. Add a preferred translation for a product term.
8. Ask another person to review a corrected string.
9. Draft the next release checklist.
10. Add our own approval rule through /customise.

## Scope and checks

[Compliance](docs/compliance.md) separates legal principles from configurable record checks. Placeholder checks cover literal named braces and basic printf tokens. ICU plurals/select and markup are blocked pending a dedicated parser. Term checks use case-insensitive substrings, not linguistic analysis. Reviewers must check meaning, grammar, locale formatting and context. No automatic translation service is called. Translation memories, editor previews, mobile delivery, branch history and source permissions need separate migration or custom work. [Why no front end](docs/why-no-front-end.md).

`npm test` uses a temporary database and exercises every CLI command, import rollback and repeatability, stale review rejection, character limits, glossary rules, dry runs, immutable events, exports and HTML escaping. The CI matrix runs Windows and Linux on Node 20/22 plus PostgreSQL 17. TEST_DATABASE_URL must refer only to an empty disposable test database.

MIT. Not affiliated with Lokalise or Anthropic. [Research and scoring](docs/research.md).
