# 🕊️ Word Mastery — Train Your Spirit

> "Physical training is good, but training for godliness is much better, promising benefits in this life and the life to come." — 1 Timothy 4:8

Welcome to **Word Mastery**, a high-intensity developer-led experiment in spiritual fitness. We took the psychology of a modern fitness app—the streaks, the stats, the "just one more set" addiction—and applied it to the most important "muscle" you own: your spirit.

## 💪 The Workout Philosophy

Word Mastery isn't a library; it's a training ground. We believe that Scripture should be **etched into the heart**, not just glanced at on a screen. Every day, the gym generates a **Global Daily Workout** for the entire community.

### 🏋️ The Drills

- **Memorization Drill**: Clozed-deletion recall. Fill in the missing words to build active retrieval pathways.
- **Context Challenge**: Rapid-fire questions on authorship, history, and theme. Proper form means understanding the _why_ behind the verse.
- **Verse Match**: High-speed reference matching. Build that quick-twitch recall for when you need a Word in the heat of life.
- **Rearrange Drill**: Drag and drop verses into their correct chronological order.

### 🏆 Mastery Mode

Take specific verses through **5 Levels of Overload**. From basic recognition to full-text recall under pressure. Once it's "Mastered," it's with you for life.

## 🛠️ The Tech Stack (The "Gear")

Built for the [DEV Weekend Challenge: Community](https://dev.to/challenges/weekend-2026-02-28).

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Backend-as-a-Service**: [Appwrite](https://appwrite.io/) (Auth, Realtime Databases, Points Sync)
- **AI Engine**: [Google Gemini API](https://ai.google.dev/) (Dynamic context & themed workout generation)
- **Animation**: [Framer Motion](https://www.framer.com/motion/) (Neo-Brutalist "punchy" UI)
- **Styles**: Tailwind CSS + Shadcn UI

## 🚀 Getting Started

### 1. Requirements

- Node.js 18+
- pnpm (recommended)
- An Appwrite project (Cloud or Self-hosted)
- A Gemini API Key

### 2. Environment Setup

Copy `.env.example` (or create one) in `apps/web/.env.local`:

```bash
GEMINI_API_KEY=your_key
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_id
APPWRITE_API_KEY=your_admin_key
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_db_id
CRON_SECRET=a_random_string
```

### 3. Database Initialization

We’ve automated the heavy lifting. Run this to sync the collections and attributes:

```bash
# In the apps/web directory
pnpm run setup:prod # or run the local setup script if you prefer
```

### 4. Running the Gym

```bash
pnpm install
pnpm dev
```

## 🛠️ Local Reproduction & Development

If you are a developer looking to reproduce this environment:

1.  **Appwrite Setup**: Create an Appwrite project. Enable **Google OAuth** in the Auth section.
2.  **Database Creation**: You don't need to create collections manually.
    - Create a database in Appwrite and copy its ID.
    - Add your `APPWRITE_API_KEY` (with `collections.write`, `attributes.write`, `indexes.write` scopes) to `.env.local`.
    - Run `pnpm run setup:prod` (from `apps/web`) to automatically provision all required collections and attributes.
3.  **Local Testing**:
    - Use `pnpm run dev` to start the Next.js app.
    - Open `http://localhost:3000`.
    - If you need to test the Daily Workout logic without waiting 24 hours, you can manually trigger the cron: `curl -X POST http://localhost:3000/api/daily-workout -H "Authorization: Bearer your_cron_secret"`.

## ⏰ Automated Training (Cron Jobs)

To keep the daily workout fresh, we use automated pings:

- **Production**: Configured via `vercel.json` to trigger at midnight UTC.
- **Local Dev**: Run `pnpm run cron:local`. It pings your local dev server and then runs a background daemon to keep the "daily" cycle alive while you code.

---

### 📖 Why This?

I built this because I realized I was tracking my bench press more than my spiritual growth. Read the full story at [/why-this](https://bible-gym.vercel.app/why-this).

**Keep Training. Grow in Grace.** 🕊️💪
