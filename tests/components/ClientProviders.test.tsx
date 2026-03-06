import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ClientProviders, useActiveAgent, ActiveAgentContext } from "@/components/ClientProviders";

vi.mock("convex/react", () => ({ useQuery: () => undefined }));
vi.mock("@/convex/_generated/api", () => ({ api: { agents: { getById: "agents:getById" } } }));

function ActiveIdDisplay() {
  const { activeAgentId } = useActiveAgent();
  return <span data-testid="id">{activeAgentId ?? "none"}</span>;
}

function AgentCountDisplay() {
  const { myAgents } = useActiveAgent();
  return <span data-testid="count">{myAgents.length}</span>;
}

function SwitchButton() {
  const { activeAgentId, switchAgent } = useActiveAgent();
  return <button onClick={() => switchAgent("agent2")}>{activeAgentId ?? "none"}</button>;
}

function AddButton() {
  const { myAgents, addAgent } = useActiveAgent();
  return (
    <button onClick={() => addAgent({ id: "a1", name: "Bot", avatar_emoji: "🤖", avatar_color: "#6366f1" })}>
      {myAgents.length}
    </button>
  );
}

describe("ClientProviders", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("provides null activeAgentId when localStorage is empty", () => {
    render(<ClientProviders><ActiveIdDisplay /></ClientProviders>);
    expect(screen.getByTestId("id").textContent).toBe("none");
  });

  it("reads activeAgentId from localStorage on mount", async () => {
    localStorage.setItem("agentin_my_agent_id", "agent1");
    localStorage.setItem(
      "agentin_my_agents",
      JSON.stringify([{ id: "agent1", name: "Bot A", avatar_emoji: "🤖", avatar_color: "#6366f1" }])
    );
    render(<ClientProviders><ActiveIdDisplay /><AgentCountDisplay /></ClientProviders>);
    expect(await screen.findByText("agent1")).toBeInTheDocument();
    expect(screen.getByTestId("count").textContent).toBe("1");
  });

  it("switchAgent updates activeAgentId and localStorage", () => {
    render(<ClientProviders><SwitchButton /></ClientProviders>);
    act(() => { screen.getByRole("button").click(); });
    expect(screen.getByRole("button").textContent).toBe("agent2");
    expect(localStorage.getItem("agentin_my_agent_id")).toBe("agent2");
  });

  it("addAgent pushes to myAgents and updates localStorage", () => {
    render(<ClientProviders><AddButton /></ClientProviders>);
    expect(screen.getByRole("button").textContent).toBe("0");
    act(() => { screen.getByRole("button").click(); });
    expect(screen.getByRole("button").textContent).toBe("1");
    expect(JSON.parse(localStorage.getItem("agentin_my_agents")!)).toHaveLength(1);
  });

  it("addAgent deduplicates — re-adding same id replaces not duplicates", () => {
    localStorage.setItem(
      "agentin_my_agents",
      JSON.stringify([{ id: "a1", name: "Bot", avatar_emoji: "🤖", avatar_color: "#6366f1" }])
    );
    render(<ClientProviders><AddButton /></ClientProviders>);
    act(() => { screen.getByRole("button").click(); });
    expect(JSON.parse(localStorage.getItem("agentin_my_agents")!)).toHaveLength(1);
  });
});
