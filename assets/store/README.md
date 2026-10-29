<!--
Stackra file contract:
Purpose: store listing text, privacy answers and app-level store facts (store.yaml) per mobile app.
Boundary: sources only; generated outputs of the brand kit and Runway are never committed.
Runtime: none (read by Runway and the brand kit in CI)
Governing contract: Stackra ADR 0441 decision 1 (draft text until stackra-01 lands); owner decision D16 of 2026-10-26; ADR 0480 (store.yaml)
-->

# assets/store

One folder per mobile app key (`store/<app>/`), named in the app entry's `store` in the root
`runway.yaml`; the entry's `identity` and `capabilities` are the app's bundle id, package, names and
App Store Connect capabilities.

`store.yaml` sits in the app folder and holds the app-level facts: `ascAppId` (the App Store Connect
app id, once the app record exists), `urls` (`privacyPolicy` and `support` required, `marketing`),
`review` (the contact, the notes, the `demoAccount`, an optional `seed` that resets the demo data
and the `probe` that proves the account works), `usesNonExemptEncryption`, `appGroups` and
`testflight.groups`. Every credential in it is a secret NAME (`emailSecret`, `phoneSecret`,
`usernameSecret`, `passwordSecret`, `tokenSecret`, in SCREAMING_SNAKE) read from Infisical at
release time, never a value.

One sub-folder per locale (`store/<app>/<locale>/`, `en`, `ar`, …) holds `name.txt` (30 characters),
`subtitle.txt` (30), `description.md` (4000), `keywords.txt` (100, comma-separated), `privacy.yaml`
(the data the app collects as `collects:` rows, with an optional `deletion:`, the same file in every
locale) and, optionally, `shortDescription.txt`, `promotionalText.txt` and `whatsNew.txt`.
Screenshots are captured in CI from the built app and framed by the brand kit; they are not
committed.
