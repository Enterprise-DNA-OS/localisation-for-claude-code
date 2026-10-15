# Replace the plain text localisation desk in Lokalise

Checked 15 October 2026 against [Lokalise download help](https://docs.lokalise.com/en/articles/3150682-downloading-translation-files) and [CSV format help](https://docs.lokalise.com/en/articles/1400753-comma-separated-values-csv).

In an Expert Web and mobile project, choose Download and CSV. Include all platform keys, select the source and target languages, choose one file per language and name them with language ISO codes, for example en.csv and fr.csv. Export all strings, keep missing translations empty, include descriptions and comments, and leave real newlines intact. Export the intended branch. Avoid mixing projects, filtering keys or substituting source text for empty translations. CSV does not support plurals. Vantage uses a different export path and is outside this importer.

The documented file is headerless: key, value, optional description, optional comment. Use UTF-8, commas and normal CSV quoting. Each language file must have a consistent column count of two through four. Put the extracted files in a single directory. No ZIP reading, nested folders, custom delimiters or header guessing.

Create a project and import the directory in one command:

```bash
npm run localise -- add-project --name="Our product" --source=en --owner=Mara --actor=Mara
npm run localise -- import lokalise --project="Our product" --source=en --dir=imports/lokalise --actor=Mara --dry-run
```

Remove --dry-run after reviewing the counts. The source file supplies each key, source text and description. Target files supply translated values. Original descriptions and comments from every language remain in the imports record and export archive. There is no claim to restore Lokalise IDs, tasks, review statuses, translators, screenshots, attachments, glossary, translation memory, history, custom statuses, branching or permissions from these files. Add preferred terms and task owners locally. Enterprise DNA maps additional exports and integrations as part of your version.

The import is one transaction. A duplicate key, invalid locale, malformed CSV or target key absent from the source rolls everything back. It matches project, locale and exact key name. Identical rows are skipped without overwriting local edits. Changed exported rows require --replace-source, which overwrites that row's local text and clears its review. Always preview it. Source changes invalidate reviews in every language. Missing rows in a later export do not delete anything. Renamed keys create new records, so reconcile the old keys separately. New source records cannot silently adopt existing local keys. Original row values and the prior local record appear in the audit history.

Compare file row counts, source key counts and target values against the export before using them. Review project retention purpose, evidence and deadlines, then review imported translations with a competent person. Run both systems during a real release. Cancel only after your team verifies the required workflow, history and deployment process.

The fixtures use the documented shape with invented text. They demonstrate the parser; they are not a captured tenant export. Flat JSON release bundles are local files, not deployment. Keep your normal source-control and release approval process.
