# Loot Legends artwork

`gear.webp` is a new transparent equipment atlas with 16 aligned cells, used by inventory, equipped slots and the Home equipment shortcut. It was produced with the built-in image generation tool, inspected and aligned/encoded into a four-by-four WebP atlas. All game artwork is shipped locally beside index.html.

Production prompt:

> Use case: stylized-concept. Asset type: casual mobile fantasy game equipment icon atlas. Make exactly 16 distinct standalone objects in a precise 4 columns by 4 rows grid on a genuinely transparent background. Equal square cells, each object centered with wide clear margins. Row-major order: 1 green leaf sword, 2 green leather chest armor, 3 green woodland helmet, 4 emerald ring, 5 green leather boots, 6 red ember sword, 7 red chest armor, 8 red knight helmet, 9 ruby ring, 10 red armored boots, 11 blue crystal sword, 12 blue chest armor, 13 blue knight helmet, 14 sapphire ring, 15 blue armored boots, 16 a small pile of colorful upgrade crystals. Friendly polished 2D cartoon mobile game art, bold readable shapes, simple clean shading, bright colors, soft highlights, no unnecessary filigree. Similar coherent cute inventory art across all objects. No text, no letters, no numbers, no labels, no UI frames, no backgrounds, no characters. Objects must be separated, not overlapping, and every one fully visible.

The original meadow illustration is retained as the full Home scene. Its layout now uses native compact HUD elements, large scene shortcuts and a single Play button. The earlier AI-generated slime/power/realm/forge atlases are retained. The decorative blue frames remain removed. No external generation service, font or CDN is called while playing; sounds are synthesized locally.

## Slime Heroes v8

`heroes.webp` is a newly generated transparent three-column character atlas: Aqua, Leaf and Ember. It is used by the central equipment stage, slime-upgrade stage, look selectors and battle companion. The generated PNG was encoded to a 1440 × 480 WebP for local use. The equipment and power icons use the shipped transparent atlases; interface frames and labels are native CSS for readable, scalable controls.

Generation prompt:

> Create an original mobile game character sprite atlas, three equal cells in a single horizontal row, each isolated on transparent background, no text no UI no ground. Each cell contains one full cute slime hero centered with large generous clear padding, same size. Friendly polished 2D painted cartoon mobile RPG art, thick clean outlines, luminous colors, soft highlights, very readable at small size. Left: happy aqua jelly slime with tiny white angel wings, little gold crown and a tiny heroic blue cape; eyes large and cute, spherical blob body not humanoid. Middle: cheerful leaf green jelly slime ranger, leaf hood, small acorn satchel, little leaves on head, no weapons. Right: happy orange-red jelly slime with small ember horns and a little red cape, yellow glowing belly, warm friendly eyes, not scary. Original characters, no recognizable franchise characters. All face camera in slight three quarter view, no overlapping cells. Important sprite atlas: precisely three equally spaced columns, 1 row, each character fits fully inside their cell, transparent surrounding.
