# State Strategy

Keep domain data out of client global state by default.

- URL state: team slug, selected module, filters.
- Server state: Next route handlers, server components, future Supabase queries.
- Local state: dialogs, forms, optimistic UI inside a module.
- Shared client state: only app-shell UI concerns that cannot live in the URL.

Add a store only when multiple distant client components need to mutate the same transient UI state.
