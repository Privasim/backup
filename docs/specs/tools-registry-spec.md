# Tools Registry (Per-Category Single-File) — Technical Specification

Updated: 2025-08-23T08:02:27+08:00

## 1) Problem Analysis

- **Requirements**
  - **Single root** registry folder with **one subfolder per category**, each containing **exactly one `category.json`** file with all tools for that category.
  - **Offline-first, deterministic**, curated dataset. No runtime network calls to build suggestions.
  - **Integration targets**:
    - Derivation consumer: `src/app/businessidea/tabs/ToolsContent.tsx` via a future `useToolSuggestions()`.
    - Data inputs: `useImplementationPlanContext()` (`src/features/implementation-plan/ImplementationPlanProvider.tsx`) and `useTab()` (`src/app/businessidea/tabs/TabContext.tsx`).
    - Chat actions: `useChatbox()` (`src/components/chatbox/ChatboxProvider.tsx`).
  - **Governance**: schema validation, taxonomy enforcement, minimum tools per live category, integrity hashing, reproducible builds.
  - **Modularity**: separate data, taxonomy, schemas, validator/aggregator scripts, and read-only accessor; avoid monolithic files.
  - **Optional** Supabase mirror, gated by dynamic import, no runtime dependency.

- **Constraints**
  - No secrets; HTTPS-only links; deterministic output.
  - Avoid introducing new dependencies unless justified. Validation/CI tooling may be dev-only.

- **Assumptions**
  - Category-level curation is preferred for review ergonomics and minimum-population checks.
  - Snapshot in `public/data/` is used by a thin accessor (import or fetch), keeping runtime simple and cacheable.

- **Ambiguities to decide**
  - Initial live categories and capability taxonomy.
  - Validation engine: AJV (dev-only) vs. custom TS validation (no deps).
  - Snapshot loading in-app: static import vs. fetch from `public/`.

- **Solution paths**
  - **Path A (recommended)**: Per-category `category.json` + `_meta` (schemas, taxonomy) + scripts (validate/aggregate/hash) → emit versioned snapshot under `public/data/`.
  - **Path B**: Same data model but import JSON directly at runtime (no aggregated snapshot). Simpler, less integrity control.

## 2) Rationale

- One-file-per-category simplifies PRs, enables category-level ownership, and makes minimum-count governance straightforward.
- Separate `_meta` keeps category folders clean and centralizes taxonomy and schemas.
- Prebuilt snapshot enables integrity hashing, deterministic builds, and simpler runtime consumption.
- Mirrors existing optional Supabase patterns from `src/app/businessidea/tabs/financials/persistence.ts` and `visualization/*`.

## 3) Implementation Plan

- **Folder Structure**
  - `src/data/tools-registry/`
    - `<category-slug>/category.json` (exactly one file per category)
    - `_meta/`
      - `README.md` (maintainer workflow)
      - `config.json` (governance: minTools, live/draft defaults, registry version)
      - `taxonomy/`
        - `capabilities.json` (allowed capability slugs + names)
        - `pricing-models.json` (allowed pricing models)
        - `compliance.json` (allowed compliance flags)
      - `schemas/`
        - `category-file.schema.json` (schema for category file)
        - `registry-snapshot.schema.json` (schema for aggregated snapshot)
  - `scripts/tools-registry/`
    - `validate.ts` (schema + governance checks)
    - `aggregate.ts` (concatenate categories, build indexes, stable sort, versioning)
    - `hash.ts` (snapshot integrity hash)
  - `public/data/`
    - `tools.registry.v1.json` (snapshot)
    - `tools.registry.v1.index.json` (optional indexes)
    - `tools.registry.v1.hash` (hash)
  - `src/features/tool-suggestions/registry/`
    - `index.ts` (read-only accessor to snapshot; thin, no heavy logic)

- **Category File Contract**: `src/data/tools-registry/<category>/category.json`
  - `category`
    - `slug`: string (kebab-case; equals folder name)
    - `name`: string (display)
    - `status`: 'live' | 'draft'
    - `minTools`: number (default 3 when `status` = live)
    - `lastUpdatedAt`: ISO date string
  - `tools`: Tool[]
    - `id`: string (kebab-case; globally unique; recommended `vendor-toolname`)
    - `name`: string
    - `vendor`: string
    - `website`: string (HTTPS only)
    - `description`: string (concise, plain text; non-promotional)
    - `pricing`: { `model`: 'free' | 'freemium' | 'subscription' | 'enterprise' | 'usage'; `minMonthlyUSD`?: number; `maxMonthlyUSD`?: number }
    - `capabilities`: string[] (entries must exist in `_meta/taxonomy/capabilities.json`)
    - `compliance`: { `gdpr`?: boolean; `soc2`?: boolean; `hipaa`?: boolean }
    - `metadata`?: { `lastVerifiedAt`?: ISO; `sourceRefs`?: string[] }

- **Snapshot Contract**: `public/data/tools.registry.v1.json`
  - `version`: string (semver for content changes)
  - `schemaVersion`: string (e.g., `category-file@1`, `snapshot@1`)
  - `generatedAt`: ISO string
  - `categories`: Record<slug, { name, status, minTools }>
  - `tools`: Tool[] (flattened)
  - `indexes`:
    - `byCategory`: Record<categorySlug, string[]> (tool ids; stable order by `name`)
    - `byCapability`: Record<capabilitySlug, string[]>
  - `integrity`: { `hash`: string; `counts`: { categories: number; tools: number; capabilities: number } }

- **Governance Rules (validated in `validate.ts`)**
  - **HTTPS-only URLs**; reject non-https or unsafe schemes.
  - **Uniqueness**: global `tool.id` uniqueness; `tool.name` uniqueness within category.
  - **Slug integrity**: folder name equals `category.slug`; capability slugs must exist in taxonomy.
  - **Pricing model**: must be from allowed list; numeric USD ranges only.
  - **Compliance flags**: only from taxonomy.
  - **Minimums**: `status=live` must have ≥ `minTools` tools; drafts may be below threshold (warn).
  - **Plain text descriptions**: no HTML markup.

- **Build / CI Pipeline**
  - **Local/CI stages**: `validate` → `aggregate` → `hash` → (optionally) `diff-report`.
  - **Determinism**: stable sort (by `tool.name`), normalized JSON formatting, reproducible hash.
  - **Outputs**: emit snapshot + index + hash to `public/data/` and commit to repo.

- **Consumer Access**
  - `src/features/tool-suggestions/registry/index.ts`: thin loader for snapshot; exposes `getRegistry()`, `getByCategory(slug)`, `getByCapability(slug)`.
  - Used by a future `useToolSuggestions()` to derive Top-5 and directory lists for `ToolsContent.tsx`.

- **Performance & Maintainability**
  - Precomputed indexes to avoid runtime scans; small accessor footprint.
  - Minimal fields per record; stable ordering; explicit taxonomy for normalization.
  - Snapshot versioning separates content changes from code deployments.

## 4) Architecture Diagrams (Mermaid)

- **Data Pipeline**
```mermaid
flowchart TD
  A[src/data/tools-registry/<category>/category.json] --> B[validate]
  M[src/data/tools-registry/_meta/{schemas,taxonomy,config}] --> B
  B --> C[aggregate]
  C --> D[public/data/tools.registry.v1.json]
  C --> E[public/data/tools.registry.v1.index.json]
  C --> F[public/data/tools.registry.v1.hash]
  D --> G[registry accessor (read-only)]
  G --> H[useToolSuggestions]
  H --> I[ToolsContent.tsx]
```

- **Data Shape** (class diagram)
```mermaid
classDiagram
  class CategoryFile {
    category.slug: string
    category.name: string
    category.status: 'live'|'draft'
    category.minTools: number
    category.lastUpdatedAt: ISO
    tools: Tool[]
  }
  class Tool {
    id: string
    name: string
    vendor: string
    website: string
    description: string
    pricing.model: 'free'|'freemium'|'subscription'|'enterprise'|'usage'
    pricing.minMonthlyUSD?: number
    pricing.maxMonthlyUSD?: number
    capabilities: string[]
    compliance: { gdpr?: boolean; soc2?: boolean; hipaa?: boolean }
    metadata?: { lastVerifiedAt?: ISO; sourceRefs?: string[] }
  }
  class Snapshot {
    version: string
    schemaVersion: string
    generatedAt: ISO
    categories: Map
    tools: Tool[]
    indexes.byCategory: Map
    indexes.byCapability: Map
    integrity.hash: string
    integrity.counts: object
  }
  CategoryFile --> Tool
  Snapshot --> Tool
```

## 5) Testing Plan

- **Unit (scripts)**
  - **Validation**: rejects non-HTTPS URLs, unknown capability slugs, invalid pricing/compliance; enforces uniqueness and minTools.
  - **Aggregation**: stable ordering, correct counts, correct indexes; ignores drafts for minTools checks (warn only).
  - **Hashing**: unchanged inputs → identical hash; changed inputs → new hash.

- **Integration**
  - Accessor loads snapshot and indexes; verify shape and deterministic content; ensure downstream hook can enumerate categories and tools quickly.

- **Edge Cases**
  - Empty draft category → allowed with warning.
  - Duplicate `tool.id` across categories → hard fail.
  - New capability without taxonomy entry → hard fail.

- **Acceptance Criteria**
  - All category files pass validation.
  - Snapshot + hash are deterministic and committed.
  - At least one `status=live` category has ≥3 tools before enabling the Category directory UI.

## 6) Security & Compliance

- **No secrets** in data files; plain text only.
- **HTTPS-only links**; sanitize links at render (`rel="noopener noreferrer"`).
- **No runtime network calls** for suggestion derivation.
- **Optional Supabase mirror** follows dynamic import gating; never a runtime dependency for the registry.

## 7) Final Checklist

1. Approve initial category slugs and capability taxonomy.
2. Decide validation engine (AJV dev-only vs TS validator) and snapshot load strategy (import vs fetch).
3. Create `src/data/tools-registry/` structure and `_meta` content.
4. Add initial curated category files (≥3 tools for at least one live category).
5. Implement `scripts/tools-registry/{validate,aggregate,hash}` and wire CI (validate → aggregate → hash).
6. Emit and commit `public/data/tools.registry.v1.*` artifacts.
7. Implement registry accessor and connect to `useToolSuggestions()` when ready.

## 8) Suggested Enhancements (Optional)

- **Diff report** during aggregation (new/removed/changed tools) to aid reviewers.
- **CLI curation helper** to add tools interactively enforcing taxonomy and validation.
- **Per-category index files** for incremental client loading if dataset grows large.
- **Snapshot changelog** emission for observability.
