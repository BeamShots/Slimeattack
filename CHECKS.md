# Growing Worlds v6.0 verification

287 automated checks passed:

| Area | Checks |
| --- | ---: |
| Number notation, including magnitudes beyond native numbers | 10 |
| Hex tree, connected purchases, expanding paths, tasks and migration | 22 |
| Extreme combat scaling and saved health ratios | 7 |
| Core engine | 36 |
| Enemy and realm expansion | 24 |
| Active combat | 29 |
| Village games and restoration | 20 |
| Merge forge, research and guild orders | 14 |
| Offline simulation, rewards, retries and collection | 22 |
| Seeded early, late and active-input progression | 9 |
| Simulated UI, Auto and skill-tree gestures | 92 |
| Service-worker cache emulation | 1 |
| Web Audio synthesis/mute | 1 |

Coverage includes synthetic migration of a v5 wave-6009 save with maxed legacy power, existing money and stardust; 600 starting tree points; prerequisite and affordability checks; three-rank forks; keystones; growing the atlas beyond its initial frontier; point overspend/orphan recovery; saved camera state; immediate live health ranks and single application of blocked-wave health upgrades; repeatable goal rewards; ongoing upgrades and evolutions.

Extreme-value checks simulate wave 50000, where the displayed damage and enemy health exceed 308 decimal places. They verify finite simulation values, JSON save/load, preserved health-bar ratios, stable scaling during temporary powers and correct displayed critical hits. The formatter also directly handles the requested 1.01e482-style magnitude without exponent text and checks 1000 distinct suffix tiers.

The UI harness checks all five bottom destinations, the 180-node atlas, real unlock buttons, locked-path explanations, drag panning, pinch zoom, cancellation, zoom buttons, Center/Next path recovery, camera preservation, goal claims and Auto continuing while browsing Skills. The open tree updates earned points without resetting its camera, and Shop goals become claimable live. Existing Auto, all-orb collection, final-wave drops, saved preference, complete reload, quiet background defeat, offline retry, menus and minigames remain covered. The village suite generates 500 solvable puzzles; the forge suite executes 10000 randomized actions.

The service-worker emulator serves every one of its 25 cached URLs with network disabled. JavaScript syntax, local asset references, archive integrity, extracted file bytes and the flat ZIP layout were checked. The shipped CSS contains no border-image frame styling.

## Limits

UI tests use happy-dom and native canvas; they do not render browser CSS or verify real mobile layout, touch ergonomics, audio permissions, PWA installation or phone performance. Native canvas checks use the shipped combat artwork. Earlier Chromium launches in this environment failed because socket access was denied; no real browser launch was claimed for this release. No Android or iOS device was used.

Recommended device smoke test: verify v6, continue your save, open Skills, pan/pinch/unlock a branch, visit a mini-game with Auto on, claim a goal, leave/return for offline results, retry a defeat, and reopen offline. Keep an exported backup.
