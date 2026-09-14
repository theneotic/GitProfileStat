# @gitprofilestats/api (v1.0.0)

High-performance Express.js REST API & SVG Generator for **GitProfileStats**, designed with Domain-Driven Design (DDD) and Clean Architecture.

## Features

- **Dynamic SVG Rendering**: Endpoints for generating profile, statistics, language breakdown, contribution streaks, and repository summary cards in sub-100ms.
- **GitHub Data Aggregators**: Clean JSON APIs for retrieving user contribution statistics, language usage, commit streaks, and repo metadata.
- **In-Memory Caching & Performance**: Optimized rate limiting and duplicate request coalescing to protect GitHub API usage limits.
- **Authentication**: Supports GitHub OAuth logins as well as Personal Access Token (PAT) overrides for private repositories.
- **Health Verification**: System health monitoring endpoint at `/health`.

## Development & Testing

```bash
# Run local dev server (default port 4000)
pnpm dev

# Build API server
pnpm build

# Run unit and integration tests with Vitest
pnpm test
```

## SVG Card Generators

The SVG engine generates self-contained vector graphics using pure TypeScript string templates without external canvas dependencies:

| Generator | Endpoint | Description |
| --------- | -------- | ----------- |
| `profileCard` | `/cards/profile.svg` | User identity card with avatar, bio, follower count, and primary stats |
| `statsCard` | `/cards/stats.svg` | Contribution overview (commits, PRs, issues) with algorithmic ranking grade |
| `languagesCard` | `/cards/languages.svg` | Top languages breakdown with percentage bars and GitHub-accurate color mapping |
| `streakCard` | `/cards/streak.svg` | Current streak, longest streak, and total contribution days |
| `repositoryCard` | `/cards/repository.svg` | Deep repository card with stars, forks, issues, and language stats |
| `rankingsCard` | `/cards/rankings.svg` | Percentile standing and developer ranking badge |
| `topContributedCard` | `/cards/top-contributed.svg` | Highlighted external repositories and open-source contributions |
| `trophiesCard` | `/cards/trophies.svg` | Milestone badges and achievement trophies |

## Dependency Injection (`tsyringe`)

The API utilizes `tsyringe` for inversion of control, allowing seamless switching between local development mocks and production cloud infrastructure:

| Token | Production Adapter | Fallback / Local Adapter |
| ----- | ------------------ | ------------------------ |
| `DatabasePool` | `pg.Pool` (Neon PostgreSQL SSL) | Not registered |
| `IUserRepository` | `PostgresUserRepository` | `InMemoryUserRepository` |
| `UpstashRedis` | `@upstash/redis` REST client | Not registered |
| `ResponseCache` | `UpstashResponseCache` | `InMemoryResponseCache` |
| `SessionService` | `SessionService` (Singleton) | `SessionService` (Singleton) |

## Documentation

See the root [README.md](../../README.md) and [DEPLOYMENT.md](../../DEPLOYMENT.md) for full deployment instructions, parameters, and customization guides.
