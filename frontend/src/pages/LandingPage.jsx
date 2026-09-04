import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router';
import { useSelector } from 'react-redux';
import useTheme from '../hooks/useTheme';

// ─── Animated Code Block ───────────────────────────────────────────────────────
const CODE_LINES = [
  { text: 'function twoSum(nums, target) {', type: 'fn' },
  { text: '  const seen = new Map();', type: 'var' },
  { text: '', type: 'blank' },
  { text: '  for (let i = 0; i < nums.length; i++) {', type: 'loop' },
  { text: '    const complement = target - nums[i];', type: 'var' },
  { text: '    if (seen.has(complement)) {', type: 'if' },
  { text: '      return [seen.get(complement), i];', type: 'ret' },
  { text: '    }', type: 'close' },
  { text: '    seen.set(nums[i], i);', type: 'call' },
  { text: '  }', type: 'close' },
  { text: '', type: 'blank' },
  { text: '  return [];', type: 'ret' },
  { text: '}', type: 'close' },
];

// Light mode colors
const TOKEN_COLOR = {
  fn: '#1D4ED8', var: '#111827', loop: '#7C3AED', if: '#7C3AED',
  ret: '#DC2626', call: '#111827', close: '#374151', blank: '',
};
// Dark mode colors
const TOKEN_COLOR_DARK = {
  fn: '#60A5FA', var: '#E2E8F0', loop: '#C084FC', if: '#C084FC',
  ret: '#F87171', call: '#E2E8F0', close: '#9CA3AF', blank: '',
};

function AnimatedCode({ isDark }) {
  const colors = isDark ? TOKEN_COLOR_DARK : TOKEN_COLOR;
  const codeBg = isDark ? '#0F172A' : '#EEF2FF';
  const codeBorder = isDark ? '#1E3A5F' : '#C7D2FE';
  const statusColor = isDark ? '#6B7280' : '#64748B';

  return (
    <div className="p-5 font-mono text-sm leading-6 select-none rounded-2xl"
      style={{ background: codeBg, border: `1px solid ${codeBorder}` }}>
      <div className="flex items-center gap-1.5 mb-4">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <span className="ml-2 text-xs" style={{ color: statusColor }}>two-sum.js</span>
      </div>
      {CODE_LINES.map((line, i) => (
        <div key={i} className="min-h-[24px]" style={{ color: colors[line.type] }}>
          {line.text}
        </div>
      ))}
      <div className="mt-4 flex items-center justify-between text-xs" style={{ color: statusColor }}>
        <span>Ready to run</span>
        <button className="px-4 py-1.5 rounded-lg font-semibold text-white" style={{ background: '#1D4ED8' }}>
          Run code
        </button>
      </div>
    </div>
  );
}

// ─── Counter ───────────────────────────────────────────────────────────────────
function Counter({ end, label, suffix = '', isDark }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = end / (1600 / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl font-black tracking-tight" style={{ color: isDark ? '#F1F5F9' : '#0F172A' }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm mt-1" style={{ color: isDark ? '#6B7280' : '#64748B' }}>{label}</div>
    </div>
  );
}

// ─── Features ──────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: '⌨️', tag: 'IDE', title: 'Problem solver', desc: 'Filter by difficulty, topic, and company tags. Write and test solutions in the built-in Monaco editor.' },
  { icon: '📊', tag: 'Stats', title: 'Progress tracking', desc: 'See solved counts, acceptance rates, streaks, and weak topics at a glance.' },
  { icon: '📖', tag: 'Learn', title: 'Guided tutorials', desc: 'Follow step-by-step DSA articles with runnable examples and concept checkpoints.' },
  { icon: '🤖', tag: 'AI', title: 'AI doubt solver', desc: 'Stuck on a problem? Chat with our Gemini-powered assistant for instant hints and explanations.' },
  { icon: '🎬', tag: 'Video', title: 'Video editorials', desc: 'Watch detailed walkthroughs for every problem, uploaded by admins.' },
  { icon: '🚀', tag: 'Engine', title: 'Judge0 execution', desc: 'Submissions run on a real code execution engine supporting C++, Java, and JavaScript.' },
];

const BLOG_POSTS = [
  { slug: 'arrays-two-pointers', tag: 'Arrays', title: 'Mastering Arrays & Two Pointers', excerpt: 'Traversal, prefix sums, sliding window and the two-pointer technique with real problems.', time: '8 min', icon: '📦' },
  { slug: 'binary-search', tag: 'Binary Search', title: 'Binary Search: Think in Halves', excerpt: 'Not just for sorted arrays. Apply it on answer spaces and rotated arrays.', time: '6 min', icon: '🔍' },
  { slug: 'dynamic-programming', tag: 'DP', title: 'Dynamic Programming Masterclass', excerpt: 'From memoization to tabulation, knapsack to LCS — every pattern covered.', time: '12 min', icon: '🧩' },
  { slug: 'graph-algorithms', tag: 'Graphs', title: 'Graph Algorithms: BFS, DFS & Beyond', excerpt: 'BFS, DFS, Dijkstra, topological sort, and union-find explained clearly.', time: '10 min', icon: '🕸️' },
];

const FOOTER_LINKS = {
  Platform: [
    { label: 'Problems', href: '#features' },
    { label: 'Visualizer', to: '/algorithms' },
    { label: 'Blog', to: '/blog' },
  ],
  Account: [
    { label: 'Sign Up', to: '/signup' },
    { label: 'Login', to: '/login' },
    { label: 'Dashboard', to: '/home' },
  ],
  Learn: [
    { label: 'Arrays & Pointers', to: '/blog/arrays-two-pointers' },
    { label: 'Binary Search', to: '/blog/binary-search' },
    { label: 'Dynamic Programming', to: '/blog/dynamic-programming' },
    { label: 'Graph Algorithms', to: '/blog/graph-algorithms' },
  ],
};

// ─── Theme Toggle ──────────────────────────────────────────────────────────────
function ThemeToggle({ isDark, toggleTheme }) {
  return (
    <button onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all"
      style={{
        borderColor: isDark ? '#374151' : '#E5E7EB',
        background: isDark ? '#1C1C1C' : '#F9FAFB',
        color: isDark ? '#D1D5DB' : '#374151',
      }}
      aria-label="Toggle theme">
      {isDark ? (
        <><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 110 10A5 5 0 0112 7z" /></svg> Light mode</>
      ) : (
        <><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#64748B' }}><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg> Dark mode</>
      )}
    </button>
  );
}

// ─── Main Landing Page ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [scrolled, setScrolled] = useState(false);

  // theme-aware inline color helpers
  const textMuted = isDark ? '#9CA3AF' : '#64748B';
  const textPrimary = isDark ? '#F1F5F9' : '#0F172A';
  const borderColor = isDark ? '#252525' : '#E5E7EB';
  const tagBg = isDark ? 'rgba(37,99,235,0.15)' : '#EFF6FF';
  const tagColor = isDark ? '#60A5FA' : '#1D4ED8';
  const outlineBtnBg = isDark ? 'transparent' : 'transparent';
  const outlineBtnBorder = isDark ? '#374151' : '#D1D5DB';
  const outlineBtnColor = isDark ? '#D1D5DB' : '#374151';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-base-200">

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? 'navbar-clean shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: '#1D4ED8' }}>
              &lt;/&gt;
            </div>
            <span className="text-lg font-extrabold tracking-tight">CodeArena</span>
          </div>

          {/* Center links */}
          <div className="hidden md:flex items-center gap-7 text-sm font-medium" style={{ color: textMuted }}>
            <a href="#features" className="hover:text-blue-500 transition-colors">Problems</a>
            <a href="#blog" className="hover:text-blue-500 transition-colors">Tutorials</a>
            <NavLink to="/algorithms" className="hover:text-blue-500 transition-colors">Visualizer</NavLink>
            {isAuthenticated && (
              <NavLink to="/home" className="hover:text-blue-500 transition-colors">Progress</NavLink>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            {isAuthenticated ? (
              <NavLink to="/home" className="btn-blue px-4 py-2 rounded-lg text-sm">
                Dashboard →
              </NavLink>
            ) : (
              <>
                <NavLink to="/login"
                  className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  style={{ color: textMuted }}>
                  Login
                </NavLink>
                <NavLink to="/signup" className="btn-blue px-4 py-2 rounded-lg text-sm">
                  Start coding
                </NavLink>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────────── */}
      <section className="min-h-screen flex items-center pt-16 bg-base-200">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-16 items-center w-full">
          {/* Left */}
          <div className="animate-slideUp">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6 border"
              style={{ background: tagBg, borderColor: isDark ? '#1E3A5F' : '#BFDBFE', color: tagColor }}>
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              {isAuthenticated ? `${user?.firstName}'s workspace` : '1,240 problems available'}
            </div>

            <h1 className="text-5xl md:text-6xl font-black leading-[1.08] tracking-tight mb-6">
              Practice coding.{' '}
              <span className="block">Track growth.</span>
              <span className="block" style={{ color: isDark ? '#60A5FA' : '#1D4ED8' }}>Follow guided</span>
              <span className="block">tutorials.</span>
            </h1>

            <p className="text-lg mb-8 leading-relaxed" style={{ color: textMuted }}>
              A focused workspace for solving algorithmic problems, monitoring what you have mastered, and learning new patterns step by step.
            </p>

            <div className="flex flex-wrap gap-3 mb-12">
              <NavLink to={isAuthenticated ? '/home' : '/signup'}
                className="btn-blue px-6 py-3 rounded-xl text-base font-semibold">
                Open the IDE
              </NavLink>
              <a href="#blog"
                className="px-6 py-3 rounded-xl text-base font-semibold border transition-colors"
                style={{ borderColor: outlineBtnBorder, color: outlineBtnColor, background: outlineBtnBg }}>
                Browse tutorials
              </a>
            </div>

            {/* Stats inline */}
            <div className="flex items-center gap-8 pt-6 border-t" style={{ borderColor }}>
              {[['312', 'Solved'], ['14', 'Streak days'], ['86%', 'Accuracy']].map(([val, label]) => (
                <div key={label}>
                  <div className="text-3xl font-black tracking-tight" style={{ color: textPrimary }}>{val}</div>
                  <div className="text-xs mt-0.5" style={{ color: textMuted }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Code card */}
          <div className="hidden md:block animate-slideInLeft delay-200 relative">
            <div className="rounded-2xl shadow-2xl overflow-hidden">
              <AnimatedCode isDark={isDark} />
            </div>
            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg border"
              style={{
                background: isDark ? 'rgba(22,163,74,0.15)' : '#F0FDF4',
                borderColor: isDark ? 'rgba(22,163,74,0.35)' : '#BBF7D0',
                color: isDark ? '#4ADE80' : '#16a34a',
              }}>
              ✓ Accepted
            </div>
            <div className="absolute -bottom-4 -left-4 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg border"
              style={{
                background: isDark ? 'rgba(217,119,6,0.15)' : '#FFFBEB',
                borderColor: isDark ? 'rgba(217,119,6,0.35)' : '#FDE68A',
                color: isDark ? '#FBBF24' : '#D97706',
              }}>
              ⚡ 48ms Runtime
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <section className="py-16 border-y bg-base-100" style={{ borderColor }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-8 divide-x" style={{ borderColor }}>
            <Counter end={200} label="Problems" suffix="+" isDark={isDark} />
            <div className="pl-8"><Counter end={5000} label="Registered users" suffix="+" isDark={isDark} /></div>
            <div className="pl-8"><Counter end={50000} label="Submissions" suffix="+" isDark={isDark} /></div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-base-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14 animate-slideUp">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: tagColor }}>Platform</p>
            <h2 className="text-4xl font-black tracking-tight mb-4">Built for serious learners.</h2>
            <p className="text-base max-w-lg" style={{ color: textMuted }}>
              Every tool you need to crack DSA interviews — in one focused platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={f.title}
                className="card-clean p-6 animate-slideUp"
                style={{ animationDelay: `${i * 0.07}s`, animationFillMode: 'both' }}>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mb-4"
                  style={{ background: tagBg, color: tagColor }}>
                  {f.tag}
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: textMuted }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DSA Blog ───────────────────────────────────────────── */}
      <section id="blog" className="py-24 bg-base-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14 animate-slideUp">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: isDark ? '#A78BFA' : '#7C3AED' }}>DSA Blog</p>
            <h2 className="text-4xl font-black tracking-tight mb-4">Learn the concepts.</h2>
            <p className="text-base max-w-lg" style={{ color: textMuted }}>
              Deep-dive articles on the most important DSA topics.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {BLOG_POSTS.map((post, i) => (
              <NavLink key={post.slug} to={`/blog/${post.slug}`}
                className="card-clean p-5 block cursor-pointer animate-slideUp"
                style={{ animationDelay: `${i * 0.07}s`, animationFillMode: 'both' }}>
                <div className="text-3xl mb-3">{post.icon}</div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md inline-block mb-3"
                  style={{ background: tagBg, color: tagColor }}>
                  {post.tag}
                </span>
                <h3 className="text-sm font-bold mb-2 leading-snug">{post.title}</h3>
                <p className="text-xs leading-relaxed mb-3" style={{ color: textMuted }}>{post.excerpt}</p>
                <span className="text-xs font-semibold" style={{ color: tagColor }}>Read article →</span>
              </NavLink>
            ))}
          </div>

          <div className="text-center mt-10">
            <NavLink to="/blog" className="btn-outline-blue px-5 py-2.5 rounded-xl text-sm inline-block">
              View all articles →
            </NavLink>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="py-24 bg-base-200">
        <div className="max-w-3xl mx-auto px-6 text-center animate-slideUp">
          <h2 className="text-4xl font-black tracking-tight mb-4">
            Ready to start your DSA journey?
          </h2>
          <p className="text-base mb-10" style={{ color: textMuted }}>
            Join thousands of coders, practice daily, and land your dream job.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <NavLink to="/signup" className="btn-blue px-8 py-3.5 rounded-xl text-base font-semibold">
              Create free account
            </NavLink>
            <NavLink to="/login"
              className="px-8 py-3.5 rounded-xl text-base font-semibold border transition-colors"
              style={{ borderColor: outlineBtnBorder, color: outlineBtnColor }}>
              Already have one? Login
            </NavLink>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-base-100 border-t" style={{ borderColor }}>
        {/* Main footer grid */}
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
            {/* Brand column */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: '#1D4ED8' }}>
                  &lt;/&gt;
                </div>
                <span className="text-lg font-extrabold tracking-tight">CodeArena</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: textMuted }}>
                A focused workspace for solving algorithmic problems, tracking your progress, and mastering DSA patterns step by step.
              </p>
              <div className="flex items-center gap-3 mt-6">
                {/* GitHub */}
                <a href="#" aria-label="GitHub"
                  className="w-9 h-9 rounded-lg flex items-center justify-center border transition-colors hover:border-blue-500"
                  style={{ borderColor, color: textMuted }}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
                {/* Twitter/X */}
                <a href="#" aria-label="Twitter"
                  className="w-9 h-9 rounded-lg flex items-center justify-center border transition-colors hover:border-blue-500"
                  style={{ borderColor, color: textMuted }}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                {/* LinkedIn */}
                <a href="#" aria-label="LinkedIn"
                  className="w-9 h-9 rounded-lg flex items-center justify-center border transition-colors hover:border-blue-500"
                  style={{ borderColor, color: textMuted }}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(FOOTER_LINKS).map(([section, links]) => (
              <div key={section}>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: textMuted }}>
                  {section}
                </h3>
                <ul className="space-y-3">
                  {links.map(link => (
                    <li key={link.label}>
                      {link.to ? (
                        <NavLink to={link.to}
                          className="text-sm transition-colors hover:text-blue-500"
                          style={{ color: textMuted }}>
                          {link.label}
                        </NavLink>
                      ) : (
                        <a href={link.href}
                          className="text-sm transition-colors hover:text-blue-500"
                          style={{ color: textMuted }}>
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t" style={{ borderColor }}>
          <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs" style={{ color: textMuted }}>
              © {new Date().getFullYear()} CodeArena. Built with ❤️ for DSA learners.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs" style={{ color: textMuted }}>
                Powered by Judge0 · Gemini AI
              </span>
              <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
