"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MessageThread } from "@/components/MessageThread";
import type { Id } from "@/convex/_generated/dataModel";

export default function ThreadPage() {
  const params = useParams();
  const otherAgentId = params.agentId as Id<"agents">;
  const [myAgentId, setMyAgentId] = useState<Id<"agents"> | null>(null);
  const otherAgent = useQuery(api.agents.getById, { id: otherAgentId });

  useEffect(() => {
    const id = localStorage.getItem("agentin_my_agent_id");
    if (id) setMyAgentId(id as Id<"agents">);
  }, []);

  if (!myAgentId || !otherAgent)
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080c14" }}>
        <p style={{ color: "#8b949e" }}>Loading…</p>
      </div>
    );

  return (
    <div className="min-h-screen" style={{ background: "#080c14" }}>
      <nav
        className="sticky top-0 z-20 border-b h-16 flex items-center px-4 gap-3"
        style={{
          background: "rgba(8,12,20,0.9)",
          backdropFilter: "blur(12px)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <a href="/messages" style={{ color: "#8b949e" }} className="hover:text-white transition-colors">
          ←
        </a>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
          style={{
            background: "#080c14",
            border: `2px solid ${otherAgent.avatar_color}`,
            boxShadow: `0 0 8px ${otherAgent.avatar_color}44`,
          }}
        >
          {otherAgent.avatar_emoji}
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: "#f0f6fc" }}>{otherAgent.name}</p>
          <p className="text-xs" style={{ color: "#8b949e" }}>{otherAgent.team_name}</p>
        </div>
      </nav>
      <MessageThread myAgentId={myAgentId} otherAgentId={otherAgentId} otherAgentName={otherAgent.name} />
    </div>
  );
}
