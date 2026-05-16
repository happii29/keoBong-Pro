# KeoBong Pro Luxury Design System

## 1. Typography System

- Display: `font-display`, used for product name, page titles, and key metrics.
- Body: `font-sans`, optimized for dense mobile SaaS workflows.
- Mono: `font-mono`, reserved for IDs, webhook traces, and audit output.
- Heading scale: page title `text-2xl sm:text-3xl`, card title `text-sm-base`, metric `text-2xl`.
- Letter spacing stays neutral for readability; only small uppercase kickers use wider tracking.

## 2. Color Palette

- Black: `luxury-black`, app background and deep shell surfaces.
- Slate: `luxury-slate`, secondary surfaces and navigation.
- Emerald: `emerald`, primary product action and football-tech signal.
- Gold: `gold`, premium accent, highlights, dividers, and priority calls to action.
- Glass: `glass`, translucent elevated surfaces with blur and subtle border.

## 3. Spacing System

- Mobile page padding: `px-4 py-5`.
- Desktop page padding: `lg:px-8`.
- Card padding: `px-5 sm:px-6 py-6`.
- Grid gap: `gap-3` for dashboard density, `gap-5/6` for page sections.
- Touch targets: 40-48px minimum via button and nav sizing.

## 4. Card System

- Base card uses `.premium-card`: glass background, white border, blur, deep shadow.
- Interactive cards add `.premium-card-hover`.
- Card radius is `rounded-xl`, not oversized.
- Cards are for repeated items and framed tools only.

## 5. Button Variants

- `default`: emerald primary.
- `emerald`: explicit football-tech primary.
- `gold`: premium action.
- `luxury`: glass button for shell controls.
- `outline`, `secondary`, `ghost`, `destructive`, `link`: standard supporting variants.

## 6. Input Styles

Inputs use translucent glass fill, 44px height, emerald focus ring, and muted placeholders. They are prepared for future forms without introducing form library decisions yet.

## 7. Modal Styles

Dialog primitives live in `src/components/ui/dialog.tsx`. They use Radix Dialog, dark overlay, glass panel content, mobile-safe width, and consistent close affordance.

## 8. Table Styles

Tables use compact uppercase headers, soft row separators, and hover states. On mobile, feature modules should switch dense tables to list/card views before shipping high-volume workflows.

## 9. Mobile Bottom Navigation

Bottom nav is fixed, glass, safe-area aware, and uses icon-first targets. Active route uses emerald text plus a gold top indicator.

## 10. Desktop Sidebar

Sidebar is persistent at `lg`, glass-dark, brand-forward, and uses emerald active states. It is reserved for workspace navigation, not secondary feature controls.

## 11. Animation Presets

- CSS utilities: `animate-luxury-enter`, `animate-soft-pulse`, `animate-shimmer`.
- Framer presets: `fadeUp`, `scaleIn`, `slideFromBottom`.
- Default motion curve: `cubic-bezier(0.16, 1, 0.3, 1)`.

## 12. Loading Skeleton

`Skeleton` uses a glass base with a soft shimmer sweep. Use skeletons for cards, rows, and KPI blocks; avoid spinner-only loading for primary content.

## 13. Empty States

`EmptyState` is centered, compact, and premium: gold icon frame, clear title, optional supporting copy and action slot.
