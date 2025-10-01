import { useState } from "react";
import type { Candidate,TimelineEntry,Note } from "../db/type";

import { fetchCandidate,fetchCandidates,fetchTimeline,patchCandidate,addNote} from "../api/candidate";

export const useCandidateViewModel=()=>{
    const [loading,setLoading] =useState(false);
    const [error,setError]=useState(null);


    const getCandidates=async(params:{
        setCandidates: (c: Candidate[]) => void;
    setTotal: (n: number) => void;
    page?: number;
    pageSize?: number;
    search?: string;
    stage?: string;
    jobId?:string;
    })=>{

        const {jobId,setCandidates,setTotal,page=1,pageSize=100,search='',stage=''}=params;
         console.log("server",params.jobId)
        setLoading(true);
        setError(null);
        try{
            const res:any= await fetchCandidates({jobId,search,stage,page,pageSize});
            console.log(res)
            setCandidates(res.data); 
            setTotal(res.total);
            return res;
        }
        catch(err:any)
        {
            setError(err.message);
            throw err;
        }
        finally{
            setLoading(false);
        }
    }
    const getCandidate = async (id: string, setCandidate: (c: Candidate | null) => void) => {
    setLoading(true);
    setError(null);
    console.log(id)
    try {
      const res = await fetchCandidate(id);
      setCandidate(res.candidate);
      return res;
    } catch (err: any) {
      setError(err?.message ?? 'Failed to fetch candidate');
      throw err;
    } finally {
      setLoading(false);
    }
  }
  const getTimeline = async (id: string, setTimeline: (t: TimelineEntry[]) => void) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetchTimeline(id);
      setTimeline(res);
      return res;
    } catch (err: any) {
      setError(err?.message ?? 'Failed to fetch timeline');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCandidate=async(id:string,patch:Partial<Candidate>)=>{
    setLoading(true);
    setError(null);
    try{
        const res=patchCandidate(id,patch);
        return res;
    }
    catch(err:any)
    {
        setError(err.message);
    }
    finally{
        setLoading(false);
    }
  }
  const addCandidateNote = async (id: string, text: string, onSuccess?: (n: Note) => void) => {
    setLoading(true);
    setError(null);
    try {
      const res:any= await addNote(id, text);
      return res;
    } catch (err: any) {
      setError(err?.message ?? "Failed to add note");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    // states
    loading,
    error,
 

    // actions
    getCandidates,
    getCandidate,
    getTimeline,
    updateCandidate,
    addCandidateNote
  };

}