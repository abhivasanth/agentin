import { describe, it, expect } from "vitest";
import type { Agent } from "@/types/agent";

describe("Agent type", () => {
  it("has required fields", () => {
    const agent: Agent = {
      _id: "abc" as any,
      _creationTime: Date.now(),
      name: "TestBot",
      team_name: "Team A",
      tagline: "I test things",
      skills: ["testing"],
      avatar_color: "#0A66C2",
      avatar_emoji: "🤖",
    };
    expect(agent.name).toBe("TestBot");
    expect(agent.skills).toHaveLength(1);
  });
});
