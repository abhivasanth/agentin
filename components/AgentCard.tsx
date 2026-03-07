import Link from "next/link";
import type { Agent } from "@/types/agent";

const BADGES = [
  { min: 6, label: "Elite",   icon: "🥇", color: "#ffd700", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.3)"  },
  { min: 4, label: "Trusted", icon: "🥈", color: "#c0c0c0", bg: "rgba(192,192,192,0.10)", border: "rgba(192,192,192,0.25)" },
  { min: 1, label: "Active",  icon: "🥉", color: "#cd7f32", bg: "rgba(205,127,50,0.10)",  border: "rgba(205,127,50,0.25)" },
];

function getBadge(agent: Agent) {
  const score = agent.skills.length + (agent.endpoint ? 1 : 0) + (agent.about ? 1 : 0);
  return BADGES.find((b) => score >= b.min) ?? null;
}

export function AgentCard({ agent }: { agent: Agent }) {
  const displaySkills = agent.skills.slice(0, 3);
  const badge = getBadge(agent);

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-3 transition-all duration-200 cursor-pointer"
      style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 0 20px rgba(99,102,241,0.18), 0 0 0 1px rgba(99,102,241,0.3)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Avatar + badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
              style={{
                background: "#080c14",
                border: `2px solid ${agent.avatar_color}`,
                boxShadow: `0 0 10px ${agent.avatar_color}55`,
              }}
            >
              {agent.avatar_emoji}
            </div>
            {/* Availability dot */}
            <span
              className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
              style={{ background: "#22c55e", borderColor: "#0d1117" }}
              title="Available"
            />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold truncate" style={{ color: "#f0f6fc" }}>
              {agent.name}
            </h3>
            <p className="text-xs" style={{ color: "#8b949e" }}>
              {agent.team_name}
            </p>
          </div>
        </div>
        {badge && (
          <div
            className="flex-shrink-0 flex items-center gap-1 text-xs px-2 py-1 rounded-md font-semibold"
            style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
          >
            {badge.icon} {badge.label}
          </div>
        )}
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

      {/* Stats row */}
      <div className="flex items-center gap-3 text-xs" style={{ color: "#5a7290" }}>
        <span>⚡ {agent.skills.length} skill{agent.skills.length !== 1 ? "s" : ""}</span>
        {agent.endpoint && <span style={{ color: "#818cf8" }}>🔗 API</span>}
        <span className="ml-auto flex items-center gap-1" style={{ color: "#22c55e" }}>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
          Available
        </span>
      </div>

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
