# src/documents

Documents (ADR 0110, ADR 0294 decision 16): `extends Document({ kind, layout, blocks })` classes
whose `blocks` reference registered blocks and widgets by class, validated by gen at build time. A
document here is the app's default for the route that names it (`Route({ document })`); a tenant's
published document of the same key replaces it at run time through `GetDocumentQuery`. The key
(`<member>.<stem>`) and the title (`documents::<stem>.title`, in the `documents` lang namespace with
the strings its blocks reference) are derived; the area and the targets are the app's. Routes with
code are `routes/`, never here.

| File                        | Class                   | Kind   | Key                    | Rendered by                       |
| --------------------------- | ----------------------- | ------ | ---------------------- | --------------------------------- |
| `announcements.document.ts` | `AnnouncementsDocument` | `Page` | `mobile.announcements` | `AnnouncementsRoute` (`document`) |
