import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import useJobViewModel from '../../../hooks/useJobViewModel';
import type { Job } from '../../../db/type';
import PageLoader from '../../../components/loader';

export default function JobDetailPage() {
  // const { jobId } = useParams<{ jobId: string }>();
  // const navigate = useNavigate();
  // const location = useLocation();

  // const { getJob, loading, error } = useJobViewModel();
  // const [job, setJob] = useState<Job | null>(null);

  // useEffect(() => {
  //   if (!jobId) return;
  //   getJob(jobId, setJob);
  // }, [jobId, setJob]);

  // if (loading) return <PageLoader label="Fetching data…" />;
  // if (error) return <div className="p-6 text-red-600">{error}</div>;
  // if (!job) return <div className="p-6 text-blue-950">Job not found</div>;

  return (
    <div className="bg-blue-50/10 min-h-screen p-6 flex justify-center">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-xl p-8 space-y-6">
        hello
      </div>
    </div>
  );
}
