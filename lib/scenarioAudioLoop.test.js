import { describe, expect, test } from "vitest";
import {
  SCENARIO_LOOP_TRACKS,
  trackKeyForScenarioTurn,
} from "./scenarioAudioLoop.js";

describe("scenario audio loop", () => {
  test("cycles through scenario tracks by turn without adjacent duplicates", () => {
    expect(SCENARIO_LOOP_TRACKS.length).toBeGreaterThan(1);

    for (let index = 1; index < SCENARIO_LOOP_TRACKS.length; index += 1) {
      expect(SCENARIO_LOOP_TRACKS[index]).not.toBe(SCENARIO_LOOP_TRACKS[index - 1]);
    }

    expect(trackKeyForScenarioTurn(1)).toBe(SCENARIO_LOOP_TRACKS[0]);
    expect(trackKeyForScenarioTurn(2)).toBe(SCENARIO_LOOP_TRACKS[1]);
    expect(trackKeyForScenarioTurn(SCENARIO_LOOP_TRACKS.length + 1)).toBe(
      SCENARIO_LOOP_TRACKS[0],
    );
  });

  test("falls back to the first scenario track for invalid turns", () => {
    expect(trackKeyForScenarioTurn(null)).toBe(SCENARIO_LOOP_TRACKS[0]);
    expect(trackKeyForScenarioTurn(0)).toBe(SCENARIO_LOOP_TRACKS[0]);
  });
});
