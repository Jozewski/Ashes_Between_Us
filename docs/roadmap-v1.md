# Ashes Between Us Docs Index

This file is a lightweight navigation page for the current app documentation. For the most accurate architecture and behavior notes, start with `APP_OVERVIEW.md`.

## Current Source Of Truth

- [README](../README.md): setup, scripts, environment, project structure, and maintenance.
- [App Overview](./APP_OVERVIEW.md): current gameplay flow, route rules, final archive, AI services, image handling, and audio behavior.
- [Audio README](../public/audio/README.md): turn-based scenario audio loop and track manifest.
- [Mock Data README](./mockData_README.md): how `lib/mockData.js` is used as fallback/sample data.
- [Scenario Image Keyword Map](./SCENARIO_IMAGE_KEYWORD_MAP.md): filename-to-keyword reference for scenario art matching.
- [Scenario Image Suggestions](./SCENARIO_IMAGE_SUGGESTIONS.md): guidance for replacing or generating additional scenario artwork.

## Current Product State

Ashes Between Us is a playable 10-turn post-collapse RPG with:

- six playable avatars
- seeded per-avatar scenario packs
- six choices per scenario
- stat changes for hope, trust, chaos, and humanity
- current-run history scoped by `runId`
- final archive screen with AI/fallback profile and ending story
- turn-based scenario music loop
- explicit avatar-selection routes through Start Transmission and Change avatar

## Current Priorities

1. Keep seeded scenario packs polished and image-matched.
2. Improve final archive story quality and layout balance.
3. Keep route behavior predictable:
   - `/` opening screen
   - `/game?selectAvatar=1` avatar selection
   - `/history` final archive
4. Keep AI generation guarded by deterministic fallbacks.
5. Maintain tests for scoring, image matching, profile prompts, ending prompts, and audio loop behavior.

## Historical Docs

The older planning docs are retained for context, but they may mention early branch ownership or incomplete MVP tasks. Prefer the current README and App Overview when making implementation decisions.
