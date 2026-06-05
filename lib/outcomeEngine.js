export function clampStat(value) {
  return Math.max(0, Math.min(100, value));
}

export function calculateImportance(statsAfter) {
  if (!statsAfter || typeof statsAfter !== "object") {
    return 0;
  }

  const center = 50;
  return Math.round(
    Math.abs((statsAfter.hope ?? center) - center) +
      Math.abs((statsAfter.trust ?? center) - center) +
      Math.abs((statsAfter.chaos ?? center) - center) +
      Math.abs((statsAfter.humanity ?? center) - center),
  );
}

export function normalizeStatsPayload(body) {
  const nestedStats = body?.statsAfter ?? body?.stats ?? body?.currentStats;

  if (nestedStats && typeof nestedStats === "object") {
    return {
      hope: Number(nestedStats.hope ?? body.hope ?? 0),
      trust: Number(nestedStats.trust ?? body.trust ?? 0),
      chaos: Number(nestedStats.chaos ?? body.chaos ?? 0),
      humanity: Number(nestedStats.humanity ?? body.humanity ?? 0),
    };
  }

  return {
    hope: Number(body.hope ?? 0),
    trust: Number(body.trust ?? 0),
    chaos: Number(body.chaos ?? 0),
    humanity: Number(body.humanity ?? 0),
  };
}

export const OUTCOME_IMAGE_BY_STATE = {
  rebuilding: "/images/outcomes/ending-rebuilding-future.png",
  balanced: "/images/outcomes/ending-balanced-future.png",
  chaotic: "/images/outcomes/ending-chaotic-future.png",
  broken: "/images/outcomes/ending-broken-future.png",
};

export function deriveFutureStateFromStats(stats) {
  const hope = Number(stats?.hope ?? 0);
  const trust = Number(stats?.trust ?? 0);
  const chaos = Number(stats?.chaos ?? 0);
  const humanity = Number(stats?.humanity ?? 0);

  if (chaos >= 75 && humanity <= 45) return "chaotic";
  if (chaos >= 70) return "chaotic";
  if (hope <= 25 || humanity <= 25) return "broken";
  if (chaos <= 20 && trust <= 35) return "broken";
  if (hope >= 75 && humanity >= 70 && chaos <= 55) return "rebuilding";
  return "balanced";
}

export function getOutcomeImageForStats(stats) {
  const state = deriveFutureStateFromStats(stats);
  return OUTCOME_IMAGE_BY_STATE[state] ?? OUTCOME_IMAGE_BY_STATE.balanced;
}
