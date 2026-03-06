# Agent Search Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add LinkedIn-style real-time search and filtering to the AgentIn home page — text search bar plus a sidebar with skill and team filters.

**Architecture:** All filtering is client-side — `useQuery(api.agents.list)` already fetches all agents; filter state lives in `useState` in `app/page.tsx`; filtered results and unique filter options computed with `useMemo`. A new `SearchFilters` sidebar component handles the checkboxes. No backend, schema, or routing changes.

**Tech Stack:** Next.js 15 App Router, React `useState`/`useMemo`, Tailwind CSS v4, Vitest + React Testing Library

---

## Task 1: Create `SearchFilters` component

**Files:**
- Create: `components/SearchFilters.tsx`
- Create: `tests/components/SearchFilters.test.tsx`

**Step 1: Write the failing test**

Create `tests/components/SearchFilters.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchFilters } from "@/components/SearchFilters";

const baseProps = {
  allSkills: ["research", "coding", "web search"],
  allTeams: ["Team Alpha", "Team Beta"],
  selectedSkills: new Set<string>(),
  selectedTeams: new Set<string>(),
  onSkillToggle: vi.fn(),
  onTeamToggle: vi.fn(),
  onClear: vi.fn(),
};

describe("SearchFilters", () => {
  it("renders all skills as checkboxes", () => {
    render(<SearchFilters {...baseProps} />);
    expect(screen.getByLabelText("research")).toBeInTheDocument();
    expect(screen.getByLabelText("coding")).toBeInTheDocument();
    expect(screen.getByLabelText("web search")).toBeInTheDocument();
  });

  it("renders all teams as checkboxes", () => {
    render(<SearchFilters {...baseProps} />);
    expect(screen.getByLabelText("Team Alpha")).toBeInTheDocument();
    expect(screen.getByLabelText("Team Beta")).toBeInTheDocument();
  });

  it("calls onSkillToggle when a skill is clicked", () => {
    const onSkillToggle = vi.fn();
    render(<SearchFilters {...baseProps} onSkillToggle={onSkillToggle} />);
    fireEvent.click(screen.getByLabelText("research"));
    expect(onSkillToggle).toHaveBeenCalledWith("research");
  });

  it("calls onTeamToggle when a team is clicked", () => {
    const onTeamToggle = vi.fn();
    render(<SearchFilters {...baseProps} onTeamToggle={onTeamToggle} />);
    fireEvent.click(screen.getByLabelText("Team Alpha"));
    expect(onTeamToggle).toHaveBeenCalledWith("Team Alpha");
  });

  it("shows Clear all button only when filters are active", () => {
    const { rerender } = render(<SearchFilters {...baseProps} />);
    expect(screen.queryByText("Clear all")).not.toBeInTheDocument();

    rerender(<SearchFilters {...baseProps} selectedSkills={new Set(["research"])} />);
    expect(screen.getByText("Clear all")).toBeInTheDocument();
  });

  it("calls onClear when Clear all is clicked", () => {
    const onClear = vi.fn();
    render(<SearchFilters {...baseProps} selectedSkills={new Set(["research"])} onClear={onClear} />);
    fireEvent.click(screen.getByText("Clear all"));
    expect(onClear).toHaveBeenCalled();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd /c/Users/abhiv/claudecode_projects/agentin
npm test -- tests/components/SearchFilters.test.tsx
```

Expected: FAIL — `Cannot find module '@/components/SearchFilters'`

**Step 3: Create `components/SearchFilters.tsx`**

```tsx
interface SearchFiltersProps {
  allSkills: string[];
  allTeams: string[];
  selectedSkills: Set<string>;
  selectedTeams: Set<string>;
  onSkillToggle: (skill: string) => void;
  onTeamToggle: (team: string) => void;
  onClear: () => void;
}

export function SearchFilters({
  allSkills,
  allTeams,
  selectedSkills,
  selectedTeams,
  onSkillToggle,
  onTeamToggle,
  onClear,
}: SearchFiltersProps) {
  const hasActive = selectedSkills.size > 0 || selectedTeams.size > 0;

  return (
    <div
      className="rounded-xl p-4 border flex flex-col gap-5"
      style={{ background: "#0d1117", borderColor: "rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ color: "#f0f6fc" }}>
          Filters
        </span>
        {hasActive && (
          <button
            onClick={onClear}
            className="text-xs hover:text-white transition-colors"
            style={{ color: "#8b949e" }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Skills */}
      {allSkills.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "#8b949e" }}>
            Skills
          </p>
          <div className="flex flex-col gap-2">
            {allSkills.map((skill) => (
              <label key={skill} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedSkills.has(skill)}
                  onChange={() => onSkillToggle(skill)}
                  className="rounded"
                  style={{ accentColor: "#6366f1" }}
                />
                <span
                  className="text-sm group-hover:text-white transition-colors"
                  style={{ color: selectedSkills.has(skill) ? "#f0f6fc" : "#8b949e" }}
                >
                  {skill}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Teams */}
      {allTeams.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "#8b949e" }}>
            Team
          </p>
          <div className="flex flex-col gap-2">
            {allTeams.map((team) => (
              <label key={team} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedTeams.has(team)}
                  onChange={() => onTeamToggle(team)}
                  className="rounded"
                  style={{ accentColor: "#6366f1" }}
                />
                <span
                  className="text-sm group-hover:text-white transition-colors"
                  style={{ color: selectedTeams.has(team) ? "#f0f6fc" : "#8b949e" }}
                >
                  {team}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 4: Run tests to verify they pass**

```bash
npm test -- tests/components/SearchFilters.test.tsx
```

Expected: 6 tests PASS

**Step 5: Commit**

```bash
git add components/SearchFilters.tsx tests/components/SearchFilters.test.tsx
git commit -m "feat: add SearchFilters sidebar component with skill and team checkboxes"
```

---

## Task 2: Update `app/page.tsx` with search bar, filter state, and two-column layout

**Files:**
- Modify: `app/page.tsx`

**Step 1: Replace the entire file with this content**

```tsx
"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AgentCard } from "@/components/AgentCard";
import { SparklesCore } from "@/components/ui/sparkles";
import { SearchFilters } from "@/components/SearchFilters";

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
            <Link
              href="/register"
              className="text-sm font-medium text-white px-4 py-2 rounded-lg transition-all bg-indigo-500 hover:bg-indigo-400"
              style={{ boxShadow: "0 0 16px rgba(99,102,241,0.35)" }}
            >
              Register Your Agent
            </Link>
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
            {Array.from(selectedSkills).map((sk) => (
              <button
                key={sk}
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
                onClick={() => toggleTeam(tm)}
                className="flex items-center gap-1 text-xs px-3 py-1 rounded-full transition-colors hover:bg-indigo-500/30"
                style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)" }}
              >
                {tm} ✕
              </button>
            ))}
            <button
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
                  <button onClick={clearAll} className="text-indigo-400 hover:text-indigo-300 underline">
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
```

**Step 2: Run TypeScript check**

```bash
cd /c/Users/abhiv/claudecode_projects/agentin
npx tsc --noEmit
```

Expected: Only pre-existing errors in `MessageThread.tsx` and `convex/messages.ts`. No new errors.

**Step 3: Verify visually**

Open http://localhost:3003 (or whichever port agentin is running on):
- Search bar appears below hero
- Sidebar shows Skills and Teams checkboxes populated from live agents
- Typing in search bar filters the grid in real time
- Clicking a skill chip filters; clicking it again removes the filter
- Active filter chips appear above the grid with ✕ to dismiss
- "Showing X of Y agents" count updates

**Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: agent search — text search bar, skill and team sidebar filters"
```

---

## Task 3: Add tests for the filter logic

**Files:**
- Create: `tests/search/filterAgents.test.ts`

**Step 1: Write the failing test**

Create `tests/search/filterAgents.test.ts`:

```ts
import { describe, it, expect } from "vitest";

// Pure filter function extracted from page logic — test it in isolation
function filterAgents(
  agents: Array<{ name: string; team_name: string; tagline: string; skills: string[] }>,
  query: string,
  selectedSkills: Set<string>,
  selectedTeams: Set<string>
) {
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
}

const agents = [
  { name: "ResearchBot", team_name: "Team Alpha", tagline: "I find data", skills: ["research", "web search"] },
  { name: "CoderBot", team_name: "Team Beta", tagline: "I write code", skills: ["coding", "testing"] },
  { name: "SummaryBot", team_name: "Team Alpha", tagline: "I summarize", skills: ["research", "summarization"] },
];

describe("filterAgents", () => {
  it("returns all agents when no filters applied", () => {
    expect(filterAgents(agents, "", new Set(), new Set())).toHaveLength(3);
  });

  it("filters by name query", () => {
    const result = filterAgents(agents, "coder", new Set(), new Set());
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("CoderBot");
  });

  it("filters by skill in tagline", () => {
    const result = filterAgents(agents, "summarize", new Set(), new Set());
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("SummaryBot");
  });

  it("filters by selected skill (OR across agents)", () => {
    const result = filterAgents(agents, "", new Set(["coding"]), new Set());
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("CoderBot");
  });

  it("selected skills use OR logic — returns any agent with any selected skill", () => {
    const result = filterAgents(agents, "", new Set(["coding", "research"]), new Set());
    expect(result).toHaveLength(3);
  });

  it("filters by selected team", () => {
    const result = filterAgents(agents, "", new Set(), new Set(["Team Alpha"]));
    expect(result).toHaveLength(2);
  });

  it("combines query and skill filter with AND logic", () => {
    // "research" query matches ResearchBot and SummaryBot, but only SummaryBot has "summarization"
    const result = filterAgents(agents, "research", new Set(["summarization"]), new Set());
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("SummaryBot");
  });

  it("returns empty array when no agents match", () => {
    const result = filterAgents(agents, "xyz-no-match", new Set(), new Set());
    expect(result).toHaveLength(0);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- tests/search/filterAgents.test.ts
```

Expected: FAIL — `Cannot find module` (directory doesn't exist yet)

**Step 3: Create the directory and run**

The test file IS the implementation (pure function defined inside the test). Just create the directory:

```bash
mkdir -p /c/Users/abhiv/claudecode_projects/agentin/tests/search
```

Then run again:

```bash
npm test -- tests/search/filterAgents.test.ts
```

Expected: 8 tests PASS

**Step 4: Run full test suite**

```bash
npm test
```

Expected: All tests pass (was 16, now should be 16 + 6 + 8 = 30 passing)

**Step 5: Commit**

```bash
git add tests/search/filterAgents.test.ts
git commit -m "test: add filter logic unit tests for agent search"
```

---
