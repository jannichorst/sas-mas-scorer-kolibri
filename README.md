# SAS Viya React Template

Minimal template preserving:

- Browser auth integration with `@sassoftware/sas-auth-browser`
- Electron multi-connection + OAuth PKCE login flow
- Build pipelines for standard web app, VA/job definition single-file build, and Electron packaging

## Commands

- `npm run dev` - Vite dev server
- `npm run build` - standard web build + `dist.zip`
- `npm run build:jobdef` - single-file VA/job definition build in `dist-jobdef`
- `npm run electron:dev` - run Electron with Vite dev server
- `npm run electron:build` - package Electron app

## Template contents

- `src/auth/*` keeps build-mode aware auth providers:
  - browser popup auth
  - no-auth mode for job definitions
  - Electron IPC auth
- `electron/*` keeps connection storage, PKCE OAuth flow, and IPC bridge
- `src/components/settings/ConnectionSettings.tsx` provides minimal Electron connection UI
- `src/api/*` includes a small Viya client and a sample `getCurrentUser` call

Replace `App.tsx` with your project UI while keeping the preserved infrastructure.
