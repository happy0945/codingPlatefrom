import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate, NavLink } from 'react-router';

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

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
        style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.15))', border: '1px solid rgba(99,102,241,0.25)' }}>
        {icon}
      </div>
      <div>
        <h2 className="font-bold text-base">{title}</h2>
        {subtitle && <p className="text-xs opacity-40">{subtitle}</p>}
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold opacity-50 uppercase tracking-wider">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-base-300 bg-base-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";
const textareaCls = "w-full px-4 py-2.5 rounded-xl border border-base-300 bg-base-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none";

function AdminPanel() {
  const navigate = useNavigate();
  const [langTab, setLangTab] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      startCode: LANGS.map(l => ({ language: l, initialCode: '' })),
      referenceSolution: LANGS.map(l => ({ language: l, completeCode: '' })),
    },
  });

  const { fields: visibleFields, append: appendVisible, remove: removeVisible } = useFieldArray({ control, name: 'visibleTestCases' });
  const { fields: hiddenFields, append: appendHidden, remove: removeHidden } = useFieldArray({ control, name: 'hiddenTestCases' });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await axiosClient.post('/problem/create', data);
      setToast({ type: 'success', msg: '✅ Problem created successfully!' });
      setTimeout(() => navigate('/admin'), 1500);
    } catch (err) {
      setToast({ type: 'error', msg: `❌ ${err.response?.data?.message || err.message}` });
    }
    setSubmitting(false);
  };

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
          <span className="text-sm font-bold" style={{ color: '#22c55e' }}>Create Problem</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8 animate-slideUp">
          <h1 className="text-3xl font-extrabold mb-1">
            Create <span style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>New Problem</span>
          </h1>
          <p className="text-sm opacity-40">Fill all sections below. Reference solutions will be validated against test cases.</p>
        </div>

        {toast && (
          <div className="mb-6 px-5 py-3 rounded-2xl text-sm font-medium"
            style={{ background: toast.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: toast.type === 'success' ? '#22c55e' : '#ef4444', border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
            {toast.msg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* ── Basic Info ── */}
          <div className="rounded-2xl border border-base-300 bg-base-100 p-6 animate-slideUp" style={{ animationDelay: '0.05s', animationFillMode: 'both' }}>
            <SectionHeader icon="📝" title="Basic Information" subtitle="Title, description, difficulty and tag" />
            <div className="space-y-4">
              <Field label="Title" error={errors.title?.message}>
                <input {...register('title')} placeholder="e.g. Two Sum" className={inputCls} />
              </Field>
              <Field label="Description" error={errors.description?.message}>
                <textarea {...register('description')} rows={5} placeholder="Describe the problem..." className={textareaCls} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Difficulty" error={errors.difficulty?.message}>
                  <select {...register('difficulty')} className={inputCls}>
                    <option value="easy">🟢 Easy</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="hard">🔴 Hard</option>
                  </select>
                </Field>
                <Field label="Tag / Category" error={errors.tags?.message}>
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

          {/* ── Visible Test Cases ── */}
          <div className="rounded-2xl border border-base-300 bg-base-100 p-6 animate-slideUp" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            <div className="flex items-center justify-between mb-6">
              <SectionHeader icon="👁️" title="Visible Test Cases" subtitle="Shown to users on the problem page" />
              <button type="button" onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                + Add Case
              </button>
            </div>
            {visibleFields.length === 0 && (
              <p className="text-sm opacity-40 text-center py-4">No visible test cases yet. Add at least one.</p>
            )}
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
                    <Field label="Input"><textarea {...register(`visibleTestCases.${i}.input`)} rows={2} className={textareaCls} placeholder="Input" /></Field>
                    <Field label="Expected Output"><textarea {...register(`visibleTestCases.${i}.output`)} rows={2} className={textareaCls} placeholder="Output" /></Field>
                  </div>
                  <Field label="Explanation"><textarea {...register(`visibleTestCases.${i}.explanation`)} rows={2} className={textareaCls} placeholder="Explain this test case..." /></Field>
                </div>
              ))}
            </div>
          </div>

          {/* ── Hidden Test Cases ── */}
          <div className="rounded-2xl border border-base-300 bg-base-100 p-6 animate-slideUp" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
            <div className="flex items-center justify-between mb-6">
              <SectionHeader icon="🔒" title="Hidden Test Cases" subtitle="Used for judging — not shown to users" />
              <button type="button" onClick={() => appendHidden({ input: '', output: '' })}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                + Add Case
              </button>
            </div>
            {hiddenFields.length === 0 && (
              <p className="text-sm opacity-40 text-center py-4">No hidden test cases yet. Add at least one.</p>
            )}
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
                    <Field label="Input"><textarea {...register(`hiddenTestCases.${i}.input`)} rows={2} className={textareaCls} placeholder="Input" /></Field>
                    <Field label="Expected Output"><textarea {...register(`hiddenTestCases.${i}.output`)} rows={2} className={textareaCls} placeholder="Output" /></Field>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Code Templates ── */}
          <div className="rounded-2xl border border-base-300 bg-base-100 p-6 animate-slideUp" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            <SectionHeader icon="💻" title="Code Templates" subtitle="Starter code and reference solution for each language" />
            {/* Language tabs */}
            <div className="flex gap-2 mb-6 p-1 rounded-xl bg-base-200 w-fit">
              {LANGS.map((l, i) => (
                <button key={l} type="button" onClick={() => setLangTab(i)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={langTab === i
                    ? { background: `${LANG_COLORS[l]}20`, color: LANG_COLORS[l], border: `1px solid ${LANG_COLORS[l]}40` }
                    : { opacity: 0.4 }}>
                  {l}
                </button>
              ))}
            </div>
            {LANGS.map((l, i) => (
              <div key={l} className={langTab !== i ? 'hidden' : 'space-y-4'}>
                <Field label={`${l} — Starter Code (shown to user)`} error={errors.startCode?.[i]?.initialCode?.message}>
                  <textarea {...register(`startCode.${i}.initialCode`)} rows={7}
                    className={`${textareaCls} font-mono text-xs`}
                    placeholder={`// ${l} starter template...`} />
                </Field>
                <Field label={`${l} — Reference Solution (for validation)`} error={errors.referenceSolution?.[i]?.completeCode?.message}>
                  <textarea {...register(`referenceSolution.${i}.completeCode`)} rows={10}
                    className={`${textareaCls} font-mono text-xs`}
                    placeholder={`// Complete ${l} solution...`} />
                </Field>
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="flex gap-4 pb-10">
            <NavLink to="/admin" className="flex-1 py-3 rounded-2xl text-sm font-semibold text-center border border-base-300 hover:bg-base-300 transition-colors">
              Cancel
            </NavLink>
            <button type="submit" disabled={submitting}
              className="flex-1 py-3 rounded-2xl text-sm font-bold text-white disabled:opacity-60 transition-opacity"
              style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>
              {submitting ? 'Creating & Validating...' : '✓ Create Problem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminPanel;