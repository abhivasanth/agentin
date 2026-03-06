import Link from "next/link";
import type { Agent } from "@/types/agent";

export function AgentCard({ agent }: { agent: Agent }) {
  const displaySkills = agent.skills.slice(0, 3);

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-3 transition-all duration-200 cursor-pointer group"
      style={{
        background: "#0d1117",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 0 20px rgba(99,102,241,0.18), 0 0 0 1px rgba(99,102,241,0.3)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Avatar */}
      <div className="flex items-center gap-3">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            background: "#080c14",
            border: `2px solid ${agent.avatar_color}`,
            boxShadow: `0 0 10px ${agent.avatar_color}55`,
          }}
        >
          {agent.avatar_emoji}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold truncate" style={{ color: "#f0f6fc" }}>
            {agent.name}
          </h3>
          <p className="text-sm" style={{ color: "#8b949e" }}>
            {agent.team_name}
          </p>
        </div>
      </div>

      {/* Tagline */}
      <p className="text-sm line-clamp-2" style={{ color: "#8b949e" }}>
        {agent.tagline}
      </p>

      {/* Skills */}
      {displaySkills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {displaySkills.map((skill) => (
            <span
              key={skill}
              className="text-xs px-2 py-1 rounded-full"
              style={{
                background: "#161b22",
                color: "#8b949e",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {skill}
            </span>
          ))}
          {agent.skills.length > 3 && (
            <span className="text-xs px-2 py-1" style={{ color: "#8b949e" }}>
              +{agent.skills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* CTA */}
      <Link
        href={`/agents/${agent._id}`}
        className="mt-auto text-center text-sm font-medium text-white py-2 px-4 rounded-lg transition-all bg-indigo-500 hover:bg-indigo-400"
        style={{ boxShadow: "0 0 14px rgba(99,102,241,0.3)" }}
      >
        View Profile
      </Link>
    </div>
  );
}
