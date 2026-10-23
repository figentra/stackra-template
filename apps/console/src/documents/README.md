# src/documents

Documents (ADR 0110, ADR 0294 decision 16): `extends Document({ kind, area, layout, blocks })`
classes whose `blocks` reference registered blocks and widgets by class, validated by gen at build
time. A document here is the app's default for the route that names it (`Route({ document })`); a
tenant's published document of the same key replaces it at run time. The key (`<member>.<stem>`),
the title (`documents::<stem>.title`) and the permission (the read permissions of its widgets) are
derived. Routes with code are `routes/`, never here.

| File                  | Class             | Kind   | Key               | Rendered by                 |
| --------------------- | ----------------- | ------ | ----------------- | --------------------------- |
| `welcome.document.ts` | `WelcomeDocument` | `Page` | `console.welcome` | `WelcomeRoute` (`document`) |

The documents the services and packages declare (the sales overview, my orders, the loyalty
overview) are not here: gen mounts each in the panel that hosts its area.
