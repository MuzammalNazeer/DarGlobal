# 🚀 Deployment Guide – Live Public Application URL

This guide outlines the exact steps to deploy the **DarGlobal & Wasalt Real Estate AI Assistant** and obtain a live, publicly accessible URL for HR and technical submission.

---

## 🌟 Option 1: 1-Click Render Deployment (Recommended by HR & Brief)

Render provides free HTTPS hosting with automatic SSL: `https://<your-app-name>.onrender.com`.

### Step-by-Step Instructions:
1. **Push this repository to your GitHub account**:
   ```bash
   git add .
   git commit -m "Complete DarGlobal + Wasalt AI Assistant"
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<REPO_NAME>.git
   git push -u origin main
   ```

2. **Create Web Service on Render**:
   - Visit [dashboard.render.com](https://dashboard.render.com) and log in with GitHub.
   - Click **New +** > **Web Service**.
   - Select **Build and deploy from a Git repository** and connect your newly pushed repo.

3. **Configure Settings**:
   - **Name**: `darglobal-wasalt-ai` (or your preferred name)
   - **Region**: Oregon (US West) or Frankfurt (EU)
   - **Runtime**: **Docker**
   - **Instance Type**: **Free** (512 MB RAM, 0.1 CPU)
   - **Health Check Path**: `/api/health`

4. **Environment Variables**:
   Under **Advanced** > **Add Environment Variable**, set:
   | Key | Value | Description |
   |---|---|---|
   | `PORT` | `8000` | Application server port |
   | `DEFAULT_MODEL` | `openrouter/free` | Primary free routing model |
   | `USE_SENTENCE_TRANSFORMERS` | `false` | Enables 0ms high-speed memory-safe vector engine (ideal for 512MB RAM) |
   | `OPENROUTER_API_KEY` | *(Your OpenRouter Key)* | Optional (free fallback enabled if blank) |

5. **Deploy**:
   - Click **Deploy Web Service**.
   - Within 2-3 minutes, the build will finish and your live URL will be ready at:
     **`https://darglobal-wasalt-ai.onrender.com`**

---

## 🌟 Option 2: Hugging Face Spaces (Free Docker, 16GB RAM)

Hugging Face Spaces offers a generous 16GB RAM free tier and instant HTTPS URL: `https://<username>-darglobal-ai.hf.space`.

1. Go to [huggingface.co/spaces](https://huggingface.co/spaces) and click **Create new Space**.
2. Set Space Name: `darglobal-wasalt-assistant`.
3. Select **Space SDK**: **Docker** (Blank).
4. Add the Hugging Face git remote and push:
   ```bash
   git remote add hf https://huggingface.co/spaces/<YOUR_HF_USERNAME>/darglobal-wasalt-assistant
   git push hf main
   ```
5. Your live app is instantly accessible at:
   **`https://<YOUR_HF_USERNAME>-darglobal-wasalt-assistant.hf.space`**

---

## 🌟 Option 3: Instant Live Public URL via Cloudflare Tunnel / Localtunnel

If you want a live public URL immediately to share with HR while setting up cloud git remotes:

```bash
# Start your local server
python run.py

# In a separate terminal, expose port 8000 to the public web
npx localtunnel --port 8000 --subdomain darglobal-ai-assistant
```
This generates a live public HTTPS URL:
**`https://darglobal-ai-assistant.loca.lt`**

---

## 🐳 Option 4: Local Docker Deployment

Run the complete multi-stage container locally using Docker Compose:

```bash
# Build and start container
docker-compose up --build

# Open application
http://localhost:8000
```
