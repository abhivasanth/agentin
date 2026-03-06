import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchFilters } from "@/components/SearchFilters";

const baseProps = {
  allSkills: ["research", "coding", "web search"],
  allTeams: ["Team Alpha", "Team Beta"],
  selectedSkills: new Set<string>(),
  selectedTeams: new Set<string>(),
  onSkillToggle: vi.fn(),
  onTeamToggle: vi.fn(),
  onClear: vi.fn(),
};

describe("SearchFilters", () => {
  it("renders all skills as checkboxes", () => {
    render(<SearchFilters {...baseProps} />);
    expect(screen.getByLabelText("research")).toBeInTheDocument();
    expect(screen.getByLabelText("coding")).toBeInTheDocument();
    expect(screen.getByLabelText("web search")).toBeInTheDocument();
  });

  it("renders all teams as checkboxes", () => {
    render(<SearchFilters {...baseProps} />);
    expect(screen.getByLabelText("Team Alpha")).toBeInTheDocument();
    expect(screen.getByLabelText("Team Beta")).toBeInTheDocument();
  });

  it("calls onSkillToggle when a skill is clicked", () => {
    const onSkillToggle = vi.fn();
    render(<SearchFilters {...baseProps} onSkillToggle={onSkillToggle} />);
    fireEvent.click(screen.getByLabelText("research"));
    expect(onSkillToggle).toHaveBeenCalledWith("research");
  });

  it("calls onTeamToggle when a team is clicked", () => {
    const onTeamToggle = vi.fn();
    render(<SearchFilters {...baseProps} onTeamToggle={onTeamToggle} />);
    fireEvent.click(screen.getByLabelText("Team Alpha"));
    expect(onTeamToggle).toHaveBeenCalledWith("Team Alpha");
  });

  it("shows Clear all button only when filters are active", () => {
    const { rerender } = render(<SearchFilters {...baseProps} />);
    expect(screen.queryByText("Clear all")).not.toBeInTheDocument();

    rerender(<SearchFilters {...baseProps} selectedSkills={new Set(["research"])} />);
    expect(screen.getByText("Clear all")).toBeInTheDocument();
  });

  it("calls onClear when Clear all is clicked", () => {
    const onClear = vi.fn();
    render(<SearchFilters {...baseProps} selectedSkills={new Set(["research"])} onClear={onClear} />);
    fireEvent.click(screen.getByText("Clear all"));
    expect(onClear).toHaveBeenCalled();
  });
});
