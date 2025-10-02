import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import useJobViewModel from '../../../hooks/useJobViewModel';
import type { Job } from '../../../../public/db/type';
import PageLoader from '../../../components/loader';

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
    <div className="bg-blue-50/10 min-h-screen p-6 flex justify-center">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-950">{job.title}</h1>
            <div className="text-sm text-blue-900 mt-1">{job.slug}</div>
          </div>

          <div className="flex gap-3">
            <Link
              to="/jobs/"
              className="px-4 py-2 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              ← Back to Jobs
            </Link>
            <button
              onClick={() =>
                navigate(`/jobs/${job.id}/edit`, { state: { background: location } })
              }
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-sm"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Tags & Status */}
        <div className="flex flex-wrap items-center gap-3">
          {(job.tags || []).map((t) => (
            <span
              key={t}
              className="text-xs bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full"
            >
              {t}
            </span>
          ))}
          <span
            className={`px-2 py-0.5 rounded text-xs ${
              job.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {job.status ?? 'active'}
          </span>
        </div>

        {/* Description */}
        <section className="mt-4">
          <h2 className="text-xl font-semibold text-blue-950 mb-2">Description</h2>
          <p className="text-blue-900">{job.description ?? 'No description available.'}</p>
        </section>

        {/* Navigation Buttons */}
        <div className="mt-6">
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/jobs/${jobId}/candidates`}
              className="px-4 py-2 rounded-lg bg-blue-50 border border-blue-500 text-blue-700 hover:bg-blue-100"
            >
              👤 Candidates
            </Link>
            <Link
              to={`/jobs/${jobId}/assessment`}
              className="px-4 py-2 rounded-lg bg-blue-50 border border-blue-500 text-blue-700 hover:bg-blue-100"
            >
              📝 Assessments
            </Link>
            <Link
              to={`/jobs/${jobId}/kanban`}
              className="px-4 py-2 rounded-lg bg-blue-50 border border-blue-500 text-blue-700 hover:bg-blue-100"
            >
              🗂️ Kanban
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
