export const routes = {
  home: "/",
  team: (teamSlug: string) => `/teams/${teamSlug}`,
  matches: (teamSlug: string) => `/teams/${teamSlug}/matches`,
  players: (teamSlug: string) => `/teams/${teamSlug}/players`,
  finance: (teamSlug: string) => `/teams/${teamSlug}/finance`,
  settings: (teamSlug: string) => `/teams/${teamSlug}/settings`,
} as const;
