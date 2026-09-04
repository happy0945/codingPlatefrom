import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser } from '../authSlice';
import useTheme from '../hooks/useTheme';

const signupSchema = z.object({
  firstName: z.string().min(3, "Name must be at least 3 characters"),
  emailId: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const demoLines = [
  { code: 'function maxProfit(prices) {', color: '#1D4ED8' },
  { code: '  let maxP = 0, minP = Infinity;', color: '#374151' },
  { code: '  for (const price of prices) {', color: '#7C3AED' },
  { code: '    minP = Math.min(minP, price);', color: '#374151' },
  { code: '    maxP = Math.max(maxP,', color: '#059669' },
  { code: '             price - minP);', color: '#059669' },
  { code: '  }', color: '#7C3AED' },
  { code: '  return maxP;', color: '#DC2626' },
  { code: '}', color: '#1D4ED8' },
];

function LeftPanel() {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (visible >= demoLines.length) {
      const t = setTimeout(() => setVisible(0), 2500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setVisible(v => v + 1), 220);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div className="hidden md:flex flex-col justify-center relative overflow-hidden bg-base-100 border-r"
      style={{ borderColor: '#E5E7EB', minHeight: '100vh' }}>
      <div className="px-10 py-16">
        <NavLink to="/" className="flex items-center gap-2.5 mb-14">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg text-white"
            style={{ background: '#1D4ED8' }}>
            &lt;/&gt;
          </div>
          <span className="text-xl font-extrabold tracking-tight">CodeArena</span>
        </NavLink>

        <h2 className="text-3xl font-black mb-3 leading-snug tracking-tight">
          Join thousands of<br />
          <span style={{ color: '#1D4ED8' }}>coders today! 💻</span>
        </h2>
        <p className="text-sm mb-10" style={{ color: '#64748B' }}>
          Best Time to Buy and Sell Stock — a classic greedy problem.
        </p>

        <div className="rounded-2xl p-5 font-mono text-sm leading-7 code-surface">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 opacity-80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 opacity-80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 opacity-80" />
            <span className="ml-2 text-xs opacity-40">maxProfit.js</span>
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
            <span className="inline-block w-2 h-4 animate-blink ml-8" style={{ background: '#1D4ED8' }} />
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mt-8">
          {[['200+', 'Problems'], ['AI', 'Hints'], ['Free', 'Always']].map(([val, label]) => (
            <div key={label} className="text-center rounded-xl py-3 border"
              style={{ background: '#F8FAFC', borderColor: '#E5E7EB' }}>
              <div className="text-lg font-black" style={{ color: '#1D4ED8' }}>{val}</div>
              <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ThemeToggle({ isDark, toggleTheme }) {
  return (
    <button onClick={toggleTheme}
      className="flex items-center justify-center w-9 h-9 rounded-lg border transition-all hover:bg-base-200"
      style={{ borderColor: '#E5E7EB' }}
      aria-label="Toggle theme">
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 110 10A5 5 0 0112 7z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#64748B' }}>
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );
}

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const { isDark, toggleTheme } = useTheme();

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(signupSchema) });

  useEffect(() => {
    if (isAuthenticated) navigate('/home');
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => { dispatch(registerUser(data)); };

  const inputCls = (hasError) =>
    `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
      hasError
        ? 'border-red-400 focus:ring-2 focus:ring-red-400/20'
        : 'focus:ring-2'
    } bg-base-100 border-base-300`;

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <LeftPanel />

      <div className="flex flex-col justify-center items-center px-8 py-12 bg-base-200 min-h-screen relative">
        <div className="absolute top-5 right-5">
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
        </div>

        <div className="w-full max-w-sm animate-slideUp">
          <NavLink to="/" className="flex md:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white" style={{ background: '#1D4ED8' }}>
              &lt;/&gt;
            </div>
            <span className="text-lg font-extrabold tracking-tight">CodeArena</span>
          </NavLink>

          <div className="bg-base-100 rounded-2xl shadow-sm border p-8" style={{ borderColor: '#E5E7EB' }}>
            <div className="mb-7">
              <h1 className="text-2xl font-black tracking-tight mb-1">Create account</h1>
              <p className="text-sm" style={{ color: '#64748B' }}>Start your DSA journey — it's completely free.</p>
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
                style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                <span>⚠</span>
                {typeof error === 'string' ? error : 'Registration failed. Please try again.'}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">First Name</label>
                <input id="signup-name" type="text" placeholder="John"
                  className={inputCls(errors.firstName)} {...register('firstName')} />
                {errors.firstName && <p className="text-xs mt-1.5" style={{ color: '#DC2626' }}>⚠ {errors.firstName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Email</label>
                <input id="signup-email" type="email" placeholder="john@example.com"
                  className={inputCls(errors.emailId)} {...register('emailId')} />
                {errors.emailId && <p className="text-xs mt-1.5" style={{ color: '#DC2626' }}>⚠ {errors.emailId.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Password</label>
                <div className="relative">
                  <input id="signup-password" type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    className={inputCls(errors.password)} {...register('password')} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 transition-opacity"
                    style={{ color: '#94A3B8' }} aria-label="Toggle password">
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
                {errors.password && <p className="text-xs mt-1.5" style={{ color: '#DC2626' }}>⚠ {errors.password.message}</p>}
              </div>

              <button id="signup-submit" type="submit" disabled={loading}
                className="btn-blue w-full py-3 rounded-xl font-semibold mt-2 disabled:opacity-60">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Creating account...
                  </span>
                ) : 'Create Account →'}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: '#E5E7EB' }} />
              <span className="text-xs" style={{ color: '#94A3B8' }}>OR</span>
              <div className="flex-1 h-px" style={{ background: '#E5E7EB' }} />
            </div>

            <p className="text-center text-sm">
              Already have an account?{' '}
              <NavLink to="/login" className="font-semibold" style={{ color: '#1D4ED8' }}>
                Sign in →
              </NavLink>
            </p>
            <p className="text-center mt-3 text-xs" style={{ color: '#94A3B8' }}>
              <NavLink to="/" className="hover:underline">← Back to home</NavLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;