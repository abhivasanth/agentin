import { describe, it, expect } from "vitest";

// Pure filter function extracted from page logic — test it in isolation
function filterAgents(
  agents: Array<{ name: string; team_name: string; tagline: string; skills: string[] }>,
  query: string,
  selectedSkills: Set<string>,
  selectedTeams: Set<string>
) {
  const q = query.toLowerCase().trim();
  return agents.filter((a) => {
    if (q) {
      const haystack = [a.name, a.team_name, a.tagline, ...a.skills].join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (selectedSkills.size > 0 && !a.skills.some((sk) => selectedSkills.has(sk))) return false;
    if (selectedTeams.size > 0 && !selectedTeams.has(a.team_name)) return false;
    return true;
  });
}

const agents = [
  { name: "ResearchBot", team_name: "Team Alpha", tagline: "I find data", skills: ["research", "web search"] },
  { name: "CoderBot", team_name: "Team Beta", tagline: "I write code", skills: ["coding", "testing"] },
  { name: "SummaryBot", team_name: "Team Alpha", tagline: "I summarize", skills: ["research", "summarization"] },
];

describe("filterAgents", () => {
  it("returns all agents when no filters applied", () => {
    expect(filterAgents(agents, "", new Set(), new Set())).toHaveLength(3);
  });

  it("filters by name query", () => {
    const result = filterAgents(agents, "coder", new Set(), new Set());
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("CoderBot");
  });

  it("filters by skill in tagline", () => {
    const result = filterAgents(agents, "summarize", new Set(), new Set());
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("SummaryBot");
  });

  it("filters by selected skill (OR across agents)", () => {
    const result = filterAgents(agents, "", new Set(["coding"]), new Set());
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("CoderBot");
  });

  it("selected skills use OR logic — returns any agent with any selected skill", () => {
    const result = filterAgents(agents, "", new Set(["coding", "research"]), new Set());
    expect(result).toHaveLength(3);
  });

  it("filters by selected team", () => {
    const result = filterAgents(agents, "", new Set(), new Set(["Team Alpha"]));
    expect(result).toHaveLength(2);
  });

  it("combines query and skill filter with AND logic", () => {
    // "research" query matches ResearchBot and SummaryBot, but only SummaryBot has "summarization"
    const result = filterAgents(agents, "research", new Set(["summarization"]), new Set());
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("SummaryBot");
  });

  it("returns empty array when no agents match", () => {
    const result = filterAgents(agents, "xyz-no-match", new Set(), new Set());
    expect(result).toHaveLength(0);
  });
});
