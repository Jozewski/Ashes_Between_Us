export const SCENARIO_LOOP_TRACKS = [
  "lowRuins",
  "radioTension",
  "bunkerDread",
  "chaosPercussion",
  "desertHighway",
  "forestHope",
  "timelineMystery",
];

export function trackKeyForScenarioTurn(turn) {
  const numericTurn = Number(turn);
  const index = Number.isFinite(numericTurn) && numericTurn > 0
    ? Math.floor(numericTurn) - 1
    : 0;

  return SCENARIO_LOOP_TRACKS[index % SCENARIO_LOOP_TRACKS.length];
}
