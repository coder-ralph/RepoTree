# RepoTree 🌳

A web tool that visualizes GitHub and GitLab repositories with clean ASCII trees. Supports both public and private repositories via OAuth authentication.

![RepoTree Preview](https://raw.githubusercontent.com/coder-ralph/RepoTree/main/public/opengraph-image.png)

<div align="center">
  <a href="https://www.producthunt.com/products/repotree?embed=true&amp;amp;utm_source=badge-featured&amp;amp;utm_medium=badge&amp;amp;utm_campaign=badge-repotree" target="_blank" rel="noopener noreferrer">
    <img alt="RepoTree - Visualize &amp; analyze GitHub &amp; GitLab repos instantly | Product Hunt" width="150" height="36" src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1113350&amp;theme=light&amp;t=1775545024553">
  </a>
  <a href="https://open-launch.com/projects/repotree" target="_blank" rel="noopener noreferrer">
    <img src="https://open-launch.com/api/badge/79b3264d-6411-4e68-aaa8-8a325bc28561/featured-dark.svg" alt="Featured on Open-Launch" width="150" height="36" />
  </a>
</div>

<div align="center">

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-RepoTree-blue?style=for-the-badge)](https://ascii-repotree.vercel.app/)
[![MIT License](https://img.shields.io/badge/📄_License-MIT-green?style=for-the-badge)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/coder-ralph/RepoTree?style=for-the-badge)](https://github.com/coder-ralph/RepoTree)
[![Visitors](https://hitscounter.dev/api/hit?url=https%3A%2F%2Fascii-repotree.vercel.app%2Fgenerator&label=Visitors&icon=github&color=%23007ec6&message=&style=for-the-badge&tz=UTC)](https://ascii-repotree.vercel.app/)

</div>

## Features

- **ASCII tree visualization** — clean, copy-ready directory structure output
- **Interactive tree view** — collapsible folder explorer with VS Code-style file icons
- **Repository analysis** — file type distribution and language breakdown charts
- **Multiple export formats** — download as .md, .txt, .json, or .html
- **Export as image** — download and share your tree as PNG or SVG
- **Real-time search** — filter files and folders as you type
- **Customizable output** — icons, line numbers, descriptions, trailing slashes
- **Dark & light themes** — automatic system preference detection
- **OAuth authentication** — secure GitHub and GitLab sign-in for private repo access

## Quick start

### Local development

```bash
# Clone the repository
git clone https://github.com/coder-ralph/RepoTree.git
cd RepoTree

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Fill in your environment variables (see setup below)
# Then start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=          # openssl rand -base64 32

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

GITLAB_CLIENT_ID=
GITLAB_CLIENT_SECRET=
```

### GitHub OAuth app

1. Go to **GitHub Settings → Developer settings → OAuth Apps → New OAuth App**
2. Callback URL: `http://localhost:3000/api/auth/callback/github`
3. Copy Client ID and Secret to your `.env.local`

### GitLab OAuth app

1. Go to **GitLab → Edit Profile → Applications → Add new application**
2. Scopes: `read_user`, `read_repository`
3. Redirect URI: `http://localhost:3000/api/auth/callback/gitlab`
4. Copy Application ID and Secret to your `.env.local`

## Tech stack

| Technology | Purpose |
|---|---|
| **Next.js 15** | React framework, App Router, server-side API routes |
| **NextAuth v4** | OAuth authentication (GitHub, GitLab) |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Shadcn UI** | Accessible component primitives |
| **Octokit** | GitHub REST API client |
| **Recharts** | Repository analysis charts |
| **Framer Motion** | Landing page animations |

## Authentication

RepoTree uses **OAuth-only** authentication. No personal access tokens are accepted.

- Sign in with GitHub or GitLab to access private repositories
- Session tokens are stored in encrypted httpOnly cookies — never in localStorage
- Sessions expire after 24 hours
- Public repositories work without any sign-in

See [MIGRATION.md](MIGRATION.md) for full details on the auth architecture.

## Contributing

Issues and pull requests are welcome at [github.com/coder-ralph/RepoTree](https://github.com/coder-ralph/RepoTree/issues).

## License

MIT — see [LICENSE](LICENSE).

---

Made with ❤️ and ☕ by [Ralph Rosael](https://app.daily.dev/coderralph)
