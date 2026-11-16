# Build verification

63 automated checks passed:
- 36 engine checks cover all eighteen cards and their interactions, manual and automatic attacks, critical hits, poison, chain damage, shatter, echoes, familiars, meteors, vortex, execute, healing, low-health damage, currencies, boss rewards, wave transitions, early/boss rarity guarantees, reroll limits, permanent purchases, milestones, save validation, run recovery, idle accrual and caps.
- 23 simulated-DOM interaction checks cover starting/resuming runs, tapping/holding/releasing, ability controls, pause/resume, build inspection, card rendering and selection, draft rerolls and persistence, new-run confirmation, workshop purchases, grimoire, milestones, idle collection, settings, export/import, reset confirmation, defeat navigation and rendering battle effects.
- 3 longer simulated runs reached wave 31 with different builds. These used three levels each of blade/companion and two levels of ward upgrades, simulated 6.7 taps per second, and automatically activated ready powers. They reached wave 31 in roughly 397–407 seconds, with 885 kills each. Run serialization was checked repeatedly.
- 1 audio-graph check covers eleven effect envelopes, ambient notes, oscillator cleanup and mute.

Additional checks verify every cached runtime file, cache installation/activation, root and app-file cache responses, non-GET bypass, JavaScript syntax, local file references and ZIP integrity.
The generated enemy atlas was aligned into isolated cells after inspecting a canvas-rendered scene, correcting neighbouring sprite bleed.

Limitations:
UI interactions ran in a simulated DOM, with the actual generated sprites and a native canvas for battle rendering. Full browser layout, physical phone controls, actual device audio, Android installation and a real service-worker offline reload have not been verified on a phone. The earlier local browser environment could not launch Chromium, and the remote browser disallows local-file previews.
The game is not claimed to be bug-free.
