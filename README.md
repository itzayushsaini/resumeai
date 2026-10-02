# ResumeAI

A resume builder with an honest ATS check, built on the MERN stack with Google Gemini for AI features.

- **Client:** React 19 + Vite, React Router, TanStack Query, Tailwind CSS 4, Radix primitives
- **Server:** Express 5 + Node, Mongoose (MongoDB Atlas), Better Auth, headless Chrome for PDF export
- **Shared:** one Zod schema for resume data, used by both client and server

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

   | Variable | What to put there |
   | --- | --- |
   | `MONGODB_URI` | Atlas → Connect → Drivers. Replace `<password>`. Allow your IP under Network Access. |
   | `BETTER_AUTH_SECRET` | Any long random string (32+ characters). |
   | `GEMINI_API_KEY` | Free key from [Google AI Studio](https://aistudio.google.com/apikey). |
   | `GOOGLE_*`, `LINKEDIN_*` | Optional. Social sign-in buttons appear only when these are set. |
   | `CHROME_PATH` | Optional. Auto-detected on Windows and macOS. |

3. Run the app:

   ```bash
   npm run dev
   ```

   Open http://localhost:5173. The API runs on port 4000 and Vite proxies `/api` to it.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Client and API with hot reload |
| `npm run build` | Production build of client and server |
| `npm start` | Runs the built server, which also serves the client |
| `npm run typecheck` | Type-checks every workspace |

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
- [ ] AI writing assistant, bullet writer, cover letters
- [ ] Application tracker, career coach, interview prep, Word/TXT export
- [ ] Landing page polish, Pro plan, performance pass
