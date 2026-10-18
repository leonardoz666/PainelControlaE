# Graph Report - PainelControlaE  (2026-10-18)

## Corpus Check
- 26 files · ~11,730 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .example 1, (none) 1, .css 1)

## Summary
- 206 nodes · 306 edges · 16 communities (12 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `26ec85d6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- app/page.tsx
- compilerOptions
- Design System: ControlaÊ — Painel CEO
- BrandingEditor.tsx
- AuditHistory.tsx
- route.ts
- dependencies
- app/page.tsx
- next.config.js
- vercel.json
- Product
- devDependencies
- Painel CEO

## God Nodes (most connected - your core abstractions)
1. `api()` - 23 edges
2. `DashboardPage()` - 21 edges
3. `compilerOptions` - 16 edges
4. `Product` - 11 edges
5. `EstablishmentSettingsPage()` - 9 edges
6. `lucide-react` - 9 edges
7. `react` - 9 edges
8. `Design System: ControlaÊ — Painel CEO` - 9 edges
9. `Components` - 8 edges
10. `BrandingEditor()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `DashboardPage()` --calls--> `Field()`  [EXTRACTED]
  app/page.tsx → app/components/dashboard/FormControls.tsx
- `DashboardPage()` --calls--> `FormActions()`  [EXTRACTED]
  app/page.tsx → app/components/dashboard/FormControls.tsx
- `DashboardPage()` --calls--> `StatusSelect()`  [EXTRACTED]
  app/page.tsx → app/components/dashboard/StatusSelect.tsx
- `EstablishmentSettingsPage()` --calls--> `api()`  [EXTRACTED]
  app/estabelecimentos/[id]/configuracoes/page.tsx → app/lib/api.ts
- `logout()` --calls--> `api()`  [EXTRACTED]
  app/estabelecimentos/[id]/configuracoes/page.tsx → app/lib/api.ts

## Import Cycles
- None detected.

## Communities (16 total, 4 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.08
Nodes (21): metadata, viewport, name, overrides, postcss, private, scripts, build (+13 more)

### Community 1 - "app/page.tsx"
Cohesion: 0.11
Nodes (23): ModuleDefinition, ModuleManager(), ModuleManagerProps, logout(), api(), ApiError, establishmentInstallationUrl(), establishmentLoginUrl() (+15 more)

### Community 2 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 3 - "Design System: ControlaÊ — Painel CEO"
Cohesion: 0.08
Nodes (24): Buttons, Cards / Containers, Chips, Client Action Grid, Colors, Components, Design System: ControlaÊ — Painel CEO, Do: (+16 more)

### Community 4 - "BrandingEditor.tsx"
Cohesion: 0.19
Nodes (12): Branding, BrandingEditor(), selectImage(), update(), DEFAULT_COLORS, IMAGE_RULES, ImageAsset(), ImageField (+4 more)

### Community 5 - "AuditHistory.tsx"
Cohesion: 0.22
Nodes (11): ACTION_DEFINITIONS, ACTIONS, AuditActionDefinition, AuditEntry, AuditHistory(), AuditIcon(), AuditResponse, detailText() (+3 more)

### Community 6 - "route.ts"
Cohesion: 0.19
Nodes (14): DELETE, GET, handler(), HOP_BY_HOP, maxDuration, PATCH, POST, PUT (+6 more)

### Community 7 - "dependencies"
Cohesion: 0.33
Nodes (6): dependencies, @fontsource-variable/manrope, lucide-react, next, react, react-dom

### Community 8 - "app/page.tsx"
Cohesion: 0.23
Nodes (15): DeleteEstablishmentDialog(), deletionConfirmation(), Field(), FormActions(), STATUS_OPTIONS, StatusSelect(), Establishment, Status (+7 more)

### Community 13 - "Product"
Cohesion: 0.17
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 14 - "devDependencies"
Cohesion: 0.29
Nodes (7): devDependencies, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom, typescript

### Community 15 - "Painel CEO"
Cohesion: 0.29
Nodes (6): Ativação de um estabelecimento, Configuração, Desenvolvimento, Painel CEO, Primeiro acesso, Remoção de um estabelecimento

## Knowledge Gaps
- **7 isolated node(s):** `react-dom`, `@tailwindcss/postcss`, `@types/node`, `@types/react`, `@types/react-dom` (+2 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 117 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `package.json` to `app/page.tsx`, `app/page.tsx`, `route.ts`?**
  _High betweenness centrality (0.135) - this node is a cross-community bridge._
- **What connects `react-dom`, `@tailwindcss/postcss`, `@types/node` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Why does `api()` connect `app/page.tsx` to `app/page.tsx`, `BrandingEditor.tsx`, `AuditHistory.tsx`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Should `app/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1053763440860215 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `app/page.tsx` to `package.json`, `app/page.tsx`, `BrandingEditor.tsx`, `AuditHistory.tsx`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._