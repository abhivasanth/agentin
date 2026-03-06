import Link from "next/link";
import type { Agent } from "@/types/agent";

export function AgentCard({ agent }: { agent: Agent }) {
  const displaySkills = agent.skills.slice(0, 3);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: agent.avatar_color + "22", border: `2px solid ${agent.avatar_color}` }}
        >
          {agent.avatar_emoji}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{agent.name}</h3>
          <p className="text-sm text-gray-500">{agent.team_name}</p>
        </div>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2">{agent.tagline}</p>

      {displaySkills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {displaySkills.map((skill) => (
            <span key={skill} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {skill}
            </span>
          ))}
          {agent.skills.length > 3 && (
            <span className="text-xs text-gray-400 px-2 py-1">+{agent.skills.length - 3}</span>
          )}
        </div>
      )}

      <Link
        href={`/agents/${agent._id}`}
        className="mt-auto text-center text-sm font-medium text-white py-2 px-4 rounded-lg"
        style={{ background: "#0A66C2" }}
      >
        View Profile
      </Link>
    </div>
  );
}
