# Slimefall · Eternal Expedition v5.1.0

A portrait, offline-capable slime wave game. No build tools, accounts, subscriptions or external runtime dependencies.

## Upload from your phone

1. Export your current save from Settings first as a backup.
2. Extract this ZIP. Upload **all files together** into the same GitHub repository directory that currently contains your game's `index.html`. Replace the old files. Every file belongs beside `index.html`; there are no asset folders.
3. Let GitHub Pages finish publishing. Open the same website online once.
4. Close every old game tab and installed game window, then reopen the game. An already-running older version can need this close/reopen cycle before it uses the new release.
5. The header must read **ETERNAL EXPEDITION · v5.1**. Settings also shows v5.1.0. If it still says Soul Rush or Moonhaven, the new release is not loaded yet.

Keep the same website address and game directory to keep its local save. Do not clear website storage or uninstall to force an update. Uploading this ZIP does not itself publish to GitHub; upload its extracted contents.

## Find the new features

- **Eternal expedition**, on the village screen: offline results, automatic card policy, offline on/off and retry controls.
- **Moonforge & orders**, on the village screen: persistent merge board and commissions.
- **Stardust research**, on the village screen: six research paths with no level cap.
- **Open forge** and **Orders**, underneath the battlefield: work on the forge while combat keeps running. Opening it enables Auto. The saved Auto toggle in the header works from every screen. Toggle Auto OFF to restore manual evolution choices and stop offline wave progression.

## One-click Auto (v5.1)

The **Auto ON/OFF** button is always available in the header, including the village and activity pages. It saves its preference and restores it after reload and on new runs. With no run yet, turning Auto ON starts one.

Auto handles attacks, swipes, counter/core openings, Frost nova, Overcharge, Soul Burst, every dropped coin/gem/time/rune orb and evolution choices. It keeps fighting while you visit the village, merge runes, fish, play the memory game or star map, inspect your build, research or buy permanent upgrades. Ordinary menus do not pause Auto. The explicit battle **Pause** menu pauses it until you resume.

A status bar shows the current wave from every screen. A defeat stops that run until you retry; it does not interrupt an activity or automatically spend your upgrade currencies. Tap the stopped status to reach upgrade/retry controls. Auto OFF stops hidden-screen fighting and disables offline waves. Your companion still attacks during a manually played battle, as before.

## Consistent large numbers (v5.1)

Wallets, costs, income rates, rewards, research resources, damage and damage popups use the same notation: **K, M, B, T, Qa, Qi, Sx, Sp, Oc, No, Dc**, followed by further thousand-fold suffixes. Examples: 1,000 → 1K, 12,300 → 12.3K, 1,000,000 → 1M, 10^15 → 1Qa. Rounded values promote to the next suffix rather than showing 1000K. Full numeric values are retained for all calculations and purchases.

## Smart offline waves

Tap **Auto ON** in the header. It enables both foreground Auto and offline waves. Leave the game with that run saved. On your next visit, it simulates the elapsed absence using the same combat engine: your cards, permanent upgrades, companion, real enemy types, movement, shields, poison, healing, boss mechanics and revivals.

The pilot attacks every quarter-second, uses swipes and counter/core windows, catches all drop types every update and activates ready powers. It also collects the final kill’s drops before advancing the wave. It chooses evolutions according to **balanced**, **power** or **sustain**. It does not consume your forge runes or buy upgrades. Balanced heals when wounded and otherwise prefers damage and automatic skills. Results can differ from skilled manual play.

Successful waves commit their coins, crystals, kills and forge rewards once. A defeated wave gives no partial loot: the simulation rolls that wave back, records the failure and stops there. It stays stopped across future visits until you press **Retry wave**. Upgrade first, then retry with a full ward. The wave and run cards are kept.

The village **Eternal expedition** entry highlights a stopped wave. A saved manual defeat can also be retried at its original wave rather than restarting at wave 1.

No offline-duration limit is imposed. Catch-up work is processed in small batches so long absences do not lock the UI in one synchronous computation. The return overlay shows progress. **Return to this wave now** ends further wave catch-up for that absence and hands you the current battle, keeping its partial progress and earned loot. Sanctuary income has already been credited in full.

Offline play does not require a phone background process. Results are computed on return from the saved timestamp. If you close the game while catch-up is running, it saves the remaining work and partial simulated wave for the next visit.

## Unlimited sanctuary income and sparks

The old eight-hour income limit and 20,000-coin bank limit have both been removed. Sanctuary coins accumulate for the full elapsed time, even after an expedition loses. Collect them from the village. Forge sparks also accumulate for the full absence with no storage limit. Neither is a promise that waves can never defeat your build.

## A second activity during combat

The Moonforge has a twelve-slot persistent board. Conjure rank-1 runes using sparks. Tap a rune, then a matching rune to merge them; an empty tile moves the selected rune. Two of a rank make one of the next rank, up to rank 9. Fill-board and salvage controls help manage space.

Sparks regenerate every 45 seconds before research bonuses, plus 2 for each cleared wave and 3 extra for a boss. Three guild orders ask for specific rune ranks. Deliver one to receive coins, stardust and, for higher ranks, crystals. Other unfinished orders remain unchanged. New commissions gradually ask for higher ranks. Orders continue after every landmark is restored.

During combat you can consume a selected rune using **Invoke**:

| Rank | Power |
| --- | --- |
| 1 | Refresh and cast Frost nova |
| 2 | Heal 3 hearts |
| 3 | Firestorm across the current swarm |
| 4 | Fill Soul Burst energy |
| 5 | 15 seconds of Overcharge and heal 3 |
| 6 | Push enemies back, freeze and collapse the rift |
| 7–9 | Double damage for 30/60/90 seconds, fill energy and heal |

Choose between spending a rune in battle, delivering it or merging toward a higher discovery. Your board, orders, sparks, research and discoveries survive runs.

## Longer progression

Stardust now funds Astral edge, Sanctuary current, Moonstone ward, Ember well, Guild charter and Spirit resonance. Each can keep leveling; costs rise with level. Damage and income improvements apply immediately. Starting-ward improvements apply when starting a run or retrying a stopped offline wave. Dust comes from orders, salvage, boss victories and the existing village games.

Four new evolutions extend the previous 38-card pool:

- **Endless constellation**, wave 60+: multiplicative late-run damage with a much higher level ceiling.
- **Celestial monsoon**, wave 60+: frequent multi-target star bombardments.
- **Lunar oath**, wave 90+: recovery after each cleared wave.
- **Eclipse hunger**, wave 100+: periodic maximum-health damage, reduced against bosses.

The existing runeforge memory game, moonpool fishing, star-map puzzles, village restoration, seven-boss cycle, 29 sprite entries, realms, active powers, settings and save export/import remain available.

## Updates and save compatibility

The old `slimefall-v1:` save key and path rules are preserved. Earlier Slimefall saves receive the new defaults without resetting their coins, waves, cards or village. An old save begins offline-wave tracking when v5 first loads; it does not unexpectedly simulate the time before this feature existed. Later absences are processed normally.

The service worker installs the complete release before activating it and requests fresh release files. Updated v5 clients save and reload when a new worker takes control. Settings includes an update check. Phone installation/offline caching requires your HTTPS GitHub Pages website; opening a downloaded HTML file directly does not install a PWA.

See CHECKS.md for verification and remaining limits. The game uses your device's clock; it does not have server-side anti-cheat. Export backups periodically.
