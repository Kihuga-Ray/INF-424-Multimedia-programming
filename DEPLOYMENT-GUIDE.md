# GitHub Pages Deployment Guide

## Prerequisites
- GitHub account (free tier sufficient)
- Git installed and configured
- Repository created: https://github.com/Kihuga-Ray/INF-424-Multimedia-programming

## Step-by-Step Deployment

### 1. Repository Setup
```bash
# Clone or navigate to your repository
git clone https://github.com/Kihuga-Ray/INF-424-Multimedia-programming.git
cd INF-424-Multimedia-programming

# Ensure you're on main/master branch
git branch -M main
```

### 2. Push Code to GitHub
```bash
# Add all files
git add .

# Commit with meaningful message
git commit -m "feat: complete multimedia learning hub"

# Push to remote
git push -u origin main
```

### 3. Enable GitHub Pages
1. Go to repository Settings
2. Scroll to "GitHub Pages" section
3. **Source:** Select "Deploy from a branch"
4. **Branch:** Select `main` (or `master`)
5. **Folder:** Select `/ (root)`
6. Click "Save"

### 4. Verify Deployment
- Wait 1-2 minutes for GitHub to build
- Your site will be available at: `https://kihuga-ray.github.io/INF-424-Multimedia-programming/`
- View deployment status under Settings → GitHub Pages

## Troubleshooting

### Site Not Appearing
- ✓ Ensure `index.html` is in the root directory
- ✓ Check that branch is set correctly in Settings
- ✓ Verify repository is public (GitHub Pages requires public repos on free tier)
- ✓ Wait 1-2 minutes for deployment to complete

### 404 Errors on Subpages
- ✓ Ensure HTML file paths are relative (not absolute)
- ✓ Check that file names match links exactly (case-sensitive on Linux servers)
- ✓ Links should use `href="audio-player.html"` not `href="/audio-player.html"`

### HTTPS Not Working
- GitHub Pages automatically provides HTTPS
- If not working, check repository settings
- May take several minutes to provision SSL certificate

### Files Not Updating
- ✓ Hard refresh browser: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- ✓ Clear browser cache
- ✓ Wait 5 minutes for CDN propagation

## Custom Domain (Optional)
1. Go to Settings → Pages → Custom domain
2. Enter your domain name
3. Add DNS records as instructed
4. Wait for DNS propagation (24-48 hours)

## GitHub Pages Features

### Automatic Jekyll Processing
- GitHub Pages automatically runs Jekyll (static site generator)
- For plain HTML/CSS/JS, no processing needed
- You can add `_config.yml` to customize (not needed for this project)

### YAML Front Matter
- If using Jekyll, you can add metadata at file top
- For this project, not needed since it's plain HTML

### 404 Custom Page
Create `404.html` in root for custom 404 errors:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Page Not Found</title>
</head>
<body>
  <h1>404 - Page Not Found</h1>
  <p><a href="/">Return to Home</a></p>
</body>
</html>
```

## Environment Variables
- GitHub Pages doesn't support server-side processing
- All code must be client-side (JavaScript, HTML, CSS)
- No backend APIs available (unless using external services)

## Performance Optimization

### Asset Caching
- Images and static files are cached by GitHub CDN
- Cache busting: Add query parameter `?v=1` to force refresh

### Speed Tips
- GitHub Pages uses global CDN (fast worldwide)
- Optimize image file sizes before deploying
- Minify CSS/JS (optional for this project)

## Continuous Deployment

### Automatic Updates
Every time you push to GitHub:
```bash
git add .
git commit -m "fix: updated feature"
git push origin main
```

GitHub Pages automatically rebuilds and updates within 1-2 minutes.

### Webhooks & Actions
- Can set up GitHub Actions for automated builds
- Not needed for this static site project
- Would be useful for post-processing/minification in larger projects

## Monitoring & Analytics

### Built-in GitHub Insights
- Go to repository → Insights → Traffic
- See pageviews and referrers
- Limited analytics, but sufficient for verification

### Third-Party Analytics (Optional)
- Google Analytics: Add tracking code to `<head>`
- Plausible, Fathom Analytics: Other privacy-friendly options
- Not part of this project requirement

## HTTPS/Security

### Automatic HTTPS
- GitHub Pages automatically provides free HTTPS
- All traffic redirected to HTTPS
- SSL certificate renewed automatically

### Security Headers
- GitHub Pages doesn't support custom security headers in free tier
- Subdomain on github.io has standard security headers

## Submission Checklist

Before submitting, verify:
- [ ] URLs work: https://kihuga-ray.github.io/INF-424-Multimedia-programming/
- [ ] index.html loads correctly
- [ ] All pages (audio-player, video-player, etc.) accessible
- [ ] CSS and JS files loading (check DevTools → Network)
- [ ] No 404 errors in console
- [ ] Theme toggle works
- [ ] Dark/light theme persists
- [ ] All media players functional
- [ ] Gallery displays correctly

## References

- GitHub Pages Documentation: https://pages.github.com/
- GitHub Pages Help: https://docs.github.com/en/pages
- Jekyll Documentation: https://jekyllrb.com/docs/
- Deployment Best Practices: https://github.com/github/super-linter
