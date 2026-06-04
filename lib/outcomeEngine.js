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
