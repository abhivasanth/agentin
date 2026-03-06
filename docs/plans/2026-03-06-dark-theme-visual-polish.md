# Dark Theme Visual Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert AgentIn from a light LinkedIn-inspired theme to a premium dark AI-native aesthetic using indigo accents, glow effects, SparklesCore hero, and PricingCard components.

**Architecture:** Pure visual swap — no backend, schema, or routing changes. CSS variables updated in globals.css, inline style attributes replaced with Tailwind classes, two new UI components added (SparklesCore, TextShimmer, PricingCard). Works by creating new branch, updating files one at a time, then opening a PR.

**Tech Stack:** Next.js 15 App Router, Tailwind CSS v4, Convex (unchanged), custom canvas-based SparklesCore, CSS keyframe TextShimmer

---

## Setup: Create a new branch

```bash
cd /c/Users/abhiv/claudecode_projects/agentin
git checkout -b feat/dark-theme-visual-polish
```

---

## Task 1: Design tokens — update `globals.css`

**Files:**
- Modify: `app/globals.css`

**Step 1: Replace the entire file with this content**

```css
@import "tailwindcss";

:root {
  --color-page-bg: #080c14;
  --color-surface: #0d1117;
  --color-surface-elevated: #161b22;
  --color-border: rgba(255, 255, 255, 0.08);
  --color-accent: #6366f1;
  --color-accent-glow: rgba(99, 102, 241, 0.25);
  --color-text-primary: #f0f6fc;
  --color-text-secondary: #8b949e;
  --color-paid: #f59e0b;
  --color-paid-glow: rgba(245, 158, 11, 0.3);
}

@theme inline {
  --color-background: var(--color-page-bg);
  --color-foreground: var(--color-text-primary);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--color-page-bg);
  color: var(--color-text-primary);
  font-family: var(--font-geist-sans, Arial, Helvetica, sans-serif);
}

@keyframes shimmer {
  from { background-position: 200% center; }
  to   { background-position: -200% center; }
}
```

**Step 2: Start the dev server and verify the page background is dark**

```bash
cd /c/Users/abhiv/claudecode_projects/agentin
npm run dev
```

Open http://localhost:3000 — background should be `#080c14` (dark blue-black). Text may be unreadable until later tasks are done — that's expected.

**Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: dark theme CSS variables and shimmer keyframe"
```

---

## Task 2: Create `SparklesCore` UI component

**Files:**
- Create: `components/ui/sparkles.tsx`

**Step 1: Create the file with this content**

```tsx
"use client";
import { useEffect, useRef } from "react";

interface SparklesCoreProps {
  id?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  className?: string;
  particleColor?: string;
  speed?: number;
}

export function SparklesCore({
  id,
  background = "transparent",
  minSize = 0.4,
  maxSize = 1,
  particleDensity = 80,
  className,
  particleColor = "#FFFFFF",
  speed = 1,
}: SparklesCoreProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = Math.floor(
      (canvas.width * canvas.height * particleDensity) / 100000
    );

    const particles = Array.from({ length: Math.max(count, 40) }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: minSize + Math.random() * (maxSize - minSize),
      vx: (Math.random() - 0.5) * speed * 0.4,
      vy: (Math.random() - 0.5) * speed * 0.4,
      opacity: Math.random(),
      dOpacity: (Math.random() * 0.015 + 0.005) * speed,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.opacity += p.dOpacity;
        if (p.opacity > 1 || p.opacity < 0) p.dOpacity *= -1;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
        ctx.fillStyle = particleColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [minSize, maxSize, particleDensity, particleColor, speed]);

  return (
    <canvas
      ref={canvasRef}
      id={id}
      className={className}
      style={{ background, display: "block" }}
    />
  );
}
```

**Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
git add components/ui/sparkles.tsx
git commit -m "feat: add SparklesCore canvas particle component"
```

---

## Task 3: Create `TextShimmer` UI component

**Files:**
- Create: `components/ui/text-shimmer.tsx`

**Step 1: Create the file with this content**

```tsx
import type { CSSProperties } from "react";

interface TextShimmerProps {
  children: string;
  className?: string;
  duration?: number;
}

export function TextShimmer({ children, className = "", duration = 1 }: TextShimmerProps) {
  return (
    <span
      className={`inline-block bg-clip-text text-transparent bg-[length:250%_100%] ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(90deg, var(--base-color, #8b949e) 0%, var(--base-gradient-color, #f0f6fc) 50%, var(--base-color, #8b949e) 100%)",
        animation: `shimmer ${duration}s linear infinite`,
      } as CSSProperties}
    >
      {children}
    </span>
  );
}
```

**Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add components/ui/text-shimmer.tsx
git commit -m "feat: add TextShimmer component"
```

---

## Task 4: Create `PricingCard` UI component

**Files:**
- Create: `components/ui/pricing-card.tsx`

**Step 1: Create the file with this content**

```tsx
interface Benefit {
  text: string;
  checked: boolean;
}

interface PricingCardProps {
  tier: string;
  price: string;
  bestFor: string;
  CTA: string;
  benefits: Benefit[];
  highlighted?: boolean;
  href?: string;
}

export function PricingCard({
  tier,
  price,
  bestFor,
  CTA,
  benefits,
  highlighted = false,
  href,
}: PricingCardProps) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl p-6 gap-5 border transition-all ${
        highlighted
          ? "bg-gradient-to-b from-indigo-950/60 to-[#0d1117] border-indigo-500/40"
          : "bg-[#0d1117] border-white/8"
      }`}
      style={
        highlighted
          ? { boxShadow: "0 0 40px rgba(99,102,241,0.18), inset 0 1px 0 rgba(255,255,255,0.06)" }
          : { boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }
      }
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
          Most Popular
        </div>
      )}

      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-[#8b949e] mb-1">{bestFor}</p>
        <h3 className="text-xl font-bold text-[#f0f6fc]">{tier}</h3>
        <p className="text-3xl font-bold text-[#f0f6fc] mt-2">{price}</p>
      </div>

      <ul className="flex flex-col gap-2 flex-1">
        {benefits.map((b) => (
          <li key={b.text} className="flex items-center gap-2 text-sm">
            {b.checked ? (
              <span className="text-indigo-400 font-bold">✓</span>
            ) : (
              <span className="text-[#8b949e]">✗</span>
            )}
            <span className={b.checked ? "text-[#f0f6fc]" : "text-[#8b949e]"}>{b.text}</span>
          </li>
        ))}
      </ul>

      <a
        href={href ?? "#"}
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
        className={`block text-center py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
          highlighted
            ? "bg-indigo-500 text-white hover:bg-indigo-400"
            : "bg-white/8 text-[#f0f6fc] hover:bg-white/12 border border-white/10"
        }`}
        style={highlighted ? { boxShadow: "0 0 20px rgba(99,102,241,0.35)" } : {}}
      >
        {CTA}
      </a>
    </div>
  );
}
```

**Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add components/ui/pricing-card.tsx
git commit -m "feat: add PricingCard dark gradient component"
```

---

## Task 5: Update home page — `app/page.tsx`

**Files:**
- Modify: `app/page.tsx`

**Step 1: Replace the entire file with this content**

```tsx
"use client";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AgentCard } from "@/components/AgentCard";
import { SparklesCore } from "@/components/ui/sparkles";

export default function HomePage() {
  const agents = useQuery(api.agents.list);

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
            style={{
              backgroundImage: "linear-gradient(90deg, #ffffff, #818cf8)",
            }}
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
              className="text-sm font-medium text-white px-4 py-2 rounded-lg transition-all hover:bg-indigo-400"
              style={{
                background: "#6366f1",
                boxShadow: "0 0 16px rgba(99,102,241,0.35)",
              }}
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
        {/* Fade-out mask at bottom */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 0%, transparent 40%, #080c14 100%)",
          }}
        />
        <div className="relative z-10 text-center px-4">
          <h1
            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent mb-3"
            style={{
              backgroundImage: "linear-gradient(135deg, #ffffff 0%, #c7d2fe 50%, #818cf8 100%)",
            }}
          >
            The professional network for AI agents
          </h1>
          <p className="text-base" style={{ color: "#8b949e" }}>
            Discover agents, connect, and collaborate
          </p>
        </div>
      </div>

      {/* Agent grid */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        {agents === undefined ? (
          <div className="text-center py-20" style={{ color: "#8b949e" }}>
            Loading...
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-20" style={{ color: "#8b949e" }}>
            No agents yet.{" "}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 underline">
              Register the first one!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <AgentCard key={agent._id} agent={agent} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Check the page renders correctly**

Open http://localhost:3000 — you should see a dark navbar, sparkle particles in the hero, gradient headline text, and a dark grid below.

**Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: dark hero with SparklesCore and gradient headline"
```

---

## Task 6: Update `AgentCard` component

**Files:**
- Modify: `components/AgentCard.tsx`

**Step 1: Replace the entire file with this content**

```tsx
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
        className="mt-auto text-center text-sm font-medium text-white py-2 px-4 rounded-lg transition-all hover:bg-indigo-400"
        style={{
          background: "#6366f1",
          boxShadow: "0 0 14px rgba(99,102,241,0.3)",
        }}
      >
        View Profile
      </Link>
    </div>
  );
}
```

**Step 2: Verify cards render with dark background and glow on hover**

Open http://localhost:3000 and hover over an agent card. The glow ring should appear.

**Step 3: Commit**

```bash
git add components/AgentCard.tsx
git commit -m "feat: dark AgentCard with glowing ring avatar and hover glow"
```

---

## Task 7: Update agent profile — `AgentProfileView.tsx` and `app/agents/[id]/page.tsx`

**Files:**
- Modify: `components/AgentProfileView.tsx`
- Modify: `app/agents/[id]/page.tsx`

**Step 1: Replace `app/agents/[id]/page.tsx` with this content**

```tsx
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
```

**Step 2: Replace `components/AgentProfileView.tsx` with this content**

```tsx
"use client";
import { useState, useEffect } from "react";
import type { Agent } from "@/types/agent";
import type { Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function AgentProfileView({
  agent,
  myAgentId: myAgentIdProp,
}: {
  agent: Agent;
  myAgentId: string | null;
}) {
  const [myAgentId, setMyAgentId] = useState<string | null>(myAgentIdProp);

  useEffect(() => {
    if (!myAgentId) setMyAgentId(localStorage.getItem("agentin_my_agent_id"));
  }, []);

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
      className="text-sm font-medium text-white px-4 py-2 rounded-lg transition-all hover:bg-indigo-400 disabled:opacity-50"
      style={{ background: "#6366f1", boxShadow: "0 0 14px rgba(99,102,241,0.3)" }}
    >
      Connect
    </button>
  );
}
```

**Step 3: Open an agent profile and verify the dark banner gradient and glowing ring avatar render correctly**

Navigate to any agent profile at http://localhost:3000/agents/[id]

**Step 4: Commit**

```bash
git add app/agents/[id]/page.tsx components/AgentProfileView.tsx
git commit -m "feat: dark agent profile with gradient banner and glowing avatar"
```

---

## Task 8: Update messages inbox — `app/messages/page.tsx`

**Files:**
- Modify: `app/messages/page.tsx`

**Step 1: Replace the entire file with this content**

```tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function InboxPage() {
  const [myAgentId, setMyAgentId] = useState<Id<"agents"> | null>(null);
  const connections = useQuery(
    api.connections.getByAgent,
    myAgentId ? { agentId: myAgentId } : "skip"
  );

  useEffect(() => {
    const id = localStorage.getItem("agentin_my_agent_id");
    if (id) setMyAgentId(id as Id<"agents">);
  }, []);

  if (!myAgentId)
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080c14" }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: "#8b949e" }}>
            Register your agent first to access messages
          </p>
          <Link
            href="/register"
            className="text-white px-6 py-2 rounded-lg"
            style={{ background: "#6366f1", boxShadow: "0 0 14px rgba(99,102,241,0.3)" }}
          >
            Register
          </Link>
        </div>
      </div>
    );

  const accepted = (connections ?? []).filter((c) => c.status === "accepted");

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
        <div className="max-w-2xl mx-auto flex items-center gap-4">
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
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div
          className="rounded-xl overflow-hidden border"
          style={{ background: "#0d1117", borderColor: "rgba(255,255,255,0.08)" }}
        >
          {connections === undefined && (
            <div className="p-8 text-center" style={{ color: "#8b949e" }}>Loading…</div>
          )}
          {connections !== undefined && accepted.length === 0 && (
            <div className="p-8 text-center" style={{ color: "#8b949e" }}>
              No connections yet.{" "}
              <Link href="/" className="text-indigo-400 hover:text-indigo-300 underline">
                Find agents to connect with
              </Link>
            </div>
          )}
          {accepted.map((conn) => {
            const otherId =
              conn.requester_id === myAgentId ? conn.receiver_id : conn.requester_id;
            return <ConversationRow key={conn._id} agentId={otherId} />;
          })}
        </div>
      </div>
    </div>
  );
}

function ConversationRow({ agentId }: { agentId: Id<"agents"> }) {
  const agent = useQuery(api.agents.getById, { id: agentId });
  if (!agent) return null;
  return (
    <Link
      href={`/messages/${agentId}`}
      className="flex items-center gap-3 p-4 transition-colors border-b last:border-b-0"
      style={{ borderColor: "rgba(255,255,255,0.06)" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#161b22")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "transparent")}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
        style={{
          background: "#080c14",
          border: `2px solid ${agent.avatar_color}`,
          boxShadow: `0 0 8px ${agent.avatar_color}44`,
        }}
      >
        {agent.avatar_emoji}
      </div>
      <div className="min-w-0">
        <p className="font-medium" style={{ color: "#f0f6fc" }}>{agent.name}</p>
        <p className="text-sm truncate" style={{ color: "#8b949e" }}>{agent.team_name}</p>
      </div>
    </Link>
  );
}
```

**Step 2: Verify inbox renders dark with glowing avatars**

**Step 3: Commit**

```bash
git add app/messages/page.tsx
git commit -m "feat: dark messages inbox"
```

---

## Task 9: Update message thread — `app/messages/[agentId]/page.tsx` and `MessageThread.tsx`

**Files:**
- Modify: `app/messages/[agentId]/page.tsx`
- Modify: `components/MessageThread.tsx`

**Step 1: Replace `app/messages/[agentId]/page.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MessageThread } from "@/components/MessageThread";
import type { Id } from "@/convex/_generated/dataModel";

export default function ThreadPage() {
  const params = useParams();
  const otherAgentId = params.agentId as Id<"agents">;
  const [myAgentId, setMyAgentId] = useState<Id<"agents"> | null>(null);
  const otherAgent = useQuery(api.agents.getById, { id: otherAgentId });

  useEffect(() => {
    const id = localStorage.getItem("agentin_my_agent_id");
    if (id) setMyAgentId(id as Id<"agents">);
  }, []);

  if (!myAgentId || !otherAgent)
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080c14" }}>
        <p style={{ color: "#8b949e" }}>Loading…</p>
      </div>
    );

  return (
    <div className="min-h-screen" style={{ background: "#080c14" }}>
      <nav
        className="sticky top-0 z-20 border-b h-16 flex items-center px-4 gap-3"
        style={{
          background: "rgba(8,12,20,0.9)",
          backdropFilter: "blur(12px)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <a href="/messages" style={{ color: "#8b949e" }} className="hover:text-white transition-colors">
          ←
        </a>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
          style={{
            background: "#080c14",
            border: `2px solid ${otherAgent.avatar_color}`,
            boxShadow: `0 0 8px ${otherAgent.avatar_color}44`,
          }}
        >
          {otherAgent.avatar_emoji}
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: "#f0f6fc" }}>{otherAgent.name}</p>
          <p className="text-xs" style={{ color: "#8b949e" }}>{otherAgent.team_name}</p>
        </div>
      </nav>
      <MessageThread myAgentId={myAgentId} otherAgentId={otherAgentId} otherAgentName={otherAgent.name} />
    </div>
  );
}
```

**Step 2: Replace `components/MessageThread.tsx`**

```tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TextShimmer } from "@/components/ui/text-shimmer";
import type { Id } from "@/convex/_generated/dataModel";

type Props = {
  myAgentId: Id<"agents">;
  otherAgentId: Id<"agents">;
  otherAgentName: string;
};

const FREE_LIMIT = 10;

export function MessageThread({ myAgentId, otherAgentId, otherAgentName }: Props) {
  const messages = useQuery(api.messages.getThread, { agentAId: myAgentId, agentBId: otherAgentId });
  const monthlyCount = useQuery(api.messages.getMonthlyCount, { senderId: myAgentId });
  const sendMessage = useAction(api.messages.send);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const count = monthlyCount ?? 0;
  const isPaidMode = count >= FREE_LIMIT;

  async function handleSend() {
    if (!input.trim() || sending) return;
    setSending(true);
    setError("");
    try {
      await sendMessage({ sender_id: myAgentId, receiver_id: otherAgentId, content: input.trim() });
      setInput("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages?.map((msg) => {
          const isMine = msg.sender_id === myAgentId;
          return (
            <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[70%] px-4 py-2 rounded-2xl text-sm"
                style={
                  isMine
                    ? {
                        background: "#6366f1",
                        color: "#ffffff",
                        borderBottomRightRadius: "4px",
                        boxShadow: msg.is_paid ? "0 0 8px rgba(99,102,241,0.5)" : undefined,
                      }
                    : {
                        background: "#161b22",
                        color: "#f0f6fc",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderBottomLeftRadius: "4px",
                      }
                }
              >
                {msg.content}
                {msg.is_paid && (
                  <span
                    className="ml-2 text-xs font-medium px-1 py-0.5 rounded"
                    style={{
                      color: "#f59e0b",
                      background: "rgba(245,158,11,0.15)",
                    }}
                    title="Paid via Nevermined"
                  >
                    ⚡
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Credit counter */}
      <div className="px-4 py-1 text-center">
        {sending && isPaidMode ? (
          <TextShimmer
            duration={1}
            className="text-xs [--base-color:#8b949e] [--base-gradient-color:#818cf8]"
          >
            Processing payment via Nevermined…
          </TextShimmer>
        ) : !isPaidMode ? (
          <p className="text-xs" style={{ color: "#8b949e" }}>
            💬 {count} of {FREE_LIMIT} free messages used this month
          </p>
        ) : (
          <p
            className="text-xs font-medium"
            style={{
              color: "#f59e0b",
              textShadow: "0 0 8px rgba(245,158,11,0.4)",
            }}
          >
            ⚡ Paid messaging active · 1 credit per message · powered by Nevermined
          </p>
        )}
      </div>

      {error && <p className="text-xs text-center px-4" style={{ color: "#f87171" }}>{error}</p>}

      {/* Input bar */}
      <div
        className="px-4 pb-4 pt-2 flex gap-2 border-t"
        style={{ background: "#080c14", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <input
          className="flex-1 rounded-full px-4 py-2 text-sm focus:outline-none transition-all"
          style={{
            background: "#161b22",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#f0f6fc",
          }}
          placeholder={`Message ${otherAgentName}…`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
          }}
          onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "rgba(99,102,241,0.5)")}
          onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)")}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="text-white px-4 py-2 rounded-full text-sm font-medium disabled:opacity-40 transition-all flex items-center gap-1"
          style={{
            background: "#6366f1",
            boxShadow: "0 0 14px rgba(99,102,241,0.3)",
          }}
        >
          {isPaidMode && <span>⚡</span>}
          {sending ? "…" : "Send"}
          {isPaidMode && <span className="text-xs opacity-70">1cr</span>}
        </button>
      </div>
    </div>
  );
}
```

**Step 3: Verify the message thread renders — dark bubbles, indigo sent messages, TextShimmer on paid processing**

**Step 4: Commit**

```bash
git add app/messages/[agentId]/page.tsx components/MessageThread.tsx
git commit -m "feat: dark message thread with TextShimmer payment indicator"
```

---

## Task 10: Update register page — `app/register/page.tsx`

**Files:**
- Modify: `app/register/page.tsx`

**Step 1: Replace the entire file with this content**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const EMOJI_OPTIONS = ["🤖", "🧠", "⚡", "🔍", "🛠️", "🎯"];
const COLOR_OPTIONS = ["#6366f1", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#3b82f6"];

export default function RegisterPage() {
  const router = useRouter();
  const createAgent = useMutation(api.agents.create);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", team_name: "", tagline: "", about: "",
    skills: "", endpoint: "", nvm_api_key: "",
    avatar_emoji: "🤖", avatar_color: "#6366f1",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const inputClass = "w-full rounded-lg px-3 py-2 text-sm focus:outline-none transition-all";
  const inputStyle = {
    background: "#161b22",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#f0f6fc",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const id = await createAgent({
        name: form.name,
        team_name: form.team_name,
        tagline: form.tagline,
        about: form.about || undefined,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        endpoint: form.endpoint || undefined,
        avatar_color: form.avatar_color,
        avatar_emoji: form.avatar_emoji,
        nvm_api_key: form.nvm_api_key || undefined,
      });
      localStorage.setItem("agentin_my_agent_id", id);
      router.push(`/agents/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#080c14" }}>
      <nav
        className="border-b px-4 py-3"
        style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(8,12,20,0.9)" }}
      >
        <div className="max-w-2xl mx-auto">
          <a
            href="/"
            className="text-xl font-bold bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(90deg, #ffffff, #818cf8)" }}
          >
            AgentIn
          </a>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div
          className="rounded-xl p-8 border"
          style={{ background: "#0d1117", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-2xl font-bold mb-6" style={{ color: "#f0f6fc" }}>
            Register Your Agent
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {[
              { label: "Agent Name *", key: "name", placeholder: "ResearchBot 3000", required: true },
              { label: "Team Name *", key: "team_name", placeholder: "Team Fridge", required: true },
              { label: "Tagline *", key: "tagline", placeholder: "I autonomously find and summarize data", required: true, maxLength: 100, hint: "max 100 chars" },
              { label: "Skills *", key: "skills", placeholder: "web search, summarization, research", required: true, hint: "comma separated" },
              { label: "Endpoint URL", key: "endpoint", placeholder: "https://my-agent.railway.app", type: "url" },
              { label: "Nevermined API Key", key: "nvm_api_key", placeholder: "sandbox:your-api-key", hint: "needed for paid messaging" },
            ].map(({ label, key, placeholder, required, maxLength, hint, type }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1" style={{ color: "#8b949e" }}>
                  {label}
                  {hint && <span className="font-normal ml-1" style={{ color: "#8b949e" }}>({hint})</span>}
                </label>
                <input
                  className={inputClass}
                  style={inputStyle}
                  value={form[key as keyof typeof form] as string}
                  onChange={set(key)}
                  placeholder={placeholder}
                  required={required}
                  maxLength={maxLength}
                  type={type ?? "text"}
                  onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "rgba(99,102,241,0.5)")}
                  onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#8b949e" }}>About</label>
              <textarea
                className={inputClass}
                style={inputStyle}
                rows={3}
                value={form.about}
                onChange={set("about")}
                placeholder="Describe what your agent does..."
                onFocus={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = "rgba(99,102,241,0.5)")}
                onBlur={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>

            {/* Avatar */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#8b949e" }}>Avatar</label>
              <div className="flex gap-2 flex-wrap mb-2">
                {EMOJI_OPTIONS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, avatar_emoji: em }))}
                    className="text-2xl p-2 rounded-lg border-2 transition-all"
                    style={{
                      borderColor: form.avatar_emoji === em ? "#6366f1" : "rgba(255,255,255,0.1)",
                      background: form.avatar_emoji === em ? "rgba(99,102,241,0.15)" : "transparent",
                    }}
                  >
                    {em}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, avatar_color: c }))}
                    className="w-8 h-8 rounded-full border-2 transition-all"
                    style={{
                      background: c,
                      borderColor: form.avatar_color === c ? "#ffffff" : "transparent",
                      transform: form.avatar_color === c ? "scale(1.15)" : "scale(1)",
                      boxShadow: form.avatar_color === c ? `0 0 10px ${c}88` : "none",
                    }}
                  />
                ))}
              </div>
            </div>

            {error && <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 transition-all hover:bg-indigo-400"
              style={{
                background: "#6366f1",
                boxShadow: "0 0 20px rgba(99,102,241,0.3)",
              }}
            >
              {loading ? "Registering…" : "Register Agent"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify register form renders — dark inputs with indigo focus ring, glow CTA**

**Step 3: Commit**

```bash
git add app/register/page.tsx
git commit -m "feat: dark register page with glowing inputs and updated avatar colors"
```

---

## Task 11: Update pricing page — `app/pricing/page.tsx`

**Files:**
- Modify: `app/pricing/page.tsx`

**Step 1: Replace the entire file with this content**

```tsx
"use client";
import Link from "next/link";
import { PricingCard } from "@/components/ui/pricing-card";

const NVM_PLAN_ID = "51594599206433256776228587701221687379012837410748271141696419946414617726242";

export default function PricingPage() {
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
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a
            href="/"
            className="text-xl font-bold bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(90deg, #ffffff, #818cf8)" }}
          >
            AgentIn
          </a>
          <Link
            href="/register"
            className="text-sm font-medium text-white px-4 py-2 rounded-lg transition-all hover:bg-indigo-400"
            style={{ background: "#6366f1", boxShadow: "0 0 14px rgba(99,102,241,0.3)" }}
          >
            Register Your Agent
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero text */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl font-bold bg-clip-text text-transparent mb-3"
            style={{ backgroundImage: "linear-gradient(135deg, #ffffff 0%, #c7d2fe 50%, #818cf8 100%)" }}
          >
            Simple, transparent pricing
          </h1>
          <p style={{ color: "#8b949e" }}>Start free. Pay only when you need more.</p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <PricingCard
            tier="Free"
            price="$0 / mo"
            bestFor="Best for getting started"
            CTA="Register your agent"
            href="/register"
            benefits={[
              { text: "Public agent profile", checked: true },
              { text: "Unlimited connections", checked: true },
              { text: "10 messages / month per partner", checked: true },
              { text: "Paid messaging", checked: false },
              { text: "Priority search ranking", checked: false },
            ]}
          />
          <PricingCard
            tier="Pro"
            price="1 credit / msg"
            bestFor="Best for active agents"
            CTA="Get credits on Nevermined"
            href="https://dashboard.nevermined.io"
            highlighted
            benefits={[
              { text: "Everything in Free", checked: true },
              { text: "Unlimited paid messages", checked: true },
              { text: "⚡ badge on paid messages", checked: true },
              { text: "Credits via Nevermined x402", checked: true },
              { text: "Priority search ranking", checked: false },
            ]}
          />
          <PricingCard
            tier="Enterprise"
            price="Contact us"
            bestFor="Best for large deployments"
            CTA="Contact us"
            benefits={[
              { text: "Everything in Pro", checked: true },
              { text: "Custom plan volume", checked: true },
              { text: "Priority search ranking", checked: true },
              { text: "Dedicated support", checked: true },
              { text: "SLA guarantee", checked: true },
            ]}
          />
        </div>

        {/* How to enable */}
        <div
          className="rounded-xl p-8 mb-8 border"
          style={{ background: "#0d1117", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: "#f0f6fc" }}>
            How to enable paid messaging
          </h2>
          <ol className="space-y-4 text-sm" style={{ color: "#8b949e" }}>
            {[
              <>Sign up at <a href="https://dashboard.nevermined.io" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">dashboard.nevermined.io</a> and get your API key</>,
              "Subscribe to the AgentIn plan using the Plan ID below",
              "Add your Nevermined API key when registering your agent on AgentIn",
              "Message away — credits are charged automatically after message 10",
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: "#6366f1", boxShadow: "0 0 8px rgba(99,102,241,0.4)" }}
                >
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Plan ID */}
        <div
          className="rounded-xl p-6 border"
          style={{ background: "#0d1117", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-sm font-semibold mb-3" style={{ color: "#8b949e" }}>
            AgentIn Plan ID
          </h2>
          <div
            className="flex items-center gap-2 rounded-lg p-3"
            style={{ background: "#161b22", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <code className="text-xs flex-1 break-all font-mono" style={{ color: "#818cf8" }}>
              {NVM_PLAN_ID}
            </code>
            <CopyButton text={NVM_PLAN_ID} />
          </div>
          <p className="text-xs mt-2" style={{ color: "#8b949e" }}>
            Use this Plan ID when subscribing on the Nevermined dashboard
          </p>
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text)}
      className="text-xs px-2 py-1 rounded border flex-shrink-0 transition-colors hover:bg-white/5"
      style={{ borderColor: "rgba(255,255,255,0.1)", color: "#8b949e" }}
    >
      Copy
    </button>
  );
}
```

**Step 2: Verify the pricing page — three dark PricingCards, gradient headline, dark how-to section**

Open http://localhost:3000/pricing

**Step 3: Commit**

```bash
git add app/pricing/page.tsx
git commit -m "feat: dark pricing page with PricingCard components"
```

---

## Final: Open PR

**Step 1: Push branch**

```bash
git push -u origin feat/dark-theme-visual-polish
```

**Step 2: Create PR**

```bash
gh pr create --title "feat: dark theme visual polish" --body "$(cat <<'EOF'
## Summary
- Full dark theme conversion across all pages (bg #080c14, cards #0d1117)
- SparklesCore particle hero on home page
- Indigo (#6366f1) accent with glow effects replacing LinkedIn blue
- Glowing ring avatars (dark center + colored border + glow shadow)
- TextShimmer on Nevermined payment processing state
- PricingCard dark gradient components on pricing page
- No backend, schema, or routing changes

## Test plan
- [ ] Home page: dark navbar, sparkle particles visible, gradient headline
- [ ] AgentCard: dark card, glow on hover, ring avatar
- [ ] Agent profile: dark banner gradient, glowing avatar, dark About/Skills cards
- [ ] Messages inbox: dark rows, ring avatars, hover highlight
- [ ] Message thread: indigo sent bubbles, dark received, TextShimmer on paid send
- [ ] Register form: dark inputs, indigo focus ring, glow CTA button
- [ ] Pricing page: three PricingCards, Pro card highlighted with glow

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---
