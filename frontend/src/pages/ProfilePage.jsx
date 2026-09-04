import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import useTheme from '../hooks/useTheme';

function ThemeToggle({ isDark, toggleTheme }) {
  return (
    <button onClick={toggleTheme}
      className="flex items-center justify-center w-9 h-9 rounded-full border transition-all hover:scale-110"
      style={{ borderColor: isDark ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.3)' }}
      aria-label="Toggle theme">
      {isDark
        ? <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 110 10A5 5 0 0112 7z" /></svg>
        : <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>}
    </button>
  );
}

const DIFF_COLOR = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' };
const DIFF_BG = { easy: 'rgba(34,197,94,0.12)', medium: 'rgba(245,158,11,0.12)', hard: 'rgba(239,68,68,0.12)' };

function StatBadge({ label, value, color }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl p-4 border border-base-300 bg-base-100 flex-1"
      style={{ background: `${color}08`, borderColor: `${color}25` }}>
      <span className="text-2xl font-extrabold" style={{ color }}>{value}</span>
      <span className="text-xs opacity-50 mt-0.5">{label}</span>
    </div>
  );
}

function EditableField({ label, value, onSave, type = 'text' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const save = async () => {
    if (draft === value) { setEditing(false); return; }
    setSaving(true);
    try {
      await onSave(draft);
      setToast({ type: 'success', msg: 'Saved!' });
    } catch {
      setToast({ type: 'error', msg: 'Save failed — backend endpoint not set up yet.' });
      setDraft(value);
    }
    setSaving(false);
    setEditing(false);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold opacity-50 uppercase tracking-wider">{label}</label>
      {editing ? (
        <div className="flex gap-2 items-center">
          <input type={type} value={draft} onChange={e => setDraft(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border border-indigo-500 bg-base-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
          <button onClick={save} disabled={saving}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>
            {saving ? '...' : 'Save'}
          </button>
          <button onClick={() => { setEditing(false); setDraft(value); }}
            className="px-3 py-2 rounded-xl text-xs font-semibold btn-ghost">Cancel</button>
        </div>
      ) : (
        <div className="flex items-center justify-between group px-3 py-2 rounded-xl bg-base-200 border border-base-300">
          <span className="text-sm">{value || <span className="opacity-30 italic">Not set</span>}</span>
          <button onClick={() => setEditing(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold ml-2"
            style={{ color: '#6366f1' }}>Edit</button>
        </div>
      )}
      {toast && (
        <div className="text-xs mt-1 px-2 py-1 rounded-lg"
          style={{ background: toast.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: toast.type === 'success' ? '#22c55e' : '#ef4444' }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const { isDark, toggleTheme } = useTheme();

  const [solvedProblems, setSolvedProblems] = useState([]);
  const [allProblems, setAllProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [solvedRes, allRes] = await Promise.all([
          axiosClient.get('/problem/problemSolvedByUser'),
          axiosClient.get('/problem/getAllProblem'),
        ]);
        setSolvedProblems(Array.isArray(solvedRes.data) ? solvedRes.data : []);
        setAllProblems(Array.isArray(allRes.data) ? allRes.data : []);
      } catch {
        setSolvedProblems([]);
        setAllProblems([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
  };

  const handleSaveField = async (field, value) => {
    await axiosClient.patch('/user/profile', { [field]: value });
    // In a full impl, dispatch an action to update the Redux store here
  };

  const solvedEasy   = solvedProblems.filter(p => p.difficulty === 'easy').length;
  const solvedMedium = solvedProblems.filter(p => p.difficulty === 'medium').length;
  const solvedHard   = solvedProblems.filter(p => p.difficulty === 'hard').length;
  const totalSolved  = solvedProblems.length;
  const totalProblems = allProblems.length;
  const progressPct = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-base-100/90 backdrop-blur-md border-b border-base-300">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NavLink to="/home" className="flex items-center gap-1.5 text-sm opacity-60 hover:opacity-100 transition-opacity">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </NavLink>
            <span className="opacity-20">/</span>
            <span className="text-sm font-semibold">My Profile</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            <button onClick={handleLogout} className="text-xs font-semibold px-3 py-1.5 rounded-xl opacity-60 hover:opacity-100 transition-opacity hover:text-red-500">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">

        {/* Hero card */}
        <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden animate-slideUp">
          {/* Cover gradient */}
          <div className="h-28" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6,#06b6d4)' }} />
          <div className="px-8 pb-8">
            {/* Avatar */}
            <div className="flex items-end justify-between -mt-10 mb-6">
              <div className="w-20 h-20 rounded-2xl border-4 border-base-100 flex items-center justify-center text-3xl font-extrabold text-white shadow-xl"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold border"
                style={user?.role === 'admin'
                  ? { background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.25)' }
                  : { background: 'rgba(99,102,241,0.1)', color: '#6366f1', borderColor: 'rgba(99,102,241,0.25)' }}>
                {user?.role === 'admin' ? '⚡ Admin' : '👤 User'}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold">{user?.firstName}</h1>
            <p className="text-sm opacity-50 mt-0.5">{user?.emailId}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slideUp" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          <StatBadge label="Total Solved" value={totalSolved} color="#6366f1" />
          <StatBadge label="Easy" value={solvedEasy} color="#22c55e" />
          <StatBadge label="Medium" value={solvedMedium} color="#f59e0b" />
          <StatBadge label="Hard" value={solvedHard} color="#ef4444" />
        </div>

        {/* Progress bar */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-6 animate-slideUp" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">Overall Progress</span>
            <span className="text-sm font-bold" style={{ color: '#6366f1' }}>{progressPct}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-base-300 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg,#6366f1,#06b6d4)' }} />
          </div>
          <p className="text-xs opacity-40 mt-2">{totalSolved} / {totalProblems} problems solved</p>
        </div>

        {/* Edit Profile */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-6 animate-slideUp" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          <h2 className="text-base font-bold mb-5 flex items-center gap-2">
            <span style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Edit Profile</span>
            <span className="text-xs font-normal opacity-40">— hover any field to edit</span>
          </h2>
          <div className="space-y-4">
            <EditableField
              label="First Name"
              value={user?.firstName || ''}
              onSave={v => handleSaveField('firstName', v)}
            />
            <EditableField
              label="Email Address"
              value={user?.emailId || ''}
              type="email"
              onSave={v => handleSaveField('emailId', v)}
            />
          </div>
        </div>

        {/* Recent Solved */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-6 animate-slideUp" style={{ animationDelay: '0.25s', animationFillMode: 'both' }}>
          <h2 className="text-base font-bold mb-4">Recently Solved</h2>
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-8 h-8 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
            </div>
          ) : solvedProblems.length === 0 ? (
            <div className="text-center py-8 opacity-40">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-sm">No problems solved yet. <NavLink to="/home" className="underline" style={{ color: '#6366f1' }}>Start solving →</NavLink></p>
            </div>
          ) : (
            <div className="space-y-2">
              {solvedProblems.slice(0, 8).map((p, i) => (
                <NavLink key={p._id} to={`/problem/${p._id}`}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-base-200 hover:bg-base-300 transition-colors group"
                  style={{ animationDelay: `${i * 0.04}s` }}>
                  <span className="text-sm font-medium group-hover:text-indigo-400 transition-colors">{p.title}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md"
                    style={{ background: DIFF_BG[p.difficulty], color: DIFF_COLOR[p.difficulty] }}>
                    {p.difficulty}
                  </span>
                </NavLink>
              ))}
              {solvedProblems.length > 8 && (
                <NavLink to="/home" className="block text-center text-xs font-semibold mt-2 opacity-50 hover:opacity-100 transition-opacity" style={{ color: '#6366f1' }}>
                  View all {solvedProblems.length} solved problems →
                </NavLink>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default ProfilePage;
