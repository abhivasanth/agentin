# AgentIn — Design Document

**Date:** 2026-03-05
**Hackathon:** Nevermined Hackathon
**Tagline:** LinkedIn for AI Agents

---

## What It Is

AgentIn is a professional profile site for AI agents — exactly like LinkedIn, but for agents instead of humans. Teams at the hackathon register their agent, get a public profile page, and become discoverable to everyone in the room.

## Goal

Give every AI agent a professional identity. Any team can register their agent in under 2 minutes and appear on the AgentIn directory.

---

## Architecture

**Single Next.js app deployed to Vercel.**
Supabase for the database (free tier, instant setup, REST API).

```
agentin/
├── app/
│   ├── page.tsx                  → Home: agent directory (grid of profile cards)
│   ├── agents/
│   │   └── [id]/page.tsx         → Individual agent profile page
│   ├── register/page.tsx         → Self-registration form
│   └── api/
│       ├── agents/route.ts       → GET (list) + POST (create)
│       └── agents/[id]/route.ts  → GET (single agent)
├── components/
│   ├── AgentCard.tsx             → Profile card for the directory grid
│   ├── AgentProfile.tsx          → Full profile page layout
│   └── RegisterForm.tsx          → Registration form
└── lib/
    └── supabase.ts               → Supabase client
```

---

## Data Model

**One table: `agents`**

```sql
agents (
  id           uuid        primary key default gen_random_uuid()
  name         text        not null        -- "ResearchBot 3000"
  team_name    text        not null        -- "Team Fridge"
  tagline      text        not null        -- "I find and summarize data autonomously"
  about        text                        -- longer description
  skills       text[]                      -- ["web search", "summarization", "research"]
  endpoint     text                        -- "https://my-agent.railway.app"
  avatar_color text        default '#C4622A'  -- hex color for generated avatar
  avatar_emoji text        default '🤖'
  registered_at timestamptz default now()
)
```

---

## Pages

### Home (`/`) — Agent Directory

- Header: "AgentIn" wordmark + "Register Your Agent" button (top right)
- Subtitle: "The professional network for AI agents"
- Grid of AgentCards (2 cols mobile, 3 cols desktop)
- Shows all registered agents, newest first

### Agent Card (component)

```
┌──────────────────────────────┐
│  🤖  [colored avatar]        │
│  ResearchBot 3000            │  ← name
│  Team Fridge                 │  ← team
│  "I find and summarize       │  ← tagline (1 line, truncated)
│   data autonomously"         │
│                              │
│  web search  summarization   │  ← skills (chips, max 3 shown)
│  research                    │
│                              │
│  [View Profile]              │
└──────────────────────────────┘
```

### Profile Page (`/agents/:id`)

```
┌─────────────────────────────────────────────┐
│  [banner — colored gradient]                │
│     🤖  ResearchBot 3000                    │  ← large avatar + name
│     Team Fridge                             │  ← team
│     "I find and summarize data autonomously"│  ← tagline
│     🔗 https://my-agent.railway.app         │  ← endpoint
│                              [Copy Endpoint]│
├─────────────────────────────────────────────┤
│  About                                      │
│  [about text]                               │
├─────────────────────────────────────────────┤
│  Skills & Capabilities                      │
│  [chip] [chip] [chip] [chip]                │
└─────────────────────────────────────────────┘
```

### Register Page (`/register`)

Simple form, one page, instant submit:

| Field | Type | Required |
|-------|------|----------|
| Agent Name | text | ✓ |
| Team Name | text | ✓ |
| Tagline | text (max 100 chars) | ✓ |
| About | textarea | — |
| Skills | tag input (comma separated) | ✓ |
| Endpoint URL | url | — |
| Avatar Emoji | emoji picker (6 options) | — |
| Avatar Color | color swatch (6 options) | — |

On submit → POST /api/agents → redirect to `/agents/:id`

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 15 (App Router) | Know it, fast deploy to Vercel |
| Database | Supabase | Free tier, instant setup, REST API |
| Styling | Tailwind CSS | Fast, consistent |
| Deployment | Vercel | One command, public URL immediately |
| Font | Outfit (Google Fonts) | Clean, modern, already used |

---

## Design Aesthetic

LinkedIn-inspired but warmer. Color palette:
- Background: `#F4F2EE` (LinkedIn's warm grey, approx)
- Card background: `white`
- Primary text: `#1A1A1A`
- Team label: `#666`
- Skill chips: light grey background, dark text
- CTA button: `#0A66C2` (LinkedIn blue) — intentional homage
- Avatar backgrounds: 6 preset colors user picks from

---

## What We Are NOT Building

- Authentication / login
- Messaging between agents
- Transaction tracking
- Ratings or reviews
- Search / filtering (nice to have, skip for now)

---

## Success Criteria

- Any hackathon team can register their agent in < 2 minutes
- Profile page has a shareable URL
- Directory shows all registered agents
- Works on mobile
