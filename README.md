# TalentFlow – Mini Hiring Platform

TalentFlow is a lightweight **Applicant Tracking System (ATS)** built as a one-week challenge.  
It simulates job postings, candidate management, and assessments – all running entirely in the browser using **React + IndexedDB (Dexie) + MSW (Mock Service Worker)**.

---

## ⚙️ Setup

### Prerequisites
- Node.js >= 18
- npm / yarn / pnpm

### Installation
bash
# clone repository
git clone https://github.com/<your-username>/talentflow.git
cd talentflow

# install dependencies
npm install
npm run dev
## 🏗️ Architecture

### Frontend
- **React + Vite + TypeScript** – component-based UI and fast build tooling.  
- **React Router v6** – client-side routing with support for deep linking (`/jobs/:id`, `/candidates/:id`).    
- **React Hook Form** – form state and validation.  
- **TailwindCSS** – utility-first styling.

### Data & Mock Backend
- **Dexie.js (IndexedDB)** – browser persistence layer.  
  - Tables: `jobs`, `candidates`, `timelines`, `assessments`, `responses`.  
- **MSW (Mock Service Worker)** – intercepts `fetch` requests and serves data from Dexie.  
- **Seed Script** (`src/db/seed.ts`) auto-populates:  
  - 25 jobs (random `active`/`archived` status)  
  - 1000 candidates across multiple stages  
  - Candidate timelines  
  - Assessments for `job-1`, `job-2`, `job-3` (10+ technical questions each)

### Routing & Pages
```text
/
 └── /about                          → About page
 └── /jobs                           → Jobs list
      ├── /jobs/new                  → Create new job
      ├── /jobs/:jobId               → Job details
      ├── /jobs/:jobId/edit          → Edit job
      ├── /jobs/:jobId/candidates    → Candidate list (filtered by job)
      ├── /jobs/:jobId/kanban        → Kanban board for candidates
      └── /jobs/:jobId/assessment    → Assessment builder
 └── /candidates                     → All candidates
      └── /candidates/:id            → Candidate profile
```
## 🐞 Issues Faced

1. **MSW not working in production**  
   - Initially kept handlers inside `public/`, but Vercel doesn’t process code in `public/`.  
   - Solution: moved mocks into `src/mocks/` and imported them in `main.tsx`.

2. **404 errors on reload / deep linking**  
   - Directly opening `/jobs/job-2/edit` returned 404 on Vercel.  
   - Solution: added SPA rewrites via `vercel.json` to always serve `index.html`.

3. **IndexedDB Seeding duplication**  
   - Seeding ran multiple times and duplicated entries.  
   - Solution: added a check (`if (jobsCount > 0) return`) to seed only if DB is empty.

4. **Edit Job not working in deployment**  
   - API paths mismatched: frontend used `/jobs/:id` but MSW defined `/api/jobs/:id`.  
   - Solution: aligned all handlers under `/api/*` and updated fetch calls.

5. **Performance with large dataset**  
   - Seeding 1000+ candidates caused query lag.  
   - Solution: optimized Dexie indexes (`id`, `jobId`, `stage`) and used `bulkAdd`.
## 🤔 Technical Decisions

- **Mock backend with MSW + Dexie instead of a real server**  
  - Chosen to simulate real APIs with persistence while staying fully client-side.  
  - Enables offline-first behavior and testing without backend setup.  

- **SPA with React Router (BrowserRouter)**  
  - Clean URLs (`/jobs/job-1/edit`) make deep linking possible.  
  - Required Vercel rewrites for production reload support.  

- **React Query for data fetching**  
  - Handles caching, background re-fetching, and mutation updates.  
  - Keeps API layer consistent with how a real REST/GraphQL backend would behave.  

- **Seeding Assessments with rich technical questions**  
  - Jobs `job-1`, `job-2`, and `job-3` have pre-populated 10+ questions each.  
  - Includes algorithm, system design, SQL, debugging, and file-upload type questions.  

- **TailwindCSS for styling**  
  - Allowed rapid prototyping with consistent spacing, colors, and responsive utilities.  

- **IndexedDB over LocalStorage**  
  - Handles thousands of candidate records efficiently.  
  - Supports indexing and bulk operations (needed for performance).  
