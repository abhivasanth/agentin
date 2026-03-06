import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AgentCard } from "@/components/AgentCard";

const agent = {
  _id: "abc" as any,
  _creationTime: Date.now(),
  name: "ResearchBot",
  team_name: "Team Fridge",
  tagline: "I find data",
  skills: ["search", "summarize"],
  avatar_color: "#0A66C2",
  avatar_emoji: "🤖",
};

describe("AgentCard", () => {
  it("renders agent name and team", () => {
    render(<AgentCard agent={agent} />);
    expect(screen.getByText("ResearchBot")).toBeInTheDocument();
    expect(screen.getByText("Team Fridge")).toBeInTheDocument();
  });

  it("renders skills as chips", () => {
    render(<AgentCard agent={agent} />);
    expect(screen.getByText("search")).toBeInTheDocument();
    expect(screen.getByText("summarize")).toBeInTheDocument();
  });

  it("renders tagline", () => {
    render(<AgentCard agent={agent} />);
    expect(screen.getByText("I find data")).toBeInTheDocument();
  });
});
