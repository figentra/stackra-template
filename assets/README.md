<!--
Stackra file contract:
Purpose: the root assets tree Runway and the brand kit read, by surface.
Boundary: sources only; generated outputs of the brand kit and Runway are never committed.
Runtime: none (read by Runway and the brand kit in CI)
Governing contract: Stackra ADR 0441 decision 1 (draft text until stackra-01 lands); owner decision D16 of 2026-10-26
-->

# assets

The product's assets: what Runway and the brand kit read, by surface. Runway finds this tree at `assets/` unless the
root `runway.yaml` names another root in `assets.root`; every `surfaces.*.content`, `mobile.*.assets` and
`mobile.*.store` path must sit under it (Stackra ADR 0441).

| Folder                  | Holds                                                                   | Read by                              |
| ----------------------- | ----------------------------------------------------------------------- | ------------------------------------ |
| `brand/`                | marks, the kit configuration, decisions, version history (sources only) | the brand kit in CI                  |
| `mobile/<app>/`         | icon, adaptive icon, splash and notification icon sources               | Runway's mobile build                |
| `store/<app>/<locale>/` | listing text, keywords, screenshots frames' captions, privacy answers   | Runway's store submission            |
| `landing/`              | seed experience documents and their images                              | Runway's one-time landing import     |
| `lang/`                 | permission prompts and store strings in every locale                    | Runway's mobile build and submission |

Generated outputs (tokens, icons at every size, splash screens, favicons, the web manifest, framed screenshots) are
build artefacts and are never committed.
