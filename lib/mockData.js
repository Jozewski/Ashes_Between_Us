// lib/mockData.js
// Swap this out once the backend /api/scenarios is live.
// Shape matches the Prisma schema exactly.

export const MOCK_SCENARIOS = [
  {
    id: "scenario-01",
    title: "The Radio Tower",
    setting: "Day 14 post-collapse. You find a working radio tower on the edge of town. Static crackles across every channel — then a voice breaks through. Someone is broadcasting coordinates. The signal is strong. Others nearby can hear it too.",
    futureMsg:
      "Don't broadcast the coordinates publicly. I know it feels like the right thing — people need shelter. But the wrong group finds that location first, and everything you've built burns. Share them privately with the ones you trust.",
    imageUrl: "/images/radio-tower.png",
    choices: [
      {
        id: "c-01a",
        text: "Broadcast the coordinates on all channels. Everyone deserves a chance.",
        outcome:
          "You open the channel. Within hours, over sixty people arrive. Most are desperate families — but a militia unit follows the signal too. The shelter holds, barely. The future shifts in ways you can't yet see.",
        hopeChange: 12,
        trustChange: -8,
        chaosChange: 20,
        humanityChange: 0,
      },
      {
        id: "c-01b",
        text: "Share the coordinates only with your inner group. Keep quiet for now.",
        outcome:
          "Your group reaches the shelter before dawn. It is cramped but safe. Somewhere behind you, others are still searching. The weight of that choice settles slowly.",
        hopeChange: -5,
        trustChange: 15,
        chaosChange: 0,
        humanityChange: 0,
      },
      {
        id: "c-01c",
        text: "Destroy the transmitter. No one should have this information.",
        outcome:
          "The tower goes dark. No one finds the shelter tonight. In the silence afterward, you wonder if you made the right call — or just the safe one.",
        hopeChange: -15,
        trustChange: 0,
        chaosChange: -10,
        humanityChange: -12,
      },
    ],
  },
  {
    id: "scenario-02",
    title: "The Supply Cache",
    setting:
      "Day 21. Your scout returns with news: an untouched pharmacy two blocks east. Enough medicine to keep your group healthy for weeks. But another group is camped nearby — they look desperate.",
    futureMsg:
      "You share the medicine. I know that sounds naive from where you're standing, but the group you help today becomes your closest allies in week six. Don't let fear make this decision for you.",
    imageUrl: "/images/ruined-city.png",
    choices: [
      {
        id: "c-02a",
        text: "Take everything and leave before the other group notices.",
        outcome:
          "Your group is well-stocked. The other group finds nothing. Two weeks later, you recognize their faces — on the other side of a barricade.",
        hopeChange: 0,
        trustChange: -10,
        chaosChange: 5,
        humanityChange: -15,
      },
      {
        id: "c-02b",
        text: "Approach the other group and propose splitting the cache.",
        outcome:
          "It's tense at first. Then someone laughs at something — and the tension breaks. You leave with half the medicine and something more valuable: allies.",
        hopeChange: 18,
        trustChange: 20,
        chaosChange: -5,
        humanityChange: 15,
      },
    ],
  },
];

export const INITIAL_STATS = {
  hope: 65,
  trust: 50,
  chaos: 30,
  humanity: 80,
};
