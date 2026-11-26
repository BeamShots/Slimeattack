# Battle Focus v8.1 verification

389 automated checks passed:

| Area | Checks |
| --- | ---: |
| Number notation | 10 |
| Equipment, victory escrow, stats, recycling, named-set progress and migration | 30 |
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
| UI interactions and native combat raster tests | 144 |
| Service-worker cache emulation | 1 |
| Sound synthesis/mute | 1 |

## v8.1 coverage

- Compact combat control structure, Home/save/continue, battle menu/build/realm access, Forge and guild-order access, Auto/Pause/Resume, clamped health/wave tracks, and Burst charge.
- A 390 × 680 native battlefield input fixture exercises tap and swipe mapping. Resize cancels a captured gesture. Out-of-bounds and zero-size pointer positions stay finite and bounded. These are input-model fixtures, not real CSS layout measurements.
- Pending loot preview cannot equip or collect gear early. Its open status changes after a won or failed wave. Auto pickup feedback no longer adds energy words. Native Canvas recording checks that eight same-location critical labels draw on separate rows.
- Total filled slots and named set counts stay separate. Same-slot replacement, mixed families, before-equip previews, activation/deactivation, five matching pieces, malformed slot references, repeated swaps and save/load are covered. UI tests equip a third matching piece and replace a sword with a different family while checking both bonus state and total slots.
- The 79 px top/80 px bottom battle budget is checked structurally, not by a real browser layout. The full-height battlefield uses CSS flex; Forge is positioned as an optional overlay. No Android touch or browser viewport measurement is claimed.

## v8 coverage retained

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

Interaction tests use happy-dom; battle raster tests use native Canvas and the shipped artwork. These tests do not establish actual browser CSS layout, physical touch ergonomics, mobile audio activation, real service-worker updates/installation or Android/iOS performance. No rendered browser layout or physical-phone playtest was completed for v8.1. Prior Chromium preview attempts could not run in this environment. Static CSS/DOM checks and native Canvas/input fixtures do not replace a real mobile layout test.

Recommended phone check: confirm v8.1 in Settings, continue the same save, use the enlarged battle controls, Home/Menu, and named equipment set counters, win and equip gear, switch looks, leave Auto running while using menus, retry a stopped wave, then reopen in airplane mode. Keep an exported backup.
