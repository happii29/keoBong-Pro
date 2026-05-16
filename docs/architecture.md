# KeoBong Pro Architecture

## 1. Folder Structure

```txt
src/
  app/                 Next.js App Router, layouts, API route handlers
  components/          Shared UI, shell, theme, motion, layout primitives
  config/              Static app, route, navigation, theme configuration
  hooks/               Client-only reusable hooks
  lib/                 Framework-neutral utilities and environment readers
  modules/             Business modules with clear ownership boundaries
  services/            External IO boundaries: API, n8n, Supabase, Zalo
  state/               UI state policy and future client store boundary
  types/               Shared TypeScript contracts
```

Business code should live under `src/modules/<domain>`. Cross-cutting UI belongs in `src/components`. Anything that touches a remote system belongs in `src/services`.

## 2. Routing Structure

```txt
/                         redirects to a default team workspace
/teams/[teamSlug]         dashboard shell for one team tenant
/teams/[teamSlug]/matches match calendar and attendance
/teams/[teamSlug]/players squad and member profiles
/teams/[teamSlug]/finance team fund and payment tracking
/teams/[teamSlug]/settings team configuration
/api/health               deployment health check
/api/webhooks/n8n         inbound automation callback boundary
```

The route key is `teamSlug`, but database records should use stable IDs. Slugs are for URLs only.

## 3. Component Architecture

- `components/ui`: shadcn/ui-owned primitives. Keep these small, copied, and editable.
- `components/app`: app shell, top bar, sidebar, mobile bottom navigation.
- `components/layout`: reusable page shells and empty states.
- `components/theme`: theme provider and controls.
- `components/motion`: Framer Motion wrappers with consistent defaults.
- `modules/<domain>/components`: domain-specific UI that should not leak across modules too early.

Composition direction: route -> module component -> shared layout/ui primitive. Shared components must not import business modules.

## 4. Service Layer Architecture

- `services/api`: generic HTTP client and API result pattern.
- `services/n8n`: outbound workflow dispatch and inbound webhook contracts.
- `services/supabase`: future database/auth/realtime adapter contracts.
- `services/zalo`: future Mini App and Zalo group contract boundary.

Components should call module-level actions/hooks. Module code can call services. Services must not import React components.

## 5. State Management Strategy

Start with the smallest state model:

- URL state for team, tabs, filters, and selected module.
- Server state through Next.js server components, route handlers, and future Supabase queries.
- Local component state for transient UI.
- Shared client state only for shell-level UI state, stored under `src/state`.

Do not introduce a global store for domain data until there is real cross-route client mutation pressure.

## 6. Theme Architecture

Theme tokens are CSS variables in `src/app/globals.css` and exposed to Tailwind through `@theme inline`. `next-themes` controls the `class` attribute for light/dark mode.

Token layers:

- semantic color tokens: `background`, `foreground`, `primary`, `muted`, `border`.
- app-shell tokens: `sidebar`, `sidebar-primary`, `sidebar-border`.
- component radius tokens derived from `--radius`.

## 7. UI Design System Structure

The design system is code-first:

- primitives in `components/ui`.
- layout primitives in `components/layout`.
- product shell in `components/app`.
- design tokens in `globals.css`.
- configuration in `config/theme.ts`.

New shadcn components should be added into `components/ui` and adjusted to match the token system before being used in modules.

## 8. Future API Integration Strategy

The app should keep a backend-for-frontend boundary in Next route handlers when useful:

- Client UI calls Next route handlers or server actions.
- Route handlers validate tenant context and auth.
- Route handlers call Supabase, n8n, or other external services.
- Response contracts use `ApiResult<T>` from `src/types/api.ts`.

When Supabase is added, keep database table types generated separately and map them into domain types at the service/module boundary.

## 9. n8n Integration Strategy

n8n should be used for automations, not core transactional state.

Good n8n candidates:

- send Zalo reminder after match creation.
- request attendance confirmation.
- post payment reminders.
- summarize weekly team activity.

Architecture:

- outbound: `services/n8n/n8n-client.ts` sends signed events to `N8N_WEBHOOK_URL`.
- inbound: `/api/webhooks/n8n` accepts callbacks using `N8N_WEBHOOK_SECRET`.
- events are typed with `N8nWorkflowEvent<TPayload>`.
- core state is persisted in Supabase, then n8n is triggered as a side effect.

## 10. Responsive Strategy

The UI is mobile-first because most usage will happen in Zalo-adjacent mobile flows.

- Primary navigation is bottom navigation on mobile.
- Desktop adds a persistent sidebar at `lg`.
- Content uses constrained widths and dense cards, not landing-page sections.
- Touch targets stay at least 44px high.
- Fixed UI accounts for safe-area insets.
- Tables should become cards/lists on mobile before large feature work begins.
