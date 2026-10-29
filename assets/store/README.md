<!--
Stackra file contract:
Purpose: store listing text and privacy answers per mobile app and locale.
Boundary: sources only; generated outputs of the brand kit and Runway are never committed.
Runtime: none (read by Runway and the brand kit in CI)
Governing contract: Stackra ADR 0441 decision 1 (draft text until stackra-01 lands); owner decision D16 of 2026-10-26
-->

# assets/store

One folder per mobile app key, one sub-folder per locale (`store/<app>/<locale>/`), named in the app
entry's `store`. Each locale holds `name.txt` (30 characters), `subtitle.txt` (30), `description.md`
(4000), `keywords.txt` (100, comma-separated), `privacy.json` (the store privacy answers) and
`screenshots/` captions. Screenshots themselves are captured in CI from the built app and framed by
the brand kit; they are not committed.
