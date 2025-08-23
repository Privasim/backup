# Tools Registry: Architecture, README, and CLI Technical Spec

Last updated: 2025-08-23 08:30 (+08:00)
Status: Draft for approval
Owners: Engineering

---

1) Problem Analysis
- Requirements
  - Centralize a deterministic, offline-first Tools database under `src/data/tools-registry/`.
  - Exactly one folder per category and exactly one file per category (e.g., `src/data/tools-registry/<category>/tools.json`).
  - Provide a root README to document authoring, validation, and build workflows.
  - Strict validation using existing dependencies only — use `zod` (already in package.json). No new dependencies.
  - Provide a minimal CLI (Node + Zod + built-ins) for validation, aggregation, and authoring assistance.
  - Produce a stable, versioned snapshot for fast runtime access (optional), without network calls.
  - Hard rule: No mock data anywhere in the registry or commits.

- Assumptions
  - The UI suggestions feature will later consume this registry via a read-only accessor and deterministic rules.
  - CI runs Node scripts and Jest (already configured) and can write build artifacts to `public/data/`.
  - Team maintains taxonomy centrally in `_meta/taxonomy/` and enforces slugs across categories.

- Ambiguities (to decide)
  - Initial “live” category slugs (proposal below) and minimum tool count per live category (default 3).
  - Whether to emit a public snapshot for runtime (`public/data/tools.snapshot.v1.json`) or import category files directly at build. Recommendation: emit snapshot for integrity and caching.

- Solution paths
  - Path A (recommended): JSON data + Zod runtime validation + Node CLI scripts (no extra deps), emit snapshot and indexes.
  - Path B: JSON + TypeScript type-only checking, no runtime validation (faster to set up, weaker guarantees).

---

2) Rationale
- JSON files per category keep data modular and reviewable.
- Zod is already in the repo; using it avoids new dependencies while enabling robust, immediate feedback during authoring and CI.
- A prebuilt snapshot ensures deterministic, stable consumption by the app and allows integrity hashing and size control.
- Optional Supabase mirroring can be added later using existing dynamic-import patterns without coupling runtime.

---

3) Implementation Plan

Directory structure
- `src/data/tools-registry/`
  - `_meta/`
    - `README.md` — authoring standards, workflows, governance rules.
    - `config.json` — registry-level configuration: version, schemaVersion, minToolsPerLiveCategory, feature flags.
    - `taxonomy/`
      - `capabilities.json` — whitelist of capability slugs and display names.
      - `pricing-models.json` — allowed pricing model slugs.
      - `compliance.json` — allowed compliance flags and descriptions.
    - `schemas/` (TypeScript modules using Zod; used by CLI only)
      - `tool.schema.ts` — schema for a tool record.
      - `registry.schema.ts` — schema for aggregated snapshot.
      - `category.schema.ts` — optional, for category metadata if needed.
  - `<category-slug>/` (one folder per category)
    - `tools.json` — the only file per category containing an array of tool records.
    - `README.md` (optional) — curation notes and constraints for this category.
  - `README.md` — top-level documentation (how to author, validate, build, and release).

Data model (authoring contracts; enforced by Zod)
- Tool record (each entry in `<category>/tools.json`)
  - `id` (string): globally unique kebab-case (`vendor-product`).
  - `name` (string): display name.
  - `vendor` (string): vendor/org name.
  - `category` (string): must equal the folder slug.
  - `website` (string): HTTPS absolute URL only.
  - `description` (string): concise, curated, neutral tone.
  - `pricing` (object): `{ model: 'free'|'freemium'|'subscription'|'enterprise'|'usage', minMonthlyUSD?: number, maxMonthlyUSD?: number }`.
  - `capabilities` (string[]): slugs from `_meta/taxonomy/capabilities.json`.
  - `compliance` (object): `{ gdpr?: boolean, soc2?: boolean, hipaa?: boolean }`.
  - `metadata?` (object): `{ lastVerifiedAt?: ISO string, sourceRefs?: string[] }`.

- Registry snapshot (`public/data/tools.snapshot.v1.json`)
  - `version` (string, semver) — registry data version.
  - `schemaVersion` (string) — schema version for breaking changes.
  - `generatedAt` (ISO string) — build timestamp.
  - `categories` (Record<slug, { name: string; status: 'live'|'draft'; minTools: number }>) — from `_meta/config.json` (and optional category manifests).
  - `tools` (Tool[]) — full tool list.
  - `indexes` ({ byCategory: Record<slug, string[]>; byCapability: Record<slug, string[]> }) — tool IDs for fast lookup.
  - `integrity` ({ hash: string; counts: { tools: number; categories: number; capabilities: number } }).

Governance rules
- One folder per category; one `tools.json` per category; array of tools only.
- No mock data — all entries must be real, verified tools (reject PRs that add placeholders or dummy entries).
- No duplicate `tool.id` globally.
- `category` in each tool must match its folder slug.
- All URLs must be HTTPS and safe (no `javascript:`, `data:`). Avoid tracking params.
- `pricing.model` must be one of the allowed slugs.
- `capabilities` slugs must exist in `_meta/taxonomy/capabilities.json`.
- `compliance` keys must be whitelisted by `_meta/taxonomy/compliance.json`.
- Live categories must meet `minToolsPerLiveCategory` from `_meta/config.json` (default 3).
- Deterministic sorting inside `tools.json` by `name` ASC to keep diffs stable (scoring/ranking happens in app logic, not in data files).

Build & validation pipeline (no new deps)
- Validate step (Node + Zod + fs/path)
  - Load `_meta/taxonomy/*` and all `<category>/tools.json`.
  - Validate every tool with Zod schemas and governance rules.
  - Fail on unknown slugs, invalid URLs, duplicates, unmet minimums for live categories.

- Aggregate step (Node + fs/path/crypto)
  - Construct category map from `_meta/config.json`.
  - Merge tools into stable order (name ASC), build `indexes.byCategory` and `indexes.byCapability`.
  - Compute deterministic JSON and integrity hash (e.g., `sha256`), write outputs under `public/data/`:
    - `tools.snapshot.v1.json`
    - `tools.index.v1.json` (optional)
    - `tools.snapshot.v1.hash`

- Consumption (later, app runtime)
  - Read the snapshot via a thin accessor (`src/features/tool-suggestions/registry/index.ts`) and feed into `useToolSuggestions()`.

Proposed initial categories (pending approval)
- `no-code-apps` — No-code / low-code builders.
- `automation` — Workflow automation and integrations.
- `analytics` — Product and business analytics.
- `ai-assistants` — Assistant and agent tools.

---

4) Architecture Diagram (Mermaid)
```mermaid
flowchart TD
  A[src/data/tools-registry/_meta/taxonomy/*.json] --> B[validate (Node+Zod)]
  A --> C[aggregate (Node)]
  D[src/data/tools-registry/<category>/tools.json] --> B
  D --> C
  E[_meta/schemas/*.ts (Zod)] --> B
  E --> C
  C --> F[public/data/tools.snapshot.v1.json]
  C --> G[public/data/tools.index.v1.json]
  C --> H[public/data/tools.snapshot.v1.hash]
  F --> I[src/features/tool-suggestions/registry/index.ts]
  G --> I
  I --> J[useToolSuggestions()] --> K[ToolsContent.tsx]
```

---

5) Testing Plan
- Unit tests (Jest)
  - Validator rejects: unknown capabilities, non-HTTPS URLs, duplicate IDs, invalid pricing models, unmet live-category minimums.
  - Aggregator outputs deterministic snapshot and indexes; counts and hash match expectations.
- Integration tests
  - Accessor loads snapshot and returns expected structures for `useToolSuggestions()`.
- Edge cases
  - Empty category tools.json (allowed only if category status is `draft`).
  - Tools missing required fields → validation failure.
- Acceptance criteria
  - One folder per category, exactly one `tools.json` each.
  - No mock data anywhere in the dataset.
  - Validation and aggregation pass locally and in CI without adding any dependency.
  - Snapshot integrity is reproducible (same content → same hash).

---

6) Security & Compliance
- No secrets or API keys. Plain JSON only.
- Enforce HTTPS URLs and reject unsafe schemes.
- Optional Supabase mirror (future) must be gated with dynamic import and try/catch; never required at runtime.
- Authoring guidelines forbid HTML or script content; renderers must treat descriptions as plain text.

---

7) Final Checklist
- Approve:
  - Initial live category slugs and min tools per live category (default 3).
  - Snapshot emission to `public/data/` vs. compile-time-only import.
- After approval (implementation phase):
  - Create `_meta` taxonomy and schemas using `zod` (existing dep).
  - Add per-category folders and `tools.json` files with curated, verified entries only (no mock data).
  - Implement `validate` and `aggregate` Node scripts.
  - Add `package.json` scripts (non-invasive) to run validate/build.
  - Commit the first snapshot and verify app accessor reads it.

---

8) Suggested Enhancements (Optional)
- `tools:diff` command to summarize changes between two snapshots (counts, added/removed tools, capability diffs).
- `tools:add-tool` interactive CLI (readline) enforcing taxonomy and field formats when adding new tools.
- Per-category README with curation rules and audit history.

---

Appendix A — Root README (proposed content)

Title: Tools Registry — Authoring and Governance

- Purpose
  - This registry stores curated, deterministic tool data for the app’s suggestion system. No mock data.

- Folder layout
  - `src/data/tools-registry/_meta/` — taxonomy, schemas (Zod), and config.
  - `src/data/tools-registry/<category>/tools.json` — one file per category (array of tools).

- Authoring rules
  - Use HTTPS links; verify descriptions are neutral and factual.
  - Keep `category` field equal to the folder slug.
  - Capabilities must be present in `_meta/taxonomy/capabilities.json`.
  - No placeholders or mock entries.
  - Sort entries by `name` ascending.

- Workflow
  1) Update or add tools in the correct category `tools.json`.
  2) If needed, update taxonomy in `_meta/taxonomy/` (capabilities, compliance, pricing models) via PR.
  3) Run validation: `npm run tools:validate`.
  4) Build snapshot: `npm run tools:build`.
  5) Commit changes and snapshot artifacts; open PR.

- Acceptance checks
  - `tools:validate` passes with no warnings.
  - Live categories meet minimum tool count.
  - Snapshot hash is updated only when data changes.

- No mock data policy
  - All entries must be real tools with verified fields. PRs containing dummy or placeholder entries will be rejected.

---

Appendix B — CLI Design (planned; no new deps)

Commands (to be added to package.json scripts after approval)
- `tools:validate`
  - Description: Validate category files against Zod schemas and governance rules.
  - Implementation: Node script using `fs`, `path`, and Zod. Exits non-zero on any violation.
  - Output: Detailed errors per file; summary of totals; strict mode by default.

- `tools:build`
  - Description: Aggregate category data into a single deterministic snapshot with indexes and integrity hash.
  - Implementation: Node script using `fs`, `path`, `crypto`.
  - Output: Writes `public/data/tools.snapshot.v1.json`, `public/data/tools.index.v1.json` (optional), and `public/data/tools.snapshot.v1.hash`.

- `tools:add-tool` (optional, interactive)
  - Description: Guides the user through adding a new tool to a category in a compliant format.
  - Implementation: Node `readline` + Zod; writes into `<category>/tools.json` in sorted order.
  - Output: Updated file plus a validation run.

- `tools:diff` (optional)
  - Description: Compare current snapshot vs previous; output a concise change log.
  - Implementation: Node only; no extra deps.

Flags (common)
- `--categories=<slug,slug>` — limit operations to specific categories.
- `--strict` (default true) — fail on any warning.
- `--outDir=public/data` — override artifact output path.
- `--no-indexes` — skip index files.

Exit codes
- `0` success; `1` validation error(s); `2` I/O or unexpected failures.

---

Appendix C — Taxonomy and Config (proposed)

- `_meta/config.json`
  - `version` (semver)
  - `schemaVersion` (string)
  - `minToolsPerLiveCategory` (number; default 3)
  - `categories` (Record<slug, { name: string; status: 'live'|'draft'; minTools?: number }>)

- `_meta/taxonomy/capabilities.json`
  - `{ capabilities: [{ slug: string, name: string }] }` (slug is kebab-case, unique)

- `_meta/taxonomy/pricing-models.json`
  - `{ models: ['free', 'freemium', 'subscription', 'enterprise', 'usage'] }`

- `_meta/taxonomy/compliance.json`
  - `{ flags: [{ key: 'gdpr'|'soc2'|'hipaa', name: string, description?: string }] }`

---

Notes
- Uses only existing dependencies (`zod`) and Node built-ins.
- Aligns with the broader plan to keep suggestions deterministic, offline-first, and tab/plan-aware at the rule layer.
- No mock data is allowed at any stage.
