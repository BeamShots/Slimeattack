# Slimefall · Growing Worlds v6.0

A cleaner mobile interface, an expanding hex skill tree, repeatable goals and progression beyond the old upgrade caps.

## Update from your phone

1. Export your current save from Settings as a backup.
2. Extract this ZIP and upload **all 28 files beside index.html**, replacing the old files in the same GitHub repository directory. There are no folders to upload.
3. Wait for GitHub Pages to publish. Open the same website online once, close all older game windows/tabs and reopen it.
4. Check for **GROWING WORLDS · v6.0** in the header, or v6.0.0 in Settings.

Keep the same website path to retain the device save. Do not clear website storage to force an update. Older unused artwork may remain in your repository; the new game does not reference the old decorative frames.

## A simpler screen

The new home uses original bright meadow artwork, plain rounded panels, clear labels and one large Play button for your saved wave. The five bottom destinations are **Home, Fight, Skills, Games, Shop**. There are no decorative blue frames.

- **Skills:** explore and grow the hex tree.
- **Games:** Memory game, Fishing and Star puzzle.
- **Shop:** battle upgrades, rune forge, research, rewards, powers, slime guide and offline results.
- **Auto ON/OFF:** always available in the header. It remembers its setting and continues fighting while you explore the other screens and play mini-games.

A saved run remains at its original wave with its cards. Starting a new adventure is optional and still asks before replacing an active run.

## Explore the skill tree

Drag to move the map. Pinch or use +/− to zoom. Tap a hexagon to see its effect, then press **Unlock**. **Center** returns to the heart; **Next path** finds another available unlock.

Six connected branches begin at the slime heart:

| Branch | What it changes |
| --- | --- |
| Attack | Damage, with Solar flare strikes at keystones |
| Spirit | Attack/helper speed and extra orb energy |
| Health | Starting/live hearts, capacity and wave recovery |
| Coins | Battle and sanctuary coin income |
| Craft | Spark generation, orders and boss spark rewards |
| Portals | Wormhole strength, duration and recharge |

The initial view contains 180 hexagons plus the heart. Buying paths reveals more hexagons beyond that branch's frontier. Each main path unlocks two optional side branches with up to three ranks. Every fifth main-path node is a special keystone. The atlas is generated as you grow; it is not a small tree you finish in one session.

You receive **one skill point per ten best waves**. Existing progress counts: a save at wave 6009 with wave 6008 cleared begins with **600 points**, before any new task rewards. Points are earned from best-wave milestones once, so repeating the same waves does not repeatedly grant that milestone.

The little adventure on Home and the three goals at the top of Shop give another way to earn points. Defeat slimes, merge runes, deliver orders, fish, finish memory rounds or solve star puzzles. Claiming a completed goal gives **3 skill points**, coins and stardust, then rotates that goal. There is no daily reset or forced waiting period.

The tree, ranks, spending, point rewards and map camera are saved. Purchased paths affect real combat, Auto and offline simulations. Health ranks apply to a live run immediately; when bought after a stopped offline battle, they apply once on retry.

## Progression after maxed upgrades

Ancient blade, Companion bond and Gel sanctuary keep leveling past their old caps, with continuing effects and costs that grow after the former maximum. Spirit ward and Fate crystal retain their meaningful original ceilings.

Three new run evolutions stay available after your original collection is complete:

- **Battle mastery:** +1% multiplicative damage per rank.
- **Golden age:** +5% battle coins per rank.
- **Spirit training:** +1% all damage and +1% companion damage per rank.

These have no ordinary level cap. The previous 42 powers, saved levels and discoveries are retained. Research, forge orders and the merge board remain available.

## Large numbers without exponent notation

K, M, B, T, Qa, Qi and the early thousand-fold suffixes remain. After Vg, the game continues with **aa, ab, ac …** rather than switching to scientific notation. The sequence continues for larger tiers. For example, a value written as `1.01e482` formats as **101fi** in this system.

The HUD, wallets, prices, rewards and damage popups use the same formatter. The combat engine also scales enemy health and damage together at extreme magnitudes, so support beyond ordinary floating-point magnitudes is not merely a changed label. Saved scaled fights retain their wave, health ratios and card build. Display labels are rounded; calculations use the underlying values.

## Saved Auto and offline adventure

Auto handles attacks, swipes, counters/cores, ready powers, evolution choices and every dropped orb. Final-kill drops are collected before advancing. It keeps fighting on Home, in Skills, in normal menus and while you play the village games. The explicit battle Pause menu pauses Auto until resumed. Auto never buys permanent upgrades or spends your crafted runes for you.

On defeat, the run stops until you upgrade/retry. A background defeat shows a stopped status without interrupting a mini-game. Tap it to open results and retry controls. Saved manual defeats can retry at their original wave with their cards.

When you leave with offline waves enabled, the game simulates the full elapsed absence using the actual combat rules and your chosen evolution policy. Successful waves commit rewards once. A failed offline wave rolls back its partial loot and stops there; it does not repeatedly restart. Upgrade and retry with a full ward. Sanctuary coins and forge sparks continue accumulating for the full absence even after that defeat, with no elapsed-time or storage cap.

Long catch-ups are processed in batches and can be interrupted with **Return to this wave now**. This ends further wave simulation for that absence and hands you the current battle, keeping partial progress and loot. Passive income has already been credited in full.

## Save and installation notes

The existing `slimefall-v1:` device-save key and path are preserved. Earlier saves gain defaults for the tree and activity counters. An old wave-6009 save was included in compatibility tests; no copy of your actual device save was available.

GitHub Pages HTTPS is required for normal PWA installation and offline caching. Uploading the ZIP itself does not publish its contents. Load the complete release online once. The service worker caches the release before activation, and updated clients save before reloading. Settings has an update check and save export/import.

See CHECKS.md for test coverage and its limits. No physical phone test was performed for this release.
