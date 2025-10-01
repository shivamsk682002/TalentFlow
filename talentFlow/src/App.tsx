
import './App.css'
import React from 'react';
import { Routes,Route,Navigate } from 'react-router-dom';
import JobsPage from './features/jobs/jobsPage/jobsPage';
import JobDetailPage from './features/jobs/jobDetailPage/jobDetailPage';
import JobEditorialModel from './features/jobs/jobEditorialModel/jobEditorialModel';
import Navbar from './components/navbar';
import CandidateList from './features/candidates/candidateList/candidateList';
import CandidateProfile from './features/candidates/candidateProfile/candidateProfile';
import KanbanPage from './features/candidates/kanban/kanban';
import Builder from './features/assessments/builder/builder';

export default function App()
{
  return (
    <div className="min-h-screen bg-white">
    <Navbar/>
    <Routes>
      
      <Route path="/" element={<Navigate to="jobs" replace/>}></Route>
      <Route path="/jobs" element={<JobsPage/>}></Route>
      <Route path="/jobs/new" element={<JobEditorialModel/>}></Route>
      <Route path="/jobs/:jobId" element={<JobDetailPage/>}></Route>
      <Route path="/jobs/:jobId/edit" element={<JobEditorialModel/>}></Route>
      <Route path="/candidates" element={<CandidateList/>}></Route>
      <Route path="/candidates/:id" element={<CandidateProfile/>}></Route>
      <Route path="/jobs/:jobId/kanban" element={<KanbanPage/>}></Route>
      <Route path="/jobs/:jobId/candidates" element={<CandidateList/>}></Route>
      <Route path="/jobs/:jobId/assessment" element={<Builder />} />

      
    </Routes>
    </div>
  );
}

