# Vercel Deployment Guide for OmniFlow CRM

This project is configured and fully ready for **1-Click deployment on Vercel**.

---

## Method 1: Deploy via GitHub (Recommended & Easiest)

1. **Initialize Git & Push to GitHub:**
   Open PowerShell or terminal in your project directory `c:\Users\DELL\Desktop\tean project` and run:
   ```bash
   git init
   git add .
   git commit -m "Complete Customer & Lead Management CRM"
   ```

2. **Create a GitHub Repository:**
   - Go to [github.com](https://github.com) and click **"New repository"**.
   - Copy the repository remote URL and run:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

3. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com) and log in (with GitHub).
   - Click **"Add New..."** → **"Project"**.
   - Select your GitHub repository from the list.
   - Vercel will automatically detect:
     - **Framework Preset:** Vite
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`
   - Click **"Deploy"**!
   - In ~30 seconds, your CRM will be live with a free SSL domain (e.g. `omniflow-crm.vercel.app`).

---

## Method 2: Deploy Directly via Terminal (Using Vercel CLI)

If you don't want to use GitHub, you can deploy directly from your computer terminal:

1. In the terminal, run:
   ```bash
   npx vercel
   ```
2. Follow the quick prompts:
   - `Set up and deploy?` → Press **Y**
   - `Which scope?` → Press **Enter** (your account)
   - `Link to existing project?` → Press **N**
   - `What's your project's name?` → Type `omniflow-crm` (or press **Enter**)
   - `In which directory is your code located?` → Press **Enter** (`./`)
   - `Want to modify settings?` → Press **N**
3. Once the preview link is generated, deploy to production with:
   ```bash
   npx vercel --prod
   ```

---

## Included Vercel Configuration (`vercel.json`)

We have created [`vercel.json`](./vercel.json) in your project root:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
This ensures:
- Vite builds the production bundle into `dist`.
- Single-page application (SPA) routing routes cleanly to `index.html`.
- No 404 errors on page refresh.
