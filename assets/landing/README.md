<!--
Stackra file contract:
Purpose: seed experience documents and images for the landing site.
Boundary: sources only; generated outputs of the brand kit and Runway are never committed.
Runtime: none (read by Runway and the brand kit in CI)
Governing contract: Stackra ADR 0441 decision 1 (draft text until stackra-01 lands); owner decision D16 of 2026-10-26
-->

# assets/landing

Seed experience documents (`<page>.json`) and their images for the product's landing site. Runway imports them once
into the experience service for the product's platform tenant; after that marketing edits them in the builder and this
folder no longer owns them. A seed may name only blocks registered in the landing block set (Stackra ADR 0440).
