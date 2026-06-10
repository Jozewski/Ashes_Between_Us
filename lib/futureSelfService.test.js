import { describe, expect, test } from "vitest";
import { pickBestImageFromPrompt } from "./futureSelfService.js";

describe("pickBestImageFromPrompt", () => {
  test("uses full generated scenario context to select an engineer bridge scene", () => {
    const imageUrl = pickBestImageFromPrompt(
      {
        title: "Bridge Under Load",
        setting:
          "A cracked bridge is the only route between the clinic district and the water pumps. Repair crews argue over whether to reinforce the central span or reroute the convoy before nightfall.",
        futureSelfMessage:
          "A crossing can save people, but only if it is still standing when they reach it.",
        imagePrompt: "Engineers working on damaged concrete supports over a river.",
      },
      [],
      "engineer",
    );

    expect(imageUrl).toBe(
      "/images/scenarios/engineer/avatar-engineer-bridge-restoration-project.png",
    );
  });

  test("matches medical scenario text even when the image prompt is generic", () => {
    const imageUrl = pickBestImageFromPrompt(
      {
        title: "Overflow Ward",
        setting:
          "The fever ward has run out of cots. Families crowd the clinic hallway while a medic decides who gets the last clean isolation room.",
        futureSelfMessage:
          "The sickness was not the only thing spreading through that hallway.",
        imagePrompt: "A tense interior scene with exhausted survivors waiting.",
      },
      [],
      "medic",
    );

    expect(imageUrl).toBe(
      "/images/scenarios/medic/avatar-medic-fever-ward-overflow.png",
    );
  });

  test("allows a strong repeated match instead of forcing an unrelated unused image", () => {
    const imageUrl = pickBestImageFromPrompt(
      {
        title: "The Radio Lie",
        setting:
          "A hidden broadcaster has turned the shelter radio room into a weapon. False warnings move families away from water while the signal keeps repeating.",
        futureSelfMessage:
          "Do not mistake a loud signal for a truthful one.",
        imagePrompt:
          "Misinformation radio room, accused broadcaster, signal equipment, false warning.",
      },
      [
        "/images/scenarios/scout/avatar-scout-misinformation-radio-room.png",
        "/images/backgrounds/misinformation-radio-room.png",
      ],
      "scout",
    );

    expect(imageUrl).toBe(
      "/images/scenarios/scout/avatar-scout-misinformation-radio-room.png",
    );
  });
});
