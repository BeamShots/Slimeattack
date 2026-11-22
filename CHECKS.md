# Eternal Expedition v5.1.0 verification

240 automated checks passed in this build:

| Area | Checks |
| --- | ---: |
| Number abbreviations | 8 |
| Core engine | 36 |
| Realm, enemy and power expansion | 24 |
| Slashes, counters, drops and Soul Burst | 29 |
| Village games and restoration | 20 |
| Moonforge, orders, research and invocations | 14 |
| Offline waves, migration, accounting, retries and Auto collection | 22 |
| Early, late and active-input progression simulations | 9 |
| Simulated UI interactions | 76 |
| Service-worker offline cache | 1 |
| Sound synthesis and mute | 1 |

The village checks include 500 generated solvable star puzzles. The forge checks include 10,000 randomized actions. Progression simulations use multiple seeded runs and save/load checks. Canvas rendering used the actual shipped slime/effect artwork.

Offline tests cover an old wave-155 save, ten years of uncapped passive income, clock rollback, first-defeat stopping, failed-wave reward rollback, blocked visits, upgrades changing retry outcomes, different processing batch sizes producing identical results, serialization in the middle of a simulated wave, manual takeover without duplicate rewards, disabled offline waves, automatic drafts and corrupt trial recovery.

UI checks exercise the new home entries, live crafting without pausing combat, conjuring, merges, healing invocation, fill-board, guild delivery, research, automatic draft choices, manual control, blocked-wave retry, saved manual defeat at wave 155, policy controls, report dismissal, asynchronous return overlay, interrupted catch-up and returning with offline mode disabled. Existing activity, settings, import/export, battle and navigation tests still pass.

The service-worker harness installs all 26 runtime URLs and serves every one with network access disabled. Every shipped JavaScript file passes Node syntax checking. Local asset references and ZIP root layout were checked.

v5.1 adds explicit coverage of Auto fighting on every village page and all three minigames, automatic choices without opening a draft overlay, regular menus versus explicit Pause, quiet background defeat, every orb type, empty-field orb collection, final-wave drops, saved Auto preference, a complete separate application reload, Auto OFF stopping hidden and offline progression, live purchase affordances and K/M/B/T/Qa notation across wallets, costs and damage.

## Limits of this verification

UI automation used happy-dom with a native canvas implementation; it does not measure real CSS layout or reproduce a mobile browser. Chromium was present but its launch failed because the environment denied socket access. No real Android/iOS device, touch ergonomics, PWA installation, browser audio activation, real service-worker upgrade lifecycle or phone performance was verified. The cache test is a service-worker emulation, not an actual installed browser session.

Recommended phone smoke test after upload: verify the v5 header, continue your saved run, open the forge while the pilot fights, merge and deliver a rune, leave and return for an expedition report, upgrade/retry a blocked wave, then reopen in airplane mode. Keep an exported save backup.
