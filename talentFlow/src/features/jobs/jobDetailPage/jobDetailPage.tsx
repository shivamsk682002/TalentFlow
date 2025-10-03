import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import useJobViewModel from '../../../hooks/useJobViewModel';
import type { Job } from '../../../db/type';
import PageLoader from '../../../components/loader';
import { Users, ClipboardList, KanbanIcon, ArrowLeft, Pencil } from 'lucide-react';

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const { getJob, loading, error } = useJobViewModel();
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    if (!jobId) return;
    getJob(jobId, setJob);
  }, [jobId, setJob]);

  if (loading) return <PageLoader label="Fetching data…" />;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!job) return <div className="p-6 text-blue-950">Job not found</div>;

  return (
    <div className="bg-blue-50/10 min-h-screen p-4 sm:p-6 flex justify-center">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-xl p-4 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-950 break-words">
              {job.title}
            </h1>
            <div className="text-sm text-blue-900 mt-1">{job.slug}</div>
          </div>

          <div className="flex gap-2 sm:gap-3">
            <Link
              to="/jobs/"
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 text-sm sm:text-base"
            >
              <ArrowLeft size={16} /> Back
            </Link>
            <button
              onClick={() =>
                navigate(`/jobs/${job.id}/edit`, { state: { background: location } })
              }
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-sm text-sm sm:text-base"
            >
              <Pencil size={16} /> Edit
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {(job.tags || []).map((t) => (
            <span
              key={t}
              className="text-xs sm:text-sm bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full"
            >
              {t}
            </span>
          ))}
          <span
            className={`px-2 py-0.5 rounded text-xs sm:text-sm ${
              job.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {job.status ?? 'active'}
          </span>
        </div>
        <section>
          <h2 className="text-lg sm:text-xl font-semibold text-blue-950 mb-2">
            Description
          </h2>
          <p className="text-blue-900 text-sm sm:text-base">
            {job.description ?? 'No description available.'}
          </p>
        </section>
        <div className="mt-4 sm:mt-6">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Link
              to={`/jobs/${jobId}/candidates`}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg bg-blue-50 border border-blue-500 text-blue-700 hover:bg-blue-100 text-sm sm:text-base"
            >
              <Users size={16} /> Candidates
            </Link>
            <Link
              to={`/jobs/${jobId}/assessment`}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg bg-blue-50 border border-blue-500 text-blue-700 hover:bg-blue-100 text-sm sm:text-base"
            >
              <ClipboardList size={16} /> Assessments
            </Link>
            <Link
              to={`/jobs/${jobId}/kanban`}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg bg-blue-50 border border-blue-500 text-blue-700 hover:bg-blue-100 text-sm sm:text-base"
            >
              <KanbanIcon size={16} /> Kanban
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
