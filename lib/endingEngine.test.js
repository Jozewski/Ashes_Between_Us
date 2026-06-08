// lib/endingEngine.test.js
// Test suite for scoring and outcome determination

import { test, expect, describe } from 'vitest';
import { calculateEndingScore, deriveEndingState, analyzeStatProfile } from './endingEngine.js';

describe('calculateEndingScore', () => {
  test('calculates positive score for high hope and humanity', () => {
    const stats = { hope: 80, trust: 70, chaos: 20, humanity: 80 };
    const score = calculateEndingScore(stats);

    // NEW FORMULA:
    // constructive = (80 × 0.6) + (80 × 0.4) = 48 + 32 = 80
    // destructive = (20 × 0.4) + ((100 - 70) × 0.6) = 8 + 18 = 26
    // score = 80 - 26 = 54
    expect(score).toBe(54);
  });

  test('calculates negative score for high chaos and low trust', () => {
    const stats = { hope: 30, trust: 20, chaos: 90, humanity: 30 };
    const score = calculateEndingScore(stats);

    // NEW FORMULA:
    // constructive = (30 × 0.6) + (30 × 0.4) = 18 + 12 = 30
    // destructive = (90 × 0.4) + ((100 - 20) × 0.6) = 36 + 48 = 84
    // score = 30 - 84 = -54
    expect(score).toBe(-54);
  });

  test('calculates zero score for balanced stats', () => {
    const stats = { hope: 50, trust: 50, chaos: 50, humanity: 50 };
    const score = calculateEndingScore(stats);

    // constructive = (50 + 50) / 2 = 50
    // destructive = (50 * 0.7) + ((100 - 50) * 0.3) = 35 + 15 = 50
    // score = 50 - 50 = 0
    expect(score).toBe(0);
  });

  test('handles extreme high stats (all 100)', () => {
    const stats = { hope: 100, trust: 100, chaos: 0, humanity: 100 };
    const score = calculateEndingScore(stats);

    // constructive = (100 + 100) / 2 = 100
    // destructive = (0 * 0.7) + ((100 - 100) * 0.3) = 0 + 0 = 0
    // score = 100 - 0 = 100
    expect(score).toBe(100);
  });

  test('handles extreme low stats (worst case)', () => {
    const stats = { hope: 0, trust: 0, chaos: 100, humanity: 0 };
    const score = calculateEndingScore(stats);

    // constructive = (0 + 0) / 2 = 0
    // destructive = (100 * 0.7) + ((100 - 0) * 0.3) = 70 + 30 = 100
    // score = 0 - 100 = -100
    expect(score).toBe(-100);
  });
});

describe('deriveEndingState', () => {
  test('returns "chaotic" when chaos >= 75 and humanity <= 45', () => {
    const stats = { hope: 50, trust: 50, chaos: 80, humanity: 40 };
    expect(deriveEndingState(stats)).toBe('chaotic');
  });

  test('returns "chaotic" when chaos >= 70 (second condition)', () => {
    const stats = { hope: 50, trust: 50, chaos: 72, humanity: 60 };
    expect(deriveEndingState(stats)).toBe('chaotic');
  });

  test('returns "broken" when hope <= 25', () => {
    const stats = { hope: 20, trust: 50, chaos: 40, humanity: 50 };
    expect(deriveEndingState(stats)).toBe('broken');
  });

  test('returns "broken" when humanity <= 25', () => {
    const stats = { hope: 50, trust: 50, chaos: 40, humanity: 20 };
    expect(deriveEndingState(stats)).toBe('broken');
  });

  test('returns "broken" when chaos <= 20 and trust <= 35', () => {
    const stats = { hope: 50, trust: 30, chaos: 15, humanity: 50 };
    expect(deriveEndingState(stats)).toBe('broken');
  });

  test('returns "rebuilding" when hope >= 75, humanity >= 70, and chaos <= 40', () => {
    const stats = { hope: 80, trust: 60, chaos: 35, humanity: 75 };
    expect(deriveEndingState(stats)).toBe('rebuilding');
  });

  test('returns "balanced" as default fallback', () => {
    const stats = { hope: 50, trust: 50, chaos: 50, humanity: 50 };
    expect(deriveEndingState(stats)).toBe('balanced');
  });

  test('boundary case: exactly chaos=70 triggers chaotic', () => {
    const stats = { hope: 50, trust: 50, chaos: 70, humanity: 60 };
    expect(deriveEndingState(stats)).toBe('chaotic');
  });

  test('boundary case: exactly hope=25 triggers broken', () => {
    const stats = { hope: 25, trust: 50, chaos: 40, humanity: 50 };
    expect(deriveEndingState(stats)).toBe('broken');
  });

  // NEW TESTS - Testing priority changes
  test('PRIORITY: broken overrides chaotic when hope ≤ 25 (even with chaos ≥ 70)', () => {
    const stats = { hope: 20, trust: 50, chaos: 75, humanity: 50 };
    // Hope is critically low - should be "broken" not "chaotic"
    expect(deriveEndingState(stats)).toBe('broken');
  });

  test('PRIORITY: broken overrides chaotic when humanity ≤ 25 (even with chaos ≥ 70)', () => {
    const stats = { hope: 50, trust: 50, chaos: 80, humanity: 20 };
    // Humanity is critically low - should be "broken" not "chaotic"
    expect(deriveEndingState(stats)).toBe('broken');
  });

  test('PRIORITY: broken overrides chaotic when BOTH hope and humanity ≤ 25', () => {
    const stats = { hope: 15, trust: 50, chaos: 85, humanity: 10 };
    // Both hope AND humanity critically low - definitively "broken"
    expect(deriveEndingState(stats)).toBe('broken');
  });

  test('chaotic still wins when hope/humanity are moderate (> 25)', () => {
    const stats = { hope: 40, trust: 50, chaos: 75, humanity: 40 };
    // No critical hope/humanity - chaotic logic applies normally
    expect(deriveEndingState(stats)).toBe('chaotic');
  });

  test('STRICTER REBUILDING: chaos=50 should NOT allow rebuilding', () => {
    const stats = { hope: 80, trust: 60, chaos: 50, humanity: 75 };
    // Old threshold was ≤55, new is ≤40
    // chaos=50 is too high now - should be "balanced" not "rebuilding"
    expect(deriveEndingState(stats)).toBe('balanced');
  });

  test('STRICTER REBUILDING: chaos=40 should STILL allow rebuilding', () => {
    const stats = { hope: 80, trust: 60, chaos: 40, humanity: 75 };
    // Exactly at new threshold - should still be "rebuilding"
    expect(deriveEndingState(stats)).toBe('rebuilding');
  });

  test('STRICTER REBUILDING: chaos=41 should NOT allow rebuilding', () => {
    const stats = { hope: 80, trust: 60, chaos: 41, humanity: 75 };
    // Just over new threshold - should be "balanced" not "rebuilding"
    expect(deriveEndingState(stats)).toBe('balanced');
  });
});

describe('analyzeStatProfile', () => {
  test('categorizes stats as "high" when >= 75', () => {
    const stats = { hope: 80, trust: 90, chaos: 75, humanity: 100 };
    const profile = analyzeStatProfile(stats);

    expect(profile.hope).toBe('high');
    expect(profile.trust).toBe('high');
    expect(profile.chaos).toBe('high');
    expect(profile.humanity).toBe('high');
  });

  test('categorizes stats as "moderate" when >= 50 and < 75', () => {
    const stats = { hope: 60, trust: 50, chaos: 74, humanity: 65 };
    const profile = analyzeStatProfile(stats);

    expect(profile.hope).toBe('moderate');
    expect(profile.trust).toBe('moderate');
    expect(profile.chaos).toBe('moderate');
    expect(profile.humanity).toBe('moderate');
  });

  test('categorizes stats as "low" when >= 25 and < 50', () => {
    const stats = { hope: 40, trust: 25, chaos: 49, humanity: 30 };
    const profile = analyzeStatProfile(stats);

    expect(profile.hope).toBe('low');
    expect(profile.trust).toBe('low');
    expect(profile.chaos).toBe('low');
    expect(profile.humanity).toBe('low');
  });

  test('categorizes stats as "critical" when < 25', () => {
    const stats = { hope: 10, trust: 0, chaos: 24, humanity: 15 };
    const profile = analyzeStatProfile(stats);

    expect(profile.hope).toBe('critical');
    expect(profile.trust).toBe('critical');
    expect(profile.chaos).toBe('critical');
    expect(profile.humanity).toBe('critical');
  });

  test('boundary case: exactly 75 is "high"', () => {
    const stats = { hope: 75, trust: 75, chaos: 75, humanity: 75 };
    const profile = analyzeStatProfile(stats);

    expect(profile.hope).toBe('high');
    expect(profile.trust).toBe('high');
    expect(profile.chaos).toBe('high');
    expect(profile.humanity).toBe('high');
  });
});
