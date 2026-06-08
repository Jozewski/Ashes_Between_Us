// lib/improvedScoring.test.js
// Tests for IMPROVED scoring formula with avatar-specific weights

import { test, expect, describe } from 'vitest';
import { calculateEndingScore } from './endingEngine.js';

describe('Improved Base Formula - Trust and Hope Prioritized', () => {
  test('NEW FORMULA: Trust has more impact than chaos (60% vs 40%)', () => {
    // Test the new weighting: trust matters MORE than chaos
    const highTrust = { hope: 50, trust: 100, chaos: 50, humanity: 50 };

    // NEW formula calculation:
    // constructive = (hope × 0.6) + (humanity × 0.4) = (50 × 0.6) + (50 × 0.4) = 30 + 20 = 50
    // destructive = (chaos × 0.4) + ((100 - trust) × 0.6) = (50 × 0.4) + (0 × 0.6) = 20 + 0 = 20
    // score = 50 - 20 = 30

    const score = calculateEndingScore(highTrust);
    expect(score).toBe(30);
  });

  test('NEW FORMULA: Hope weighs more than humanity (60% vs 40%)', () => {
    const highHope = { hope: 100, trust: 50, chaos: 50, humanity: 50 };
    const highHumanity = { hope: 50, trust: 50, chaos: 50, humanity: 100 };

    // High hope: constructive = (100 × 0.6) + (50 × 0.4) = 60 + 20 = 80
    // High humanity: constructive = (50 × 0.6) + (100 × 0.4) = 30 + 40 = 70

    const scoreHope = calculateEndingScore(highHope);
    const scoreHumanity = calculateEndingScore(highHumanity);

    // Hope-focused survivor should score HIGHER
    expect(scoreHope).toBeGreaterThan(scoreHumanity);
    expect(scoreHope).toBe(30); // 80 - 50
    expect(scoreHumanity).toBe(20); // 70 - 50
  });

  test('NEW FORMULA: Improving trust has bigger impact than reducing chaos', () => {
    const baseStats = { hope: 50, trust: 50, chaos: 50, humanity: 50 };
    const improvedTrust = { hope: 50, trust: 100, chaos: 50, humanity: 50 };
    const improvedChaos = { hope: 50, trust: 50, chaos: 0, humanity: 50 };

    const baseScore = calculateEndingScore(baseStats);
    const trustScore = calculateEndingScore(improvedTrust);
    const chaosScore = calculateEndingScore(improvedChaos);

    const trustImpact = trustScore - baseScore;
    const chaosImpact = chaosScore - baseScore;

    // Trust improvement (+50 points) should have BIGGER impact than chaos reduction (-50 points)
    expect(trustImpact).toBeGreaterThan(chaosImpact);

    // Specific expected impacts:
    // Trust: (100-50) × 0.6 = 50 × 0.6 = 30 point improvement
    // Chaos: 50 × 0.4 = 20 point improvement
    expect(trustImpact).toBe(30);
    expect(chaosImpact).toBe(20);
  });

  test('NEW FORMULA: Perfect world still scores 100', () => {
    const perfect = { hope: 100, trust: 100, chaos: 0, humanity: 100 };
    // constructive = (100 × 0.6) + (100 × 0.4) = 60 + 40 = 100
    // destructive = (0 × 0.4) + (0 × 0.6) = 0
    // score = 100 - 0 = 100
    expect(calculateEndingScore(perfect)).toBe(100);
  });

  test('NEW FORMULA: Worst apocalypse still scores -100', () => {
    const worst = { hope: 0, trust: 0, chaos: 100, humanity: 0 };
    // constructive = (0 × 0.6) + (0 × 0.4) = 0
    // destructive = (100 × 0.4) + (100 × 0.6) = 40 + 60 = 100
    // score = 0 - 100 = -100
    expect(calculateEndingScore(worst)).toBe(-100);
  });

  test('NEW FORMULA: Balanced stats produce neutral score', () => {
    const balanced = { hope: 50, trust: 50, chaos: 50, humanity: 50 };
    // constructive = (50 × 0.6) + (50 × 0.4) = 30 + 20 = 50
    // destructive = (50 × 0.4) + (50 × 0.6) = 20 + 30 = 50
    // score = 50 - 50 = 0
    expect(calculateEndingScore(balanced)).toBe(0);
  });

  test('REAL SCENARIO: High-trust low-chaos community scores well', () => {
    // A community that's built trust and reduced chaos
    const stats = { hope: 70, trust: 85, chaos: 25, humanity: 60 };

    // constructive = (70 × 0.6) + (60 × 0.4) = 42 + 24 = 66
    // destructive = (25 × 0.4) + (15 × 0.6) = 10 + 9 = 19
    // score = 66 - 19 = 47

    expect(calculateEndingScore(stats)).toBe(47);
  });

  test('REAL SCENARIO: High hope drives score even with moderate humanity', () => {
    // A hopeful but ethically imperfect community
    const stats = { hope: 90, trust: 60, chaos: 40, humanity: 50 };

    // constructive = (90 × 0.6) + (50 × 0.4) = 54 + 20 = 74
    // destructive = (40 × 0.4) + (40 × 0.6) = 16 + 24 = 40
    // score = 74 - 40 = 34

    expect(calculateEndingScore(stats)).toBe(34);
  });
});

describe('Avatar-Specific Scoring Weights (Future)', () => {
  // These tests will FAIL until we implement avatar-specific scoring
  // For now, they document the intended behavior

  test.skip('MEDIC: Humanity weighs more (70% instead of 40%)', () => {
    const medicStats = { hope: 60, trust: 60, chaos: 40, humanity: 90 };

    // Medic formula: constructive = (hope × 0.5) + (humanity × 0.5)
    // Standard would be: (60 × 0.6) + (90 × 0.4) = 36 + 36 = 72
    // Medic boost: (60 × 0.5) + (90 × 0.5) = 30 + 45 = 75

    // For now, this will use standard formula
    // TODO: Implement avatar-specific weights
  });

  test.skip('GUARDIAN: Trust weighs more (70% instead of 60%)', () => {
    const guardianStats = { hope: 60, trust: 90, chaos: 30, humanity: 60 };

    // Guardian should get bonus for high trust
    // TODO: Implement avatar-specific weights
  });

  test.skip('SCOUT: Hope weighs more (70% instead of 60%)', () => {
    const scoutStats = { hope: 90, trust: 60, chaos: 40, humanity: 60 };

    // Scout should get bonus for high hope
    // TODO: Implement avatar-specific weights
  });
});
