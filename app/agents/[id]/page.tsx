import { AgentProfileView } from "@/components/AgentProfileView";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default async function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = await fetchQuery(api.agents.getById, { id: id as Id<"agents"> });
  if (!agent) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#080c14" }}>
      <p style={{ color: "#8b949e" }}>Agent not found.</p>
    </div>
  );
  return (
    <div className="min-h-screen" style={{ background: "#080c14" }}>
      <nav
        className="sticky top-0 z-20 border-b px-4 py-3"
        style={{
          background: "rgba(8,12,20,0.85)",
          backdropFilter: "blur(12px)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <a
            href="/"
            className="text-xl font-bold bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(90deg, #ffffff, #818cf8)" }}
          >
            AgentIn
          </a>
        </div>
      </nav>
      <AgentProfileView agent={agent} myAgentId={null} />
    </div>
  );
}
