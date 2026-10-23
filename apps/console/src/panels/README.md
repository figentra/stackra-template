# src/panels

The panels this app hosts (ADR 0164, ADR 0294 decision 14): `extends Panel({ path, area })`, a
declaration only. A panel hosts one API area (ADR 0082), so gen places in it every consumed
resource, widget, document and settings page whose area it hosts; packages and services name an area
and never a panel. The key is derived from the file (`tenant_admin`), and gen collects every panel
into `#stackra/panels` and the route tree. The server scopes every query to the area's realm, so a
panel grants nothing by itself.

| File                       | Class                 | Path      | Area            | Hosts                                                                    |
| -------------------------- | --------------------- | --------- | --------------- | ------------------------------------------------------------------------ |
| `tenant-admin.panel.ts`    | `TenantAdminPanel`    | `/`       | `ApiArea.Admin` | staff screens: products, orders, loyalty accounts, audit trail, settings |
| `customer-portal.panel.ts` | `CustomerPortalPanel` | `/portal` | `ApiArea.App`   | customer pages: my orders, the loyalty overview                          |

The tenant-admin panel renders inside `ShellLayout` (`routes/shell/`), whose sidebar is the
generated navigation; the customer portal renders the panel package's own shell.
