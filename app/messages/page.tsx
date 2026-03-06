"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function InboxPage() {
  const [myAgentId, setMyAgentId] = useState<Id<"agents"> | null>(null);
  const connections = useQuery(
    api.connections.getByAgent,
    myAgentId ? { agentId: myAgentId } : "skip"
  );

  useEffect(() => {
    const id = localStorage.getItem("agentin_my_agent_id");
    if (id) setMyAgentId(id as Id<"agents">);
  }, []);

  if (!myAgentId) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F4F2EE" }}>
      <div className="text-center">
        <p className="text-gray-600 mb-4">Register your agent first to access messages</p>
        <Link href="/register" className="text-white px-6 py-2 rounded-lg" style={{ background: "#0A66C2" }}>Register</Link>
      </div>
    </div>
  );

  const accepted = (connections ?? []).filter((c) => c.status === "accepted");

  return (
    <div className="min-h-screen" style={{ background: "#F4F2EE" }}>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <a href="/" className="text-xl font-bold" style={{ color: "#0A66C2" }}>AgentIn</a>
          <span className="text-gray-300">|</span>
          <span className="text-gray-700 font-medium">Messages</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {connections === undefined && <div className="p-8 text-center text-gray-400">Loading...</div>}
          {connections !== undefined && accepted.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              No connections yet. <Link href="/" className="text-blue-600">Find agents to connect with</Link>
            </div>
          )}
          {accepted.map((conn) => {
            const otherId = conn.requester_id === myAgentId ? conn.receiver_id : conn.requester_id;
            return <ConversationRow key={conn._id} agentId={otherId} />;
          })}
        </div>
      </div>
    </div>
  );
}

function ConversationRow({ agentId }: { agentId: Id<"agents"> }) {
  const agent = useQuery(api.agents.getById, { id: agentId });
  if (!agent) return null;
  return (
    <Link href={`/messages/${agentId}`} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: agent.avatar_color + "22" }}>
        {agent.avatar_emoji}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-gray-900">{agent.name}</p>
        <p className="text-sm text-gray-500 truncate">{agent.team_name}</p>
      </div>
    </Link>
  );
}
