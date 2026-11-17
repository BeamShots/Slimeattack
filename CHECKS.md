# Riftbound v2 verification
93 automated checks passed:
- 36 original engine checks, rerun against v2.
- 24 expansion checks covering v1 wave-45 migration; new cards, prerequisites and late draft guarantees; boss and realm rotation; all wave conditions; splitting/minion accounting; mini recursion prevention; healer pulses; mirror hits; sentinel protection; blink/burrow/haste/leech behaviours; boss summons/dashes/rifts; automatic blades/lasers/thunder; glaives and resonance; mines; lasting vortex pull and collapse; limited revivals; thorns, curses, infinity scaling, power duration and saved mines/elites.
- 26 simulated-DOM interaction checks covering home, combat, pointer/hold/release controls, cooldowns, cards/drafts, save/home/resume, permanent upgrades, collection, milestones, idle claims, settings, imports/exports, confirmed reset, field guide, new icon mapping, realm information and rendering all added effects with actual generated textures.
- 3 early progression simulations reached wave 31.
- 3 later progression simulations started at wave 41 with a plausible developed v1 build and reached wave 101 in 770–798 simulated seconds. Each encountered 19 enemy types and selected all 12 expansion cards. They used 5 simulated taps per second and activated ready powers. They repeatedly checked save/load, accounting, entity caps and finite values.
- 1 audio graph check covers seventeen sound envelopes, ambient notes, oscillator cleanup and mute.

Additional checks verify all cached files exist, install/activate/cache response logic, non-GET bypass, JavaScript syntax, flat local references and ZIP integrity.
A synthetic v1 wave-45 save with 15,297 coins, 8 crystals, an injured boss and existing cards retains those values under v2.
Enemy, card and effect atlases were aligned into isolated cells. A native-canvas scene using the real generated art was visually inspected.

Limitations:
Interaction tests use a simulated DOM and native canvas. These are not a physical-phone playtest. Full browser layout, device audio and vibration, Android installation, real browser offline reload and phone frame rate remain unverified. The build is not claimed to be bug-free.
