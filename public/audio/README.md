# Game Audio

Ashes Between Us is music-only. There are no sound effects.

Audio is managed by `components/MusicProvider.js` using Howler. The provider keeps one active track at a time, fades out the old track, fades in the next track, and protects against overlapping orphaned Howl instances during route transitions or React dev remounts.

## Audio Model

- **Opening / avatar selection** uses `start-screen.mp3`.
- **Scenario gameplay** uses a turn-based loop from `lib/scenarioAudioLoop.js`.
- **Final archive / ending** uses an ending track from `lib/endingAudioMap.js`.
- Track source paths, volumes, and loop flags live in `lib/audioTracks.js`.

Scenario music is intentionally **not tied to images**. Several scenarios can share visual themes, and image-based audio caused repeated tracks to play back-to-back. The scenario loop now advances by turn so each new scenario changes music predictably.

## Files

| File | Use |
| --- | --- |
| `music/start-screen.mp3` | Opening screen and avatar selection loop |
| `music/scenario-low-ruins.mp3` | Scenario loop track |
| `music/scenario-radio-tension.mp3` | Scenario loop track |
| `music/scenario-bunker-dread.mp3` | Scenario loop track |
| `music/scenario-chaos-percussion.mp3` | Scenario loop track |
| `music/scenario-desert-highway.mp3` | Scenario loop track |
| `music/scenario-forest-hope.mp3` | Scenario loop track |
| `music/scenario-timeline-mystery.mp3` | Scenario loop track |
| `music/ending-balanced.mp3` | Balanced ending |
| `music/ending-broken.mp3` | Broken ending |
| `music/ending-chaotic.mp3` | Chaotic ending |
| `music/ending-rebuilding.mp3` | Rebuilding ending |

## Scenario Loop

Scenario turn order is defined in:

```text
lib/scenarioAudioLoop.js
```

Current loop keys:

```js
[
  "lowRuins",
  "radioTension",
  "bunkerDread",
  "chaosPercussion",
  "desertHighway",
  "forestHope",
  "timelineMystery",
]
```

Turn 1 uses the first key, turn 2 uses the second, and so on. The list wraps if needed.

## Start Screen Exception

The `start` track is intentionally separate from the scenario loop. It should play for:

- opening screen after Start Transmission unlocks audio
- avatar selection screen
- returning to avatar selection through Change avatar

It should not be included in the scenario loop.

## Track Switching

- Old music fades out in about 250 ms.
- New music fades in over about 600 ms.
- Missing files fail silently so gameplay is not blocked.
- Browser autoplay restrictions still apply; audio unlocks after the player clicks Start Transmission.
- Mute is global and persisted in `localStorage` as `abu-muted`.

## Credits

Keep `licenses/audio-credits.json` current when replacing or adding audio.
