# Deployment Guide: Cloudflare Pages

## How to Host on Cloudflare Pages

### Method 1: Using Cloudflare Dashboard (Recommended)

1. **Build your project locally**
   ```bash
   npm run build
   ```
   This creates a `dist/` folder with your production-ready files.

2. **Go to Cloudflare Pages**
   - Visit https://pages.cloudflare.com/
   - Sign in or create a Cloudflare account
   - Click "Create a project"

3. **Connect to Git**
   - Choose "Connect to Git"
   - Select your repository (comm-itx/gads-dashboard)
   - Authorize Cloudflare to access your repository

4. **Configure Build Settings**
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: Leave empty (or `/` if required)
   - **Environment variables**: None required for basic functionality

5. **Deploy**
   - Click "Save and Deploy"
   - Wait 2-3 minutes for the build to complete
   - You'll get a URL like: `https://your-project.pages.dev`

### Method 2: Using Wrangler CLI

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Build and Deploy**
   ```bash
   npm run build
   wrangler pages deploy dist --project-name=gads-dashboard
   ```

### Method 3: Direct Upload (No Git)

1. **Build locally**
   ```bash
   npm run build
   ```

2. **Go to Cloudflare Pages Dashboard**
   - Click "Create a project"
   - Choose "Direct Upload"
   - Drag and drop the `dist/` folder
   - Give it a project name

## Data Storage Explained

### Current Implementation: Browser LocalStorage

**Where data is stored:**
- All lead data is stored in the **browser's localStorage**
- Location: `localStorage.getItem('google-ads-leads')`
- API configuration: `localStorage.getItem('ai-api-config')`

**Important Characteristics:**

✅ **Advantages:**
- No backend server needed
- Free hosting on Cloudflare Pages
- Instant data access
- Privacy-focused (data stays on user's device)
- No database costs

❌ **Limitations:**
- Data is **device-specific** (not synced across browsers/devices)
- Data is **user-specific** (each user sees only their own data)
- Clearing browser data = losing all leads
- Storage limit: ~5-10MB per domain
- No collaboration features (can't share data between team members)

### Data Persistence:

```javascript
// From App.tsx:21-32
useEffect(() => {
  // Load data from localStorage on startup
  const storedLeads = localStorage.getItem('google-ads-leads');
  if (storedLeads) setLeads(JSON.parse(storedLeads));

  const storedApiConfig = localStorage.getItem('ai-api-config');
  if (storedApiConfig) setApiConfig(JSON.parse(storedApiConfig));
}, []);

// Save to localStorage whenever leads change
useEffect(() => {
  localStorage.setItem('google-ads-leads', JSON.stringify(leads));
}, [leads]);
```

## Data Storage Options for Production

If you need persistent, shared data storage, consider these options:

### Option 1: Cloudflare D1 (Serverless SQL Database)
- Best for: Multi-user access, data persistence
- Cost: Free tier available
- Requires: Backend API using Cloudflare Workers

### Option 2: Cloudflare KV (Key-Value Storage)
- Best for: Simple key-value data
- Cost: Free tier available
- Requires: Cloudflare Workers integration

### Option 3: Firebase/Supabase
- Best for: Real-time sync, authentication
- Cost: Free tier available
- Requires: Adding SDK and authentication

### Option 4: Export/Import Feature
- Keep localStorage but add data export (JSON/CSV)
- Users can backup and restore their data
- No backend needed

## Custom Domain Setup

After deployment:

1. Go to your Cloudflare Pages project
2. Click "Custom domains"
3. Add your domain (e.g., `leads.yourdomain.com`)
4. Cloudflare will handle SSL automatically

## Environment Variables

If you want to pre-configure API keys:

1. In Cloudflare Pages dashboard → Settings → Environment variables
2. Add: `VITE_GEMINI_API_KEY` (if needed)
3. Update code to use: `import.meta.env.VITE_GEMINI_API_KEY`

**Note:** Current implementation allows users to configure API keys through the UI, so this is optional.

## Continuous Deployment

Once connected to Git:
- Every push to your main branch = automatic deployment
- Pull requests get preview deployments
- Rollback to previous versions anytime

## Post-Deployment Checklist

- [ ] Test the live URL
- [ ] Add leads via the form
- [ ] Check if data persists after page refresh
- [ ] Configure AI API key in Settings
- [ ] Test AI insights feature
- [ ] Set up custom domain (optional)
- [ ] Configure analytics (Cloudflare Web Analytics)

## Monitoring

Cloudflare Pages provides:
- Real-time visitor analytics
- Performance metrics
- Error tracking
- Build logs

Access via: Cloudflare Dashboard → Pages → Your Project → Analytics
