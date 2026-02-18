---
description: Use Bun instead of Node.js, npm, pnpm, or vite.
globs: "*.ts, *.tsx, *.html, *.css, *.js, *.jsx, package.json"
alwaysApply: false
---

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";
import { createRoot } from "react-dom/client";

// import .css files directly and it works
import './index.css';

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.

---

## Project: VietEuro Converter

A PWA currency converter between VND and EUR that works fully offline.

### Running the project

```sh
bun install          # install dependencies
bun run dev          # start dev server at http://localhost:3000
bun run build        # production build → dist/
bun run preview      # preview the production build locally
```

> Note: this project uses Vite (via `@vitejs/plugin-react`) rather than `Bun.serve()` because it predates the Bun HTML-import approach. Do not migrate it to Bun.serve() without explicit instruction.

### Architecture

- **Framework**: React 19 + TypeScript, bundled by Vite
- **Styling**: Tailwind CSS via CDN (`<script src="https://cdn.tailwindcss.com">`)
- **Icons**: `lucide-react`
- **Exchange rate**: Fixed (`1 EUR = 30 303.03 VND`). No API calls are made; the rate is hardcoded in `hooks/useExchangeRate.ts`.

### PWA / offline

- **Service worker**: `public/service-worker.js` — uses stale-while-revalidate for cached resources and runtime-caches everything (including CDN scripts) as it is fetched, so the app works offline after the first online visit.
- **Manifest**: `public/manifest.json` — references local SVG icons (`public/icon-192.svg`, `public/icon-512.svg`).
- **Install button**: rendered in `App.tsx` when the browser fires `beforeinstallprompt`; hidden once the app is installed.

### Key files

| File | Purpose |
|------|---------|
| `index.html` | HTML entry point; registers the service worker |
| `index.tsx` | React root mount |
| `App.tsx` | Top-level component; online/offline status, PWA install button |
| `components/Converter.tsx` | Converter UI (bidirectional EUR ↔ VND) |
| `hooks/useExchangeRate.ts` | Provides the fixed rate and `isOnline` state |
| `public/service-worker.js` | Offline caching logic |
| `public/manifest.json` | PWA manifest |
