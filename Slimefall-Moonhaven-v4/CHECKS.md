# Moonhaven verification
163 automated checks passed:
- 36 base engine checks.
- 24 Riftbound checks.
- 29 Soul Rush active-combat checks.
- 44 simulated-DOM interaction checks. These cover previous controls and the new village locations, memory playback/input/replay, fishing casts/bites/reels/limits, puzzle rotation/hints/completion, restoration, extra rerolls, live-battle pause/resume across activities, timer suspension under dialogs, effect cycling, damage-number toggling and reduced visual budgets.
- 20 Moonhaven model checks cover migration, data validation, side-game state transitions, reward duplication prevention, limits, discoveries, puzzle solvability, hints, rotations, restoration costs, idle growth, rerolls, serialization, visual-setting independence and idle-claim duplication. One of these checks generated and solved 500 different seeded spatial puzzles.
- Three legacy-input early combat simulations.
- Three developed-build late combat simulations.
- Three active-input progression simulations.
- One audio-graph check for original/action effects, ambient notes, noise layers, cleanup and mute.

Additional checks verify all local references and cached files, service-worker install/activate/cache logic, non-GET bypass, JavaScript syntax, flat packaging and ZIP integrity.
The original combat checks were rerun against the new build. Town rewards and visual settings are independent of combat simulation.
The village, moonstone frame and location/rune atlas are generated images used by the actual game.

Limitations:
UI interaction tests run in a simulated DOM. Full browser layout, physical-phone controls, device sound/vibration, Android installation, real offline reload and phone frame rate have not been verified on a physical device.
