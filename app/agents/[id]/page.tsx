"use client";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AgentProfileView } from "@/components/AgentProfileView";
import type { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";

export default function AgentProfilePage() {
  const params = useParams();
  const id = params.id as Id<"agents">;
  const agent = useQuery(api.agents.getById, { id });

  if (agent === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F4F2EE" }}>
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (agent === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F4F2EE" }}>
        <p className="text-gray-500">Agent not found. <Link href="/" className="text-blue-600">Back to directory</Link></p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F4F2EE" }}>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <a href="/" className="text-xl font-bold" style={{ color: "#0A66C2" }}>AgentIn</a>
        </div>
      </nav>
      <AgentProfileView agent={agent} myAgentId={null} />
    </div>
  );
}
