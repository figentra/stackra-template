<!--
Stackra file contract:
Purpose: icon, adaptive icon, splash and notification icon sources per mobile app.
Boundary: sources only; generated outputs of the brand kit and Runway are never committed.
Runtime: none (read by Runway and the brand kit in CI)
Governing contract: Stackra ADR 0441 decision 1 (draft text until stackra-01 lands); owner decision D16 of 2026-10-26
-->

# assets/mobile

One folder per mobile app key of the root runway's `mobile` block (`mobile/<app>/`), named in that
entry's `assets`.

| File                    | Format and size                                       |
| ----------------------- | ----------------------------------------------------- |
| `icon.png`              | 1024 × 1024 PNG, no transparency, no rounded corners  |
| `adaptive-icon/`        | Android foreground and background, 432 × 432 PNG each |
| `splash.png`            | 1284 × 2778 PNG, the mark centred in the safe area    |
| `notification-icon.png` | 96 × 96 PNG, white on transparent                     |
