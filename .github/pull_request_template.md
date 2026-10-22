## Summary

<!-- What changed and why, in a few lines. Link the issue it closes or advances. -->

Change risk: <!-- R0 | R1 | R2 | R3 (R3: CI, permissions, auth, tenancy or secrets; needs an owner review) -->

## Verification

- [ ] `pnpm verify` green
- [ ] Committed `.stackra/app-manifest.json` (and a service's `openapi.json`) regenerated with `pnpm gen` when a
      declaration changed
- [ ] A changeset (`pnpm changeset`) when a published package changes
