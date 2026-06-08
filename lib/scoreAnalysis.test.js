// lib/scoreAnalysis.test.js
// Analysis of current scoring formula behavior and potential improvements

import { test, expect, describe } from 'vitest';
import { calculateEndingScore } from './endingEngine.js';

describe('Current Score Formula - Behavior Analysis', () => {
  test('FIXED: Trust now has MAJOR impact (60% weight)', () => {
    // Scenario A: High chaos, low trust
    const scenarioA = { hope: 50, trust: 0, chaos: 100, humanity: 50 };
    const scoreA = calculateEndingScore(scenarioA);
    // NEW FORMULA:
    // constructive = (50 × 0.6) + (50 × 0.4) = 30 + 20 = 50
    // destructive = (100 × 0.4) + (100 × 0.6) = 40 + 60 = 100
    // score = 50 - 100 = -50
    expect(scoreA).toBe(-50);

    // Scenario B: High chaos, HIGH trust (only trust changes)
    const scenarioB = { hope: 50, trust: 100, chaos: 100, humanity: 50 };
    const scoreB = calculateEndingScore(scenarioB);
    // NEW FORMULA:
    // constructive = 50
    // destructive = (100 × 0.4) + (0 × 0.6) = 40 + 0 = 40
    // score = 50 - 40 = 10
    expect(scoreB).toBe(10);

    // Trust improved by 100 points → score improved by 60 (0.6 weight)!
    const improvement = scoreB - scoreA;
    expect(improvement).toBe(60); // Much bigger impact now!
  });

  test('FIXED: Hope now weighs MORE than humanity (60/40)', () => {
    const highHope = { hope: 100, trust: 50, chaos: 50, humanity: 50 };
    const highHumanity = { hope: 50, trust: 50, chaos: 50, humanity: 100 };

    const scoreHope = calculateEndingScore(highHope);
    const scoreHumanity = calculateEndingScore(highHumanity);

    // Hope-focused survivors now score HIGHER
    expect(scoreHope).toBeGreaterThan(scoreHumanity);
    expect(scoreHope).toBe(30); // (100×0.6 + 50×0.4) - 50 = 80 - 50
    expect(scoreHumanity).toBe(20); // (50×0.6 + 100×0.4) - 50 = 70 - 50
  });

  test('ANALYSIS: No "synergy" bonuses for aligned high stats', () => {
    // Scenario A: Balanced moderate stats
    const balanced = { hope: 60, trust: 60, chaos: 40, humanity: 60 };
    const scoreBalanced = calculateEndingScore(balanced);
    // constructive = (60 + 60) / 2 = 60
    // destructive = (40 × 0.7) + (40 × 0.3) = 28 + 12 = 40
    // score = 60 - 40 = 20

    // Scenario B: All constructive stats high (should this get a bonus?)
    const allHigh = { hope: 80, trust: 80, chaos: 20, humanity: 80 };
    const scoreAllHigh = calculateEndingScore(allHigh);
    // constructive = (80 + 80) / 2 = 80
    // destructive = (20 × 0.7) + (20 × 0.3) = 14 + 6 = 20
    // score = 80 - 20 = 60

    // Linear increase - no synergy bonus for all stats being aligned
    expect(scoreBalanced).toBe(20);
    expect(scoreAllHigh).toBe(60);
  });

  test('FIXED: Trust now dominates (60% vs chaos 40%)', () => {
    const highChaos = { hope: 50, trust: 50, chaos: 100, humanity: 50 };
    const lowTrust = { hope: 50, trust: 0, chaos: 50, humanity: 50 };

    const scoreChaos = calculateEndingScore(highChaos);
    const scoreTrust = calculateEndingScore(lowTrust);

    // NEW FORMULA:
    // High chaos impact: destructive = (100 × 0.4) + (50 × 0.6) = 40 + 30 = 70
    // Low trust impact: destructive = (50 × 0.4) + (100 × 0.6) = 20 + 60 = 80

    expect(scoreChaos).toBe(-20); // 50 - 70
    expect(scoreTrust).toBe(-30); // 50 - 80

    // Trust is now MORE impactful than chaos (0.6 vs 0.4)!
  });

  test('ANALYSIS: Edge case - perfect world score', () => {
    const perfect = { hope: 100, trust: 100, chaos: 0, humanity: 100 };
    const score = calculateEndingScore(perfect);
    expect(score).toBe(100); // Maximum possible
  });

  test('ANALYSIS: Edge case - worst apocalypse score', () => {
    const worst = { hope: 0, trust: 0, chaos: 100, humanity: 0 };
    const score = calculateEndingScore(worst);
    expect(score).toBe(-100); // Minimum possible
  });

  test('ANALYSIS: What score range is "good" vs "bad"?', () => {
    // We have no tests that establish what scores mean narratively
    // Is 20 good? Is -10 bad? Where's the threshold?

    const scenarios = [
      { name: 'Decent rebuild', stats: { hope: 75, trust: 65, chaos: 35, humanity: 70 } },
      { name: 'Struggling', stats: { hope: 45, trust: 40, chaos: 60, humanity: 45 } },
      { name: 'Barely surviving', stats: { hope: 30, trust: 30, chaos: 70, humanity: 35 } },
    ];

    scenarios.forEach(({ name, stats }) => {
      const score = calculateEndingScore(stats);
      console.log(`${name}: score = ${score}`);
      // No assertions - just analyzing the range
    });

    // This test always passes - it's for observation
    expect(true).toBe(true);
  });
});

describe('Potential Improvements to Consider', () => {
  test('IDEA: Should trust weigh more? (equal to chaos)', () => {
    // Current: trust is only 30% of destructive, chaos is 70%
    // Alternative: trust and chaos both 50%?

    const stats = { hope: 50, trust: 100, chaos: 50, humanity: 50 };

    // Current formula
    const currentDestructive = (stats.chaos * 0.7) + ((100 - stats.trust) * 0.3);
    expect(currentDestructive).toBe(35); // 35 + 0

    // Alternative: equal weighting
    const alternativeDestructive = (stats.chaos * 0.5) + ((100 - stats.trust) * 0.5);
    expect(alternativeDestructive).toBe(25); // 25 + 0

    // High trust would have MORE impact with equal weighting
  });

  test('IDEA: Should hope weigh more than humanity?', () => {
    // Hope = motivation to rebuild
    // Humanity = ethical behavior
    // Is one more important for scoring?

    const highHope = { hope: 100, trust: 50, chaos: 50, humanity: 50 };
    const highHumanity = { hope: 50, trust: 50, chaos: 50, humanity: 100 };

    // Current: both produce same score (equal weight)
    // Alternative: hope × 0.6 + humanity × 0.4?

    const currentHope = (highHope.hope + highHope.humanity) / 2;
    const currentHumanity = (highHumanity.hope + highHumanity.humanity) / 2;
    expect(currentHope).toBe(currentHumanity); // Equal

    const alternativeHope = (highHope.hope * 0.6) + (highHope.humanity * 0.4);
    const alternativeHumanity = (highHumanity.hope * 0.6) + (highHumanity.humanity * 0.4);
    expect(alternativeHope).toBe(80); // 60 + 20
    expect(alternativeHumanity).toBe(70); // 30 + 40

    // Hope-focused survivors would score higher
  });

  test('IDEA: Synergy bonuses for aligned stats', () => {
    // Should "all stats high" get a bonus beyond linear sum?
    const allHigh = { hope: 90, trust: 90, chaos: 10, humanity: 90 };
    const oneHigh = { hope: 90, trust: 50, chaos: 50, humanity: 50 };

    // Current scoring: no bonus for alignment
    // Alternative: +10 bonus if all constructive stats > 75 AND chaos < 25?

    const currentAllHigh = calculateEndingScore(allHigh);
    const currentOneHigh = calculateEndingScore(oneHigh);

    console.log('All high:', currentAllHigh);
    console.log('One high:', currentOneHigh);

    // Could add synergy bonus in future implementation
    expect(true).toBe(true);
  });

  test('PLANNED: Avatar-specific scoring (not yet implemented)', () => {
    // Should a Medic's humanity count more than a Scout's?
    // Should a Guardian's trust count more than a Scavenger's?

    const medicStats = { hope: 60, trust: 60, chaos: 40, humanity: 90 };
    const scoutStats = { hope: 90, trust: 60, chaos: 40, humanity: 60 };

    // With NEW base formula:
    const medicScore = calculateEndingScore(medicStats);
    const scoutScore = calculateEndingScore(scoutStats);

    // NEW FORMULA makes them different now:
    // medicScore: (60×0.6 + 90×0.4) - (40×0.4 + 40×0.6) = 72 - 40 = 32
    // scoutScore: (90×0.6 + 60×0.4) - (40×0.4 + 40×0.6) = 78 - 40 = 38
    expect(medicScore).toBe(32);
    expect(scoutScore).toBe(38);

    // Scout scores higher due to hope weighting
    // Future: could add avatar-specific multipliers on top of this
  });
});
