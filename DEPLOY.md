# GitHub Pages Deployment Guide

## Automatic Deployment with GitHub Actions ✨

The app automatically deploys to GitHub Pages whenever you push to the `main` branch.

## Initial Setup

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `AviationTools` (or your preferred name)
3. Set visibility (Public or Private)
4. Don't initialize with README

### 2. Update Configuration

**Update `package.json`** - Replace `yourusername` with your GitHub username:
```json
"homepage": "https://YOUR-USERNAME.github.io/AviationTools"
```

**Update `.github/workflows/deploy.yml`** - Line 32, change if your repo name differs:
```yaml
PUBLIC_PATH: /AviationTools/  # Match your repo name
```

### 3. Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Aviation Tools PWA"

# Add remote (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/AviationTools.git

# Push to main branch
git branch -M main
git push -u origin main
```

### 4. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **gh-pages** / (root)
4. Click **Save**

### 5. Wait for Deployment

- GitHub Actions will automatically run
- Check progress: **Actions** tab in your repo
- First deployment takes 1-2 minutes
- App will be live at: `https://YOUR-USERNAME.github.io/AviationTools`

## How It Works

### Automatic Deployment Workflow

```
┌─────────────┐
│  Push code  │
│  to main    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│  GitHub Actions starts  │
│  (.github/workflows/)   │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────┐
│  Install Node.js 20 │
│  Install packages   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Build production   │
│  npm run build      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Deploy to          │
│  gh-pages branch    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Live on GitHub     │
│  Pages! 🎉          │
└─────────────────────┘
```

### Workflow Triggers

- **Push to main**: Automatic deployment
- **Manual**: Actions tab → Deploy to GitHub Pages → Run workflow

## Making Updates

### Simple Workflow

```bash
# 1. Make your changes to the code
# 2. Test locally
npm run dev

# 3. Commit and push
git add .
git commit -m "Add new feature"
git push

# 4. Wait 1-2 minutes - automatic deployment!
```

That's it! No need to run `npm run deploy` manually.

## Manual Deployment (Alternative)

If you prefer manual deployment without GitHub Actions:

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Deploy
npm run deploy
```

## Repository Settings

### Required Permissions

**Settings** → **Actions** → **General**:
- Workflow permissions: **Read and write permissions**
- Allow GitHub Actions to create and approve pull requests: **Enabled**

### Branch Protection (Optional)

Protect the `main` branch:
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date

## Monitoring Deployments

### Check Deployment Status

1. Go to **Actions** tab
2. Click on latest workflow run
3. View build logs and deployment status
4. Green checkmark = successful deployment ✅

### Common Workflow Statuses

- 🟡 **In Progress**: Building and deploying
- ✅ **Success**: Deployed successfully
- ❌ **Failed**: Check logs for errors

## Troubleshooting

### Build Fails in GitHub Actions

**Check the Actions tab for error details:**

1. Click on failed workflow
2. Expand failed step
3. Read error message

**Common fixes:**
- Ensure `package.json` has correct dependencies
- Check TypeScript errors locally: `npm run build`
- Verify Node.js version compatibility

### Deployment Succeeds but Page is Blank

1. Check `PUBLIC_PATH` in `deploy.yml` matches repo name
2. Verify `homepage` in `package.json` is correct
3. Check browser console for errors
4. Ensure GitHub Pages source is `gh-pages` branch

### GitHub Pages Not Updating

1. Check Actions tab - workflow succeeded?
2. Hard refresh browser: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
3. Clear browser cache
4. Wait 1-2 minutes for CDN propagation

### Permission Denied Error

**Settings** → **Actions** → **General**:
- Set workflow permissions to "Read and write permissions"

## Environment Variables

### Custom Configuration

Add secrets or environment variables:

1. **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add variable name and value
4. Reference in workflow: `${{ secrets.SECRET_NAME }}`

## Multiple Environments

### Deploy to Different Environments

**Staging**: Deploy `develop` branch to staging
**Production**: Deploy `main` branch to production

Create separate workflows for each environment.

## Offline Support

The deployed app works offline:
- ✅ All assets bundled
- ✅ CSS inlined
- ✅ Images base64 encoded
- ✅ PWA manifest included
- ✅ Works from bookmarks
- ✅ Installable on devices

## Testing Deployment

### iPad Mini Testing

1. Open Safari on iPad Mini
2. Navigate to GitHub Pages URL
3. Test both orientations (portrait/landscape)
4. Add to Home Screen
5. Test offline mode (airplane mode)

### Checklist

- ✅ App loads correctly
- ✅ All tools function properly
- ✅ Altitude Correction calculates correctly
- ✅ Turn Calculator works
- ✅ Responsive design on iPad Mini
- ✅ Works on mobile phones
- ✅ Works on desktop
- ✅ No console errors
- ✅ Offline functionality

## Performance

### Bundle Size

Optimize for fast loading:
- Production build is minified
- Images are inlined (small size)
- CSS is bundled
- Single request for JS

### Lighthouse Score Goals

- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+
- PWA: Installable

## Your Deployment URL

Once deployed, your app will be available at:

```
https://YOUR-USERNAME.github.io/AviationTools
```

**Replace `YOUR-USERNAME` with your actual GitHub username.**

---

## Quick Reference

### Deployment Commands

```bash
# Push and auto-deploy
git push

# Manual deployment
npm run deploy

# Local development
npm run dev

# Production build
npm run build
```

### Important Files

- `.github/workflows/deploy.yml` - GitHub Actions workflow
- `package.json` - Homepage URL and scripts
- `webpack.config.js` - Build configuration
- `public/manifest.json` - PWA manifest
- `public/.nojekyll` - Disable Jekyll on GitHub Pages

---

**🎉 Ready to deploy!** Push your code and watch the magic happen! ✈️