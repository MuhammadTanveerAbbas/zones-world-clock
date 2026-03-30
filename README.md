# Zones World Clock

A personal timezone dashboard for tracking time across the world. Built with Next.js 15, React 19, and Tailwind CSS v4.

**Repository:** [https://github.com/MuhammadTanveerAbbas/zones-world-clock](https://github.com/MuhammadTanveerAbbas/zones-world-clock)

## Features

- **4 view modes**  Stack, Scroll, Grid, and Compact layouts
- **Time scrubber**  Drag to travel forward or backward up to 12 hours
- **Ambient mode**  Subtle time-of-day gradients per timezone
- **Add/remove zones**  Search any city or country from the full IANA timezone database
- **Set home timezone**  Mark any zone as your reference point
- **Drag to reorder**  Reorder zones in Scroll view via drag-and-drop
- **12h / 24h toggle**  Switch time formats globally
- **Dark / Light / System theme**  Persisted across sessions
- **Haptic feedback**  Web Haptics API on supported devices
- **Persistent state**  All preferences saved to localStorage
- **Fully responsive**  Works on mobile, tablet, and desktop

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19 |
| Styling | Tailwind CSS v4 |
| Animations | Motion (Framer Motion) |
| Timezone logic | date-fns-tz |
| Fonts | Geist Sans, Geist Mono |
| Flags | flag-icons |
| Theming | next-themes |
| Linting/Formatting | Biome |

## Architecture Overview

```
src/
├── app/
│   ├── layout.tsx        # Root layout, fonts, metadata, ThemeProvider
│   ├── page.tsx          # Main page  composes all views and controls
│   └── globals.css       # CSS variables, Tailwind theme, range input styles
├── components/
│   ├── views/
│   │   ├── stack-view.tsx    # Grouped zones filling full height
│   │   ├── scroll-view.tsx   # Scrollable list with drag-to-reorder
│   │   ├── grid-view.tsx     # Card grid layout
│   │   └── compact-view.tsx  # Pill-style compact layout
│   ├── grouped-zone-row.tsx  # Row for grouped zones (stack/compact)
│   ├── timezone-row.tsx      # Row for individual zones
│   ├── time-scrubber.tsx     # Bottom scrubber bar with tick marks
│   ├── view-switcher.tsx     # Top nav bar with view tabs
│   ├── zone-search.tsx       # Modal search for adding timezones
│   ├── theme-switcher.tsx    # Theme toggle (desktop inline / mobile dropdown)
│   └── theme-provider.tsx    # next-themes wrapper
├── hooks/
│   ├── use-world-clock.ts    # Live clock tick + scrubber offset logic
│   ├── use-zones-store.ts    # React bindings for the zone store
│   └── use-click-sound.ts    # Web Audio API click sound
└── lib/
    ├── store.ts              # Vanilla JS store with localStorage persistence
    ├── zones.ts              # Zone type + default zones
    ├── group-zones.ts        # Groups zones by UTC offset for stack/compact views
    ├── time-utils.ts         # Timezone formatting and delta utilities
    ├── time-of-day.ts        # Time-of-day period detection + ambient gradients
    ├── tz-metadata.ts        # IANA timezone search + country code mapping
    └── tz-country-names.ts   # Country code to name lookup
```

### State Management

State is managed via a lightweight vanilla JS store (`src/lib/store.ts`) that uses a pub/sub pattern. React components subscribe via `useSyncExternalStore`, which provides concurrent-safe external store integration. State is persisted to `localStorage` on every update.

### Timezone Logic

- All time calculations use `date-fns-tz` for accurate DST-aware offsets
- `groupZones` groups zones by their UTC offset relative to the home timezone
- The scrubber snaps to 30-minute intervals and offsets the display time without affecting the live clock

## Environment Variables

No environment variables are required. This is a fully client-side application.

## Setup

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Install

```bash
npm install
```

## Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Lint

```bash
npm run lint
```

### Format

```bash
npm run format
```

## Deployment

### Vercel (recommended)

```bash
npx vercel
```

Or connect your GitHub repository to [vercel.com](https://vercel.com) for automatic deployments on push.

### Build for production

```bash
npm run build
npm run start
```

### Docker / Self-hosted

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

Add `output: "standalone"` to `next.config.ts` when using Docker.

## Production Considerations

- **No backend required**  fully static, deployable to any CDN or edge runtime
- **localStorage**  state is per-browser; no sync across devices by design
- **Font loading**  Geist fonts are self-hosted via the `geist` npm package, no external requests
- **Flag icons**  served from the `flag-icons` npm package, no CDN dependency
- **CSP**  no inline scripts or external resources; safe to add a strict Content Security Policy

## License

MIT  see [LICENSE](./LICENSE)

## Author

Made by [Muhammad Tanveer Abbas](https://themvpguy.vercel.app/)

- X: [@m_tanveerabbas](https://x.com/m_tanveerabbas)
- LinkedIn: [muhammadtanveerabbas](https://linkedin.com/in/muhammadtanveerabbas)
- GitHub: [muhammadtanveerabbas](https://github.com/muhammadtanveerabbas)
