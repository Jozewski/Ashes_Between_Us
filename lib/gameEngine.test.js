// lib/gameEngine.test.js
// Test suite for stat application and game mechanics

import { test, expect, describe } from 'vitest';
import { applyChoiceToStats } from './gameEngine.js';

describe('applyChoiceToStats', () => {
  test('applies positive changes to all stats', () => {
    const currentStats = { hope: 50, trust: 50, chaos: 50, humanity: 50 };
    const choice = {
      hopeChange: 10,
      trustChange: 15,
      chaosChange: 5,
      humanityChange: 20,
    };

    const result = applyChoiceToStats({ choice, currentStats });

    expect(result).toEqual({
      hope: 60,
      trust: 65,
      chaos: 55,
      humanity: 70,
    });
  });

  test('applies negative changes to all stats', () => {
    const currentStats = { hope: 50, trust: 50, chaos: 50, humanity: 50 };
    const choice = {
      hopeChange: -20,
      trustChange: -10,
      chaosChange: 15,
      humanityChange: -5,
    };

    const result = applyChoiceToStats({ choice, currentStats });

    expect(result).toEqual({
      hope: 30,
      trust: 40,
      chaos: 65,
      humanity: 45,
    });
  });

  test('clamps stats at upper bound (100)', () => {
    const currentStats = { hope: 95, trust: 90, chaos: 85, humanity: 99 };
    const choice = {
      hopeChange: 10,   // 95 + 10 = 105, should clamp to 100
      trustChange: 15,  // 90 + 15 = 105, should clamp to 100
      chaosChange: 20,  // 85 + 20 = 105, should clamp to 100
      humanityChange: 5, // 99 + 5 = 104, should clamp to 100
    };

    const result = applyChoiceToStats({ choice, currentStats });

    expect(result).toEqual({
      hope: 100,
      trust: 100,
      chaos: 100,
      humanity: 100,
    });
  });

  test('clamps stats at lower bound (0)', () => {
    const currentStats = { hope: 10, trust: 5, chaos: 8, humanity: 3 };
    const choice = {
      hopeChange: -15,  // 10 - 15 = -5, should clamp to 0
      trustChange: -10, // 5 - 10 = -5, should clamp to 0
      chaosChange: -20, // 8 - 20 = -12, should clamp to 0
      humanityChange: -5, // 3 - 5 = -2, should clamp to 0
    };

    const result = applyChoiceToStats({ choice, currentStats });

    expect(result).toEqual({
      hope: 0,
      trust: 0,
      chaos: 0,
      humanity: 0,
    });
  });

  test('handles choice with no changes (all undefined)', () => {
    const currentStats = { hope: 60, trust: 70, chaos: 40, humanity: 80 };
    const choice = {}; // No change properties

    const result = applyChoiceToStats({ choice, currentStats });

    expect(result).toEqual({
      hope: 60,
      trust: 70,
      chaos: 40,
      humanity: 80,
    });
  });

  test('handles choice with null values (treats as 0)', () => {
    const currentStats = { hope: 50, trust: 50, chaos: 50, humanity: 50 };
    const choice = {
      hopeChange: null,
      trustChange: null,
      chaosChange: null,
      humanityChange: null,
    };

    const result = applyChoiceToStats({ choice, currentStats });

    expect(result).toEqual({
      hope: 50,
      trust: 50,
      chaos: 50,
      humanity: 50,
    });
  });

  test('handles choice with string numbers', () => {
    const currentStats = { hope: 50, trust: 50, chaos: 50, humanity: 50 };
    const choice = {
      hopeChange: "10",
      trustChange: "-5",
      chaosChange: "15",
      humanityChange: "0",
    };

    const result = applyChoiceToStats({ choice, currentStats });

    expect(result).toEqual({
      hope: 60,
      trust: 45,
      chaos: 65,
      humanity: 50,
    });
  });

  test('handles partial stat changes (some undefined)', () => {
    const currentStats = { hope: 40, trust: 60, chaos: 30, humanity: 70 };
    const choice = {
      hopeChange: 20,
      // trustChange is undefined
      chaosChange: -10,
      // humanityChange is undefined
    };

    const result = applyChoiceToStats({ choice, currentStats });

    expect(result).toEqual({
      hope: 60,
      trust: 60,  // unchanged
      chaos: 20,
      humanity: 70, // unchanged
    });
  });

  test('normalizes malformed input stats (missing properties)', () => {
    const currentStats = { hope: 60, trust: 80 }; // Missing chaos and humanity
    const choice = {
      hopeChange: 10,
      trustChange: 5,
      chaosChange: 15,
      humanityChange: 20,
    };

    const result = applyChoiceToStats({ choice, currentStats });

    // Missing stats should default to 50, then have changes applied
    expect(result).toEqual({
      hope: 70,
      trust: 85,
      chaos: 65,  // 50 (default) + 15
      humanity: 70, // 50 (default) + 20
    });
  });

  test('normalizes malformed input stats (null values)', () => {
    const currentStats = { hope: null, trust: 60, chaos: null, humanity: 80 };
    const choice = {
      hopeChange: 10,
      trustChange: 5,
      chaosChange: 15,
      humanityChange: -10,
    };

    const result = applyChoiceToStats({ choice, currentStats });

    // Null stats should default to 50
    expect(result).toEqual({
      hope: 60,   // 50 (default from null) + 10
      trust: 65,
      chaos: 65,  // 50 (default from null) + 15
      humanity: 70,
    });
  });

  test('extreme case: massive positive change still clamps at 100', () => {
    const currentStats = { hope: 50, trust: 50, chaos: 50, humanity: 50 };
    const choice = {
      hopeChange: 1000,
      trustChange: 999,
      chaosChange: 500,
      humanityChange: 10000,
    };

    const result = applyChoiceToStats({ choice, currentStats });

    expect(result).toEqual({
      hope: 100,
      trust: 100,
      chaos: 100,
      humanity: 100,
    });
  });

  test('extreme case: massive negative change still clamps at 0', () => {
    const currentStats = { hope: 50, trust: 50, chaos: 50, humanity: 50 };
    const choice = {
      hopeChange: -1000,
      trustChange: -999,
      chaosChange: -500,
      humanityChange: -10000,
    };

    const result = applyChoiceToStats({ choice, currentStats });

    expect(result).toEqual({
      hope: 0,
      trust: 0,
      chaos: 0,
      humanity: 0,
    });
  });

  test('boundary case: stat at 0 can increase', () => {
    const currentStats = { hope: 0, trust: 0, chaos: 0, humanity: 0 };
    const choice = {
      hopeChange: 25,
      trustChange: 50,
      chaosChange: 75,
      humanityChange: 100,
    };

    const result = applyChoiceToStats({ choice, currentStats });

    expect(result).toEqual({
      hope: 25,
      trust: 50,
      chaos: 75,
      humanity: 100,
    });
  });

  test('boundary case: stat at 100 can decrease', () => {
    const currentStats = { hope: 100, trust: 100, chaos: 100, humanity: 100 };
    const choice = {
      hopeChange: -25,
      trustChange: -50,
      chaosChange: -75,
      humanityChange: -100,
    };

    const result = applyChoiceToStats({ choice, currentStats });

    expect(result).toEqual({
      hope: 75,
      trust: 50,
      chaos: 25,
      humanity: 0,
    });
  });

  test('real game scenario: Scout discovers supplies (hope +15, trust +5, chaos -10)', () => {
    const currentStats = { hope: 45, trust: 60, chaos: 55, humanity: 50 };
    const choice = {
      hopeChange: 15,
      trustChange: 5,
      chaosChange: -10,
      humanityChange: 0,
    };

    const result = applyChoiceToStats({ choice, currentStats });

    expect(result).toEqual({
      hope: 60,
      trust: 65,
      chaos: 45,
      humanity: 50,
    });
  });
});
