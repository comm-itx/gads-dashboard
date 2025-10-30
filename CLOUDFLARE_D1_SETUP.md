# Cloudflare D1 Database Setup Guide

This guide will help you deploy the Google Ads Lead Dashboard with Cloudflare D1 database for persistent, shared data storage.

## What Changed

The dashboard now uses **Cloudflare D1 (serverless SQLite database)** instead of browser localStorage:

✅ **Benefits:**
- Data is **shared across all users** - everyone sees the same leads
- Data **persists permanently** in the cloud
- Access from **any device/browser**
- Team collaboration enabled
- Free tier available (100K reads/day, 100K writes/day)

## Prerequisites

1. A Cloudflare account (free tier works): https://dash.cloudflare.com/sign-up
2. Node.js installed on your machine
3. Git repository with your dashboard code

## Step-by-Step Setup

### 1. Install Wrangler CLI

Wrangler is Cloudflare's command-line tool:

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

This will open a browser window to authorize Wrangler.

### 3. Create D1 Database

Run this command to create your database:

```bash
wrangler d1 create gads-leads-db
```

You'll get output like:

```
✅ Successfully created DB 'gads-leads-db'

[[d1_databases]]
binding = "DB"
database_name = "gads-leads-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**IMPORTANT:** Copy the `database_id` value!

### 4. Update wrangler.toml

Open `wrangler.toml` and replace the placeholder database_id with your actual ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "gads-leads-db"
database_id = "YOUR-DATABASE-ID-HERE"  # Replace with actual ID from step 3
```

### 5. Initialize Database Schema

Run this command to create the database tables:

```bash
wrangler d1 execute gads-leads-db --file=worker/schema.sql
```

You should see:

```
🌀 Executing on remote database gads-leads-db (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx):
🌀 To execute on your local development database, pass the --local flag to 'wrangler d1 execute'
✅ Executed 6 commands in 0.5 seconds
```

### 6. Deploy the Worker API

Deploy your Cloudflare Worker that handles database operations:

```bash
wrangler deploy
```

After deployment, you'll get a URL like:

```
https://gads-dashboard-api.YOUR-SUBDOMAIN.workers.dev
```

**Copy this URL** - you'll need it next!

### 7. Configure Frontend API URL

You have two options:

#### Option A: Environment Variable (Recommended for Production)

Create a `.env.local` file in the project root:

```bash
VITE_API_URL=https://gads-dashboard-api.YOUR-SUBDOMAIN.workers.dev
```

Replace with your actual Worker URL from step 6.

#### Option B: Update databaseService.ts directly

Edit `services/databaseService.ts`:

```typescript
const API_URL = 'https://gads-dashboard-api.YOUR-SUBDOMAIN.workers.dev';
```

### 8. Build and Deploy Frontend

#### Deploy to Cloudflare Pages:

```bash
# Build the frontend
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=gads-dashboard
```

Or connect your GitHub repo to Cloudflare Pages:

1. Go to https://dash.cloudflare.com/
2. Click **Pages** → **Create a project**
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Environment variable**: `VITE_API_URL` = `https://gads-dashboard-api.YOUR-SUBDOMAIN.workers.dev`
5. Click **Save and Deploy**

### 9. Test Your Deployment

1. Visit your Cloudflare Pages URL (e.g., `https://gads-dashboard.pages.dev`)
2. Try adding a lead through the form
3. Refresh the page - lead should still be there!
4. Open in another browser/device - lead should be visible there too!

## Local Development

### 1. Run Worker Locally

In one terminal, start the worker:

```bash
wrangler dev
```

This starts the worker at `http://localhost:8787`

### 2. Run Frontend Locally

In another terminal:

```bash
npm run dev
```

The frontend will connect to the local worker automatically.

### 3. Use Local Database

For local development with a local D1 database:

```bash
# Create local database
wrangler d1 execute gads-leads-db --local --file=worker/schema.sql

# Run worker with local DB
wrangler dev --local
```

## Verifying Everything Works

### Test the Worker API Directly

```bash
# Health check
curl https://gads-dashboard-api.YOUR-SUBDOMAIN.workers.dev/health

# Get all leads (should return empty array initially)
curl https://gads-dashboard-api.YOUR-SUBDOMAIN.workers.dev/api/leads
```

### Check Database Contents

```bash
# View all leads in database
wrangler d1 execute gads-leads-db --command "SELECT * FROM leads"

# Count total leads
wrangler d1 execute gads-leads-db --command "SELECT COUNT(*) FROM leads"
```

## Architecture Overview

```
┌─────────────────┐
│   Browser App   │  (React + Vite)
│  (Cloudflare    │
│     Pages)      │
└────────┬────────┘
         │
         │ HTTP Requests
         ↓
┌─────────────────┐
│ Cloudflare      │  (API Endpoints)
│    Worker       │
└────────┬────────┘
         │
         │ SQL Queries
         ↓
┌─────────────────┐
│  Cloudflare D1  │  (SQLite Database)
│   Database      │
└─────────────────┘
```

## API Endpoints

Your Worker provides these endpoints:

- `GET /health` - Health check
- `GET /api/leads` - Get all leads
- `GET /api/leads/:id` - Get single lead
- `POST /api/leads` - Create new lead(s)
- `PUT /api/leads/:id` - Update a lead
- `DELETE /api/leads/:id` - Delete a lead
- `GET /api/stats` - Get lead statistics

## Cost Breakdown (Free Tier)

**Cloudflare D1:**
- 5 GB storage
- 5 million reads per day
- 100,000 writes per day

**Cloudflare Workers:**
- 100,000 requests per day
- 10ms CPU time per request

**Cloudflare Pages:**
- Unlimited static requests
- 500 builds per month

**Total Cost:** $0/month for typical usage! 🎉

## Troubleshooting

### Error: "Failed to load leads"

1. Check your Worker URL is correct in `.env.local` or `databaseService.ts`
2. Test Worker directly: `curl https://your-worker.workers.dev/health`
3. Check CORS settings in `worker/index.ts`

### Error: "D1_ERROR: no such table: leads"

Run the schema initialization:

```bash
wrangler d1 execute gads-leads-db --file=worker/schema.sql
```

### Error: "Authentication error"

Re-login to Wrangler:

```bash
wrangler logout
wrangler login
```

### Worker not updating after changes

Redeploy the worker:

```bash
wrangler deploy
```

### Want to reset all data?

Drop and recreate the database:

```bash
# Delete all leads
wrangler d1 execute gads-leads-db --command "DELETE FROM leads"

# Or recreate the entire database
wrangler d1 execute gads-leads-db --file=worker/schema.sql
```

## Migration from localStorage

If you already have leads in localStorage and want to keep them:

1. Open your dashboard in browser (old version with localStorage)
2. Open browser console (F12)
3. Run this to export leads:

```javascript
copy(localStorage.getItem('google-ads-leads'))
```

4. Paste the JSON into a file
5. Use the new dashboard's form to re-import the leads manually, or
6. Use the API directly to bulk import:

```bash
curl -X POST https://your-worker.workers.dev/api/leads \
  -H "Content-Type: application/json" \
  -d @leads.json
```

## Security Considerations

The current implementation has:
- **Public API** - Anyone can read/write leads
- **CORS enabled** - Any origin can access the API

For production with sensitive data, consider adding:

1. **Authentication**: Add API keys or JWT tokens
2. **Rate limiting**: Prevent abuse
3. **Input validation**: Sanitize user input
4. **Private Worker**: Restrict access by domain

## Next Steps

Want to enhance your setup?

- [ ] Add user authentication
- [ ] Enable real-time sync with WebSockets
- [ ] Add data export (CSV/Excel)
- [ ] Set up monitoring and alerts
- [ ] Add backup/restore functionality
- [ ] Implement rate limiting

## Support

- Cloudflare Workers Docs: https://developers.cloudflare.com/workers/
- Cloudflare D1 Docs: https://developers.cloudflare.com/d1/
- Wrangler Docs: https://developers.cloudflare.com/workers/wrangler/

Happy deploying! 🚀
