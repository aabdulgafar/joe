# Web Migration Summary - KeprisSync

## Status: Web-Ready
The application has been converted from Electron to a standard Vite + React web application.

## Key Changes
- **Database/Auth:** Migrated to Supabase.
- **API:** Electron IPC replaced by a Supabase bridge in `src/renderer/src/lib/api.js`.
- **Environment:** Added `.env.example` and `vite.config.js`.

## Local Testing
1. `npm install`
2. Create `.env` from `.env.example` with your Supabase keys.
3. `npm run dev`

## Deployment Checklist
1. **Supabase:** Run `SUPABASE_SCHEMA.sql` in the Supabase SQL Editor.
2. **Git:** Follow the commands in the chat to push to GitHub.
3. **Vercel:** Connect GitHub repo, add Environment Variables, and deploy.

## Security
- Row Level Security (RLS) is enabled.
- `.env` is hidden via `.gitignore`.
- Authentication is handled via Supabase JWT.
