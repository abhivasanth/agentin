"use client";
import { createContext, useContext, useEffect, useState } from "react";

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

  const switchAgent = (id: string) => {
    setActiveAgentId(id);
    localStorage.setItem("agentin_my_agent_id", id);
  };

  const addAgent = (agent: StoredAgent) => {
    setMyAgents((prev) => {
      const next = prev.filter((a) => a.id !== agent.id).concat(agent);
      localStorage.setItem("agentin_my_agents", JSON.stringify(next));
      return next;
    });
  };

  return (
    <ActiveAgentContext.Provider value={{ activeAgentId, myAgents, switchAgent, addAgent }}>
      {children}
    </ActiveAgentContext.Provider>
  );
}
