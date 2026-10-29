<!--
Stackra file contract:
Purpose: permission prompts and store strings per locale.
Boundary: sources only; generated outputs of the brand kit and Runway are never committed.
Runtime: none (read by Runway and the brand kit in CI)
Governing contract: Stackra ADR 0441 decision 1 (draft text until stackra-01 lands); owner decision D16 of 2026-10-26
-->

# assets/lang

Permission prompts and store strings, one file per locale (`<locale>.json`), keyed by the permission
or store field. Runway writes the prompts into the app config of each build and the store strings
into each submission.
