import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useJobViewModel from '../../../hooks/useJobViewModel';
import type { Job } from '../../../db/type';
import { v4 as uuidv4 } from 'uuid';

type FormValues = {
  title: string;
  slug: string;
  status: Job['status'];
  tags: string;
  description?: string;
};
type JobEditorModalProps = {
  onClose?: () => void;
};

export default function JobEditorModal({ onClose }: JobEditorModalProps) {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const isEdit = Boolean(jobId);

  const { getJob, createNewJob, updateExistingJob, loading, updateLoading, error } = useJobViewModel();
  const { register, handleSubmit, reset, watch, setValue } = useForm<FormValues>({
    defaultValues: { title: '', slug: '', status: 'active', tags: '' },
  });

  // fetch job if editing
  useEffect(() => {
    if (isEdit && jobId) {
      getJob(jobId, (job) => {
        reset({
          title: job.title,
          slug: job.slug,
          status: job.status,
          tags: job.tags?.join(', ') ?? '',
          description: job.description ?? '',
        });
      });
    }
  }, [isEdit, jobId, reset]);

  // auto-generate slug
  useEffect(() => {
    const sub = watch((value, { name }) => {
      if (name === 'title') {
        const s = value.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '') ?? '';
        setValue('slug', s);
      }
    });
    return () => sub.unsubscribe();
  }, [watch, setValue]);

  // onClose = () => navigate('/jobs');

  const onSubmit = async (vals: FormValues) => {
    const payload: Partial<Job> = {
      title: vals.title,
      slug: vals.slug || undefined,
      status: vals.status,
      tags: vals.tags.split(',').map((t) => t.trim()).filter(Boolean),
      description: vals.description,
    };

    try {
      if (isEdit && jobId) {
        await updateExistingJob(jobId, payload);
      } else {
        await createNewJob({ ...payload, id: uuidv4() });
      }
      onClose?onClose():"";
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center overflow-auto p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-8">
        <header className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-blue-950">{isEdit ? 'Edit Job' : 'Create Job'}</h3>
          <button onClick={(isEdit && jobId)?() => navigate('/jobs'):onClose} className="text-blue-900 text-xl font-bold hover:text-blue-700">✕</button>
        </header>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm text-blue-900 mb-1">Title</label>
            <input {...register('title', { required: true })} className="w-full border border-blue-500/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>

          <div>
            <label className="block text-sm text-blue-900 mb-1">Slug</label>
            <input {...register('slug', { required: true })} className="w-full border border-blue-500/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>

          <div>
            <label className="block text-sm text-blue-900 mb-1">Status</label>
            <select {...register('status')} className="w-full border border-blue-500/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300">
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-blue-900 mb-1">Tags (comma separated)</label>
            <input {...register('tags')} className="w-full border border-blue-500/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>

          <div>
            <label className="block text-sm text-blue-900 mb-1">Description</label>
            <textarea {...register('description')} className="w-full border border-blue-500/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 h-28 resize-none" />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg border border-blue-500/30 text-blue-950 hover:bg-blue-50">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-700" disabled={loading || updateLoading}>
              {loading || updateLoading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
