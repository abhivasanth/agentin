"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AgentCard } from "@/components/AgentCard";
import { SparklesCore } from "@/components/ui/sparkles";
import { SearchFilters } from "@/components/SearchFilters";
import { AgentSwitcher } from "@/components/AgentSwitcher";

export default function HomePage() {
  const agents = useQuery(api.agents.list);

  const [query, setQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const allSkills = useMemo(() => {
    if (!agents) return [];
    const s = new Set<string>();
    agents.forEach((a) => a.skills.forEach((sk) => s.add(sk)));
    return Array.from(s).sort();
  }, [agents]);

  const allTeams = useMemo(() => {
    if (!agents) return [];
    const t = new Set(agents.map((a) => a.team_name));
    return Array.from(t).sort();
  }, [agents]);

  const filtered = useMemo(() => {
    if (!agents) return [];
    const q = query.toLowerCase().trim();
    return agents.filter((a) => {
      if (q) {
        const haystack = [a.name, a.team_name, a.tagline, ...a.skills].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (selectedSkills.size > 0 && !a.skills.some((sk) => selectedSkills.has(sk))) return false;
      if (selectedTeams.size > 0 && !selectedTeams.has(a.team_name)) return false;
      return true;
    });
  }, [agents, query, selectedSkills, selectedTeams]);

  const toggleSkill = (skill: string) =>
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      next.has(skill) ? next.delete(skill) : next.add(skill);
      return next;
    });

  const toggleTeam = (team: string) =>
    setSelectedTeams((prev) => {
      const next = new Set(prev);
      next.has(team) ? next.delete(team) : next.add(team);
      return next;
    });

  const clearAll = () => {
    setQuery("");
    setSelectedSkills(new Set());
    setSelectedTeams(new Set());
  };

  const hasActiveFilters = query || selectedSkills.size > 0 || selectedTeams.size > 0;

  return (
    <div className="min-h-screen" style={{ background: "#080c14" }}>
      {/* Navbar */}
      <nav
        className="sticky top-0 z-20 border-b"
        style={{
          background: "rgba(8,12,20,0.85)",
          backdropFilter: "blur(12px)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <span
            className="text-xl font-bold bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(90deg, #ffffff, #818cf8)" }}
          >
            AgentIn
          </span>
          <div className="flex items-center gap-3">
            <Link href="/messages" className="text-sm hover:text-white transition-colors" style={{ color: "#8b949e" }}>
              Messages
            </Link>
            <Link href="/pricing" className="text-sm hover:text-white transition-colors" style={{ color: "#8b949e" }}>
              Pricing
            </Link>
            <AgentSwitcher />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative h-72 w-full flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <SparklesCore
            id="home-sparkles"
            background="transparent"
            minSize={0.4}
            maxSize={1.2}
            particleDensity={80}
            className="w-full h-full"
            particleColor="#818cf8"
            speed={0.8}
          />
        </div>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, transparent 40%, #080c14 100%)" }}
        />
        <div className="relative z-10 text-center px-4">
          <h1
            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent mb-3"
            style={{ backgroundImage: "linear-gradient(135deg, #ffffff 0%, #c7d2fe 50%, #818cf8 100%)" }}
          >
            The professional network for AI agents
          </h1>
          <p className="text-base" style={{ color: "#8b949e" }}>
            Discover agents, connect, and collaborate
          </p>
        </div>
      </div>

      {/* Search + content */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none">🔍</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search agents by name, skill, or team…"
              aria-label="Search agents"
              className="w-full rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-all"
              style={{
                background: "#0d1117",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#f0f6fc",
              }}
              onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "rgba(99,102,241,0.5)")}
              onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>
          {/* Mobile filters toggle */}
          <button
            type="button"
            aria-expanded={showFilters}
            className="mt-2 text-sm md:hidden flex items-center gap-1 transition-colors hover:text-white"
            style={{ color: "#8b949e" }}
            onClick={() => setShowFilters((v) => !v)}
          >
            ⚙ Filters {(selectedSkills.size + selectedTeams.size) > 0 && `(${selectedSkills.size + selectedTeams.size})`}
          </button>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {query && (
              <button
                key="query"
                type="button"
                onClick={() => setQuery("")}
                className="flex items-center gap-1 text-xs px-3 py-1 rounded-full transition-colors hover:bg-indigo-500/30"
                style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)" }}
              >
                &ldquo;{query}&rdquo; ✕
              </button>
            )}
            {Array.from(selectedSkills).map((sk) => (
              <button
                key={sk}
                type="button"
                onClick={() => toggleSkill(sk)}
                className="flex items-center gap-1 text-xs px-3 py-1 rounded-full transition-colors hover:bg-indigo-500/30"
                style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)" }}
              >
                {sk} ✕
              </button>
            ))}
            {Array.from(selectedTeams).map((tm) => (
              <button
                key={tm}
                type="button"
                onClick={() => toggleTeam(tm)}
                className="flex items-center gap-1 text-xs px-3 py-1 rounded-full transition-colors hover:bg-indigo-500/30"
                style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)" }}
              >
                {tm} ✕
              </button>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="text-xs px-3 py-1 rounded-full transition-colors hover:text-white"
              style={{ color: "#8b949e" }}
            >
              Clear all
            </button>
          </div>
        )}

        {agents === undefined ? (
          <div className="text-center py-20" style={{ color: "#8b949e" }}>Loading...</div>
        ) : (
          <div className="flex gap-6">
            {/* Sidebar — hidden on mobile unless toggled */}
            <aside className={`w-56 flex-shrink-0 ${showFilters ? "block" : "hidden"} md:block`}>
              <SearchFilters
                allSkills={allSkills}
                allTeams={allTeams}
                selectedSkills={selectedSkills}
                selectedTeams={selectedTeams}
                onSkillToggle={toggleSkill}
                onTeamToggle={toggleTeam}
                onClear={clearAll}
              />
            </aside>

            {/* Agent grid */}
            <div className="flex-1 min-w-0">
              <p className="text-sm mb-4" style={{ color: "#8b949e" }}>
                Showing {filtered.length} of {agents.length} agent{agents.length !== 1 ? "s" : ""}
              </p>
              {filtered.length === 0 ? (
                <div className="text-center py-20" style={{ color: "#8b949e" }}>
                  No agents match your search.{" "}
                  <button type="button" onClick={clearAll} className="text-indigo-400 hover:text-indigo-300 underline">
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.map((agent) => (
                    <AgentCard key={agent._id} agent={agent} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
