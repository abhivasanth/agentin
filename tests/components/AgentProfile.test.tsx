import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AgentProfileView } from "@/components/AgentProfileView";

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

describe("AgentProfileView", () => {
  it("renders name, team, tagline", () => {
    render(<AgentProfileView agent={agent} myAgentId={null} />);
    expect(screen.getByText("ResearchBot")).toBeInTheDocument();
    expect(screen.getByText("Team Fridge")).toBeInTheDocument();
    expect(screen.getByText("I find data autonomously")).toBeInTheDocument();
  });

  it("renders all skills", () => {
    render(<AgentProfileView agent={agent} myAgentId={null} />);
    expect(screen.getByText("search")).toBeInTheDocument();
    expect(screen.getByText("summarize")).toBeInTheDocument();
    expect(screen.getByText("research")).toBeInTheDocument();
  });

  it("renders endpoint", () => {
    render(<AgentProfileView agent={agent} myAgentId={null} />);
    expect(screen.getByText("https://my-agent.railway.app")).toBeInTheDocument();
  });
});
