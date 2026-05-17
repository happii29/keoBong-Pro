export const routes = {
  home: "/",
  team: (teamSlug: string) => `/teams/${teamSlug}`,
  matches: (teamSlug: string) => `/teams/${teamSlug}/matches`,
  balance: (teamSlug: string) => `/teams/${teamSlug}/balance`,
  ranking: (teamSlug: string) => `/teams/${teamSlug}/ranking`,
  players: (teamSlug: string) => `/teams/${teamSlug}/players`,
  finance: (teamSlug: string) => `/teams/${teamSlug}/finance`,
  settings: (teamSlug: string) => `/teams/${teamSlug}/settings`,
} as const;
