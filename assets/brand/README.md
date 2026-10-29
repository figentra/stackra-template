<!--
Stackra file contract:
Purpose: brand sources (marks, kit configuration, decisions, version history).
Boundary: sources only; generated outputs of the brand kit and Runway are never committed.
Runtime: none (read by Runway and the brand kit in CI)
Governing contract: Stackra ADR 0441 decision 1 (draft text until stackra-01 lands); owner decision D16 of 2026-10-26
-->

# assets/brand

Brand sources only (Stackra ADR 0441 decision 4): the marks (`logo.svg`, `logo-mono.svg`,
`mark.svg`), the kit configuration (concept, logo rules, asset manifest), decisions, the Arabic
review and the version history. Exploration moves to `versions/` once a direction is picked and is
never deleted. The brand kit generates everything else in CI; do not commit its outputs. Fonts are
not kept here: keep only licence notes for fonts the product already uses.
