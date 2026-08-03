import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { loginUser } from "../authSlice";
import { useEffect, useState } from 'react';
import useTheme from '../hooks/useTheme';

const loginSchema = z.object({
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Animated code lines for the left panel
const demoLines = [
  { code: 'const solve = (arr, target) => {', color: '#6366f1' },
  { code: '  let left = 0, right = arr.length - 1;', color: '#8b5cf6' },
  { code: '  while (left < right) {', color: '#c084fc' },
  { code: '    const mid = (left + right) >> 1;', color: '#06b6d4' },
  { code: '    if (arr[mid] === target) return mid;', color: '#22d3ee' },
  { code: '    arr[mid] < target ? left = mid+1', color: '#34d399' },
  { code: '                     : right = mid-1;', color: '#a78bfa' },
  { code: '  }', color: '#c084fc' },
  { code: '  return -1;', color: '#f472b6' },
  { code: '};', color: '#6366f1' },
];

function LeftPanel() {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (visible >= demoLines.length) {
      const t = setTimeout(() => setVisible(0), 2500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setVisible(v => v + 1), 200);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div className="hidden md:flex flex-col justify-center relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 60%, #24243e 100%)',
      minHeight: '100vh',
    }}>
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative px-10 py-16 text-white">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 mb-16">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            &lt;/&gt;
          </div>
          <span className="text-xl font-extrabold" style={{
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            CodeArena
          </span>
        </NavLink>

        <h2 className="text-3xl font-extrabold mb-3 leading-snug">
          Welcome back,<br />
          <span style={{
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>keep coding! 🚀</span>
        </h2>
        <p className="text-sm opacity-60 mb-10">
          Binary Search — the elegant way to find your answer.
        </p>

        {/* Animated code block */}
        <div className="rounded-2xl p-5 font-mono text-sm leading-7"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(99,102,241,0.25)',
            backdropFilter: 'blur(10px)',
          }}>
          <div className="flex items-center gap-1.5 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-80" />
            <span className="ml-2 text-xs opacity-30">binarySearch.js</span>
          </div>
          {demoLines.map((line, i) => (
            <div key={i} style={{
              color: line.color,
              opacity: i < visible ? 1 : 0,
              transform: i < visible ? 'translateX(0)' : 'translateX(-6px)',
              transition: 'opacity 0.2s, transform 0.2s',
            }}>
              <span className="mr-3 text-xs opacity-25">{String(i + 1).padStart(2, '0')}</span>
              {line.code}
            </div>
          ))}
          {visible < demoLines.length && (
            <span className="inline-block w-2 h-4 bg-indigo-400 animate-blink ml-8" />
          )}
        </div>

        {/* Features pills */}
        <div className="flex flex-wrap gap-2 mt-8">
          {['Monaco Editor', 'AI Hints', 'Video Editorial', 'Submission History'].map(f => (
            <span key={f} className="text-xs px-3 py-1 rounded-full"
              style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}>
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ThemeToggle({ isDark, toggleTheme }) {
  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-9 h-9 rounded-full border hover:scale-110 transition-all"
      style={{ borderColor: isDark ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.3)' }}
      aria-label="Toggle theme"
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

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const { isDark, toggleTheme } = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthenticated) navigate('/home');
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left decorative panel */}
      <LeftPanel />

      {/* Right: Login form */}
      <div className="flex flex-col justify-center items-center px-8 py-12 bg-base-100 min-h-screen relative">
        {/* Theme toggle top-right */}
        <div className="absolute top-5 right-5">
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
        </div>

        <div className="w-full max-w-sm animate-slideUp">
          {/* Mobile logo */}
          <NavLink to="/" className="flex md:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              &lt;/&gt;
            </div>
            <span className="text-lg font-extrabold">
              Code<span style={{
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Arena</span>
            </span>
          </NavLink>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold mb-2">Sign in</h1>
            <p className="text-sm opacity-50">Welcome back! Let's get back to solving problems.</p>
          </div>

          {/* Global error */}
          {error && (
            <div className="alert alert-error mb-6 py-3 text-sm animate-fadeIn">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{typeof error === 'string' ? error : 'Invalid credentials. Please try again.'}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                id="login-email"
                type="email"
                placeholder="john@example.com"
                className={`input input-bordered w-full transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${errors.emailId ? 'input-error' : ''}`}
                {...register('emailId')}
              />
              {errors.emailId && (
                <p className="text-error text-xs mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {errors.emailId.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`input input-bordered w-full pr-11 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${errors.password ? 'input-error' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-error text-xs mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn w-full font-bold text-white border-0 shadow-lg hover:opacity-90 transition-opacity mt-2"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Signing in...
                </>
              ) : 'Sign In →'}
            </button>
          </form>

          {/* Divider */}
          <div className="divider text-xs opacity-40 my-6">OR</div>

          <p className="text-center text-sm">
            Don't have an account?{' '}
            <NavLink to="/signup" className="font-semibold text-indigo-500 hover:text-indigo-400 transition-colors">
              Create one free →
            </NavLink>
          </p>

          <p className="text-center mt-4 text-xs opacity-40">
            <NavLink to="/" className="hover:opacity-70 transition-opacity">← Back to home</NavLink>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;