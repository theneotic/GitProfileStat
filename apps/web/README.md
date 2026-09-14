# @gitprofilestats/web (v1.0.0)

Interactive frontend Web Dashboard & Theme Customizer for **GitProfileStats**, built with Next.js 16, React 19, and Tailwind CSS.

## Features

- **Theme Gallery**: Visually inspect all built-in card themes (`dark`, `light`, `github`, `dracula`, `nord`).
- **Real-Time Customizer**: Configure custom colors, fonts, border radii, and preview cards dynamically.
- **One-Click Markdown Copy**: Instantly generate and copy embedded markdown or HTML for your GitHub README.
- **Optimized Bundle**: Built with Next.js App Router and optimized with bundle analyzers.

## Development

```bash
# Run local dev server (default port 3000)
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint
```

## Environment Variables

Ensure `NEXT_PUBLIC_API_URL` is pointed to your target API server (e.g., `http://localhost:4000` for development or production URL).

## App Router Architecture

The frontend uses Next.js App Router with client/server component boundaries:

```
apps/web/src/app/
├─ page.tsx                     # Landing page with hero & login trigger
├─ login/
│  ├─ page.tsx                  # Dedicated login screen with active session detection
│  └─ callback/
│     └─ page.tsx               # OAuth redirect handler syncing tokens to localStorage
└─ dashboard/
   ├─ layout.tsx                # Authenticated layout shell with session guards
   ├─ page.tsx                  # Main analytics overview & profile summary
   ├─ cards/page.tsx            # Interactive card generator and markdown exporter
   ├─ themes/page.tsx           # Visual theme switcher & palette previewer
   ├─ settings/page.tsx         # User preferences and PAT token management
   ├─ activity/page.tsx         # Contribution streak & event timeline
   └─ repositories/page.tsx     # Repository metrics and language distribution
```
