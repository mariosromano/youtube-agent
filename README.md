# YouTube Video Analyzer 🎬

An AI-powered YouTube video analyzer that uses OpenAI's Agents SDK to answer questions about any YouTube video.

## What it does

1. You provide a YouTube URL and a question
2. The agent analyzes the video using BumpUps (via Zapier MCP)
3. Returns an answer along with video metadata (thumbnail, title, duration)

## Quick Start (Local)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

3. **Run the app**
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 in your browser

---

## Deploy to Vercel (Easiest)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Add environment variable**
   - Go to your project on vercel.com
   - Settings → Environment Variables
   - Add `OPENAI_API_KEY`

4. **Redeploy**
   ```bash
   vercel --prod
   ```

---

## Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub" or "Empty Project"
3. If empty project, drag your folder or use Railway CLI:
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   railway up
   ```
4. Add environment variable: `OPENAI_API_KEY`
5. Railway will auto-detect Node.js and deploy

---

## Deploy to Render

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect your repo or use "Deploy from a public Git repository"
4. Settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add environment variable: `OPENAI_API_KEY`

---

## Deploy to Replit

1. Go to [replit.com](https://replit.com)
2. Create new Repl → Import from GitHub or upload files
3. In the Repl:
   - Add Secret: `OPENAI_API_KEY`
   - Click "Run"
4. Your app will be live at `your-repl-name.your-username.repl.co`

---

## Project Structure

```
youtube-agent/
├── public/
│   └── index.html      # Frontend UI
├── src/
│   ├── server.ts       # Express server
│   └── workflow.ts     # OpenAI Agent workflow
├── package.json
├── tsconfig.json
└── .env.example
```

## Tech Stack

- **OpenAI Agents SDK** - Agent orchestration
- **Express** - Web server
- **Zapier MCP** - Tool integration (BumpUps, YouTube)
- **TypeScript** - Type safety

## Notes

- The Zapier MCP authorization is embedded in the workflow
- Make sure your Zapier connection stays active
- API costs apply for OpenAI usage

---

Built by Samson 🚀
