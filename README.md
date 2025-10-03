# TalentFlow – Mini Hiring Platform

A lightweight hiring workflow platform built with **React + Vite**, using  
**React Router**, **Dexie (IndexedDB)** for persistence, and  
**MSW (Mock Service Worker)** for API simulation.  

This project demonstrates a mini-ATS (Applicant Tracking System) where jobs, candidates, and assessments can be managed in a production-like environment without a real backend.

---

## 🚀 Features

- **Job Management**
  - List all jobs
  - Create new job postings
  - Edit existing jobs
  - View job details

- **Candidate Management**
  - Candidate list & profile pages
  - Track candidate stages (`applied`, `screen`, `tech`, `offer`, `hired`, `rejected`)
  - Candidate Kanban view
  - Candidate timelines & notes

- **Assessments**
  - Assessment builder per job
  - Section/question management

- **Mock API (MSW)**
  - All API calls intercepted by MSW
  - Data persisted in IndexedDB (`Dexie`)
  - Fake latency + occasional errors to simulate real production APIs

- **Deep Linking**
  - Direct URLs for jobs and candidates (e.g. `/jobs/job-2/edit`, `/candidates/cand-10`)
  - SPA routing with `react-router-dom`
  - Configured for reload support on Vercel via `vercel.json`

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **State/Data:** React Query, React Hook Form
- **Routing:** React Router v6
- **Mock Backend:** MSW (Mock Service Worker)
- **Persistence:** Dexie.js (IndexedDB)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

---
