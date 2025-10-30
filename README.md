<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Google Ads Lead Dashboard

A modern dashboard to parse, save, and manage Google Ads leads with AI-powered insights. Data is stored in **Cloudflare D1** (serverless database) for persistent, shared access across all users.

## Features

- 📊 Parse leads from email text automatically
- 💾 Store leads in Cloudflare D1 database (shared across all users)
- 📈 Analytics dashboard with visualizations
- 🤖 AI-powered insights using Gemini or OpenAI
- ✅ Lead status tracking and notes
- 🚀 Deploy to Cloudflare Pages for free

## Quick Start

### Prerequisites
- Node.js installed
- Cloudflare account (free tier works)

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Cloudflare D1 database:**

   Follow the complete guide in [CLOUDFLARE_D1_SETUP.md](./CLOUDFLARE_D1_SETUP.md)

   Quick version:
   ```bash
   # Install Wrangler CLI
   npm install -g wrangler

   # Login to Cloudflare
   wrangler login

   # Create database
   wrangler d1 create gads-leads-db

   # Update wrangler.toml with your database_id
   # Then initialize schema
   wrangler d1 execute gads-leads-db --file=worker/schema.sql
   ```

3. **Run the app:**
   ```bash
   # Terminal 1: Start the Worker API
   npm run worker:dev

   # Terminal 2: Start the frontend
   npm run dev
   ```

4. **Open browser:**
   Visit http://localhost:3000

## Deployment

See [CLOUDFLARE_D1_SETUP.md](./CLOUDFLARE_D1_SETUP.md) for complete deployment instructions.

Quick deploy:
```bash
# Deploy Worker
npm run worker:deploy

# Deploy frontend to Cloudflare Pages
npm run build
npx wrangler pages deploy dist --project-name=gads-dashboard
```

## Data Storage

**Current:** Cloudflare D1 (serverless SQLite database)
- Shared across all users
- Persistent and reliable
- Free tier: 5GB storage, 5M reads/day

**Previous:** Browser localStorage (see git history if needed)

## Documentation

- [CLOUDFLARE_D1_SETUP.md](./CLOUDFLARE_D1_SETUP.md) - Complete database setup guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - General deployment options

## AI Configuration

Configure your AI provider in the dashboard Settings:
- **Gemini**: Get API key from https://ai.google.dev
- **OpenAI**: Get API key from https://platform.openai.com
