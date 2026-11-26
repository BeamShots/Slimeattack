# Slimefall · Battle Focus v8.1

The battle screen now gives most of its height to swiping and attacking. The Home scene, Talents, Slime upgrades and your progress are retained.

## What changed in v8.1

**Larger battlefield.** Fighting hides the separate brand/resource header, duplicate Auto status strip and full bottom navigation. A compact top bar holds Home, wave number, Auto, Menu and Pause, with health and wave-progress tracks beneath it. One bottom row holds Forge, Frost, Fury and Burst. Tap Home to return to the usual navigation; Menu contains your build, realm information, guild orders and Settings. Frost and Fury are the same Frost nova and Overcharge powers with shorter button labels.

The normal battle chrome uses about 79 CSS pixels above the arena and 80 below it, before device safe-area insets. This is a layout budget, not a measured phone screenshot. The field flexes to use the remaining height, including when the mobile browser changes size. A resize cancels a held gesture safely. The optional Forge floats over the field and no longer shrinks it.

**Cleaner feedback.** Burst charge fills its own button. The separate energy strip and helper-text row are gone. Energy pickups still grant their normal charge, with no repeated +ENERGY labels. Damage labels are smaller and placed on separate rows. Powers, enemies, long wormholes and damage calculations are unchanged.

**A safe wave chest.** The small pending-gear button previews drops without equipping or banking them early. Its status updates if Auto wins or loses while the preview is open. Victory still collects every pending item automatically; a lost wave does not award its pending drops.

**Clear equipment counters.** Total equipment is now labeled “N / 5 slots filled.” Set bonuses have a separate view showing Woodland, Ember and Crystal together. Item details show the named set, actual matching equipped pieces, the bonus, and the result if the inspected item replaces your current item. Three matching pieces activate a set bonus; the count can show four or five without hiding the real number. Replacing a sword changes one slot, so it may reduce one family's count and increase another while total filled slots stays the same. Inspecting an item never counts as equipping it.

All set counters and bonuses read the same distinct equipped slots. Save/load, swapping families and deactivating/reactivating bonuses are covered by regression checks.

## Upload from your phone

1. Export your save in Settings as a backup.
2. Extract this ZIP. Upload **all 32 files together beside index.html**, replacing the old files in the same repository directory. There are no asset folders.
3. Wait for GitHub Pages to publish. Open your usual game address online once, close older game tabs/app windows, then reopen.
4. Check Settings for **Battle Focus · v8.1.0**. Settings also has “Check for game update”.

Use the same website path to keep your save. Do not clear website storage. Upload the extracted files, not the ZIP itself.

## The five bottom buttons

- **Home:** your scene, Play, mini-games, idle chest and tasks.
- **Fight:** your current battle or retry screen. The full navigation is hidden during combat; tap the top Home button to return.
- **Talents:** nine large talent buttons. Tap one, see the effect and price, then Learn.
- **Gear:** your slime with five surrounding slots and an icon-based bag.
- **Slime:** character level, attack, health and one large Upgrade slime button.

## Gear

Tap a bag item to see its stats and Equip it. Tap an equipped slot to Upgrade that item with essence. Item options under More contain Change this item, Favorite, Unequip and Recycle. Individual recycling asks first; favorites and equipped items are protected.

The collection uses four columns, rarity-colored backgrounds, level labels, equipped ticks and green arrows for items with a stronger raw-stat score. Arrows compare raw scores, not set combinations. Tap an empty slot to see that type of gear; Show all returns to the full bag. The bag opens on All when you return from another page.

The Forge button contains Equip strongest, Recycle spares and the duplicate-Common recycling setting. Recycling spare gear supplies essence. Bulk recycling protects equipped items, favorites and your strongest item per slot, and only recycles spare Common/Uncommon gear. Automatic recycling only processes inferior duplicate Common items of the same slot and set after victory.

Five slots remain: Sword (attack), Chest armor (health and armor), Helmet (health and luck), Ring (income and luck), Boots (speed and income). Three matching pieces activate the Woodland, Ember or Crystal set bonus, shown in the item popup. Armor reduces incoming damage, capped at 60% reduction. Item level displays drop tier plus purchased upgrade ranks; no existing stats were reduced.

**Gear stays in the wave chest until you beat that wave, then collects automatically.** Manual, Auto and offline victories use the same rule. Failed-wave drops are discarded, while previously won equipment stays safe. A saved partial wave retains its pending chest.

## Talents

The nine cards use your existing saved skill paths and point balance. Strength, Health, Companion, More coins, Rune magic and Wormhole buy the next connected rank in their branch. Sun strike, Recovery and Rift surge buy the remaining connected main-path lessons to the next keystone. The popup shows the complete price before spending. A failed or unaffordable purchase spends nothing.

Your previously bought nodes still count. Talents continue growing as more points are earned. There is no forced drag or zoom. **Advanced map** opens the original six-branch map if you want to choose individual paths. Both views share the same purchases.

Earn one talent point per ten best waves, or use Earn points for repeatable tasks.

## Upgrade your slime

The large green button displays the coin price and next benefit. It purchases the original permanent strength, health or companion upgrade, choosing a lowest-level available category. Strength and companion continue beyond the ward's cap. Character level reflects the sum of those three existing upgrades plus one.

Health purchased here applies once to a living run. If an offline wave is stopped or the run has ended, the displayed health previews the next retry without modifying the failed battle. Cards, current wave, gear and currencies are kept.

Aqua, Leaf and Ember are cosmetic looks: they use the same stats and your choice is saved. The selected look appears on the equipment/character screens and as your battle companion. Upgrading plays the existing sound and a short character animation.

Battle upgrades, research, rune forge, mini-games, rewards, powers, tasks, the slime guide and offline results are accessible through **Slime → More**. Research and battle upgrades use icon tiles with details opened on tap. Forge tabs stay available while researching.

## Progress, Auto and offline play

The existing `slimefall-v1:` save key and site-path rules are unchanged. Older saves gain a default cosmetic selection, preserving waves, powers, equipment, talent nodes, upgrades and currencies.

Auto continues through normal pages, item/talent dialogs and mini-games. It collects dropped orbs, uses abilities, chooses cards and banks won equipment. Explicit Pause still pauses Auto. Gear choices, talent purchases and currency spending remain your decisions.

Offline combat uses the existing simulation, stops on its first failed wave and waits for upgrade/retry. Passive coin income continues for the entire absence, including after an offline defeat; there is no time/storage limit. Late-wave income scaling, gear income bonuses and all older progression systems remain. Large values use K/M/B/T/Qa and continuing suffixes, including beyond ordinary floating-point combat magnitudes.

The long-wormhole rendering fix, visible-actor fallback, canvas sizing repair and short death images remain. All artwork and scripts ship locally; no CDN is needed. The service worker caches the complete new release before activation.

See CHECKS.md for automated verification and its limits. No physical phone playtest was performed.
