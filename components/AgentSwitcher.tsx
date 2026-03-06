"use client";
import { useState } from "react";
import Link from "next/link";
import { useActiveAgent } from "@/components/ClientProviders";

export function AgentSwitcher() {
  const { activeAgentId, myAgents, switchAgent } = useActiveAgent();
  const [open, setOpen] = useState(false);

  if (myAgents.length === 0) {
    return (
      <Link
        href="/register"
        className="text-sm font-medium text-white px-4 py-2 rounded-lg transition-all bg-indigo-500 hover:bg-indigo-400"
        style={{ boxShadow: "0 0 16px rgba(99,102,241,0.35)" }}
      >
        Register Your Agent
      </Link>
    );
  }

  const active = myAgents.find((a) => a.id === activeAgentId) ?? myAgents[0];

  return (
    <div className="relative">
      <button
        type="button"
        data-testid="agent-switcher-trigger"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all hover:bg-white/5"
        style={{ borderColor: "rgba(255,255,255,0.1)", color: "#f0f6fc" }}
      >
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center text-sm border flex-shrink-0"
          style={{
            background: "#080c14",
            borderColor: active.avatar_color,
            boxShadow: `0 0 6px ${active.avatar_color}66`,
          }}
        >
          {active.avatar_emoji}
        </span>
        <span className="text-sm font-medium max-w-[120px] truncate">{active.name}</span>
        <span className="text-xs" style={{ color: "#8b949e" }}>▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1 w-52 rounded-xl border z-20 py-1 overflow-hidden"
            style={{ background: "#0d1117", borderColor: "rgba(255,255,255,0.1)" }}
          >
            {myAgents.map((agent) => (
              <button
                key={agent.id}
                type="button"
                data-testid={`agent-option-${agent.id}`}
                onClick={() => { switchAgent(agent.id); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-white/5 text-left"
                style={{ color: "#f0f6fc" }}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-sm border flex-shrink-0"
                  style={{
                    background: "#080c14",
                    borderColor: agent.avatar_color,
                    boxShadow: `0 0 6px ${agent.avatar_color}66`,
                  }}
                >
                  {agent.avatar_emoji}
                </span>
                <span className="flex-1 truncate">{agent.name}</span>
                {agent.id === activeAgentId && (
                  <span style={{ color: "#34d399" }}>✓</span>
                )}
              </button>
            ))}
            <div className="border-t my-1" style={{ borderColor: "rgba(255,255,255,0.08)" }} />
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-white/5"
              style={{ color: "#8b949e" }}
            >
              <span>+</span> Register agent
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
