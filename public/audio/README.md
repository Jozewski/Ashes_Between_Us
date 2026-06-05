# Game Audio

Background **music** for the game lives in `music/`. Each track is mapped to a
scene or ending so the audio follows the picture on screen.

The app loads tracks gracefully: a missing or invalid file fails silently
(`onloaderror` in `components/MusicProvider.js`) and never blocks gameplay.

> There are **no sound effects** — the game is music-only. The previous
> `sfx/` folder and `SFX_TRACKS` were removed.

## Files

### `music/`
| File | When it plays |
| ---- | ------------- |
| `start-screen.mp3` | Landing → Start Transmission (loop) |
| `scenario-low-ruins.mp3` | `ruined-city.png` + `ending-broken-future.png` + default fallback (loop) |
| `scenario-radio-tension.mp3` | `radio-tower.png` (loop) |
| `scenario-bunker-dread.mp3` | `bunker.png` (loop) |
| `scenario-chaos-percussion.mp3` | `aurora-mountain-storm.png` + `ending-chaotic-future.png` (loop) |
| `scenario-desert-highway.mp3` | `desert-highway.png` (loop) |
| `scenario-forest-hope.mp3` | `forest-safe-zone.png` + `ending-rebuilding-future.png` (loop) |
| `scenario-timeline-mystery.mp3` | `aurora-lake-sunset.png`, `aurora-winter-forest.png`, `aurora-coastal-beacon.png` + `ending-balanced-future.png` (loop) |
| `ending-balanced.mp3` | Balanced ending (one-shot) |
| `ending-broken.mp3` | Broken ending (one-shot) |
| `ending-chaotic.mp3` | Chaotic ending (one-shot) |
| `ending-rebuilding.mp3` | Rebuilding ending (one-shot) |

To swap a track, replace the file in place (keep the exact filename) and update
its row in `licenses/audio-credits.json`.

## How the mapping works
- Scenario music follows the **background image**, mapped in
  `lib/sceneAudioMap.js` (file name → track key). Because each avatar's ten
  scenarios now use ten distinct backgrounds (including the `ending-*-future`
  vistas as late-game scenes), the music varies turn to turn.
- Ending music follows the derived ending state, mapped in
  `lib/endingAudioMap.js`.
- Track sources/volumes/loop flags live in `lib/audioTracks.js`.

## Track switching
- Switching to a new scene **cleanly swaps** tracks: the old track ducks out
  fast (~250 ms) while the new one eases in (~600 ms), so only one track is
  audible at a time — no overlapping crossfade.
- A module-level registry hard-stops any orphaned track, so a provider remount
  (React Strict Mode in dev, route changes) can never leave two songs playing.

## Notes
- Browsers block audible autoplay until a user gesture; music unlocks on the
  Start Transmission click.
- Mute is global and persisted in `localStorage` (`abu-muted`).
