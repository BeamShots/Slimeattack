# Slime Heroes v8.0 verification

361 automated checks passed:

| Area | Checks |
| --- | ---: |
| Number notation | 10 |
| Equipment, victory escrow, stats, recycling and migration | 23 |
| Existing skill paths, tasks and migration | 22 |
| New talent lessons, hero upgrades, cosmetics, health previews and migration | 20 |
| Extreme combat scaling | 7 |
| Core engine | 36 |
| Enemy and realm expansion | 24 |
| Active combat | 29 |
| Village games | 20 |
| Rune forge and research | 14 |
| Offline progression and accounting | 22 |
| Seeded progression/serialization simulations | 9 |
| UI interactions and native combat raster tests | 123 |
| Service-worker cache emulation | 1 |
| Sound synthesis/mute | 1 |

## New coverage

- The default Talents page has nine fixed cards; individual effects, costs, disabled states and affordability refresh are checked through the actual controls. Optional map navigation, pan/pinch, node purchases and saved camera still work.
- Talent purchases use the existing nodes and caches. Keystone bundles preflight every prerequisite and total cost, with no partial spending. One hundred continuing purchases in every card category survive normalization. Health changes apply once, with blocked-wave changes deferred until retry.
- The Slime tab has one main upgrade, three cosmetic selectors and no management-menu stack. Purchases charge the displayed cost, update level and HP, skip the capped ward, and preserve the run. Cosmetic choices save and do not alter damage. Retry-health previews match actual manual and offline retry calculations without mutating the stopped run.
- Gear has five surrounding slots, an icon-and-level bag, contextual filters and one popup action. Equipping, upgrading, changing a slot, favorites, protected recycling, bulk-recycle cancellation, sort order and live drops are checked through UI events.
- Research keeps its Forge tabs before and after purchases. Auto continues across the redesigned screens and normal dialogs. The original v7 Home remains scene-based with four shortcuts and one main Play action.
- All three new shipped hero sprites are drawn through native Canvas with visible companion pixels. Existing long-wormhole, positive-radius, transparency/blend reset, broken-effect fallback, scheduling and zero-size canvas checks still pass.

## Existing coverage retained

Core combat, all card/enemy types, village games, 500 generated star puzzles, 10000 randomized forge actions, number suffixes at extreme magnitudes, Auto/orb collection, offline rollback/retry/accounting, equipment escrow and migrations remain covered. Failed-wave equipment is not collected; won loot banks once. Previously equipped/favorited gear stays protected.

The cache emulator installs and serves all 29 cached release URLs with network disabled. All JavaScript passes syntax checks. Local paths, flat ZIP layout, archive integrity and extracted bytes are checked separately during packaging.

## Verification limits

Interaction tests use happy-dom; battle raster tests use native Canvas and the shipped artwork. These tests do not establish actual browser CSS layout, physical touch ergonomics, mobile audio activation, real service-worker updates/installation or Android/iOS performance. Headless Chromium could not start because local socket creation is denied in this environment. No rendered browser layout or physical-phone playtest was completed.

Recommended phone check: confirm v8 in Settings, continue the same save, use Talents/Gear/Slime, win and equip gear, switch looks, leave Auto running while using menus, retry a stopped wave, then reopen in airplane mode. Keep an exported backup.
