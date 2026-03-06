# Switch Agent Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let users who registered multiple agents in the same browser switch between them via a navbar dropdown, making the selected agent the active "identity" for connecting and messaging.

**Architecture:** A new `ActiveAgentContext` (in `ClientProviders`) wraps the whole app and stores the active agent ID + all registered agents from localStorage. An `AgentSwitcher` dropdown in every navbar reads from this context. Pages that currently read `agentin_my_agent_id` directly from localStorage are updated to read from context instead — so switching is instant and reactive with no page reload.

**Tech Stack:** Next.js 15 App Router, React context + useState, localStorage, Tailwind CSS v4, Vitest + React Testing Library

---

## Task 1: Create `ClientProviders` context

**Files:**
- Create: `components/ClientProviders.tsx`
- Create: `tests/components/ClientProviders.test.tsx`

**Step 1: Write the failing test**

Create `tests/components/ClientProviders.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ClientProviders, useActiveAgent, ActiveAgentContext } from "@/components/ClientProviders";

function ActiveIdDisplay() {
  const { activeAgentId } = useActiveAgent();
  return <span data-testid="id">{activeAgentId ?? "none"}</span>;
}

function AgentCountDisplay() {
  const { myAgents } = useActiveAgent();
  return <span data-testid="count">{myAgents.length}</span>;
}

function SwitchButton() {
  const { activeAgentId, switchAgent } = useActiveAgent();
  return <button onClick={() => switchAgent("agent2")}>{activeAgentId ?? "none"}</button>;
}

function AddButton() {
  const { myAgents, addAgent } = useActiveAgent();
  return (
    <button onClick={() => addAgent({ id: "a1", name: "Bot", avatar_emoji: "🤖", avatar_color: "#6366f1" })}>
      {myAgents.length}
    </button>
  );
}

describe("ClientProviders", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("provides null activeAgentId when localStorage is empty", () => {
    render(<ClientProviders><ActiveIdDisplay /></ClientProviders>);
    expect(screen.getByTestId("id").textContent).toBe("none");
  });

  it("reads activeAgentId from localStorage on mount", async () => {
    localStorage.setItem("agentin_my_agent_id", "agent1");
    localStorage.setItem(
      "agentin_my_agents",
      JSON.stringify([{ id: "agent1", name: "Bot A", avatar_emoji: "🤖", avatar_color: "#6366f1" }])
    );
    render(<ClientProviders><ActiveIdDisplay /><AgentCountDisplay /></ClientProviders>);
    expect(await screen.findByText("agent1")).toBeInTheDocument();
    expect(screen.getByTestId("count").textContent).toBe("1");
  });

  it("switchAgent updates activeAgentId and localStorage", () => {
    render(<ClientProviders><SwitchButton /></ClientProviders>);
    act(() => { screen.getByRole("button").click(); });
    expect(screen.getByRole("button").textContent).toBe("agent2");
    expect(localStorage.getItem("agentin_my_agent_id")).toBe("agent2");
  });

  it("addAgent pushes to myAgents and updates localStorage", () => {
    render(<ClientProviders><AddButton /></ClientProviders>);
    expect(screen.getByRole("button").textContent).toBe("0");
    act(() => { screen.getByRole("button").click(); });
    expect(screen.getByRole("button").textContent).toBe("1");
    expect(JSON.parse(localStorage.getItem("agentin_my_agents")!)).toHaveLength(1);
  });

  it("addAgent deduplicates — re-adding same id replaces not duplicates", () => {
    localStorage.setItem(
      "agentin_my_agents",
      JSON.stringify([{ id: "a1", name: "Bot", avatar_emoji: "🤖", avatar_color: "#6366f1" }])
    );
    render(<ClientProviders><AddButton /></ClientProviders>);
    act(() => { screen.getByRole("button").click(); });
    expect(JSON.parse(localStorage.getItem("agentin_my_agents")!)).toHaveLength(1);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd /c/Users/abhiv/claudecode_projects/agentin
npm test -- tests/components/ClientProviders.test.tsx
```

Expected: FAIL — `Cannot find module '@/components/ClientProviders'`

**Step 3: Create `components/ClientProviders.tsx`**

```tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";

export interface StoredAgent {
  id: string;
  name: string;
  avatar_emoji: string;
  avatar_color: string;
}

interface ActiveAgentContextValue {
  activeAgentId: string | null;
  myAgents: StoredAgent[];
  switchAgent: (id: string) => void;
  addAgent: (agent: StoredAgent) => void;
}

export const ActiveAgentContext = createContext<ActiveAgentContextValue>({
  activeAgentId: null,
  myAgents: [],
  switchAgent: () => {},
  addAgent: () => {},
});

export function useActiveAgent() {
  return useContext(ActiveAgentContext);
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [myAgents, setMyAgents] = useState<StoredAgent[]>([]);

  useEffect(() => {
    const id = localStorage.getItem("agentin_my_agent_id");
    const stored = localStorage.getItem("agentin_my_agents");
    if (id) setActiveAgentId(id);
    if (stored) {
      try { setMyAgents(JSON.parse(stored)); } catch {}
    }
  }, []);

  const switchAgent = (id: string) => {
    setActiveAgentId(id);
    localStorage.setItem("agentin_my_agent_id", id);
  };

  const addAgent = (agent: StoredAgent) => {
    setMyAgents((prev) => {
      const next = prev.filter((a) => a.id !== agent.id).concat(agent);
      localStorage.setItem("agentin_my_agents", JSON.stringify(next));
      return next;
    });
  };

  return (
    <ActiveAgentContext.Provider value={{ activeAgentId, myAgents, switchAgent, addAgent }}>
      {children}
    </ActiveAgentContext.Provider>
  );
}
```

**Step 4: Run tests to verify they pass**

```bash
npm test -- tests/components/ClientProviders.test.tsx
```

Expected: 5 tests PASS

**Step 5: Commit**

```bash
git add components/ClientProviders.tsx tests/components/ClientProviders.test.tsx
git commit -m "feat: add ActiveAgentContext and ClientProviders for multi-agent support"
```

---

## Task 2: Create `AgentSwitcher` component

**Files:**
- Create: `components/AgentSwitcher.tsx`
- Create: `tests/components/AgentSwitcher.test.tsx`

**Step 1: Write the failing test**

Create `tests/components/AgentSwitcher.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AgentSwitcher } from "@/components/AgentSwitcher";
import { ActiveAgentContext } from "@/components/ClientProviders";
import type { StoredAgent } from "@/components/ClientProviders";

const agent1: StoredAgent = { id: "a1", name: "ResearchBot", avatar_emoji: "🤖", avatar_color: "#6366f1" };
const agent2: StoredAgent = { id: "a2", name: "CoderBot", avatar_emoji: "⚡", avatar_color: "#f59e0b" };

function wrap(value: {
  activeAgentId: string | null;
  myAgents: StoredAgent[];
  switchAgent: (id: string) => void;
  addAgent: (agent: StoredAgent) => void;
}) {
  return render(
    <ActiveAgentContext.Provider value={value}>
      <AgentSwitcher />
    </ActiveAgentContext.Provider>
  );
}

describe("AgentSwitcher", () => {
  it("shows Register Your Agent link when no agents registered", () => {
    wrap({ activeAgentId: null, myAgents: [], switchAgent: vi.fn(), addAgent: vi.fn() });
    expect(screen.getByText("Register Your Agent")).toBeInTheDocument();
  });

  it("shows active agent name when agents are registered", () => {
    wrap({ activeAgentId: "a1", myAgents: [agent1, agent2], switchAgent: vi.fn(), addAgent: vi.fn() });
    expect(screen.getByText("ResearchBot")).toBeInTheDocument();
  });

  it("dropdown is not visible before clicking trigger", () => {
    wrap({ activeAgentId: "a1", myAgents: [agent1, agent2], switchAgent: vi.fn(), addAgent: vi.fn() });
    expect(screen.queryByText("CoderBot")).not.toBeInTheDocument();
  });

  it("opens dropdown and shows all agents on trigger click", () => {
    wrap({ activeAgentId: "a1", myAgents: [agent1, agent2], switchAgent: vi.fn(), addAgent: vi.fn() });
    fireEvent.click(screen.getByTestId("agent-switcher-trigger"));
    expect(screen.getByText("CoderBot")).toBeInTheDocument();
  });

  it("calls switchAgent with correct id when another agent is clicked", () => {
    const switchAgent = vi.fn();
    wrap({ activeAgentId: "a1", myAgents: [agent1, agent2], switchAgent, addAgent: vi.fn() });
    fireEvent.click(screen.getByTestId("agent-switcher-trigger"));
    fireEvent.click(screen.getByTestId("agent-option-a2"));
    expect(switchAgent).toHaveBeenCalledWith("a2");
  });

  it("shows checkmark only on active agent", () => {
    wrap({ activeAgentId: "a1", myAgents: [agent1, agent2], switchAgent: vi.fn(), addAgent: vi.fn() });
    fireEvent.click(screen.getByTestId("agent-switcher-trigger"));
    expect(screen.getByTestId("agent-option-a1")).toHaveTextContent("✓");
    expect(screen.getByTestId("agent-option-a2")).not.toHaveTextContent("✓");
  });

  it("shows Register agent link at bottom of dropdown", () => {
    wrap({ activeAgentId: "a1", myAgents: [agent1], switchAgent: vi.fn(), addAgent: vi.fn() });
    fireEvent.click(screen.getByTestId("agent-switcher-trigger"));
    expect(screen.getByText("Register agent")).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- tests/components/AgentSwitcher.test.tsx
```

Expected: FAIL — `Cannot find module '@/components/AgentSwitcher'`

**Step 3: Create `components/AgentSwitcher.tsx`**

```tsx
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
```

**Step 4: Run tests to verify they pass**

```bash
npm test -- tests/components/AgentSwitcher.test.tsx
```

Expected: 7 tests PASS

**Step 5: Commit**

```bash
git add components/AgentSwitcher.tsx tests/components/AgentSwitcher.test.tsx
git commit -m "feat: add AgentSwitcher navbar dropdown for switching between registered agents"
```

---

## Task 3: Wire layout and update registration

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/register/page.tsx`

**Step 1: Update `app/layout.tsx`**

Replace the entire file:

```tsx
import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ClientProviders } from "@/components/ClientProviders";

export const metadata: Metadata = {
  title: "AgentIn — The professional network for AI agents",
  description: "LinkedIn for AI agents",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>
          <ClientProviders>
            {children}
          </ClientProviders>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
```

**Step 2: Update `app/register/page.tsx`**

At the top of the file add the import and hook (after the existing imports):

```tsx
import { useActiveAgent } from "@/components/ClientProviders";
```

Inside `RegisterPage()`, add after the existing hooks:

```tsx
const { addAgent, switchAgent } = useActiveAgent();
```

In `handleSubmit`, replace:

```tsx
localStorage.setItem("agentin_my_agent_id", id);
router.push(`/agents/${id}`);
```

With:

```tsx
addAgent({ id, name: form.name, avatar_emoji: form.avatar_emoji, avatar_color: form.avatar_color });
switchAgent(id);
router.push(`/agents/${id}`);
```

**Step 3: Run TypeScript check**

```bash
cd /c/Users/abhiv/claudecode_projects/agentin
npx tsc --noEmit 2>&1 | head -20
```

Expected: Only pre-existing errors. No new errors.

**Step 4: Run all tests**

```bash
npm test
```

Expected: All tests pass (at least 30 existing + 5 ClientProviders + 7 AgentSwitcher = 42)

**Step 5: Commit**

```bash
git add app/layout.tsx app/register/page.tsx
git commit -m "feat: wire ClientProviders into layout, update registration to use context"
```

---

## Task 4: Update pages to use context + add AgentSwitcher to navbars

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/messages/page.tsx`
- Modify: `components/AgentProfileView.tsx`
- Modify: `app/agents/[id]/page.tsx`

### `app/page.tsx`

Add import at the top:
```tsx
import { AgentSwitcher } from "@/components/AgentSwitcher";
```

In the navbar, replace:
```tsx
<Link
  href="/register"
  className="text-sm font-medium text-white px-4 py-2 rounded-lg transition-all bg-indigo-500 hover:bg-indigo-400"
  style={{ boxShadow: "0 0 16px rgba(99,102,241,0.35)" }}
>
  Register Your Agent
</Link>
```

With:
```tsx
<AgentSwitcher />
```

The page already has no direct localStorage usage for agent identity (it doesn't use `myAgentId`), so no other changes needed here.

### `app/messages/page.tsx`

Add import:
```tsx
import { useActiveAgent } from "@/components/ClientProviders";
import { AgentSwitcher } from "@/components/AgentSwitcher";
```

Replace the `useState` + `useEffect` that read localStorage:
```tsx
// REMOVE these:
const [myAgentId, setMyAgentId] = useState<Id<"agents"> | null>(null);
useEffect(() => {
  const id = localStorage.getItem("agentin_my_agent_id");
  if (id) setMyAgentId(id as Id<"agents">);
}, []);
```

With:
```tsx
const { activeAgentId } = useActiveAgent();
const myAgentId = activeAgentId as Id<"agents"> | null;
```

Also add `AgentSwitcher` to the messages navbar. Replace the navbar content:

```tsx
<div className="max-w-2xl mx-auto flex items-center justify-between">
  <div className="flex items-center gap-4">
    <a
      href="/"
      className="text-xl font-bold bg-clip-text text-transparent"
      style={{ backgroundImage: "linear-gradient(90deg, #ffffff, #818cf8)" }}
    >
      AgentIn
    </a>
    <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
    <span className="font-medium" style={{ color: "#f0f6fc" }}>Messages</span>
  </div>
  <AgentSwitcher />
</div>
```

### `components/AgentProfileView.tsx`

Add import:
```tsx
import { useActiveAgent } from "@/components/ClientProviders";
```

Remove the `myAgentId` prop from the interface and component signature:

```tsx
// BEFORE:
export function AgentProfileView({
  agent,
  myAgentId: myAgentIdProp,
}: {
  agent: Agent;
  myAgentId: string | null;
}) {
  const [myAgentId, setMyAgentId] = useState<string | null>(myAgentIdProp);

  useEffect(() => {
    const stored = localStorage.getItem("agentin_my_agent_id");
    if (stored) setMyAgentId(stored);
  }, []);

// AFTER:
export function AgentProfileView({ agent }: { agent: Agent }) {
  const { activeAgentId: myAgentId } = useActiveAgent();
```

Also remove `useState` and `useEffect` imports if they are no longer used elsewhere in the file (check — `ConnectButton` uses `useState` so keep that import; `useEffect` can be removed if nothing else uses it).

### `app/agents/[id]/page.tsx`

Remove the `myAgentId={null}` prop from `AgentProfileView`:

```tsx
// BEFORE:
<AgentProfileView agent={agent} myAgentId={null} />

// AFTER:
<AgentProfileView agent={agent} />
```

**Step 1: Make all four file changes above**

**Step 2: Run TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: Only pre-existing errors. No new errors.

**Step 3: Run all tests**

```bash
npm test
```

Expected: All tests pass (42+)

**Step 4: Commit**

```bash
git add app/page.tsx app/messages/page.tsx components/AgentProfileView.tsx app/agents/[id]/page.tsx
git commit -m "feat: add AgentSwitcher to navbars, replace localStorage reads with context"
```

---
