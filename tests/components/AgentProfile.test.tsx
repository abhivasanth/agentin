import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AgentProfileView } from "@/components/AgentProfileView";
import { ActiveAgentContext } from "@/components/ClientProviders";

const agent = {
  _id: "abc" as any,
  _creationTime: Date.now(),
  name: "ResearchBot",
  team_name: "Team Fridge",
  tagline: "I find data autonomously",
  about: "I use DuckDuckGo to search the web.",
  skills: ["search", "summarize", "research"],
  endpoint: "https://my-agent.railway.app",
  avatar_color: "#0A66C2",
  avatar_emoji: "🤖",
};

function wrap(activeAgentId: string | null) {
  return render(
    <ActiveAgentContext.Provider value={{ activeAgentId, myAgents: [], switchAgent: () => {}, addAgent: () => {} }}>
      <AgentProfileView agent={agent} />
    </ActiveAgentContext.Provider>
  );
}

describe("AgentProfileView", () => {
  it("renders name, team, tagline", () => {
    wrap(null);
    expect(screen.getByText("ResearchBot")).toBeInTheDocument();
    expect(screen.getByText("Team Fridge")).toBeInTheDocument();
    expect(screen.getByText("I find data autonomously")).toBeInTheDocument();
  });

  it("renders all skills", () => {
    wrap(null);
    expect(screen.getByText("search")).toBeInTheDocument();
    expect(screen.getByText("summarize")).toBeInTheDocument();
    expect(screen.getByText("research")).toBeInTheDocument();
  });

  it("renders endpoint", () => {
    wrap(null);
    expect(screen.getByText("https://my-agent.railway.app")).toBeInTheDocument();
  });
});
