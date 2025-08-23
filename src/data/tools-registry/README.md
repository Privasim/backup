# Tools Registry — Authoring and Governance

## Purpose

This registry stores curated, deterministic tool data for the app’s suggestion system. No mock data.

## Folder layout

- `src/data/tools-registry/_meta/` — taxonomy, schemas (Zod), and config.
- `src/data/tools-registry/<category>/tools.json` — one file per category (array of tools).

## Authoring rules

- Use HTTPS links; verify descriptions are neutral and factual.
- Keep `category` field equal to the folder slug.
- Capabilities must be present in `_meta/taxonomy/capabilities.json`.
- No placeholders or mock entries.
- Sort entries by `name` ascending.

## Workflow

1. Update or add tools in the correct category `tools.json`.
2. If needed, update taxonomy in `_meta/taxonomy/` (capabilities, compliance, pricing models) via PR.
3. Run validation: `npm run tools:validate`.
4. Build snapshot: `npm run tools:build`.
5. Commit changes and snapshot artifacts; open PR.

## Acceptance checks

- `tools:validate` passes with no warnings.
- Live categories meet minimum tool count.
- Snapshot hash is updated only when data changes.

## No mock data policy

All entries must be real tools with verified fields. PRs containing dummy or placeholder entries will be rejected.
