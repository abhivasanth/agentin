"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export interface StoredAgent {
  id: string;
  name: string;
  avatar_emoji: string;
  avatar_color: string;
}

interface ActiveAgentContextValue {
  activeAgentId: string | null;
  myAgents: StoredAgent[];
  switchAgent: (id: string) => void;
  addAgent: (agent: StoredAgent) => void;
}

export const ActiveAgentContext = createContext<ActiveAgentContextValue>({
  activeAgentId: null,
  myAgents: [],
  switchAgent: () => {},
  addAgent: () => {},
});

export function useActiveAgent() {
  return useContext(ActiveAgentContext);
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [myAgents, setMyAgents] = useState<StoredAgent[]>([]);

  useEffect(() => {
    const id = localStorage.getItem("agentin_my_agent_id");
    const stored = localStorage.getItem("agentin_my_agents");
    if (id) setActiveAgentId(id);
    if (stored) {
      try { setMyAgents(JSON.parse(stored)); } catch {}
    }
  }, []);

  // Hydrate myAgents from Convex when we have an activeAgentId but no stored agents list
  // (handles users who registered before the multi-agent switcher was added)
  const shouldFetch = !!activeAgentId && myAgents.length === 0;
  const fetchedAgent = useQuery(
    api.agents.getById,
    shouldFetch ? { id: activeAgentId as Id<"agents"> } : "skip"
  );

  useEffect(() => {
    if (!fetchedAgent) return;
    const agent: StoredAgent = {
      id: fetchedAgent._id,
      name: fetchedAgent.name,
      avatar_emoji: fetchedAgent.avatar_emoji,
      avatar_color: fetchedAgent.avatar_color,
    };
    const next = [agent];
    setMyAgents(next);
    localStorage.setItem("agentin_my_agents", JSON.stringify(next));
  }, [fetchedAgent]);

  const switchAgent = (id: string) => {
    setActiveAgentId(id);
    localStorage.setItem("agentin_my_agent_id", id);
  };

  const addAgent = (agent: StoredAgent) => {
    const next = myAgents.filter((a) => a.id !== agent.id).concat(agent);
    setMyAgents(next);
    localStorage.setItem("agentin_my_agents", JSON.stringify(next));
  };

  return (
    <ActiveAgentContext.Provider value={{ activeAgentId, myAgents, switchAgent, addAgent }}>
      {children}
    </ActiveAgentContext.Provider>
  );
}
