// src/features/jobs/LandingDesignPage.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { Job } from '../../../../public/db/type';
import useJobViewModel from '../../../hooks/useJobViewModel';
import JobEditorModal from '../jobEditorialModel/jobEditorialModel';
import { DndContext } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PageLoader from '../../../components/loader';

/* --------------------------- Hero Component --------------------------- */
function Hero() {
  const navigate = useNavigate();
  return (
    <header className="bg-white">
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-950 leading-tight">
          Streamline Your Hiring Process
        </h1>
        <p className="mt-4 text-lg text-blue-950 max-w-2xl mx-auto">
          A comprehensive hiring platform for HR teams and candidates. Manage jobs, track applications,
          and build assessments all in one place.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => navigate('/jobs')}
            className="px-6 py-3 rounded bg-blue-500 text-white text-lg font-medium shadow-sm hover:bg-blue-700"
          >
            Browse Jobs
          </button>
          <button
            onClick={() => navigate('/about')}
            className="px-6 py-3 rounded text-lg text-blue-950 bg-blue-400/10 hover:bg-slate-50"
          >
            Learn More
          </button>
        </div>
      </div>
    </header>
  );
}

/* --------------------------- FiltersBar Component --------------------------- */
function FiltersBar({
  onSearch,
  initialSearch,
  initialStatus,
  initialSort,
}: {
  onSearch: (params: { search: string; status: string; sort: string }) => void;
  initialSearch?: string;
  initialStatus?: string;
  initialSort?: string;
}) {
  const [search, setSearch] = useState(initialSearch ?? '');
  const [status, setStatus] = useState(initialStatus ?? '');
  const [sort, setSort] = useState(initialSort ?? '');

  return (
    <div className="bg-white border border-blue-500/30 rounded-lg p-4 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
        <div className="md:col-span-2">
          <label className="block text-sm text-blue-900 mb-1">Search Jobs</label>
          <input
            aria-label="Search jobs"
            className="w-full border border-blue-950/25 rounded px-3 py-2 text-sm"
            placeholder="Job title, skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm text-blue-900 mb-1">Status</label>
          <select
            aria-label="Status filter"
            className="w-full border border-blue-950/25 rounded px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-blue-900 mb-1">Sort By</label>
          <select
            aria-label="Sort"
            className="w-full border border-blue-950/25 rounded px-3 py-2 text-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="">Newest First</option>
            <option value="title:asc">Title A → Z</option>
            <option value="title:desc">Title Z → A</option>
            <option value="order:asc">Order ↑</option>
            <option value="order:desc">Order ↓</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => onSearch({ search, status, sort })}
            className="ml-auto px-4 py-2 bg-blue-500 text-white rounded text-sm font-medium"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- JobCard Component (same behavior) --------------------------- */
function JobCard({ job, role }: { job: Job; role: 'hr' | 'candidate' }) {
  const posted = job.createdAt ? new Date(job.createdAt) : undefined;
  const postedText = posted ? posted.toLocaleDateString() : job.order ? `Posted ${job.order}` : '';

  return (
    <div className="bg-white border border-blue-500/30 shadow-xl rounded-lg p-5 flex items-start justify-between">
      <div className="max-w-[72%]">
        <h3 className="text-lg font-semibold text-blue-950">{job.title}</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {(job.tags || []).map((t) => (
            <span key={t} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
              {t}
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-4 text-sm text-blue-900">
          <span
            className={`px-2 py-0.5 rounded text-xs ${
              job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {job.status ?? 'active'}
          </span>
          <div>{postedText}</div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        {role === 'hr' ? (
          <>
            {/* use Link to keep original behavior; stopPropagation so click doesn't trigger DnD */}
            <Link
              onClick={(e) => e.stopPropagation()}
              to={`/jobs/${job.id}/edit`}
              className="text-sm px-3 py-1 rounded bg-blue-400/10 cursor-pointer"
            >
              Edit
            </Link>
            <Link onClick={(e) => e.stopPropagation()} to={`/jobs/${job.id}`} className="text-sm text-blue-900 ml-2">
              View Details
            </Link>
          </>
        ) : (
          <>
            <Link onClick={(e) => e.stopPropagation()} to={`/assessments/${job.id}`} className="text-sm px-3 py-1 bg-blue-600 text-white rounded cursor-pointer">
              Apply
            </Link>
            <Link onClick={(e) => e.stopPropagation()} to={`/jobs/${job.id}`} className="text-sm text-blue-900 underline ml-2">
              View Details
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

/* --------------------------- Sortable wrapper using dnd-kit --------------------------- */
function SortableJob({ job, role }: { job: Job; role: 'hr' | 'candidate' }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: job.id });

  const transformStyle = transform ? CSS.Transform.toString(transform) : undefined;
  const style: React.CSSProperties = {
    transform: transformStyle,
    transition,
    willChange: transform ? 'transform' : undefined,
  };

  // apply attributes/listeners to the root wrapper so whole card is draggable
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
      <JobCard job={job} role={role} />
    </div>
  );
}

/* --------------------------- LandingDesignPage --------------------------- */
export default function LandingDesignPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // query params
  const page = Number(searchParams.get('page') ?? 1);
  const pageSize = Number(searchParams.get('pageSize') ?? 10);
  const qSearch = searchParams.get('search') ?? '';
  const qStatus = searchParams.get('status') ?? '';
  const qSort = searchParams.get('sort') ?? '';

  // local state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const { getJobs, reorderJobList } = useJobViewModel();

  // role from localStorage
  const role =  'hr';

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      await getJobs({
        page,
        pageSize,
        search: qSearch,
        status: qStatus,
        sort: qSort,
        setJobs,
        setTotal,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load jobs');
      setJobs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, qSearch, qStatus, qSort]);

  const handleSearch = (p: { search: string; status: string; sort: string }) => {
    const base: Record<string, string> = {};
    if (p.search) base.search = p.search;
    if (p.status) base.status = p.status;
    if (p.sort) base.sort = p.sort;
    base.page = '1';
    base.pageSize = String(pageSize);
    setSearchParams(base);
  };

  // keep jobs sorted by order for rendering
  const sorted = [...jobs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  /* --------------------------- Drag & Drop handler using dnd-kit --------------------------- */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sorted.findIndex((j) => j.id === active.id);
    const newIndex = sorted.findIndex((j) => j.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newArray = arrayMove(sorted, oldIndex, newIndex);
    const newOrderedIds = newArray.map((j) => j.id);

    // delegate optimistic update + rollback + re-sync to view model helper
    setIsReordering(true);
    try {
      await reorderJobList(newOrderedIds, jobs, setJobs);
    } catch (err: any) {
      // reorderJobList already handles rollback and setError/alert, but catch just in case
      console.error('reorderJobList failed unexpectedly', err);
      setError(err?.message ?? 'Reorder failed');
    } finally {
      setIsReordering(false);
    }
  };

  // Edit navigation (kept as Link in JobCard - kept here if you later want programmatic nav)
 

  return (
    <div className="min-h-screen bg-blue-300/6 text-blue-950">
      <main className="px-4">
        <Hero />

        <div className="flex flex-col items-center justify-center">
          <div className="w-full max-w-7xl mx-auto">
            <section className="mt-8 w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-4xl font-semibold text-blue-950 mb-4 text-center">Available Positions</h2>
                {role === 'hr' && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    + Create Job
                  </button>
                )}
              </div>

              <div className="mb-6">
                <FiltersBar onSearch={handleSearch} initialSearch={qSearch} initialStatus={qStatus} initialSort={qSort} />
              </div>

              {loading ? (
                 <PageLoader label='Loading jobs'></PageLoader>
              ) : error ? (
                <div className="p-6 bg-white border rounded text-red-600 w-full">{error}</div>
              ) : jobs.length === 0 ? (
                <div className="p-6 bg-white border rounded text-blue-900 w-full">No jobs found</div>
              ) : (
                <>
                  {isReordering && <div className="mb-3 text-sm text-blue-900">Saving order…</div>}
                  <DndContext onDragEnd={handleDragEnd}>
                    <SortableContext items={sorted.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-4">
                        {sorted.map((job) => (
                          <SortableJob key={job.id} job={job} role={role} />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </>
              )}
            </section>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between text-sm w-full max-w-7xl mx-auto">
          <div className="text-blue-900">Total: {total}</div>
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setSearchParams((prev) => {
                  const p = Object.fromEntries([...prev]);
                  p['page'] = String(Math.max(1, page - 1));
                  return p;
                })
              }
              disabled={page <= 1}
              className="px-3 py-1 border rounded text-sm"
            >
              Prev
            </button>
            <div>Page {page}</div>
            <button
              onClick={() =>
                setSearchParams((prev) => {
                  const p = Object.fromEntries([...prev]);
                  p['page'] = String(page + 1);
                  return p;
                })
              }
              disabled={total <= page * pageSize}
              className="px-3 py-1 border rounded text-sm"
            >
              Next
            </button>
          </div>
        </div>

        <footer className="mt-12 mb-8 border-t pt-6">
          <div className="flex items-center justify-between text-sm text-blue-900 max-w-7xl mx-auto">
            <div>© {new Date().getFullYear()} TalentFlow. All rights reserved.</div>
            <div className="flex gap-4">
              <Link to="/about" className="hover:underline">About</Link>
              <Link to="/privacy" className="hover:underline">Privacy</Link>
              <Link to="/contact" className="hover:underline">Contact</Link>
            </div>
          </div>
        </footer>
      </main>

      {/* Job Editor Modal */}
      {showModal && <JobEditorModal onClose={() => setShowModal(false)} />}
    </div>
  );
}











// import React, { useEffect, useState } from 'react';
// import { Link, useNavigate, useSearchParams } from 'react-router-dom';
// import type { Job } from '../../../db/type';
// import useJobViewModel from '../../../hooks/useJobs';
// import JobEditorModal from '../jobEditorialModel/jobEditorialModel';

// /* --------------------------- Hero Component --------------------------- */
// function Hero() {
//   const navigate = useNavigate();
//   return (
//     <header className="bg-white">
//       <div className="max-w-6xl mx-auto px-4 py-20 text-center">
//         <h1 className="text-4xl md:text-5xl font-bold text-blue-950 leading-tight">
//           Streamline Your Hiring Process
//         </h1>
//         <p className="mt-4 text-lg text-blue-950 max-w-2xl mx-auto">
//           A comprehensive hiring platform for HR teams and candidates. Manage jobs, track applications,
//           and build assessments all in one place.
//         </p>

//         <div className="mt-8 flex items-center justify-center gap-4">
//           <button
//             onClick={() => navigate('/jobs')}
//             className="px-6 py-3 rounded bg-blue-500 text-white text-lg font-medium shadow-sm hover:bg-blue-700"
//           >
//             Browse Jobs
//           </button>
//           <button
//             onClick={() => navigate('/about')}
//             className="px-6 py-3 rounded text-lg text-blue-950 bg-blue-400/10 hover:bg-slate-50"
//           >
//             Learn More
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// }

// /* --------------------------- FiltersBar Component --------------------------- */
// function FiltersBar({
//   onSearch,
//   initialSearch,
//   initialStatus,
//   initialSort,
// }: {
//   onSearch: (params: { search: string; status: string; sort: string }) => void;
//   initialSearch?: string;
//   initialStatus?: string;
//   initialSort?: string;
// }) {
//   const [search, setSearch] = useState(initialSearch ?? '');
//   const [status, setStatus] = useState(initialStatus ?? '');
//   const [sort, setSort] = useState(initialSort ?? '');

//   return (
//     <div className="bg-white border border-blue-500/30  rounded-lg p-4 shadow-sm">
//       <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
//         <div className="md:col-span-2">
//           <label className="block text-sm text-blue-900 mb-1">Search Jobs</label>
//           <input
//             aria-label="Search jobs"
//             className="w-full border border-blue-950/25 rounded px-3 py-2 text-sm"
//             placeholder="Job title, skills..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>

//         <div>
//           <label className="block text-sm text-blue-900 mb-1">Status</label>
//           <select
//             aria-label="Status filter"
//             className="w-full border border-blue-950/25 rounded px-3 py-2 text-sm"
//             value={status}
//             onChange={(e) => setStatus(e.target.value)}
//           >
//             <option value="">All Status</option>
//             <option value="active">Active</option>
//             <option value="draft">Draft</option>
//             <option value="archived">Archived</option>
//           </select>
//         </div>

//         <div>
//           <label className="block text-sm text-blue-900 mb-1">Sort By</label>
//           <select
//             aria-label="Sort"
//             className="w-full border border-blue-950/25 rounded px-3 py-2 text-sm"
//             value={sort}
//             onChange={(e) => setSort(e.target.value)}
//           >
//             <option value="">Newest First</option>
//             <option value="title:asc">Title A → Z</option>
//             <option value="title:desc">Title Z → A</option>
//             <option value="order:asc">Order ↑</option>
//             <option value="order:desc">Order ↓</option>
//           </select>
//         </div>

//         <div className="flex items-end">
//           <button
//             onClick={() => onSearch({ search, status, sort })}
//             className="ml-auto px-4 py-2 bg-blue-500 text-white rounded text-sm font-medium"
//           >
//             Search
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* --------------------------- JobCard Component --------------------------- */
// function JobCard({ job, role }: { job: Job; role: 'hr' | 'candidate' }) {
//   const navigate = useNavigate();
//   const posted = job.createdAt ? new Date(job.createdAt) : undefined;
//   const postedText = posted ? posted.toLocaleDateString() : job.order ? `Posted ${job.order}` : '';

//   return (
//     <div className="bg-white border border-blue-500/30 shadow-xl rounded-lg p-5 flex items-start justify-between">
//       <div className="max-w-[72%]">
//         <h3 className="text-lg font-semibold text-blue-950">{job.title}</h3>
//         <div className="mt-2 flex flex-wrap gap-2">
//           {(job.tags || []).map((t) => (
//             <span key={t} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
//               {t}
//             </span>
//           ))}
//         </div>
//         <div className="mt-3 flex items-center gap-4 text-sm text-blue-900">
//           <span
//             className={`px-2 py-0.5 rounded text-xs ${
//               job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
//             }`}
//           >
//             {job.status ?? 'active'}
//           </span>
//           <div>{postedText}</div>
//         </div>
//       </div>

//       <div className="flex flex-col items-end gap-2">
//         {role === 'hr' ? (
//           <>
//             <button
//               className="text-sm px-3 py-1 rounded bg-blue-400/10 cursor-pointer"
//               onClick={() => navigate(`/jobs/${job.id}/edit`)}
//             >
//               Edit
//             </button>
//             <Link to={`/jobs/${job.id}`} className="text-sm text-blue-900 ml-2">
//               View Details
//             </Link>
//           </>
//         ) : (
//           <>
//             <Link
//               to={`/assessments/${job.id}`}
//               className="text-sm px-3 py-1 bg-blue-600 text-white rounded cursor-pointer"
//             >
//               Apply
//             </Link>
//             <Link to={`/jobs/${job.id}`} className="text-sm text-blue-900 underline ml-2">
//               View Details
//             </Link>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// /* --------------------------- LandingDesignPage --------------------------- */
// export default function LandingDesignPage() {
//   const navigate = useNavigate();
//   const [searchParams, setSearchParams] = useSearchParams();

//   // query params
//   const page = Number(searchParams.get('page') ?? 1);
//   const pageSize = Number(searchParams.get('pageSize') ?? 10);
//   const qSearch = searchParams.get('search') ?? '';
//   const qStatus = searchParams.get('status') ?? '';
//   const qSort = searchParams.get('sort') ?? '';

//   // local state
//   const [jobs, setJobs] = useState<Job[]>([]);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [showModal, setShowModal] = useState(false);

//   const { getJobs } = useJobViewModel();

//   // role from localStorage
//   const role = (localStorage.getItem('role') as 'hr' | 'candidate') || 'hr';

//   const loadJobs = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       await getJobs({
//         page,
//         pageSize,
//         search: qSearch,
//         status: qStatus,
//         sort: qSort,
//         setJobs,
//         setTotal,
//       });
//     } catch (err: any) {
//       setError(err.message || 'Failed to load jobs');
//       setJobs([]);
//       setTotal(0);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadJobs();
//   }, [page, pageSize, qSearch, qStatus, qSort]);

//   const handleSearch = (p: { search: string; status: string; sort: string }) => {
//     const base: Record<string, string> = {};
//     if (p.search) base.search = p.search;
//     if (p.status) base.status = p.status;
//     if (p.sort) base.sort = p.sort;
//     base.page = '1';
//     base.pageSize = String(pageSize);
//     setSearchParams(base);
//   };

//   return (
//     <div className="min-h-screen bg-blue-300/6 text-blue-950">
//       <main className="px-4">
//         <Hero />

//         <div className="flex flex-col items-center justify-center">
//           <div className="w-full max-w-7xl mx-auto">
//             <section className="mt-8 w-full">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-4xl font-semibold text-blue-950 mb-4 text-center">
//                   Available Positions
//                 </h2>
//                 {role === 'hr' && (
//                   <button
//                     onClick={() => setShowModal(true)}
//                     className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 text-sm"
//                   >
//                     + Create Job
//                   </button>
//                 )}
//               </div>

//               {/* Filters panel */}
//               <div className="mb-6">
//                 <FiltersBar
//                   onSearch={handleSearch}
//                   initialSearch={qSearch}
//                   initialStatus={qStatus}
//                   initialSort={qSort}
//                 />
//               </div>

//               {/* Job list */}
//               <div className="space-y-4 w-full">
//                 {loading ? (
//                   <div className="p-6 bg-white border rounded text-blue-900 w-full">
//                     Loading jobs…
//                   </div>
//                 ) : error ? (
//                   <div className="p-6 bg-white border rounded text-red-600 w-full">{error}</div>
//                 ) : jobs.length === 0 ? (
//                   <div className="p-6 bg-white border rounded text-blue-900 w-full">
//                     No jobs found
//                   </div>
//                 ) : (
//                   jobs.map((job) => <JobCard key={job.id} job={job} role={role} />)
//                 )}
//               </div>

//               {/* Pagination */}
//               <div className="mt-6 flex items-center justify-between text-sm w-full">
//                 <div className="text-blue-900">Total: {total}</div>
//                 <div className="flex items-center gap-3">
//                   <button
//                     onClick={() =>
//                       setSearchParams((prev) => {
//                         const p = Object.fromEntries([...prev]);
//                         p['page'] = String(Math.max(1, page - 1));
//                         return p;
//                       })
//                     }
//                     disabled={page <= 1}
//                     className="px-3 py-1 border rounded text-sm"
//                   >
//                     Prev
//                   </button>
//                   <div>Page {page}</div>
//                   <button
//                     onClick={() =>
//                       setSearchParams((prev) => {
//                         const p = Object.fromEntries([...prev]);
//                         p['page'] = String(page + 1);
//                         return p;
//                       })
//                     }
//                     disabled={total <= page * pageSize}
//                     className="px-3 py-1 border rounded text-sm"
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             </section>
//           </div>
//         </div>

//         <footer className="mt-12 mb-8 border-t pt-6">
//           <div className="flex items-center justify-between text-sm text-blue-900">
//             <div>© {new Date().getFullYear()} TalentFlow. All rights reserved.</div>
//             <div className="flex gap-4">
//               <Link to="/about" className="hover:underline">
//                 About
//               </Link>
//               <Link to="/privacy" className="hover:underline">
//                 Privacy
//               </Link>
//               <Link to="/contact" className="hover:underline">
//                 Contact
//               </Link>
//             </div>
//           </div>
//         </footer>
//       </main>

//       {/* Job Editor Modal */}
//       {showModal && <JobEditorModal onClose={()=>setShowModal(false)}/>}
//     </div>
//   );
// }
