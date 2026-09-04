import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useParams, useNavigate, NavLink } from 'react-router';

const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linkedList', 'graph', 'dp']),
  visibleTestCases: z.array(
    z.object({ input: z.string().min(1), output: z.string().min(1), explanation: z.string().min(1) })
  ).min(1),
  hiddenTestCases: z.array(
    z.object({ input: z.string().min(1), output: z.string().min(1) })
  ).min(1),
  startCode: z.array(
    z.object({ language: z.enum(['C++', 'Java', 'JavaScript']), initialCode: z.string().min(1) })
  ).length(3),
  referenceSolution: z.array(
    z.object({ language: z.enum(['C++', 'Java', 'JavaScript']), completeCode: z.string().min(1) })
  ).length(3),
});

const LANGS = ['C++', 'Java', 'JavaScript'];
const LANG_COLORS = { 'C++': '#06b6d4', 'Java': '#f59e0b', 'JavaScript': '#facc15' };
const inputCls = "w-full px-4 py-2.5 rounded-xl border border-base-300 bg-base-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";
const textareaCls = "w-full px-4 py-2.5 rounded-xl border border-base-300 bg-base-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none";

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold opacity-50 uppercase tracking-wider">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
        style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.2),rgba(217,119,6,0.15))', border: '1px solid rgba(245,158,11,0.25)' }}>
        {icon}
      </div>
      <div>
        <h2 className="font-bold text-base">{title}</h2>
        {subtitle && <p className="text-xs opacity-40">{subtitle}</p>}
      </div>
    </div>
  );
}

function AdminUpdate() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [langTab, setLangTab] = useState(0);
  const [toast, setToast] = useState(null);
  const [problemTitle, setProblemTitle] = useState('');

  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: '', description: '', difficulty: 'easy', tags: 'array',
      visibleTestCases: [{ input: '', output: '', explanation: '' }],
      hiddenTestCases: [{ input: '', output: '' }],
      startCode: LANGS.map(l => ({ language: l, initialCode: '' })),
      referenceSolution: LANGS.map(l => ({ language: l, completeCode: '' })),
    },
  });

  const { fields: visibleFields, append: appendVisible, remove: removeVisible } = useFieldArray({ control, name: 'visibleTestCases' });
  const { fields: hiddenFields, append: appendHidden, remove: removeHidden } = useFieldArray({ control, name: 'hiddenTestCases' });

  useEffect(() => {
    if (!problemId) return;
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const { data } = await axiosClient.get(`/problem/problemById/${problemId}`);
        setProblemTitle(data.title || 'Problem');
        reset({
          title: data.title || '',
          description: data.description || '',
          difficulty: data.difficulty || 'easy',
          tags: data.tags || 'array',
          visibleTestCases: data.visibleTestCases?.length > 0 ? data.visibleTestCases : [{ input: '', output: '', explanation: '' }],
          hiddenTestCases: data.hiddenTestCases?.length > 0 ? data.hiddenTestCases : [{ input: '', output: '' }],
          startCode: data.startCode?.length === 3 ? data.startCode : LANGS.map(l => ({ language: l, initialCode: '' })),
          referenceSolution: data.referenceSolution?.length === 3 ? data.referenceSolution : LANGS.map(l => ({ language: l, completeCode: '' })),
        });
      } catch {
        setFetchError('Failed to load problem.');
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [problemId, reset]);

  const onSubmit = async (data) => {
    try {
      await axiosClient.put(`/problem/update/${problemId}`, data);
      setToast({ type: 'success', msg: '✅ Problem updated successfully!' });
      setTimeout(() => navigate('/admin'), 1500);
    } catch (err) {
      setToast({ type: 'error', msg: `❌ ${err.response?.data?.message || err.message}` });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
        <p className="text-sm opacity-40">Loading problem data...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">⚠️</div>
        <p className="text-base font-semibold text-red-400">{fetchError}</p>
        <button onClick={() => navigate('/admin')} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          ← Back to Admin
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-base-100/90 backdrop-blur-md border-b border-base-300">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-3">
          <NavLink to="/admin" className="flex items-center gap-1.5 text-sm opacity-60 hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Admin
          </NavLink>
          <span className="opacity-20">/</span>
          <NavLink to="/admin/updateList" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Update List</NavLink>
          <span className="opacity-20">/</span>
          <span className="text-sm font-bold truncate max-w-[200px]" style={{ color: '#f59e0b' }}>{problemTitle}</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8 animate-slideUp">
          <h1 className="text-3xl font-extrabold mb-1">
            Edit <span style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Problem</span>
          </h1>
          <p className="text-sm opacity-40">Editing: <strong className="opacity-70">{problemTitle}</strong> — all changes will be re-validated against your reference solutions.</p>
        </div>

        {toast && (
          <div className="mb-6 px-5 py-3 rounded-2xl text-sm font-medium"
            style={{ background: toast.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: toast.type === 'success' ? '#22c55e' : '#ef4444', border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
            {toast.msg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Basic Info */}
          <div className="rounded-2xl border border-base-300 bg-base-100 p-6 animate-slideUp" style={{ animationDelay: '0.05s', animationFillMode: 'both' }}>
            <SectionHeader icon="📝" title="Basic Information" subtitle="Title, description, difficulty and tag" />
            <div className="space-y-4">
              <Field label="Title" error={errors.title?.message}>
                <input {...register('title')} className={inputCls} />
              </Field>
              <Field label="Description" error={errors.description?.message}>
                <textarea {...register('description')} rows={5} className={textareaCls} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Difficulty">
                  <select {...register('difficulty')} className={inputCls}>
                    <option value="easy">🟢 Easy</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="hard">🔴 Hard</option>
                  </select>
                </Field>
                <Field label="Tag">
                  <select {...register('tags')} className={inputCls}>
                    <option value="array">Array</option>
                    <option value="linkedList">Linked List</option>
                    <option value="graph">Graph</option>
                    <option value="dp">Dynamic Programming</option>
                  </select>
                </Field>
              </div>
            </div>
          </div>

          {/* Visible Test Cases */}
          <div className="rounded-2xl border border-base-300 bg-base-100 p-6 animate-slideUp" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            <div className="flex items-center justify-between mb-6">
              <SectionHeader icon="👁️" title="Visible Test Cases" subtitle="Shown to users" />
              <button type="button" onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>+ Add</button>
            </div>
            <div className="space-y-4">
              {visibleFields.map((field, i) => (
                <div key={field.id} className="rounded-xl border border-base-300 p-4 bg-base-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold opacity-50">CASE #{i + 1}</span>
                    <button type="button" onClick={() => removeVisible(i)}
                      className="text-xs px-2 py-1 rounded-lg font-semibold"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>Remove</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <Field label="Input"><textarea {...register(`visibleTestCases.${i}.input`)} rows={2} className={textareaCls} /></Field>
                    <Field label="Output"><textarea {...register(`visibleTestCases.${i}.output`)} rows={2} className={textareaCls} /></Field>
                  </div>
                  <Field label="Explanation"><textarea {...register(`visibleTestCases.${i}.explanation`)} rows={2} className={textareaCls} /></Field>
                </div>
              ))}
            </div>
          </div>

          {/* Hidden Test Cases */}
          <div className="rounded-2xl border border-base-300 bg-base-100 p-6 animate-slideUp" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
            <div className="flex items-center justify-between mb-6">
              <SectionHeader icon="🔒" title="Hidden Test Cases" subtitle="For judging only" />
              <button type="button" onClick={() => appendHidden({ input: '', output: '' })}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>+ Add</button>
            </div>
            <div className="space-y-4">
              {hiddenFields.map((field, i) => (
                <div key={field.id} className="rounded-xl border border-base-300 p-4 bg-base-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold opacity-50">HIDDEN #{i + 1}</span>
                    <button type="button" onClick={() => removeHidden(i)}
                      className="text-xs px-2 py-1 rounded-lg font-semibold"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>Remove</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Input"><textarea {...register(`hiddenTestCases.${i}.input`)} rows={2} className={textareaCls} /></Field>
                    <Field label="Output"><textarea {...register(`hiddenTestCases.${i}.output`)} rows={2} className={textareaCls} /></Field>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Code Templates */}
          <div className="rounded-2xl border border-base-300 bg-base-100 p-6 animate-slideUp" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            <SectionHeader icon="💻" title="Code Templates" subtitle="Edit starter code and reference solution per language" />
            <div className="flex gap-2 mb-6 p-1 rounded-xl bg-base-200 w-fit">
              {LANGS.map((l, i) => (
                <button key={l} type="button" onClick={() => setLangTab(i)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={langTab === i ? { background: `${LANG_COLORS[l]}20`, color: LANG_COLORS[l], border: `1px solid ${LANG_COLORS[l]}40` } : { opacity: 0.4 }}>
                  {l}
                </button>
              ))}
            </div>
            {LANGS.map((l, i) => (
              <div key={l} className={langTab !== i ? 'hidden' : 'space-y-4'}>
                <Field label={`${l} — Starter Code`}>
                  <textarea {...register(`startCode.${i}.initialCode`)} rows={7} className={`${textareaCls} font-mono text-xs`} />
                </Field>
                <Field label={`${l} — Reference Solution`}>
                  <textarea {...register(`referenceSolution.${i}.completeCode`)} rows={10} className={`${textareaCls} font-mono text-xs`} />
                </Field>
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="flex gap-4 pb-10">
            <NavLink to="/admin" className="flex-1 py-3 rounded-2xl text-sm font-semibold text-center border border-base-300 hover:bg-base-300 transition-colors">
              Cancel
            </NavLink>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 py-3 rounded-2xl text-sm font-bold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
              {isSubmitting ? 'Saving & Validating...' : '✓ Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminUpdate;