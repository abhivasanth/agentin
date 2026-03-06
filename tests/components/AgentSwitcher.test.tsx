import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AgentSwitcher } from "@/components/AgentSwitcher";
import { ActiveAgentContext } from "@/components/ClientProviders";
import type { StoredAgent } from "@/components/ClientProviders";

const agent1: StoredAgent = { id: "a1", name: "ResearchBot", avatar_emoji: "🤖", avatar_color: "#6366f1" };
const agent2: StoredAgent = { id: "a2", name: "CoderBot", avatar_emoji: "⚡", avatar_color: "#f59e0b" };

function wrap(value: {
  activeAgentId: string | null;
  myAgents: StoredAgent[];
  switchAgent: (id: string) => void;
  addAgent: (agent: StoredAgent) => void;
}) {
  return render(
    <ActiveAgentContext.Provider value={value}>
      <AgentSwitcher />
    </ActiveAgentContext.Provider>
  );
}

describe("AgentSwitcher", () => {
  it("shows Register Your Agent link when no agents registered", () => {
    wrap({ activeAgentId: null, myAgents: [], switchAgent: vi.fn(), addAgent: vi.fn() });
    expect(screen.getByText("Register Your Agent")).toBeInTheDocument();
  });

  it("shows active agent name when agents are registered", () => {
    wrap({ activeAgentId: "a1", myAgents: [agent1, agent2], switchAgent: vi.fn(), addAgent: vi.fn() });
    expect(screen.getByText("ResearchBot")).toBeInTheDocument();
  });

  it("dropdown is not visible before clicking trigger", () => {
    wrap({ activeAgentId: "a1", myAgents: [agent1, agent2], switchAgent: vi.fn(), addAgent: vi.fn() });
    expect(screen.queryByText("CoderBot")).not.toBeInTheDocument();
  });

  it("opens dropdown and shows all agents on trigger click", () => {
    wrap({ activeAgentId: "a1", myAgents: [agent1, agent2], switchAgent: vi.fn(), addAgent: vi.fn() });
    fireEvent.click(screen.getByTestId("agent-switcher-trigger"));
    expect(screen.getByText("CoderBot")).toBeInTheDocument();
  });

  it("calls switchAgent with correct id when another agent is clicked", () => {
    const switchAgent = vi.fn();
    wrap({ activeAgentId: "a1", myAgents: [agent1, agent2], switchAgent, addAgent: vi.fn() });
    fireEvent.click(screen.getByTestId("agent-switcher-trigger"));
    fireEvent.click(screen.getByTestId("agent-option-a2"));
    expect(switchAgent).toHaveBeenCalledWith("a2");
  });

  it("shows checkmark only on active agent", () => {
    wrap({ activeAgentId: "a1", myAgents: [agent1, agent2], switchAgent: vi.fn(), addAgent: vi.fn() });
    fireEvent.click(screen.getByTestId("agent-switcher-trigger"));
    expect(screen.getByTestId("agent-option-a1")).toHaveTextContent("✓");
    expect(screen.getByTestId("agent-option-a2")).not.toHaveTextContent("✓");
  });

  it("shows Register agent link at bottom of dropdown", () => {
    wrap({ activeAgentId: "a1", myAgents: [agent1], switchAgent: vi.fn(), addAgent: vi.fn() });
    fireEvent.click(screen.getByTestId("agent-switcher-trigger"));
    expect(screen.getByText("Register agent")).toBeInTheDocument();
  });
});
