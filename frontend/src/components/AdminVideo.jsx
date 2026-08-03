import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import axiosClient from '../utils/axiosClient';

const DIFF = { easy: 'badge-easy', medium: 'badge-medium', hard: 'badge-hard' };

const AdminVideo = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchProblems(); }, []);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(Array.isArray(data) ? data : []);
    } catch { setProblems([]); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    setDeleting(true);
    try {
      await axiosClient.delete(`/video/delete/${confirmId}`);
      setProblems(p => p.filter(x => x._id !== confirmId));
    } catch (e) { console.error(e); }
    finally { setDeleting(false); setConfirmId(null); }
  };

  const toDelete = problems.find(p => p._id === confirmId);

  return (
    <div className="min-h-screen bg-base-200">
      <nav className="bg-base-100 border-b border-base-300 px-6 py-3 flex items-center gap-3">
        <NavLink to="/admin" className="opacity-60 hover:opacity-100 text-sm flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Admin
        </NavLink>
        <span className="opacity-20">/</span>
        <span className="font-bold text-sm">🎬 Video Editorials</span>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold">Video Editorials</h1>
            <p className="text-sm opacity-50 mt-1">Upload or remove video solutions for problems</p>
          </div>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>🎬</div>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
          </div>
        )}

        {!loading && problems.length === 0 && (
          <div className="text-center py-20 opacity-40">
            <div className="text-6xl mb-4">🎥</div>
            <p className="text-lg font-semibold">No problems found</p>
          </div>
        )}

        {!loading && problems.length > 0 && (
          <div className="bg-base-100 rounded-2xl border border-base-300 overflow-hidden">
            <div className="grid grid-cols-12 px-5 py-3 border-b border-base-300 bg-base-200/60 text-xs font-semibold uppercase opacity-50">
              <div className="col-span-1">#</div>
              <div className="col-span-4">Title</div>
              <div className="col-span-2">Difficulty</div>
              <div className="col-span-2">Topic</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>
            {problems.map((p, i) => (
              <div key={p._id}
                className="grid grid-cols-12 px-5 py-4 border-b border-base-300/50 hover:bg-base-200/40 transition-colors animate-fadeIn"
                style={{ animationDelay: `${Math.min(i * 0.03, 0.3)}s`, animationFillMode: 'both' }}>
                <div className="col-span-1 flex items-center text-sm opacity-30 font-mono">{i + 1}</div>
                <div className="col-span-4 flex items-center font-medium text-sm">{p.title}</div>
                <div className="col-span-2 flex items-center">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${DIFF[p.difficulty] || ''}`}>{p.difficulty}</span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>{p.tags}</span>
                </div>
                <div className="col-span-3 flex items-center justify-end gap-2">
                  <NavLink to={`/admin/upload/${p._id}`}
                    className="btn btn-xs text-white border-0"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                    📤 Upload
                  </NavLink>
                  <button onClick={() => setConfirmId(p._id)}
                    className="btn btn-xs text-white border-0"
                    style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
          <div className="bg-base-100 rounded-2xl p-8 max-w-sm w-full mx-4 border border-error/30 animate-slideUp">
            <div className="text-4xl mb-4 text-center">🎬</div>
            <h3 className="text-xl font-extrabold text-center mb-2">Delete Video?</h3>
            <p className="text-center text-sm opacity-60 mb-6">
              Video for "<strong>{toDelete?.title}</strong>" will be removed.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmId(null)} className="btn flex-1 btn-ghost">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="btn flex-1 text-white border-0"
                style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
                {deleting ? <span className="loading loading-spinner loading-sm" /> : 'Delete Video'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVideo;