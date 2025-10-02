import { useState } from "react";
import { fetchJobs, getJobById, createJob, updateJob } from "../../public/api/jobs";
import type { Job } from "../../public/db/type";
import { reorderJobs } from "../../public/api/jobs";

const useJobViewModel = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const getJobs = async (params: {
    setJobs: (jobs: Job[]) => void;
    setTotal: (total: number) => void;
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    sort?: string;
  }) => {
    const { setJobs, setTotal, page, pageSize, search, status, sort } = params;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchJobs({ page, pageSize, search, status, sort });
      setJobs(res.data);
      setTotal(res.total);
      return res;
    } catch (err: any) {
      setError(err.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const getJob = async (id: string, setJob: (job: Job) => void) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getJobById(id);
      setJob(res);
      return res;
    } catch (err: any) {
      setError(err.message || "Failed to fetch job");
    } finally {
      setLoading(false);
    }
  };

  const createNewJob = async (job: Partial<Job>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createJob(job);
      return res;
    } catch (err: any) {
      setError(err.message || "Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  const updateExistingJob = async (id: string, patch: Partial<Job>) => {
    setUpdateLoading(true);
    setError(null);
    try {
      const res = await updateJob(id, patch);
      return res;
    } catch (err: any) {
      setError(err.message || "Failed to update job");
    } finally {
      setUpdateLoading(false);
    }
  };
  const reorderJobList = async (
    newOrderedIds: string[],
    jobs: Job[],
    setJobs: (jobs: Job[]) => void
  ) => {
    console.log("Hello",newOrderedIds)
    const previousJobs = [...jobs];

    const newJobs:Job[] = newOrderedIds.map((id, idx) => {
      const found = jobs.find((j) => j.id === id);
      return { ...(found ?? { id, title: "Unknown",slug:"Unknown", status: "active", tags: [], order: 0 }), order: idx + 1 };
    });
    setJobs(newJobs);

    try {
      await reorderJobs(newOrderedIds);
    } catch (err: any) {
      setJobs(previousJobs);
      setError(err.message || "Reorder failed — changes rolled back");
      alert("Reorder failed — changes rolled back");
    } finally {
      try {
        const res = await fetchJobs({});
        setJobs(res.data);
      } catch {
      }
    }
  };


  return {
    loading,
    updateLoading,
    error,
    getJobs,
    getJob,
    createNewJob,
    updateExistingJob,
    reorderJobList,
  };
};

export default useJobViewModel;
