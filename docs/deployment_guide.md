# 🚀 CareLens AI - Cloud Deployment Guide

This guide provides step-by-step instructions to deploy CareLens AI to free cloud hosting platforms so that hackathon judges, clinicians, and users can access your application 24/7 via a live HTTPS link.

---

## 🎯 Recommended Deployment Architecture

- **Frontend**: **Vercel** (Free, instant global CDN, automatic SSL).
- **Backend & ML Inference**: **Render** or **Railway** or **Hugging Face Spaces** (Free Python/PyTorch web services).

---

## 📦 Step 1: Push Code to GitHub

1. Open terminal in the project directory:
   ```bash
   git init
   git add .
   git commit -m "Production release for CareLens AI Round 2"
   ```
2. Create a new repository on [GitHub](https://github.com/new).
3. Connect and push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/carelens-ai.git
   git branch -M main
   git push -u origin main
   ```

---

## ⚙️ Step 2: Deploy Backend to Render (Free Web Service)

1. Sign up / Log in to [Render.com](https://render.com).
2. Click **New +** $\rightarrow$ Select **Blueprint**.
3. Connect your `carelens-ai` GitHub repository.
4. Render will automatically detect `render.yaml` and configure:
   - **Service Name**: `carelens-ai-api`
   - **Environment**: Python
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `gunicorn backend.app.main:app -w 2 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`
5. Click **Apply**.
6. Once deployed, Render will give you a public URL (e.g. `https://carelens-ai-api.onrender.com`).

---

## 🌐 Step 3: Deploy Frontend to Vercel (Free React Host)

1. Sign up / Log in to [Vercel.com](https://vercel.com).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Select your `carelens-ai` repository.
4. Set **Root Directory** to `frontend`.
5. Vercel automatically detects Vite:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL` = `https://carelens-ai-api.onrender.com/api`
7. Click **Deploy**.
8. Within 60 seconds, Vercel will give you a live production link:
   `https://carelens-ai.vercel.app`

---

## 🐋 Alternative: Single Container Deployment (Docker / Railway / Hugging Face)

If you prefer deploying via Docker container:
- Use the included `Dockerfile` in the root directory.
- Deploy directly to **Railway**, **Hugging Face Spaces (Docker SDK)**, or **Google Cloud Run**.

---

## ✅ Deployment Checklist

- [x] `frontend/vercel.json` SPA rewrite rules created.
- [x] `render.yaml` blueprint configuration created.
- [x] `Dockerfile` multi-stage build configuration created.
- [x] PyTorch model checkpoint `ml/checkpoints/carelens_efficientnet_b0.pt` included.
- [x] `backend/requirements.txt` dependencies verified.
