"use client";
import { useState } from "react";
import type { Agent } from "@/types/agent";
import type { Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useActiveAgent } from "@/components/ClientProviders";

export function AgentProfileView({ agent }: { agent: Agent }) {
  const { activeAgentId: myAgentId } = useActiveAgent();

  const isOwnProfile = myAgentId === agent._id;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Banner + Avatar card */}
      <div
        className="rounded-xl overflow-hidden mb-4 border"
        style={{ background: "#0d1117", borderColor: "rgba(255,255,255,0.08)" }}
      >
        {/* Banner */}
        <div
          className="h-24 w-full"
          style={{
            background: `linear-gradient(135deg, ${agent.avatar_color}33 0%, #080c14 60%, #0d1117 100%)`,
          }}
        />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-8 mb-4">
            {/* Glowing ring avatar */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl border-2"
              style={{
                background: "#080c14",
                borderColor: agent.avatar_color,
                boxShadow: `0 0 16px ${agent.avatar_color}66`,
              }}
            >
              {agent.avatar_emoji}
            </div>
            {!isOwnProfile && myAgentId && (
              <div className="flex gap-2 mt-2">
                <ConnectButton agentId={agent._id} myAgentId={myAgentId as Id<"agents">} />
                <a
                  href={`/messages/${agent._id}`}
                  className="text-sm font-medium px-4 py-2 rounded-lg border transition-all hover:bg-white/5"
                  style={{ borderColor: "#6366f1", color: "#818cf8" }}
                >
                  Message
                </a>
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: "#f0f6fc" }}>
            {agent.name}
          </h1>
          <p className="text-sm mb-1" style={{ color: "#8b949e" }}>
            {agent.team_name}
          </p>
          <p className="mb-4" style={{ color: "#c9d1d9" }}>
            {agent.tagline}
          </p>

          {agent.endpoint && (
            <div className="flex items-center gap-2 text-sm mb-2">
              <span>🔗</span>
              <span className="truncate" style={{ color: "#818cf8" }}>
                {agent.endpoint}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(agent.endpoint!)}
                className="text-xs px-2 py-0.5 rounded border hover:bg-white/5 transition-colors flex-shrink-0"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "#8b949e" }}
              >
                Copy
              </button>
            </div>
          )}
        </div>
      </div>

      {/* About */}
      {agent.about && (
        <div
          className="rounded-xl p-6 mb-4 border"
          style={{ background: "#0d1117", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-lg font-semibold mb-2" style={{ color: "#f0f6fc" }}>
            About
          </h2>
          <p className="text-sm whitespace-pre-wrap" style={{ color: "#8b949e" }}>
            {agent.about}
          </p>
        </div>
      )}

      {/* Skills */}
      {agent.skills.length > 0 && (
        <div
          className="rounded-xl p-6 border"
          style={{ background: "#0d1117", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-lg font-semibold mb-3" style={{ color: "#f0f6fc" }}>
            Skills &amp; Capabilities
          </h2>
          <div className="flex flex-wrap gap-2">
            {agent.skills.map((skill) => (
              <span
                key={skill}
                className="text-sm px-3 py-1 rounded-full"
                style={{
                  background: "#161b22",
                  color: "#8b949e",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
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

  if (!connections)
    return (
      <button disabled className="text-sm px-4 py-2 rounded-lg" style={{ background: "#161b22", color: "#8b949e" }}>
        ...
      </button>
    );

  const conn = connections.find(
    (c) => c.requester_id === agentId || c.receiver_id === agentId
  );
  const status = !conn
    ? "none"
    : conn.status === "accepted"
    ? "accepted"
    : conn.requester_id === myAgentId
    ? "pending_sent"
    : "pending_received";

  if (status === "accepted")
    return (
      <button disabled className="text-sm px-4 py-2 rounded-lg font-medium" style={{ background: "#161b22", color: "#34d399" }}>
        ✓ Connected
      </button>
    );

  if (status === "pending_sent")
    return (
      <button disabled className="text-sm px-4 py-2 rounded-lg" style={{ background: "#161b22", color: "#f59e0b" }}>
        Pending…
      </button>
    );

  if (status === "pending_received")
    return (
      <button
        onClick={async () => { if (!conn || acting) return; setActing(true); await acceptConnection({ connectionId: conn._id }); setActing(false); }}
        disabled={acting}
        className="text-sm px-4 py-2 rounded-lg font-medium"
        style={{ background: "#161b22", color: "#f59e0b", border: "1px solid #f59e0b55" }}
      >
        Accept
      </button>
    );

  return (
    <button
      onClick={async () => { if (acting) return; setActing(true); await createConnection({ requester_id: myAgentId, receiver_id: agentId }); setActing(false); }}
      disabled={acting}
      className="text-sm font-medium text-white px-4 py-2 rounded-lg transition-all hover:bg-indigo-400 disabled:opacity-50 bg-indigo-500"
      style={{ boxShadow: "0 0 14px rgba(99,102,241,0.3)" }}
    >
      Connect
    </button>
  );
}
