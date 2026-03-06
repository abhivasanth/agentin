"use client";
import { useState, useEffect } from "react";
import type { Agent } from "@/types/agent";
import type { Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function AgentProfileView({
  agent,
  myAgentId: myAgentIdProp,
}: {
  agent: Agent;
  myAgentId: string | null;
}) {
  const [myAgentId, setMyAgentId] = useState<string | null>(myAgentIdProp);

  useEffect(() => {
    if (!myAgentId) {
      setMyAgentId(localStorage.getItem("agentin_my_agent_id"));
    }
  }, []);

  const isOwnProfile = myAgentId === agent._id;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Banner + Avatar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
        <div className="h-24 w-full" style={{ background: `linear-gradient(135deg, ${agent.avatar_color}44, ${agent.avatar_color}22)` }} />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-8 mb-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl border-4 border-white shadow"
              style={{ background: agent.avatar_color + "22" }}
            >
              {agent.avatar_emoji}
            </div>
            {!isOwnProfile && myAgentId && (
              <div className="flex gap-2 mt-2">
                <ConnectButton agentId={agent._id} myAgentId={myAgentId as Id<"agents">} />
                <a
                  href={`/messages/${agent._id}`}
                  className="text-sm font-medium px-4 py-2 rounded-lg border"
                  style={{ borderColor: "#0A66C2", color: "#0A66C2" }}
                >
                  Message
                </a>
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900">{agent.name}</h1>
          <p className="text-gray-500 text-sm mb-1">{agent.team_name}</p>
          <p className="text-gray-700 mb-4">{agent.tagline}</p>

          {agent.endpoint && (
            <div className="flex items-center gap-2 text-sm text-blue-600 mb-4">
              <span>🔗</span>
              <span className="truncate">{agent.endpoint}</span>
              <button
                onClick={() => navigator.clipboard.writeText(agent.endpoint!)}
                className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded px-2 py-0.5"
              >
                Copy
              </button>
            </div>
          )}
        </div>
      </div>

      {agent.about && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
          <p className="text-gray-600 text-sm whitespace-pre-wrap">{agent.about}</p>
        </div>
      )}

      {agent.skills.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Skills & Capabilities</h2>
          <div className="flex flex-wrap gap-2">
            {agent.skills.map((skill) => (
              <span key={skill} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ConnectButton({ agentId, myAgentId }: { agentId: Id<"agents">; myAgentId: Id<"agents"> }) {
  const connections = useQuery(api.connections.getByAgent, { agentId: myAgentId });
  const createConnection = useMutation(api.connections.create);
  const acceptConnection = useMutation(api.connections.accept);
  const [acting, setActing] = useState(false);

  if (!connections) return <button disabled className="text-sm px-4 py-2 rounded-lg bg-gray-100 text-gray-400">...</button>;

  const conn = connections.find(
    (c) => (c.requester_id === agentId || c.receiver_id === agentId)
  );

  const status = !conn ? "none"
    : conn.status === "accepted" ? "accepted"
    : conn.requester_id === myAgentId ? "pending_sent"
    : "pending_received";

  if (status === "accepted") {
    return <button disabled className="text-sm px-4 py-2 rounded-lg bg-green-100 text-green-700 font-medium">✓ Connected</button>;
  }

  if (status === "pending_sent") {
    return <button disabled className="text-sm px-4 py-2 rounded-lg bg-yellow-50 text-yellow-700 font-medium">Pending...</button>;
  }

  if (status === "pending_received") {
    return (
      <button
        onClick={async () => {
          if (!conn || acting) return;
          setActing(true);
          await acceptConnection({ connectionId: conn._id });
          setActing(false);
        }}
        disabled={acting}
        className="text-sm px-4 py-2 rounded-lg bg-yellow-100 text-yellow-700 font-medium"
      >
        Accept
      </button>
    );
  }

  return (
    <button
      onClick={async () => {
        if (acting) return;
        setActing(true);
        await createConnection({ requester_id: myAgentId, receiver_id: agentId });
        setActing(false);
      }}
      disabled={acting}
      className="text-sm font-medium text-white px-4 py-2 rounded-lg"
      style={{ background: "#0A66C2" }}
    >
      Connect
    </button>
  );
}
