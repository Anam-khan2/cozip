# Vercel Deployment

This project is ready to deploy on Vercel as a Vite single-page application.

## What Is Configured

- `vercel.json` sets the framework to Vite
- Vercel builds the app with `npm run build`
- The deploy output directory is `dist`
- Client-side routes like `/shop`, `/product/:productId`, and `/dashboard` are rewritten to `index.html`

## Required Environment Variables

Add these in the Vercel project settings before the first production deploy:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_PRODUCTS_BUCKET`

Use the same values you already use locally. The app will fail at runtime if the first two are missing.

## Deploy Steps

1. Push this repo to GitHub.
2. Import the repository into Vercel.
3. In the Vercel project settings, add the required environment variables.
4. Keep these defaults unless you need something custom:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Deploy.

## Notes

- This app is a browser-routed SPA, so direct visits to nested routes need the rewrite in `vercel.json`.
- Supabase calls happen from the client, so the `VITE_` prefixed variables must be available at build time.
- If you later add a backend or serverless Stripe flow, that should use non-`VITE_` secrets and Vercel Functions.