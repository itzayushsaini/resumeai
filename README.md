# ResumeAI

A resume builder with an honest ATS check and an AI writing copilot, built on the MERN stack in plain JavaScript, with Google Gemini for AI features.

- **Client:** React 19 + Vite (JSX), plain CSS files, React Router, TanStack Query, Radix primitives
- **Server:** Express 5 + Node (ES modules), Mongoose (MongoDB Atlas), Better Auth, headless Chrome for PDF export
- **Shared:** one Zod schema for resume data, used by both client and server

## AI writing help

- **Live checks** on every bullet as you type: weak start, AI-sounding buzzwords, missing numbers, first person, passive voice, length. Free and instant (rule-based).
- **One-click rewrites:** Improve, Add a number, Shorten, Sound human. Suggestions never invent facts; when a number would help, the AI asks for it.
- **Autocomplete:** grey ghost text while you type; Tab accepts.
- **Write from notes:** describe your work in English, Hindi or Hinglish and get English bullets to pick from.
- **Summary writer** and **skill suggestions** built only from what's on the resume.

Models default to `gemini-3.6-flash` and `gemini-3.5-flash-lite` (both on the free tier); override with `GEMINI_MODEL_SMART` / `GEMINI_MODEL_FAST`. Busy or rate-limited calls retry once, then fall back to the fast model.

## Getting started

Requirements: Node 22 or newer, a MongoDB Atlas cluster, and Chrome or Edge installed (for PDF export).

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `server/.env` from the example and fill it in:

   ```bash
   cp server/.env.example server/.env
   ```

   | Variable                 | What to put there                                                                    |
   | ------------------------ | ------------------------------------------------------------------------------------ |
   | `MONGODB_URI`            | Atlas → Connect → Drivers. Replace `<password>`. Allow your IP under Network Access. |
   | `BETTER_AUTH_SECRET`     | Any long random string (32+ characters).                                             |
   | `GEMINI_API_KEY`         | Free key from [Google AI Studio](https://aistudio.google.com/apikey).                |
   | `GOOGLE_*`, `LINKEDIN_*` | Optional. Social sign-in buttons appear only when these are set.                     |
   | `CHROME_PATH`            | Optional. Auto-detected on Windows and macOS.                                        |

3. Run the app:

   ```bash
   npm run dev
   ```

   Open http://localhost:5173. The API runs on port 4000 and Vite proxies `/api` to it.

## Scripts

| Command                      | What it does                                                 |
| ---------------------------- | ------------------------------------------------------------ |
| `npm run dev`                | Client and API with hot reload                               |
| `npm run build`              | Production build of the client (the server runs as-is)       |
| `npm start`                  | Runs the server, which also serves the built client          |
| `npm run format`             | Formats the code with Prettier                               |
| `npm run ai:smoke -w server` | Calls Gemini once per AI feature to check the key and models |

## Deploying to Render

The repo includes a `Dockerfile` (Node + Chromium for PDF export) and a `render.yaml` Blueprint.
It runs as one web service: Express serves the API and the built React app.

1. In MongoDB Atlas → **Network Access**, allow `0.0.0.0/0`. Render's free plan has no fixed
   outbound IP, so the strong database password is what protects the cluster.
2. In Render: **New → Blueprint**, connect GitHub and pick this repo.
3. Fill in `MONGODB_URI` and `GEMINI_API_KEY` when asked. `BETTER_AUTH_SECRET` is generated for
   you, and the public URL is read from Render's `RENDER_EXTERNAL_URL`.
4. Click **Apply**. The first build takes a few minutes; later pushes to `main` redeploy automatically.

Free instances sleep after 15 minutes without traffic, so the first visit after a pause takes
about a minute. If you add a custom domain, set `CLIENT_URL` and `BETTER_AUTH_URL` to it.

## Project layout

```
client/   React app (pages, editor, resume renderer)
server/   Express API (auth, resumes, PDF export)
shared/   Resume schema, section definitions, example content
```

### How PDF export works

The editor preview and the PDF use the same renderer. It measures every block and splits the
content into pages itself, so the download matches the preview exactly. For export, the server opens
the client's `/print/:id` page in headless Chrome with a short-lived signed token and saves it as a
PDF with a real text layer.

## Roadmap

- [x] Foundation: auth, onboarding, dashboard, settings, light and dark themes
- [x] Resume editor: live paginated preview, 3 templates, design controls, autosave, PDF export
- [ ] Import and ATS engine: PDF/Word import, rule checks + Gemini analysis, score breakdown
- [ ] Resume Analyser and career roadmap
- [ ] Job Match and "Tailor to this job"
- [x] AI writing copilot: live checks, rewrites, autocomplete, notes to bullets, summary, skills
- [ ] Cover letters
- [ ] Application tracker, career coach, interview prep, Word/TXT export
- [ ] Landing page polish, Pro plan, performance pass
