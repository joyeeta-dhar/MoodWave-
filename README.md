# 🎵 MoodWave — AI Mood-Based Music Recommendation App

> Tell us how you feel. We'll find the perfect soundtrack.

MoodWave uses Claude AI to analyze your emotions from natural language input, then serves a personalized music playlist. The UI dynamically morphs — colors, particles, and animations — to match your detected mood in real time.

---

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Frontend     | React + Vite, Tailwind CSS          |
| Animations   | Framer Motion                       |
| 3D visuals   | Three.js                            |
| Backend      | Node.js + Express                   |
| Database     | PostgreSQL (Supabase)               |
| AI           | Anthropic Claude API                |
| Music API    | Last.fm (free, no OAuth)            |
| Auth         | JWT                                 |
| Deployment   | Vercel (FE) + Render (BE) + Supabase|

---
## Live link mood-wave-theta.vercel.app
## Local Setup

### Prerequisites
- Node.js >= 18
- A Supabase project (free tier works)
- Anthropic API key
- Last.fm API key (free at last.fm/api)

### 1. Clone and install

```bash
git clone <your-repo>
cd moodwave

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Set up database

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste `database/schema.sql` → click **Run**
3. Copy the connection string from **Settings → Database**

### 3. Configure environment

```bash
# backend/.env
cp backend/.env.example backend/.env
# Fill in: DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY, LASTFM_API_KEY
```

```bash
# frontend/.env.local
VITE_API_URL=http://localhost:5000/api
```

### 4. Run locally

```bash
# Terminal 1 — backend
cd backend && npm run dev
# → API running at http://localhost:5000

# Terminal 2 — frontend
cd frontend && npm run dev
# → App running at http://localhost:5173
```

---

## Project Structure

```
moodwave/
├── database/
│   └── schema.sql              PostgreSQL schema
│
├── backend/
│   ├── config/database.js      pg Pool connection
│   ├── controllers/
│   │   ├── authController.js   register / login / me
│   │   └── moodController.js   analyze / history / stats
│   ├── middleware/auth.js      JWT verification
│   ├── routes/
│   │   ├── auth.js
│   │   └── mood.js
│   ├── services/
│   │   ├── moodService.js      Claude AI mood analysis
│   │   └── musicService.js     Last.fm playlist builder
│   └── server.js               Express entry point
│
└── frontend/
    └── src/
        ├── components/
        │   ├── three/MoodBackground.jsx   Three.js particles
        │   ├── ui/
        │   │   ├── Navbar.jsx
        │   │   ├── MoodInput.jsx
        │   │   ├── TrackCard.jsx
        │   │   └── MoodBadge.jsx
        │   └── motion/PageTransition.jsx
        ├── context/
        │   ├── AuthContext.jsx
        │   └── MoodContext.jsx
        ├── hooks/
        │   ├── useAuth.js
        │   └── useMood.js
        ├── pages/
        │   ├── Home.jsx
        │   ├── Dashboard.jsx
        │   ├── History.jsx
        │   └── Auth.jsx
        └── services/api.js
```

---

## API Reference

### Auth
```
POST /api/auth/register  { email, username, password }
POST /api/auth/login     { email, password }
GET  /api/auth/me        (Bearer token required)
```

### Mood
```
POST /api/mood/analyze   { text }           → mood, tracks, scores
GET  /api/mood/history   (auth required)    → past sessions
GET  /api/mood/stats     (auth required)    → mood frequency
```

---

## Mood → UI Mapping

| Mood       | Colors          | Three.js     | Animation Speed |
|------------|-----------------|--------------|-----------------|
| Happy      | Gold/Amber      | Fast particles | Fast           |
| Sad        | Blues           | Slow drift   | Slow            |
| Energetic  | Pink/Purple     | Rapid spin   | Very fast       |
| Calm       | Teal/Green      | Gentle wave  | Slow            |
| Stressed   | Orange          | Medium swirl | Medium          |
| Romantic   | Rose/Red        | Soft pulse   | Slow            |
| Nostalgic  | Violet/Purple   | Dream drift  | Slow            |

---

## Deployment

### Supabase
1. Create project at supabase.com
2. Paste `database/schema.sql` in SQL Editor and run

### Render (Backend)
1. Push to GitHub
2. New Web Service → connect repo
3. Root: `/` | Build: `cd backend && npm install` | Start: `cd backend && node server.js`
4. Add env vars from `.env.example`

### Vercel (Frontend)
1. Import frontend/ folder to Vercel
2. Framework preset: **Vite**
3. Add env: `VITE_API_URL=https://your-app.onrender.com/api`
4. Deploy

---

## Features Roadmap

- [ ] Spotify OAuth for real playlist creation
- [ ] Mood-to-playlist history timeline visualization
- [ ] Share your mood playlist with a link
- [ ] Mood trends chart (weekly/monthly)
- [ ] PWA support for mobile

---

## License

MIT
