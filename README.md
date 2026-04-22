<div align="center">

  <img src="public/favicon.svg" alt="Zones World Clock Logo" width="80" height="80" />

  # Zones World Clock

  **A personal timezone dashboard for tracking time across the world beautifully.**

  [![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://zones-world-clock.vercel.app)
  [![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
  [![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

</div>

---

Zones is a clean, fast, and fully client-side world clock dashboard. It solves the daily friction of tracking time across multiple cities and timezones no accounts, no backend, no bloat. Built for remote teams, digital nomads, and anyone who works across time zones.

## ✨ Features

- 🗂 **4 View Modes:** Stack, Scroll, Grid, and Compact layouts to suit your workflow
- ⏱ **Time Scrubber:** Drag to travel forward or backward up to 12 hours across all zones
- 🌅 **Ambient Mode:** Subtle time-of-day gradients per timezone for visual context
- 🔍 **Add / Remove Zones:** Search any city or country from the full IANA timezone database
- 🏠 **Home Timezone:** Mark any zone as your reference point
- 🖱 **Drag to Reorder:** Reorder zones in Scroll view via drag-and-drop
- 🕐 **12h / 24h Toggle:** Switch time formats globally
- 🎨 **Dark / Light / System Theme:** Persisted across sessions
- 📳 **Haptic Feedback:** Web Haptics API on supported devices
- 💾 **Persistent State:** All preferences saved to localStorage
- 📱 **Fully Responsive:** Works on mobile, tablet, and desktop

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| UI | React 19 |
| Styling | Tailwind CSS v4 |
| Animations | Motion (Framer Motion) |
| Timezone Logic | date-fns-tz |
| Fonts | Geist Sans, Geist Mono |
| Flags | flag-icons |
| Theming | next-themes |
| Linting / Formatting | Biome |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm, pnpm, or yarn

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/MuhammadTanveerAbbas/zones-world-clock.git
cd zones-world-clock

# 2. Install dependencies
npm install

# 3. Run the development server
npm run dev

# 4. Open in browser
# http://localhost:3000
```

## 🔐 Environment Variables

No environment variables are required. This is a fully client-side application with no backend dependencies.

## 📁 Project Structure

```
zones-world-clock/
├── public/                  # Static assets
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout, fonts, metadata, ThemeProvider
│   │   ├── page.tsx         # Main page composes all views and controls
│   │   └── globals.css      # CSS variables, Tailwind theme, range input styles
│   ├── components/
│   │   ├── views/
│   │   │   ├── stack-view.tsx
│   │   │   ├── scroll-view.tsx
│   │   │   ├── grid-view.tsx
│   │   │   └── compact-view.tsx
│   │   ├── grouped-zone-row.tsx
│   │   ├── timezone-row.tsx
│   │   ├── time-scrubber.tsx
│   │   ├── view-switcher.tsx
│   │   ├── zone-search.tsx
│   │   ├── theme-switcher.tsx
│   │   └── theme-provider.tsx
│   ├── hooks/
│   │   ├── use-world-clock.ts
│   │   ├── use-zones-store.ts
│   │   └── use-click-sound.ts
│   └── lib/
│       ├── store.ts
│       ├── zones.ts
│       ├── group-zones.ts
│       ├── time-utils.ts
│       ├── time-of-day.ts
│       ├── tz-metadata.ts
│       └── tz-country-names.ts
├── .env.example
├── package.json
└── README.md
```

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run Biome linter |
| `npm run format` | Format code with Biome |

## 🌐 Deployment

This project is deployed on **Vercel**.

### Deploy Your Own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/MuhammadTanveerAbbas/zones-world-clock)

1. Click the button above
2. Connect your GitHub account
3. Deploy no environment variables needed

## 🗺 Roadmap

- [x] 4 view modes (Stack, Scroll, Grid, Compact)
- [x] Time scrubber with 30-minute snap intervals
- [x] Ambient time-of-day gradients
- [x] Full IANA timezone search
- [x] Drag-to-reorder zones
- [x] Dark / Light / System theme
- [x] Haptic feedback support
- [ ] Export / share timezone sets
- [ ] Keyboard shortcuts
- [ ] PWA / installable app

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👨‍💻 Built by The MVP Guy

<div align="center">

**Muhammad Tanveer Abbas**
SaaS Developer | Building production-ready MVPs in 14–21 days

[![Portfolio](https://img.shields.io/badge/Portfolio-themvpguy.vercel.app-black?style=for-the-badge)](https://themvpguy.vercel.app)
[![Twitter](https://img.shields.io/badge/Twitter-@m__tanveerabbas-1DA1F2?style=for-the-badge&logo=twitter)](https://x.com/m_tanveerabbas)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/muhammadtanveerabbas)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github)](https://github.com/MuhammadTanveerAbbas)

*If this project helped you, please consider giving it a ⭐*

</div>
