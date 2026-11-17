# Soul Rush verification
131 automated checks passed:
- 36 base engine checks.
- 24 Riftbound checks, rerun against v3.
- 29 active-combat checks covering v2 wave-45 migration, 38 cards, seven bosses, active-card draft guarantees, slash geometry, diagonals, cooldowns, invalid paths, misses, cleave upgrades, core windows, fresh-tap intent, companion behaviour, timed counters, missed counters, runes, drops, magnet bonuses, swipe collection, Soul Burst spend/empty-arena behaviour, bounty duplication/reset, every new card, bomb explosions, candy drops, shell cracking, new casts and saved action state.
- 32 simulated-DOM checks covering original screens and controls plus the one-time guide, pointer-drag-release slashes, cancellation, precision/collection dispatch, charged Burst control and meter, new icon/portrait mappings and actual-art rendering.
- Three legacy-input early progression simulations reached waves 18–21. These did not use swipes, pickups or Soul Burst.
- Three active-input early simulations reached wave 31. They used three blade/companion upgrades and two ward upgrades, tapped at up to five times per second, collected available drops and used swipes/powers. The simulated runs included 254–347 slashes, 723–878 core hits, 59–66 counters and 394–419 catches. These are automated input patterns, not observed human sessions.
- Three developed-build late simulations reached wave 101 with active-state serialization and entity accounting checks.
- One audio-graph check covers 22 sound envelopes, two noise layers, ambient notes, cleanup and mute.

Additional checks cover cached-file existence, service-worker install/activate/cache response logic, non-GET bypass, JavaScript syntax, flat local references and ZIP integrity.
Generated enemy/icon sheets were isolated into aligned cells. A native-canvas scene using the actual new art, action rings, pickups and a slash path was visually inspected.

Limitations:
UI interactions ran in a simulated DOM with native canvas, not on a physical phone. Full browser layout, physical swipe feel, device audio/vibration, real service-worker offline reload, Android installation and mobile frame rate remain unverified.
