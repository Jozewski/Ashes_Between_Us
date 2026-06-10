import { describe, expect, test } from "vitest";
import {
  buildEndingStoryPrompt,
  buildFallbackEndingStory,
} from "./aiEndingStoryService.js";

const avatar = {
  id: "scout",
  name: "The Scout",
  trait: "Observant",
  description: "Finds safe routes through unstable territory.",
  backstory: "The Scout learned to read roads as promises people often break.",
};

const attempts = [
  {
    scenarioTitle: "The Surveyor's Bell",
    scenarioSetting: "A bell rings from a flooded tunnel with three marked exits.",
    scenarioFutureMsg:
      "The right path was not the quiet one; it was the one whose danger you could name.",
    choiceText: "Watch the tunnel bell from cover before moving anyone.",
    outcome: "Patience reveals the hidden pattern.",
    hope: 52,
    trust: 58,
    chaos: 31,
    humanity: 55,
  },
  {
    scenarioTitle: "Red Snow at the Pass",
    scenarioSetting: "Red snow marks safe steps across ice while a wounded stranger erases them.",
    scenarioFutureMsg:
      "The pass did not ask whether mercy was efficient. It only showed what your footprints cost.",
    choiceText: "Mark the safest route around the red snow.",
    outcome: "The crossing slows, but fewer people fall through.",
    hope: 70,
    trust: 68,
    chaos: 22,
    humanity: 76,
  },
];

describe("AI ending story prompt", () => {
  test("requires avatar-specific explanation of choices and future transmissions", () => {
    const prompt = buildEndingStoryPrompt({
      avatar,
      stats: { hope: 70, trust: 68, chaos: 22, humanity: 76 },
      attempts,
      username: "Jo",
      endingState: "balanced",
      endingScore: 42,
      localEnding: {
        title: "THE SCOUT",
        narrative: "Routes shaped the future.",
      },
    });

    expect(prompt).toContain("avatar name: The Scout");
    expect(prompt).toContain("The Surveyor's Bell");
    expect(prompt).toContain("Red Snow at the Pass");
    expect(prompt).toContain("Future transmission:");
    expect(prompt).toContain("whether they listened, misunderstood");
    expect(prompt).toContain("explaining why the rendered ending outcome happened");
    expect(prompt).toContain("Reference at least three concrete scenario moments");
    expect(prompt).toContain('Use the player\'s username, "Jo", naturally at least once');
  });

  test("fallback ending story includes stats, ending result, and signal reading", () => {
    const story = buildFallbackEndingStory({
      avatar,
      stats: { hope: 70, trust: 68, chaos: 22, humanity: 76 },
      attempts,
      username: "Jo",
      endingState: "balanced",
      endingScore: 42,
    });

    expect(story.title).toBeTruthy();
    expect(story.summary).toContain("Jo's timeline");
    expect(story.summary).toContain("balanced outcome");
    expect(story.summary).toContain("score 42");
    expect(story.futureSignalReading).toContain("future transmissions");
    expect(story.closingLine).toBeTruthy();
  });
});
