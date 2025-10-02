// src/features/candidates/CandidateList.tsx
import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useCandidateViewModel } from "../../../hooks/useCandidateViewModel";
import type { Candidate } from "../../../db/type";
import PageLoader from "../../../components/loader";

export default function CandidateList() {
  const vm = useCandidateViewModel();
  const {jobId}  = useParams();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [searchInput, setSearchInput] = useState("");
  const [stage, setStage] = useState("");
  console.log("jobId",jobId)
  // debounce search
  const searchRef = useRef<number | undefined>(0);
  const debouncedFetch = (s: string) => {
    window.clearTimeout(searchRef.current);
    searchRef.current = window.setTimeout(() => {
      setPage(1);
      vm
        .getCandidates({
          setCandidates,
          setTotal,
          page: 1,
          pageSize,
          search: s,
          stage,
          jobId
        })
        .catch(() => {});
    }, 250) as unknown as number;
  };

  useEffect(() => {
    vm
      .getCandidates({
        setCandidates,
        setTotal,
        page,
        pageSize,
        search: searchInput,
        stage,
        jobId
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, stage,jobId]);

  return (
    <div className="min-h-[60vh] p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-blue-950">Candidates</h1>
            <p className="text-sm text-blue-900/80 mt-1">
              Browse and manage candidates — search, filter by stage, and page through results.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* You might add a "Create candidate" CTA here if needed */}
            <div className="text-sm text-slate-600">Total: <span className="font-medium text-blue-900">{total}</span></div>
          </div>
        </div>

        {/* Filters card */}
        <div className="bg-white border border-blue-500/30 rounded-lg p-4 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <div className="md:col-span-3">
              <label className="block text-sm text-blue-900 mb-1">Search</label>
              <input
                aria-label="Search name or email"
                placeholder="Name or email..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  debouncedFetch(e.target.value);
                }}
                className="w-full border border-blue-950/25 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm text-blue-900 mb-1">Stage</label>
              <select
                value={stage}
                onChange={(e) => { setStage(e.target.value); setPage(1); }}
                className="w-full border border-blue-950/25 rounded px-3 py-2 text-sm"
                aria-label="Filter by stage"
              >
                <option value="">All stages</option>
                <option value="applied">Applied</option>
                <option value="screen">Screen</option>
                <option value="tech">Tech</option>
                <option value="offer">Offer</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                onClick={() => {
                  setSearchInput("");
                  setStage("");
                  setPage(1);
                  vm.getCandidates({ setCandidates, setTotal, page: 1, pageSize, search: "", stage: "" }).catch(()=>{});
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 text-sm"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Candidate cards list */}
        <div className="space-y-4">
          {vm.loading && candidates.length === 0 ? (
             <PageLoader label="Loading candidates"></PageLoader>
          ) : vm.error && candidates.length === 0 ? (
            <div className="p-6 bg-white border rounded text-red-600">{vm.error}</div>
          ) : candidates.length === 0 ? (
            <div className="p-6 bg-white border rounded text-blue-900">No candidates found</div>
          ) : (
            candidates.map((c) => (
              <article
                key={c.id}
                className="bg-white border border-blue-500/30 rounded-lg p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-blue-900 font-semibold">
                    {c.name ? c.name.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div>
                    <div className="flex flex-row gap-4">
                    <Link to={`/candidates/${c.id}`} className="text-lg font-semibold text-blue-950 hover:underline">
                      {c.name}
                    </Link>
                    <div>
                    <span className={`px-3 py-1 text-sm rounded ${
                      c.stage === "hired" ? "bg-green-100 text-green-800" :
                      c.stage === "rejected" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {c.stage ?? "—"}
                    </span>
                  </div>
                  </div>
                    <div className="text-sm text-slate-600">{c.email}</div>
                    
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/candidates/${c.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm text-blue-900 hover:underline"
                    >
                      View
                    </Link>

                    
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between text-sm">
          <div className="text-slate-600">Showing {Math.min(pageSize, candidates.length)} of {total}</div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50"
            >
              Prev
            </button>
            <div>Page {page}</div>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={candidates.length < pageSize}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        <div className="mt-4">
          {vm.loading && <div className="text-sm text-blue-900">Loading…</div>}
          {vm.error && <div className="text-sm text-red-600">Error: {vm.error}</div>}
        </div>
      </div>
    </div>
  );
}
