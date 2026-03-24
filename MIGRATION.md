# RepoTree — OAuth Migration Guide

This document covers migrating RepoTree from Personal Access Token (PAT) authentication
to secure OAuth-only authentication using NextAuth / Auth.js, and the subsequent addition
of the authenticated repository browser feature.

---

## Summary of changes

### Removed
| File | Reason |
|------|--------|
| `src/components/token-status.tsx` | Replaced by `auth-status.tsx` (OAuth-aware) |
| `src/components/private-repos-dialog.tsx` | PAT input removed entirely |
| `src/app/api/repo/route.ts` | Old PAT-based single-repo endpoint |
| `src/app/github-signin/page.tsx` | Popup OAuth pattern replaced by NextAuth |

### Added
| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | NextAuth config — GitHub + GitLab OAuth |
| `src/app/api/auth/[...nextauth]/route.ts` | Auth handler |
| `src/types/next-auth.d.ts` | Session type extensions |
| `src/lib/providers/types.ts` | Unified provider interface |
| `src/lib/providers/github.ts` | GitHub implementation (Octokit) |
| `src/lib/providers/gitlab.ts` | GitLab implementation (fetch + pagination) |
| `src/lib/providers/index.ts` | Provider factory + URL detection |
| `src/app/api/tree/route.ts` | Secure server-side tree fetch |
| `src/app/api/repos/route.ts` | Authenticated repo listing (GET, session-based) |
| `src/app/auth/signin/page.tsx` | OAuth-only sign-in page |
| `src/components/auth/auth-provider.tsx` | SessionProvider wrapper |
| `src/components/auth/user-menu.tsx` | Signed-in user menu (avatar + sign out) |
| `src/components/generator/auth-status.tsx` | OAuth session status banner |
| `src/components/generator/repo-browser.tsx` | Authenticated repository browser with search, sort, pagination |
| `src/components/generator/repo-tree-generator.tsx` | Refactored generator with dual-source tabs |
| `public/favicon.ico` | Browser tab icon |
| `public/icon.png` | App icon (256×256) |
| `public/apple-icon.png` | iOS home screen icon (256×256) |

### Updated
| File | Change |
|------|--------|
| `src/app/layout.tsx` | AuthProvider wrapper + favicon/icon metadata |
| `src/components/layout/header.tsx` | Sticky header with backdrop-blur + UserMenu |
| `src/components/auth/user-menu.tsx` | Provider badge removed — avatar + sign out only |
| `src/components/landing-page.tsx` | Redesigned hero, no PAT references |
| `src/lib/repo-tree-utils.ts` | PAT/Octokit calls removed, pure tree logic |

---

## Authenticated Repository Browser

After login, RepoTree now allows users to browse and select repositories directly
from their authenticated account. This removes the need to paste your own repository
URL while keeping manual URL input available for any public repository.

### How it works

The generator now has two source tabs:

**My Repositories** (visible when signed in):
- Fetches all repositories from the authenticated provider via `GET /api/repos`
- Includes public and private repositories based on OAuth scope
- Searchable by name, description, and full name
- Sortable by recently updated, name A–Z, or most starred
- Paginated (8 per page) with smart ellipsis navigation
- Clicking a repository immediately triggers tree generation — no URL paste needed

**Paste URL** (always available):
- Provider selector + URL input + Generate button
- Works for any public GitHub or GitLab repository
- Works whether signed in or not

### Tab behaviour

- When signed out: only the Paste URL tab is shown
- When signed in: My Repositories tab is shown and selected by default
- Users can switch to Paste URL at any time to generate trees for external repos

### API design

`GET /api/repos` — reads the OAuth session server-side, calls the provider's
`listRepos()` implementation, and returns a normalized `Repository[]`. No token
is ever sent in the request body or exposed to client-side JavaScript.

---

## Environment variables

### Required
```bash
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=

# Development
NEXTAUTH_URL=http://localhost:3000

# GitHub OAuth App
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# GitLab OAuth App
GITLAB_CLIENT_ID=
GITLAB_CLIENT_SECRET=
```

### Removed (delete these)
```bash
# These exposed tokens to the browser bundle — delete them
NEXT_PUBLIC_GITHUB_TOKEN=
NEXT_PUBLIC_GITLAB_TOKEN=
NEXT_PUBLIC_GITHUB_PAT=
```

---

## OAuth app setup

### GitHub
1. Go to: github.com → Settings → Developer settings → OAuth Apps → **New OAuth App**
2. Set:
   - **Application name**: `RepoTree`
   - **Homepage URL**: `https://ascii-repotree.vercel.app`
   - **Authorization callback URL**: `https://ascii-repotree.vercel.app/api/auth/callback/github`
3. For local development, create a **separate** app with callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy **Client ID** → `GITHUB_CLIENT_ID`
5. Generate a **Client secret** → `GITHUB_CLIENT_SECRET`

### GitLab
1. Go to: gitlab.com → Edit Profile → Applications → **Add new application**
2. Set:
   - **Name**: `RepoTree`
   - **Redirect URI**: `https://ascii-repotree.vercel.app/api/auth/callback/gitlab`
   - **Scopes**: check `read_user`, `read_repository`, and `api`
3. For local development: `http://localhost:3000/api/auth/callback/gitlab`
4. Copy **Application ID** → `GITLAB_CLIENT_ID`
5. Copy **Secret** → `GITLAB_CLIENT_SECRET`

---

## Local development setup

```bash
# 1. Clone the repo
git clone https://github.com/coder-ralph/RepoTree.git
cd RepoTree

# 2. Install dependencies
npm install

# 3. Copy and fill environment variables
cp .env.example .env.local
# Fill in NEXTAUTH_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET,
# GITLAB_CLIENT_ID, GITLAB_CLIENT_SECRET

# 4. Start the dev server
npm run dev

# 5. Open http://localhost:3000
```

---

## Deployment notes (Vercel)

1. Add all environment variables in Vercel project settings
2. Set `NEXTAUTH_URL` to your production URL: `https://ascii-repotree.vercel.app`
3. Update OAuth callback URLs to use production domain
4. The `NEXTAUTH_SECRET` must be the same value across all deployments

---

## Security improvements

| Before (PAT) | After (OAuth) |
|---|---|
| Token stored in `localStorage` | Token in encrypted httpOnly cookie |
| Token visible in browser DevTools | Token inaccessible to JavaScript |
| `NEXT_PUBLIC_*` tokens in browser bundle | Server-only env vars |
| All API calls made from browser | Sensitive calls proxied through Next.js server |
| No identity — anyone with a token | Authenticated identity via OAuth provider |
| Token never expires unless manually rotated | Session expires after 24 hours |
| No repo browser — URL paste only | My Repositories tab after sign-in |

---

## Architecture overview

```
Browser                     Next.js Server              Provider API
──────                     ──────────────              ────────────
Sign in → /auth/signin
  click GitHub/GitLab ──→ /api/auth/[...nextauth] ──→ OAuth flow
                          Session cookie set ←──────── access_token

Browse repos (My Repos tab):
GET /api/repos ──────────→ Read session cookie
                          Get access_token (server only)
                          Call provider listRepos() ───→ fetch repos
                          Return Repository[] ←──────── response
← { repos } ────────────
Click repo → auto-generate ↓

Generate tree:
POST /api/tree ─────────→ Read session cookie
  { url }                 Get access_token (server only)
                          Call provider fetchTree() ───→ fetch tree
                          Return TreeItem[] ←─────────── response
← { tree } ─────────────
Build ASCII tree in browser
(no token ever needed client-side)
```

---

## User-facing changes

- The "Enable Private Repos" button and PAT input dialog are gone entirely
- Users sign in with GitHub or GitLab via standard OAuth
- After sign-in, the generator shows **My Repositories** by default — browse, search, and click to generate
- **Paste URL** tab remains available for any public repository, signed in or not
- The header shows the user avatar and a sign-out option (provider badge removed for cleanliness)
- The generator shows a green banner when signed in with private repo access confirmed
- The generator shows an amber banner with a sign-in prompt when unauthenticated
- Signing out returns the user to the landing page
- Favicon, browser tab icon, and iOS home screen icon now correctly display the RepoTree logo

---

## Notes for contributors

- Do not add `NEXT_PUBLIC_` prefixed token variables — this re-introduces the original security vulnerability
- Do not accept PAT or tokens in any API route body — all auth must go through the NextAuth session cookie
- Provider implementations live in `src/lib/providers/` — add new providers by implementing `RepoProvider`
- The `RepoProvider` interface in `types.ts` is the contract all providers must satisfy
- The `RepoBrowser` component is self-contained and provider-agnostic — it reads the session provider internally
