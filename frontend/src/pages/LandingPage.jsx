import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router';
import { useSelector } from 'react-redux';
import useTheme from '../hooks/useTheme';

// ─── Animated Code Block (hero left side) ────────────────────────────────────
const codeLines = [
  { txt: 'function twoSum(nums, target) {',   color: '#6366f1' },
  { txt: '  const map = new Map();',           color: '#8b5cf6' },
  { txt: '  for (let i = 0; i < nums.length; i++) {', color: '#c084fc' },
  { txt: '    const diff = target - nums[i];', color: '#06b6d4' },
  { txt: '    if (map.has(diff)) {',           color: '#22d3ee' },
  { txt: '      return [map.get(diff), i];',   color: '#34d399' },
  { txt: '    }',                               color: '#6ee7b7' },
  { txt: '    map.set(nums[i], i);',           color: '#a78bfa' },
  { txt: '  }',                                color: '#c084fc' },
  { txt: '}',                                  color: '#6366f1' },
];

function AnimatedCode() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (visibleLines >= codeLines.length) return;
    const timer = setTimeout(() => setVisibleLines(v => v + 1), 180);
    return () => clearTimeout(timer);
  }, [visibleLines]);

  // Restart loop
  useEffect(() => {
    if (visibleLines >= codeLines.length) {
      const timer = setTimeout(() => setVisibleLines(0), 3000);
      return () => clearTimeout(timer);
    }
  }, [visibleLines]);

  return (
    <div className="font-mono text-sm leading-7 select-none">
      <div className="flex items-center gap-1.5 mb-4">
        <span className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
        <span className="w-3 h-3 rounded-full bg-yellow-500 opacity-80" />
        <span className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
        <span className="ml-2 text-xs opacity-40">solution.js</span>
      </div>
      {codeLines.map((line, i) => (
        <div
          key={i}
          className="transition-all duration-200"
          style={{
            opacity: i < visibleLines ? 1 : 0,
            transform: i < visibleLines ? 'translateX(0)' : 'translateX(-8px)',
            color: line.color,
          }}
        >
          <span className="mr-4 text-xs opacity-30">{String(i + 1).padStart(2, '0')}</span>
          {line.txt}
        </div>
      ))}
      {visibleLines < codeLines.length && (
        <span className="inline-block w-2 h-4 bg-indigo-400 animate-blink ml-8" />
      )}
    </div>
  );
}

// ─── Floating Particle ────────────────────────────────────────────────────────
function Particle({ style }) {
  return (
    <div
      className="absolute rounded-full opacity-20 pointer-events-none"
      style={style}
    />
  );
}

// ─── Animated Stats Counter ──────────────────────────────────────────────────
function StatCard({ end, label, suffix = '+' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const duration = 1800;
          const step = end / (duration / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= end) { setCount(end); clearInterval(timer); }
            else setCount(Math.floor(start));
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={ref} className="text-center animate-slideUp">
      <div className="text-4xl md:text-5xl font-extrabold gradient-text mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm md:text-base opacity-60 font-medium">{label}</div>
    </div>
  );
}

// ─── DSA Blog Card ─────────────────────────────────────────────────────────────
const blogPosts = [
  {
    slug: 'arrays-two-pointers',
    tag: 'Arrays',
    tagColor: '#6366f1',
    title: 'Mastering Arrays: From Basics to Two Pointers',
    excerpt:
      'Arrays are the foundation of DSA. Learn traversal, sliding window, prefix sums, and the two-pointer technique with real LeetCode problems.',
    time: '8 min read',
    icon: '📦',
    topics: ['Traversal', 'Prefix Sum', 'Two Pointers', 'Sliding Window'],
  },
  {
    slug: 'binary-search',
    tag: 'Binary Search',
    tagColor: '#8b5cf6',
    title: 'Binary Search: Think in Halves',
    excerpt:
      'Binary search is not just for sorted arrays. Discover how to apply it on answer spaces, rotated arrays, and monotonic functions.',
    time: '6 min read',
    icon: '🔍',
    topics: ['Classic BS', 'Rotated Array', 'Search Space', 'Lower Bound'],
  },
  {
    slug: 'dynamic-programming',
    tag: 'Dynamic Programming',
    tagColor: '#06b6d4',
    title: 'Dynamic Programming: From Recursion to Tabulation',
    excerpt:
      'Break down overlapping subproblems. We cover memoization, tabulation, knapsack, LCS, and the thought process behind every DP problem.',
    time: '12 min read',
    icon: '🧩',
    topics: ['Memoization', 'Tabulation', 'Knapsack', 'LCS'],
  },
  {
    slug: 'graph-algorithms',
    tag: 'Graphs',
    tagColor: '#22d3ee',
    title: 'Graph Algorithms: BFS, DFS & Beyond',
    excerpt:
      'Graphs model real-world problems. Learn BFS, DFS, Dijkstra, topological sort, and union-find with step-by-step visualizations.',
    time: '10 min read',
    icon: '🕸️',
    topics: ['BFS', 'DFS', 'Dijkstra', 'Union-Find'],
  },
];

function BlogCard({ post, index }) {
  return (
    <NavLink
      to={`/blog/${post.slug}`}
      className="card-hover rounded-2xl p-6 border cursor-pointer animate-slideUp block"
      style={{
        animationDelay: `${index * 0.1}s`,
        animationFillMode: 'both',
        borderColor: `${post.tagColor}30`,
        background: `linear-gradient(135deg, ${post.tagColor}08, transparent)`,
      }}
    >
      <div className="text-3xl mb-4">{post.icon}</div>
      <span
        className="text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block"
        style={{ background: `${post.tagColor}20`, color: post.tagColor }}
      >
        {post.tag}
      </span>
      <h3 className="text-lg font-bold mb-2 leading-snug">{post.title}</h3>
      <p className="text-sm opacity-60 leading-relaxed mb-4">{post.excerpt}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {post.topics.map(t => (
          <span
            key={t}
            className="text-xs px-2 py-0.5 rounded-md"
            style={{ background: `${post.tagColor}15`, color: post.tagColor }}
          >
            {t}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="opacity-50">⏱ {post.time}</span>
        <span className="font-semibold hover:underline" style={{ color: post.tagColor }}>
          Read Article →
        </span>
      </div>
    </NavLink>
  );
}

// ─── Features Section ─────────────────────────────────────────────────────────
const features = [
  {
    icon: '⚡',
    title: 'Monaco Code Editor',
    desc: 'Industry-grade editor with syntax highlighting, IntelliSense, and multi-language support (JS, Java, C++).',
    color: '#6366f1',
  },
  {
    icon: '🤖',
    title: 'AI Doubt Solver',
    desc: 'Stuck on a problem? Chat with our built-in AI assistant that explains concepts and hints you toward the solution.',
    color: '#8b5cf6',
  },
  {
    icon: '📊',
    title: 'Submission Tracking',
    desc: 'Track every submission, view runtime & memory stats, and revisit your past solutions with full history.',
    color: '#06b6d4',
  },
  {
    icon: '🎬',
    title: 'Video Editorials',
    desc: 'Watch detailed video walkthroughs for every problem, uploaded directly by admins.',
    color: '#22d3ee',
  },
  {
    icon: '🏆',
    title: 'Problem Filters',
    desc: 'Filter by difficulty (Easy / Medium / Hard) and topic tags to focus on your weak areas.',
    color: '#34d399',
  },
  {
    icon: '🔒',
    title: 'Secure Auth',
    desc: 'JWT + Redis token blacklisting ensures your account stays safe even after logout.',
    color: '#f59e0b',
  },
];

// ─── Theme Toggle Button ──────────────────────────────────────────────────────
function ThemeToggle({ isDark, toggleTheme }) {
  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-10 h-10 rounded-full border border-indigo-500/40 hover:border-indigo-400 transition-all hover:bg-indigo-500/10"
      aria-label="Toggle theme"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 110 10A5 5 0 0112 7z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );
}

// ─── Main Landing Page ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Particles config
  const particles = Array.from({ length: 18 }, (_, i) => ({
    width: Math.random() * 60 + 20,
    height: Math.random() * 60 + 20,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    background: ['#6366f1', '#8b5cf6', '#06b6d4', '#22d3ee'][i % 4],
    animationDuration: `${Math.random() * 6 + 4}s`,
    animationDelay: `${Math.random() * 3}s`,
  }));

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-base-100/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-lg shadow-lg">
              &lt;/&gt;
            </div>
            <span className="text-xl font-extrabold">
              Code<span className="gradient-text">Arena</span>
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="opacity-70 hover:opacity-100 transition-opacity">Features</a>
            <a href="#blog" className="opacity-70 hover:opacity-100 transition-opacity">Blog</a>
            <NavLink to="/algorithms" className="opacity-70 hover:opacity-100 transition-opacity">Visualizer</NavLink>
            {isAuthenticated && (
              <NavLink to="/home" className="opacity-70 hover:opacity-100 transition-opacity">Problems</NavLink>
            )}
          </div>

          {/* Actions — auth-aware */}
          <div className="flex items-center gap-3">
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            {isAuthenticated ? (
              <>
                <span className="hidden sm:block text-sm opacity-60">Hi, {user?.firstName} 👋</span>
                <NavLink
                  to="/home"
                  className="btn btn-sm font-semibold text-white border-0 gradient-brand hover:opacity-90 transition-opacity shadow-lg"
                >
                  Go to Dashboard →
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/login" className="btn btn-ghost btn-sm font-semibold">
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  className="btn btn-sm font-semibold text-white border-0 gradient-brand hover:opacity-90 transition-opacity shadow-lg"
                >
                  Get Started →
                </NavLink>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-hero opacity-80" />
        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-cyan-600/15 rounded-full blur-3xl" />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((p, i) => (
            <Particle
              key={i}
              style={{
                width: p.width,
                height: p.height,
                top: p.top,
                left: p.left,
                background: p.background,
                animation: `drift ${p.animationDuration} ease-in-out infinite`,
                animationDelay: p.animationDelay,
                borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '8px' : '30%',
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-12 grid md:grid-cols-2 gap-12 items-center w-full">
          {/* Left: text */}
          <div className="text-white">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 animate-fadeIn"
              style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)' }}>
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Built for Competitive Programmers
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 animate-slideUp">
              Master{' '}
              <span className="gradient-text">DSA</span>
              <br />
              One Problem<br />at a Time.
            </h1>

            <p className="text-lg opacity-75 leading-relaxed mb-8 max-w-md animate-slideUp delay-200">
              Practice coding problems, get AI hints, watch video editorials, and track
              your progress — all in one beautiful platform.
            </p>

            <div className="flex flex-wrap gap-4 animate-slideUp delay-300">
              <NavLink
                to="/signup"
                className="btn btn-lg text-white border-0 gradient-brand hover:opacity-90 shadow-xl animate-pulseGlow font-bold"
              >
                Start Coding Free →
              </NavLink>
              <NavLink
                to="/login"
                className="btn btn-lg btn-outline border-white/30 text-white hover:bg-white/10"
              >
                Sign In
              </NavLink>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-6 mt-10 animate-slideUp delay-400">
              {[['🚀', 'Judge0 Engine'], ['🤖', 'AI Assistant'], ['🎬', 'Video Editorials']].map(([icon, label]) => (
                <div key={label} className="flex items-center gap-1.5 text-xs opacity-60">
                  <span>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: code animation */}
          <div className="hidden md:block animate-slideInLeft delay-200">
            <div
              className="glass rounded-2xl p-6 shadow-2xl animate-float"
              style={{ border: '1px solid rgba(99,102,241,0.3)' }}
            >
              <AnimatedCode />
            </div>
            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 glass rounded-xl px-3 py-2 text-xs font-bold text-green-400 animate-float"
              style={{ animationDelay: '0.5s', border: '1px solid rgba(34,197,94,0.3)' }}>
              ✓ Accepted
            </div>
            <div className="absolute -bottom-4 -left-4 glass rounded-xl px-3 py-2 text-xs font-bold text-yellow-400 animate-float"
              style={{ animationDelay: '1s', border: '1px solid rgba(234,179,8,0.3)' }}>
              ⚡ 48ms Runtime
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 animate-bounce">
          <span className="text-xs text-white">Scroll</span>
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Stats Section ──────────────────────────────────────── */}
      <section id="stats" className="py-20 border-y border-base-300">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-8 md:gap-16">
            <StatCard end={200} label="Problems" suffix="+" />
            <StatCard end={5000} label="Registered Users" suffix="+" />
            <StatCard end={50000} label="Submissions" suffix="+" />
          </div>
        </div>
      </section>

      {/* ── Features Section ───────────────────────────────────── */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 animate-slideUp">
          <span className="text-xs font-bold tracking-widest uppercase text-indigo-500 mb-3 block">Platform Features</span>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            Everything you need to
            <span className="gradient-text"> level up</span>
          </h2>
          <p className="text-base opacity-60 max-w-xl mx-auto">
            From writing code to understanding solutions, we've built every tool you need to crack DSA interviews.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="card-hover rounded-2xl p-6 border border-base-300 bg-base-100 animate-slideUp"
              style={{ animationDelay: `${i * 0.08}s`, animationFillMode: 'both' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 shadow-lg"
                style={{ background: `${f.color}20`, border: `1px solid ${f.color}30` }}
              >
                {f.icon}
              </div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-sm opacity-60 leading-relaxed">{f.desc}</p>
              <div className="mt-4 w-8 h-0.5 rounded-full" style={{ background: f.color }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── DSA Blog Section ───────────────────────────────────── */}
      <section id="blog" className="py-24 bg-base-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 animate-slideUp">
            <span className="text-xs font-bold tracking-widest uppercase text-purple-500 mb-3 block">DSA Blog</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              Learn the
              <span className="gradient-text"> Concepts</span>
            </h2>
            <p className="text-base opacity-60 max-w-xl mx-auto">
              Deep-dive articles on the most important DSA topics, written for competitive programmers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {blogPosts.map((post, i) => (
              <BlogCard key={post.tag} post={post} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 animate-slideUp">
            Ready to start your
            <span className="gradient-text"> DSA journey?</span>
          </h2>
          <p className="text-lg opacity-70 mb-10 animate-slideUp delay-100">
            Join thousands of coders, practice daily, and land your dream job.
          </p>
          <div className="flex flex-wrap justify-center gap-4 animate-slideUp delay-200">
            <NavLink
              to="/signup"
              className="btn btn-lg text-white border-0 gradient-brand hover:opacity-90 shadow-2xl font-bold animate-pulseGlow"
            >
              Create Free Account
            </NavLink>
            <NavLink
              to="/login"
              className="btn btn-lg btn-outline border-white/30 text-white hover:bg-white/10"
            >
              Already have one? Login
            </NavLink>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-base-100 border-t border-base-300 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-lg">
            <span className="gradient-text">CodeArena</span>
          </div>
          <div className="text-xs opacity-40 text-center">
            Built with ❤️ for DSA learners · © {new Date().getFullYear()}
          </div>
          <div className="flex items-center gap-2 text-xs opacity-40">
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            <span>{isDark ? 'Dark' : 'Light'} Mode</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
