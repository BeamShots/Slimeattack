# Slimefall · Loot Legends v7.0

This update focuses on the empty-battlefield bug, a scene-based Home screen, worthwhile late-wave idle income and equipment drops that are banked only after victory.

## Update from your phone

1. Export your current save from Settings as a backup.
2. Extract the ZIP and upload **all 30 files beside index.html**, replacing the previous files in the same GitHub repository directory. Everything is flat; no asset folders are required.
3. Wait for GitHub Pages to finish publishing. Open the same game address online once, close older game windows/tabs and reopen.
4. Open Settings and check for **Loot Legends · v7.0.0**.

Keep the same website path to retain your existing save. Do not clear website storage to force an update. The ZIP itself is not a GitHub Pages deployment; upload its extracted contents.

## Home is a scene

Home now contains a compact resource HUD, one wave badge, four large shortcuts, one Play button and the bottom navigation. The slogan, big heading, text-card stack, duplicate wave line, secondary new-run button and long Auto status strip are gone from Home.

- **Games:** Memory, Fishing and Star puzzle.
- **Collect:** collect idle coins directly.
- **Gear:** inspect and equip your items.
- **Tasks:** view and claim little adventure goals.

The bottom destinations are Home, Fight, Skills, Gear and Shop. The profile portrait also opens equipment. Detailed income information and the new-adventure action are in Settings. An ended adventure shows Retry instead of silently starting again.

## Equipment waits until you beat the wave

Slimes can drop swords, chest armor, helmets, rings and boots. A drop enters the current wave chest. It is **not** usable gear yet.

**When you clear the wave, every pending piece is collected automatically.** This works in manual play, Auto and offline waves. A failed wave discards its pending equipment. Previously banked gear remains safe. Closing the game halfway through a wave saves the pending chest; taking control after a partial offline simulation also keeps it pending until a later victory.

The battle HUD shows how many pieces are pending. Won gear appears in the inventory and updates its badge. You do not need to tap armor drops or press a claim button after winning.

Base drop chances before equipment luck are 0.6% for normal slimes, 1.6% for elites and 40% for bosses. Boss drops have improved rarity odds. A first-item safeguard and a 180-kill dry-streak counter prevent a new inventory from staying empty indefinitely. Tier rises with the wave where the item drops.

## Build your loadout

There are five slots and six rarities: Common, Uncommon, Rare, Epic, Legendary and Mythic.

| Slot | Main bonuses |
| --- | --- |
| Sword | Strength / attack damage |
| Chest armor | Health and armor |
| Helmet | Health and drop luck |
| Ring | Income and drop luck |
| Boots | Attack/helper speed and income |

Armor reduces actual incoming ward damage, up to 60% mitigation. Bonuses apply to battle, Auto and offline simulations where relevant. Income bonuses apply to both battle coins and the idle chest.

Three matching pieces activate a set bonus: Woodland grants +25% income, Ember +30% strength, Crystal +15% speed. Choose between individual item quality and a matching set.

Tap an item for details, Equip/Unequip, upgrades, favorites and recycling. **Equip strongest** chooses the highest raw-stat score in each slot; it does not optimize set combinations. Green arrows identify pieces with a higher raw score than the equipped item in that slot.

Recycling supplies essence for equipment upgrades. Equipped pieces and favorites cannot be recycled. Recycle spares protects the strongest piece in each slot and only processes spare Common/Uncommon items. Inventory can be filtered, sorted and paged.

**Auto-recycle duplicate Common** is ON by default. It only converts an inferior duplicate of the same slot and set, after the wave has been won. A first piece from another set is kept. Rare and higher items are never automatically recycled. You can turn this setting off in Gear.

Gear is not equipped or upgraded automatically: Auto banks drops, while you decide how to build the character. Equipment stats, upgrades, favorites, essence and pending-wave loot are saved.

## Late-wave idle income

The idle chest now scales with best-wave progress in addition to sanctuary upgrades, research, skill-tree income and equipment bonuses. The progression multiplier is `1 + sqrt(best wave) / 3`. At best wave 12154, this is roughly **37.7 times** the old income calculation at the same upgrades, before new equipment income bonuses.

It continues earning through the full absence even after the offline adventure loses. There is no elapsed-time or chest-storage cap. Idle coins and offline wave rewards are separate: successful offline waves deposit their own rewards directly, while the Collect chest stores passive income.

## Combat rendering repair

Skill-tree portal bonuses can extend a wormhole beyond three seconds. The old drawing code assumed three seconds and could calculate negative ellipse radii, aborting drawing after the canvas had already been cleared. Its visual pulse now stays in a valid range for the full duration.

The renderer resets transparency/blending each frame, uses an explicitly positioned canvas inside the arena, recovers dimensions, draws a companion fallback if art is unavailable and falls back to visible actors if an optional effect throws. The next animation callback is scheduled before drawing, so one effect cannot stop subsequent combat frames. Instant kills leave a brief death image and direct attacks have a short slash flash.

## Features retained

The expanding six-branch hex skill tree, wave milestone points, repeatable adventure goals, three continuing battle upgrades, 45 evolution cards, forge, research and village games remain. Auto keeps fighting through normal menus and mini-games, collects dropped orbs, casts powers and chooses evolutions. The explicit Pause menu pauses Auto.

Offline waves still simulate actual combat, bank successful-wave rewards once and stop on first defeat until you upgrade/retry. They do not automatically spend your currencies or crafted runes. Long absences are processed in batches. Interrupting a catch-up hands over the partial battle and ends further wave simulation for that absence, while keeping already accrued passive income.

Number suffixes continue beyond K/M/B/T/Qa through further named tiers and letter suffixes, without switching to exponent text. Extreme combat uses a shared numeric scale for health and damage.

The existing `slimefall-v1:` save key and path rules are unchanged. Older saves receive an empty equipment inventory without resetting their wave, money, powers, skill tree or previous progress.

See CHECKS.md for verification and its limits. No physical phone playtest was performed.
