import { NavLink } from 'react-router';
import { useSelector } from 'react-redux';
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

const CARDS = [
  { id:'create', title:'Create Problem', desc:'Add new coding problems with test cases, starter code, and solutions', icon:'➕', grad:'linear-gradient(135deg,#22c55e,#16a34a)', shadow:'rgba(34,197,94,0.3)', route:'/admin/create' },
  { id:'update', title:'Update Problem', desc:'Edit existing problems — modify description, test cases, or solutions', icon:'✏️', grad:'linear-gradient(135deg,#f59e0b,#d97706)', shadow:'rgba(245,158,11,0.3)', route:'/admin/updateList' },
  { id:'delete', title:'Delete Problem', desc:'Permanently remove problems from the platform', icon:'🗑️', grad:'linear-gradient(135deg,#ef4444,#dc2626)', shadow:'rgba(239,68,68,0.3)', route:'/admin/delete' },
  { id:'video',  title:'Video Editorial', desc:'Upload and manage video solutions for problems', icon:'🎬', grad:'linear-gradient(135deg,#6366f1,#8b5cf6)', shadow:'rgba(99,102,241,0.3)', route:'/admin/video' },
];

function Admin() {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useSelector(s => s.auth);

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <nav className="bg-base-100 border-b border-base-300 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <NavLink to="/home" className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Problems
          </NavLink>
          <span className="opacity-20">|</span>
          <span className="font-bold text-sm">Admin Panel</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs opacity-50 hidden sm:block">{user?.emailId}</span>
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10 animate-slideUp">
          <h1 className="text-4xl font-black tracking-tight mb-2">
            Admin <span style={{ color: '#1D4ED8' }}>Dashboard</span>
          </h1>
          <p className="opacity-50 text-sm">Manage your coding platform — problems, videos, and more.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[['200+','Problems'],['4','Admin Tools'],['🟢 Online','Platform']].map(([v,l],i) => (
            <div key={l} className="card-clean p-4 text-center animate-slideUp" style={{ animationDelay:`${i*0.1}s`, animationFillMode:'both' }}>
              <div className="text-2xl font-extrabold" style={{ color: '#1D4ED8' }}>{v}</div>
              <div className="text-xs opacity-50 mt-0.5">{l}</div>
            </div>
          ))}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CARDS.map((c, i) => (
            <div key={c.id} className="admin-card rounded-2xl p-6 animate-slideUp" style={{ animationDelay:`${i*0.08}s`, animationFillMode:'both' }}>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg shrink-0"
                  style={{ background: c.grad, boxShadow:`0 8px 24px ${c.shadow}` }}>
                  {c.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold mb-1">{c.title}</h2>
                  <p className="text-sm opacity-60 mb-4 leading-relaxed">{c.desc}</p>
                  <NavLink to={c.route}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ background: c.grad }}>
                    Open {c.title} →
                  </NavLink>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Admin;