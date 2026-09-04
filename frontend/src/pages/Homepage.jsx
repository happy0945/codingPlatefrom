import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import useTheme from '../hooks/useTheme';

const DIFFICULTY_CONFIG = {
  easy:   { label: 'Easy',   className: 'badge-easy' },
  medium: { label: 'Medium', className: 'badge-medium' },
  hard:   { label: 'Hard',   className: 'badge-hard' },
};

function ThemeToggle({ isDark, toggleTheme }) {
  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-9 h-9 rounded-full border transition-all hover:scale-110"
      style={{ borderColor: isDark ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.3)' }}
      aria-label="Toggle theme"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 110 10A5 5 0 0112 7z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );
}

function Homepage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isDark, toggleTheme } = useTheme();

  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all',
  });

  useEffect(() => {
    const fetchAll = async () => {
      setFetching(true);
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching problems:', error);
        setProblems([]);
      }
      try {
        if (user) {
          const { data } = await axiosClient.get('/problem/problemSolvedByUser');
          setSolvedProblems(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching solved:', error);
      }
      setFetching(false);
    };
    fetchAll();
  }, [user]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
  };

  const isSolved = (id) => solvedProblems.some(sp => sp._id === id);

  const filteredProblems = problems.filter(problem => {
    const diffMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch  = filters.tag === 'all' || problem.tags === filters.tag;
    const statusMatch =
      filters.status === 'all' ||
      (filters.status === 'solved' && isSolved(problem._id)) ||
      (filters.status === 'unsolved' && !isSolved(problem._id));
    const searchMatch = search === '' || problem.title.toLowerCase().includes(search.toLowerCase());
    return diffMatch && tagMatch && statusMatch && searchMatch;
  });

  // Progress stats
  const solvedCount  = problems.filter(p => isSolved(p._id)).length;
  const progressPct  = problems.length > 0 ? Math.round((solvedCount / problems.length) * 100) : 0;
  const easyCount    = problems.filter(p => p.difficulty === 'easy').length;
  const mediumCount  = problems.filter(p => p.difficulty === 'medium').length;
  const hardCount    = problems.filter(p => p.difficulty === 'hard').length;

  const allTags = [...new Set(problems.map(p => p.tags).filter(Boolean))];

  return (
    <div className="min-h-screen bg-base-200">

      {/* ── Top Navbar ────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 navbar-clean shadow-sm">
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm"
              style={{ background: '#1D4ED8' }}>
              &lt;/&gt;
            </div>
            <span className="text-lg font-extrabold tracking-tight hidden sm:block">CodeArena</span>
          </NavLink>

          {/* Search bar */}
          <div className="flex-1 max-w-sm mx-4 hidden md:block">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search problems..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input input-sm input-bordered w-full pl-9 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 rounded-lg"
              />
            </div>
          </div>

          {/* Center nav links */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium" style={{ color: '#64748B' }}>
            <NavLink to="/home" className="hover:text-blue-700 transition-colors">Problems</NavLink>
            <NavLink to="/algorithms" className="hover:text-blue-700 transition-colors">Visualizer</NavLink>
            <NavLink to="/blog" className="hover:text-blue-700 transition-colors">Blog</NavLink>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />

            {/* Avatar dropdown */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-semibold hidden sm:block">{user?.firstName}</span>
                <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <ul tabIndex={0} className="mt-3 p-2 shadow-xl menu menu-sm dropdown-content bg-base-100 rounded-2xl w-48 border border-base-300">
                <li className="menu-title text-xs opacity-50 px-2 pb-1">{user?.emailId}</li>
                {user?.role === 'admin' && (
                  <li>
                    <NavLink to="/admin" className="flex items-center gap-2 font-medium">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Admin Panel
                    </NavLink>
                  </li>
                )}
                <li>
                  <NavLink to="/profile" className="flex items-center gap-2 font-medium">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Profile
                  </NavLink>
                </li>
                <li>
                  <button onClick={handleLogout} className="flex items-center gap-2 text-error hover:bg-error/10">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ── Progress & Stats Row ──────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Progress card */}
          <div className="col-span-2 bg-base-100 rounded-2xl p-5 border border-base-300 shadow-sm animate-slideUp">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs opacity-50 font-medium uppercase tracking-wide">Overall Progress</p>
                <p className="text-2xl font-extrabold mt-0.5">
                  <span style={{ color: '#1D4ED8' }}>{solvedCount}</span>
                  <span className="text-base opacity-40 font-normal"> / {problems.length}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-extrabold" style={{ color: '#1D4ED8' }}>{progressPct}%</p>
              </div>
            </div>
            <div className="w-full bg-base-300 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%`, background: '#1D4ED8' }}
              />
            </div>
          </div>

          {/* Easy */}
          <div className="bg-base-100 rounded-2xl p-5 border border-base-300 shadow-sm animate-slideUp delay-100">
            <p className="text-xs font-medium mb-1" style={{ color: '#22c55e' }}>🟢 Easy</p>
            <p className="text-2xl font-extrabold" style={{ color: '#22c55e' }}>{easyCount}</p>
            <p className="text-xs opacity-40 mt-1">problems</p>
          </div>

          {/* Medium */}
          <div className="bg-base-100 rounded-2xl p-5 border border-base-300 shadow-sm animate-slideUp delay-200">
            <p className="text-xs font-medium mb-1" style={{ color: '#eab308' }}>🟡 Medium</p>
            <p className="text-2xl font-extrabold" style={{ color: '#eab308' }}>{mediumCount}</p>
            <p className="text-xs opacity-40 mt-1">problems</p>
          </div>
        </div>

        {/* ── Filters Row ───────────────────────────────────── */}
        <div className="bg-base-100 rounded-2xl border border-base-300 p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            {/* Mobile search */}
            <div className="relative flex-1 md:hidden min-w-[180px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input input-sm input-bordered w-full pl-9"
              />
            </div>

            <select
              className="select select-sm select-bordered flex-1 min-w-[120px] focus:border-indigo-500"
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Status</option>
              <option value="solved">✅ Solved</option>
              <option value="unsolved">⬜ Unsolved</option>
            </select>

            <select
              className="select select-sm select-bordered flex-1 min-w-[130px] focus:border-indigo-500"
              value={filters.difficulty}
              onChange={e => setFilters({ ...filters, difficulty: e.target.value })}
            >
              <option value="all">All Difficulty</option>
              <option value="easy">🟢 Easy</option>
              <option value="medium">🟡 Medium</option>
              <option value="hard">🔴 Hard</option>
            </select>

            <select
              className="select select-sm select-bordered flex-1 min-w-[120px] focus:border-indigo-500"
              value={filters.tag}
              onChange={e => setFilters({ ...filters, tag: e.target.value })}
            >
              <option value="all">All Topics</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>

            {/* Result count */}
            <span className="text-xs opacity-40 ml-auto whitespace-nowrap">
              {filteredProblems.length} of {problems.length} problems
            </span>
          </div>
        </div>

        {/* ── Problem Table ─────────────────────────────────── */}
        <div className="bg-base-100 rounded-2xl border border-base-300 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 px-5 py-3 border-b border-base-300 bg-base-200/60 text-xs font-semibold uppercase tracking-wider opacity-50">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Title</div>
            <div className="col-span-2">Difficulty</div>
            <div className="col-span-2">Topic</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          {/* Loading state */}
          {fetching && (
            <div className="flex justify-center items-center py-20 gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
              <span className="text-sm opacity-40">Loading problems...</span>
            </div>
          )}

          {/* Empty state */}
          {!fetching && filteredProblems.length === 0 && (
            <div className="flex flex-col items-center py-20 opacity-40">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-lg font-semibold">No problems found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          )}

          {/* Problem rows */}
          {!fetching && filteredProblems.map((problem, index) => {
            const solved = isSolved(problem._id);
            const diff = DIFFICULTY_CONFIG[problem.difficulty] || { label: problem.difficulty, className: '' };

            return (
              <div
                key={problem._id}
                className="grid grid-cols-12 px-5 py-4 border-b border-base-300/50 hover:bg-base-200/50 transition-colors group animate-fadeIn"
                style={{ animationDelay: `${Math.min(index * 0.03, 0.3)}s`, animationFillMode: 'both' }}
              >
                {/* Index */}
                <div className="col-span-1 flex items-center">
                  <span className="text-sm opacity-30 font-mono">{index + 1}</span>
                </div>

                {/* Title */}
                <div className="col-span-5 flex items-center">
                  <NavLink
                    to={`/problem/${problem._id}`}
                    className="font-medium text-sm hover:text-indigo-500 transition-colors group-hover:text-indigo-500"
                  >
                    {problem.title}
                  </NavLink>
                </div>

                {/* Difficulty */}
                <div className="col-span-2 flex items-center">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${diff.className}`}>
                    {diff.label}
                  </span>
                </div>

                {/* Topic */}
                <div className="col-span-2 flex items-center">
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>
                    {problem.tags || '—'}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-2 flex items-center justify-end">
                  {solved ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Solved
                    </span>
                  ) : (
                    <span className="text-xs opacity-25 font-medium">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Homepage;