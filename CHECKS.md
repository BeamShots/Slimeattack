# Loot Legends v7.0 verification

325 automated checks passed:

| Area | Checks |
| --- | ---: |
| Number notation | 10 |
| Equipment, victory escrow, stats, recycling and migration | 23 |
| Skill tree, tasks and migration | 22 |
| Extreme combat scaling | 7 |
| Core engine | 36 |
| Enemy and realm expansion | 24 |
| Active combat | 29 |
| Village games | 20 |
| Rune forge and research | 14 |
| Offline progression and accounting | 22 |
| Seeded progression/serialization simulations | 9 |
| UI, native rendering and input simulation | 107 |
| Service-worker cache emulation | 1 |
| Sound synthesis/mute | 1 |

## Specific regression coverage

- Upgraded wormholes with remaining durations above three seconds, through 100 seconds, in every effects mode. The native renderer is also guarded against negative ellipse radii to enforce the browser Canvas contract.
- Visible companion pixels during long wormholes; transparency/composite reset; deliberately broken-effect fallback; continuing animation scheduling; zero-client-size recovery using arena bounds; death images and direct-hit slash feedback.
- Pending equipment cannot be banked during a fight. Manual failure discards it. Offline failure awards none, including drops already pending before departure. A won offline wave banks exactly once across reloads. Partial offline takeover keeps pending loot until a later victory.
- Deterministic generation covers five slots, six rarities, three sets, first-drop protection and dry-streak protection. Equipped stats change real damage, health, armor mitigation, income and set bonuses. Equip/unequip cannot farm healing. Blocked-wave equipment health changes apply once on retry, including after reload.
- Favorites and equipped items are protected; only inferior same-set Common duplicates can auto-recycle; upgrades charge essence once; malformed imported magnitudes are sanitized. Inventory ids, upgrades, favorites, equipped slots, currencies and pending-wave state survive save/load.
- Inventory controls, strongest-piece equip, item detail actions, filtering, sorting, recycling settings, live arrival of new gear during Auto, home chest collection and task shortcuts.
- Home has one visible scene action plus four shortcut buttons; the old dashboard container is hidden, the large heading is removed and the bottom destinations are Home/Fight/Skills/Gear/Shop.

Existing skill-tree pan/pinch/unlock/camera checks, Auto through all activities, all-orb/final-kill collection, offline reward rollback and retries, 500 generated star puzzles and 10000 randomized forge actions still pass.

The cache emulator installs and serves all 27 cached URLs with network disabled. JavaScript syntax, local asset paths, flat ZIP layout, archive integrity and extracted bytes were checked.

## What was not verified

UI interaction tests use happy-dom. Combat raster tests use native canvas and the shipped artwork. They do not reproduce browser CSS layout, physical touch ergonomics, mobile audio activation, a real service-worker lifecycle, PWA installation or Android/iOS performance.

An actual Chromium preview was attempted through the available desktop UI. The browser's organization policy blocked the local file URL, so no rendered browser layout verification was completed and the restriction was not bypassed. No real phone was used. Automated counts do not establish that every phone-specific issue is fixed.

Suggested phone smoke test: check v7 in Settings; continue your current run; inspect long-wormhole combat; win a pending gear chest; equip/upgrade a piece; leave and return for offline gear and income; try an offline defeat/retry; reopen in airplane mode. Keep an exported save backup.
