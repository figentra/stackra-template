# src/documents

L2 **documents** (ADR 0110): `@Document` classes whose `blocks` reference registered blocks and
widgets by class, validated by gen at build time. The kind was `pages/` (`definePage`) and is
renamed `documents/` so that "page" means a page-level component under `components/pages/`. A
document here is the app's default for a route that names it (`@Route({ document })`); a tenant's
published document of the same key replaces it at runtime through `Experience.queries.GetDocument`.
Keys are declared short and snake; gen prefixes the member on the wire. Routes with code are
`routes/`, never here.

| File                        | Key                    | Rendered by                       | Replaced by                                     |
| --------------------------- | ---------------------- | --------------------------------- | ----------------------------------------------- |
| `announcements.document.ts` | `mobile.announcements` | `AnnouncementsRoute` (`document`) | the tenant's published document of the same key |
