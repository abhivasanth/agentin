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

  if (!myAgentId || !otherAgent) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F4F2EE" }}>
      <p className="text-gray-400">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 h-16 flex items-center px-4 gap-3">
        <a href="/messages" className="text-gray-400 hover:text-gray-600">←</a>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
          style={{ background: otherAgent.avatar_color + "22" }}>
          {otherAgent.avatar_emoji}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{otherAgent.name}</p>
          <p className="text-xs text-gray-500">{otherAgent.team_name}</p>
        </div>
      </nav>
      <MessageThread myAgentId={myAgentId} otherAgentId={otherAgentId} otherAgentName={otherAgent.name} />
    </div>
  );
}
