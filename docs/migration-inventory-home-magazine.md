# WKND AEM → EDS (Universal Editor) Migration Inventory — Home & Magazine

**Scope:** Home page and Magazine section (article listing + article detail page) only.
Deferred for a later pass: Adventures section, Search, any other templates/pages not listed below.
Shared infrastructure (Header, Footer, Byline) is in scope regardless, since every page in this scope depends on it.

**Source:** Local AEM codebase at `/Users/aditiagarwal/aem/WKND/aem-guides-wknd` (Maven multi-module: `ui.apps`, `ui.content`, `ui.content.sample`, `ui.apps.structure`, `core`).

**Destination:**
- AEM author environment (Universal Editor content target): `https://author-p189356-e1976989.adobeaemcloud.com`, under `/content/wknd-site`
- EDS repository: `/Users/aditiagarwal/EDS/wknd/wknd-site` (already pushed to GitHub)

---

## 1. Templates

| Template | Structure summary | Pages using it | Notes |
|---|---|---|---|
| **Landing Page Template** (`/conf/wknd/settings/wcm/templates/landing-page-template`) | `empty-page` type; Header XF (master) + editable container + Footer XF (master) | Home page, Magazine listing page | Allowed components per policy: teaser, carousel, image, text, list, breadcrumb, title, separator, button, experiencefragment, embed, container, accordion, tabs, contentfragment |
| **Article Page Template** (`/conf/wknd/settings/wcm/templates/article-page-template`) | `empty-page` type; Header XF + main container (image/breadcrumb/nested containers) + Footer XF | Article detail pages (e.g. `western-australia`) | Allowed components: title, text, list, image, teaser, button, breadcrumb, contentfragment |
| **Experience Fragment Web Variation Template** | `empty-experience-fragment` type; editable container, responsive grid | Header/Footer/Byline XFs | Per-instance component allow-list |

## 2. Page Structures

- **Home** (`/content/wknd/us/en`) — `landing-page-template`, root container with editable child container.
- **Magazine listing** (`/content/wknd/us/en/magazine`) — `landing-page-template`; title → teaser (featured) → title → image-list (auto-lists child article pages) → title → text (membership callout) → separator → teaser(s).
- **Article detail** (`/content/wknd/us/en/magazine/western-australia`) — `article-page-template`; hero image → content container (title, byline heading, contentfragment body, byline XF card) → sidebar container (share heading, sharing, separator, download, related-articles list) → breadcrumb.

## 3. Core Components in Use (Core Component proxies, no custom logic)

| Component | Resource type | Dialog fields | Where used | Suggested UE component model / EDS block |
|---|---|---|---|---|
| page | `wknd/components/page` → `core/wcm/components/page/v3/page` | — | all pages | N/A (page wrapper) |
| container | `wknd/components/container` → `core/wcm/components/container/v1/container` | layout/style | all pages | layout section |
| title | `wknd/components/title` → `core/wcm/components/title/v3/title` | text, heading level | Home, Magazine, Article | text field (heading) → `heading`/section title |
| text | `wknd/components/text` → `core/wcm/components/text/v2/text` | richtext | Magazine (callout) | richtext field → `text` block |
| image | `wknd/components/image` → `core/wcm/components/image/v3/image` | asset, alt text | Article (hero) | reference (asset) + text (alt) → `image` block |
| teaser | `wknd/components/teaser` → `core/wcm/components/teaser/v2/teaser` | image, title, description, CTA(s) | Home, Magazine | image + text + text + multifield(link+label) → `cards`/`teaser` block |
| breadcrumb | `wknd/components/breadcrumb` → `core/wcm/components/breadcrumb/v3/breadcrumb` | none (auto) | Article | layout-only → nav/breadcrumb block, derived from page path |
| separator | `wknd/components/separator` → `core/wcm/components/separator/v1/separator` | none | Magazine, Article | layout-only → `hr`/divider block |
| sharing | `wknd/components/sharing` → `core/wcm/components/sharing/v1/sharing` | social network list | Article | config field (list of enabled networks) → `share` block, client-side share links |
| download | `wknd/components/download` → `core/wcm/components/download/v2/download` | asset reference | Article | reference (asset) → `download`/link block |
| list | `wknd/components/list` → `core/wcm/components/list/v3/list` | source (static/children/tags), CTA | Article (related articles) | see Migration Decision #1 (same underlying pattern as image-list) |
| experiencefragment | `wknd/components/experiencefragment` → `core/wcm/components/experiencefragment/v2/experiencefragment` | XF path | Header, Footer, Byline card | see Migration Decision #2 |
| contentfragment | `wknd/components/contentfragment` → `core/wcm/components/contentfragment/v1/contentfragment` | CF path, element names, variation | Article (body) | reference (CF) + rendered elements → UE component model mirroring the CF's fields (see §5) |

## 4. Custom Project Components

| Component | Resource type | Dialog fields | Backing logic | Suggested UE component model / EDS block | Open question? |
|---|---|---|---|---|---|
| **image-list** | `wknd/components/image-list` → `core/wcm/components/list/v3/list` | listFrom (children/descendants/tags/custom), orderBy, sortOrder, childDepth, tagsMatch | **ImageListImpl** (`core/.../models/impl/ImageListImpl.java`) — uses `QueryBuilder` server-side to enumerate child pages and build `ListItem`s (title, description, URL, image) | Resolved — see Migration Decision #1 | Resolved |
| **byline** | `wknd/components/byline` → `core/wcm/components/image/v3/image` | `name` (text, required), `occupations` (multifield of text) + inherited Core Image asset tab | **BylineImpl** (`core/.../models/impl/BylineImpl.java`) — alphabetically sorts `occupations`; validates name/occupations/image present | text (name) + multifield of text (occupations) + reference (image); sort-by-alphabetical moves to block-side JS (trivial, no ambiguity) | Resolved (folded into #2) |

## 5. Content Fragment Model

- Referenced fragment: `/content/dam/wknd-shared/en/magazine/western-australia/western-australia-by-camper-van`, included via `contentfragment` component with `displayMode="singleText"`, `elementNames="main"`, `variationName="master"`.
- The CFM model definition itself lives in the DAM config on the AEM instance, not in this codebase (no `/conf/wknd/settings/dam/cfm/models/` found in `ui.content`/`ui.content.sample`). It resolves cleanly to a single `main` richtext element — no nested/fragment-to-fragment references observed, so no ambiguity here.
- **Action before implementation:** pull the actual CFM model schema from the live AEM instance (`get-aem-fragment-model` or equivalent) to confirm field list before building the UE component model — the "main" element is the only one referenced by this component instance, but the model may define more fields.

## 6. Experience Fragments

| XF | Path | Used on |
|---|---|---|
| Header (master) | `/content/experience-fragments/wknd/language-masters/en/site/header/master` | all pages in scope |
| Footer (master) | `/content/experience-fragments/wknd/language-masters/en/site/footer/master` | all pages in scope |
| Byline (Sofia Sjöberg) | `/content/experience-fragments/wknd/language-masters/en/contributors/sofia-sjoeberg/byline` | Article detail |

Resolution — see Migration Decision #2.

---

## Migration Decisions

1. **Auto-listing logic (image-list / related-articles list)**
   - **Trigger:** `ImageListImpl` and the `list` component's Core Component logic query child pages server-side via `QueryBuilder` (filter by children/descendants/tags, with sort order) — EDS has no server-side QueryBuilder equivalent.
   - **Options considered:** (a) client-side fetch against `query-index.json` (Sheet-backed, auto-generated from page metadata), filtered/sorted in block JS; (b) author the list manually as a multifield in the UE component model, with no auto-query.
   - **Decision:** (a) — client-side `query-index.json` fetch. Preserves the existing auto-listing editorial behavior (new articles appear without manual list maintenance) rather than trading it for manual curation.
   - **Applies to:** Magazine listing page's image-list block, and the Article detail page's "related articles" list block.

2. **Experience Fragments (Header, Footer, Byline)**
   - **Trigger:** These are currently AEM XFs, shared/included across multiple pages — EDS/UE has no native XF mechanism.
   - **Options considered:** (a) standard EDS shared block/fragment pattern — Header/Footer become site-wide `block.js` includes (not page content), Byline becomes a reusable UE component referenced per-article; (b) duplicate content into each page.
   - **Decision:** (a) — shared EDS block/fragment pattern. Avoids content duplication and keeps a single source of truth for header/footer/byline, matching standard EDS practice.

3. **Byline occupation sorting**
   - **Trigger:** `BylineImpl` alphabetically sorts the `occupations` multifield server-side.
   - **Decision:** Not treated as an open question — trivial to replicate as a client-side sort in the byline block's JS at render time. Folded into Decision #2's Byline resolution.

---

## Report location note

This report was saved to the EDS repo per user preference: `/Users/aditiagarwal/EDS/wknd/wknd-site/docs/migration-inventory-home-magazine.md`.
It does not include `component-definition.json`/`component-models.json`/block code — that is scoped to a follow-up implementation pass.
