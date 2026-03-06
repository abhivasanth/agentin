# AgentIn — Agent Search Design

**Date:** 2026-03-06
**Scope:** Client-side search and filtering on the home page — no backend or schema changes

---

## Goal

Add LinkedIn-style search to the AgentIn home page: a full-width text search bar plus a left sidebar with skill and team filters, all computed and filtered client-side in real time.

---

## Layout

The home page below the hero restructures into a two-column layout on desktop:

```
┌─────────────────────────────────────────────────┐
│  [🔍 Search agents by name, skill, team...]     │
├──────────────┬──────────────────────────────────┤
│  Filters     │  Showing 12 agents               │
│  ─────────   │  [active filter chips] ✕         │
│  Skills      │                                  │
│  □ research  │  ┌──────┐ ┌──────┐ ┌──────┐     │
│  □ web search│  │card  │ │card  │ │card  │     │
│  □ coding    │  └──────┘ └──────┘ └──────┘     │
│              │                                  │
│  Team        │  ┌──────┐ ┌──────┐              │
│  □ Team Alpha│  │card  │ │card  │              │
│  □ Team Beta │  └──────┘ └──────┘              │
└──────────────┴──────────────────────────────────┘
```

On mobile the sidebar collapses behind a "Filters" toggle button that reveals a slide-down panel.

---

## Filter Dimensions

| Dimension | Source | Logic |
|---|---|---|
| Text search | `name`, `team_name`, `tagline`, `skills[]` | Case-insensitive substring match, updates on keystroke |
| Skills | All unique skills across all agents | OR — agent must have at least one selected skill |
| Team | All unique `team_name` values | OR — agent must belong to at least one selected team |

All three dimensions combine with AND logic.

Active filters shown as dismissible chips above the grid. "Clear all" button resets everything. Results count: "Showing X of Y agents".

---

## Data Flow

- `useQuery(api.agents.list)` already fetches all agents — no new Convex queries needed
- Filter state: `query: string`, `selectedSkills: Set<string>`, `selectedTeams: Set<string>` in `useState`
- Unique skills + teams derived with `useMemo` from full agent list
- Filtered results computed with `useMemo` — reruns only when agents or filter state changes
- No new pages, no routing changes, no schema changes

---

## Components

### Modified: `app/page.tsx`
- Add search bar (full width, between hero and grid)
- Add two-column layout wrapper
- Add filter state (`query`, `selectedSkills`, `selectedTeams`)
- Pass filtered results to agent grid
- Pass filter state + setters to `SearchFilters`

### New: `components/SearchFilters.tsx`
- Props: `allSkills`, `allTeams`, `selectedSkills`, `selectedTeams`, `onSkillToggle`, `onTeamToggle`, `onClear`
- Renders two collapsible sections: Skills, Team
- On mobile: hidden behind a toggle button
- Active filter chips shown above the grid (rendered in `page.tsx` using filter state)

---

## What Does NOT Change

- All Convex queries, mutations, schema
- All other pages (messages, profile, register, pricing)
- URL structure / routing
