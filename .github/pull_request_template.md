## Summary

<!-- What changed and why, in a few lines. Link the issue it closes or advances. -->

Change risk:
<!-- R0 | R1 | R2 | R3, the highest that applies (CONTRIBUTING.md, "Change risk"); R3 needs a code owner's review -->

## Verification

- [ ] `pnpm verify` green (while the Stackra packages are unpublished, the CI gate runs
      `node .github/scripts/preview-gate.mjs`; run it locally instead)
- [ ] The member's committed `stackra.manifest.json` and `openapi.json` regenerated with `pnpm gen`
      when a declaration changed (a changed identity carries `@Renamed`)
- [ ] A changeset (`pnpm changeset`) when a published package changes
- [ ] Docs updated: the member README, a guide or an ADR when behaviour or a decision changed
- [ ] Breaking change: none, or described above with the migration consumers need
