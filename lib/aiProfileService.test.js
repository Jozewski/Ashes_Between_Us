import { describe, expect, test } from "vitest";
import { AVATARS } from "./mockData.js";
import {
  buildFallbackProfile,
  buildProfilePrompt,
} from "./aiProfileService.js";

const avatar = AVATARS[0];

describe("AI player profile prompt", () => {
  test("keeps the backstory focused on the pre-collapse beginning", () => {
    const prompt = buildProfilePrompt({
      avatar,
      stats: { hope: 70, trust: 62, chaos: 28, humanity: 74 },
      recentChoices: [
        {
          scenarioTitle: "The Surveyor's Bell",
          choiceText: "Wait and read the tunnel pattern before moving.",
          outcome: "Patience reveals the hidden route.",
          statsAfter: { hope: 70, trust: 62, chaos: 28, humanity: 74 },
        },
      ],
      username: "Jo",
      futureState: "rebuilding",
    });

    expect(prompt).toContain("pre-collapse beginning story");
    expect(prompt).toContain('If the username is not "Traveler", use it naturally');
    expect(prompt).toContain("before the collapse event");
    expect(prompt).toContain("must not recap the run, final stats, or final future state");
    expect(prompt).toContain("one about interpreting future transmissions");
  });

  test("fallback backstory does not recap final stats or future notes", () => {
    const profile = buildFallbackProfile({
      avatar,
      stats: { hope: 70, trust: 62, chaos: 28, humanity: 74 },
      futureState: "rebuilding",
      username: "Jo",
    });

    expect(profile.profileTitle).toContain("Jo");
    expect(profile.backstory).toContain("Before the collapse");
    expect(profile.backstory).toContain("Jo");
    expect(profile.backstory).not.toContain("hope 70");
    expect(profile.backstory).not.toContain("trust 62");
    expect(profile.futureNotes).toHaveLength(3);
    expect(new Set(profile.futureNotes).size).toBe(3);
  });
});
