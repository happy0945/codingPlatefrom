// ProblemPagePanels.jsx — Left & Right panel content, split for maintainability
import SubmissionHistory from './SubmissionHistory';
import ChatAi from './ChatAi';
import Editorial from './Editorial';

// ─── Difficulty Badge ─────────────────────────────────────────────────────────
export function DiffBadge({ difficulty }) {
  const cfg = {
    easy:   { label: 'Easy',   cls: 'badge-easy' },
    medium: { label: 'Medium', cls: 'badge-medium' },
    hard:   { label: 'Hard',   cls: 'badge-hard' },
  };
  const d = cfg[difficulty] || { label: difficulty, cls: '' };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${d.cls}`}>{d.label}</span>
  );
}

// ─── Test Case Result Row ─────────────────────────────────────────────────────
function TestCaseRow({ tc, index }) {
  const passed = tc.status_id === 3;
  return (
    <div className={`rounded-xl border p-3 text-xs font-mono transition-all ${
      passed ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`font-bold ${passed ? 'text-green-400' : 'text-red-400'}`}>
          {passed ? '✓' : '✗'} Case {index + 1}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {passed ? 'Passed' : 'Failed'}
        </span>
      </div>
      <div className="space-y-1 opacity-80">
        <div><span className="opacity-50">Input: </span>{tc.stdin}</div>
        <div><span className="opacity-50">Expected: </span>{tc.expected_output}</div>
        {tc.stdout && <div><span className="opacity-50">Output: </span>{tc.stdout}</div>}
      </div>
    </div>
  );
}

// ─── Left Panel — Description, Editorial, Solutions, Submissions, ChatAI ─────
export function LeftPanel({ problem, activeTab, setActiveTab, problemId }) {
  const tabs = [
    { id: 'description', label: 'Description',  icon: '📄' },
    { id: 'editorial',   label: 'Editorial',    icon: '🎬' },
    { id: 'solutions',   label: 'Solutions',    icon: '💡' },
    { id: 'submissions', label: 'Submissions',  icon: '📊' },
    { id: 'chatAI',      label: 'AI Tutor',     icon: '🤖' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex gap-0 border-b border-base-300 bg-base-100 shrink-0 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-3 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === t.id
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent opacity-50 hover:opacity-80'
            }`}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {problem && (
          <>
            {/* ── DESCRIPTION ── */}
            {activeTab === 'description' && (
              <div className="p-5 space-y-5">
                {/* Title + badges */}
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-xl font-extrabold">{problem.title}</h1>
                  <DiffBadge difficulty={problem.difficulty} />
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                    {problem.tags}
                  </span>
                </div>

                {/* Description */}
                <div className="text-sm leading-relaxed opacity-85 whitespace-pre-wrap">
                  {problem.description}
                </div>

                {/* Examples */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold opacity-70 uppercase tracking-wide">Examples</h3>
                  {problem.visibleTestCases.map((ex, i) => (
                    <div key={i} className="rounded-xl overflow-hidden border border-base-300">
                      <div className="px-4 py-2 text-xs font-bold border-b border-base-300 bg-base-200/60"
                        style={{ color: '#818cf8' }}>
                        Example {i + 1}
                      </div>
                      <div className="p-4 font-mono text-xs space-y-1.5 bg-base-200/30">
                        <div><span className="opacity-50">Input:  </span><span className="text-cyan-400">{ex.input}</span></div>
                        <div><span className="opacity-50">Output: </span><span className="text-green-400">{ex.output}</span></div>
                        {ex.explanation && (
                          <div className="pt-1 opacity-60 text-xs not-italic normal-case"
                            style={{ fontFamily: 'inherit' }}>
                            <span className="opacity-70">Explanation: </span>{ex.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Constraints hint */}
                <div className="rounded-xl p-4 text-xs border border-base-300 bg-base-200/40 space-y-1">
                  <p className="font-bold opacity-60 mb-2">Constraints</p>
                  <p className="opacity-50">All inputs are within reasonable bounds. Check examples for expected format.</p>
                </div>
              </div>
            )}

            {/* ── EDITORIAL ── */}
            {activeTab === 'editorial' && (
              <div className="p-5">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">🎬 Video Editorial</h2>
                <Editorial
                  secureUrl={problem.secureUrl}
                  thumbnailUrl={problem.thumbnailUrl}
                  duration={problem.duration}
                />
              </div>
            )}

            {/* ── SOLUTIONS ── */}
            {activeTab === 'solutions' && (
              <div className="p-5">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">💡 Reference Solutions</h2>
                <div className="space-y-4">
                  {problem.referenceSolution?.length > 0
                    ? problem.referenceSolution.map((sol, i) => (
                      <div key={i} className="rounded-xl overflow-hidden border border-base-300">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-base-300"
                          style={{ background: '#1a1a2e' }}>
                          <div className="flex items-center gap-2">
                            {[['#ef4444'],['#eab308'],['#22c55e']].map(([c], j) =>
                              <div key={j} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />)}
                            <span className="text-xs font-mono opacity-50 ml-1">{sol.language}</span>
                          </div>
                        </div>
                        <pre className="p-4 text-xs overflow-x-auto font-mono leading-6"
                          style={{ background: '#0d0d1a', color: '#a78bfa' }}>
                          <code>{sol.completeCode}</code>
                        </pre>
                      </div>
                    ))
                    : <div className="text-sm opacity-50 text-center py-10">🔒 Solutions unlock after solving the problem.</div>
                  }
                </div>
              </div>
            )}

            {/* ── SUBMISSIONS ── */}
            {activeTab === 'submissions' && (
              <div className="p-5">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">📊 My Submissions</h2>
                <SubmissionHistory problemId={problemId} />
              </div>
            )}

            {/* ── CHAT AI ── */}
            {activeTab === 'chatAI' && (
              <div className="h-full flex flex-col" style={{ minHeight: 'calc(100vh - 120px)' }}>
                <ChatAi problem={problem} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Run Result Panel ─────────────────────────────────────────────────────────
export function RunResultPanel({ runResult }) {
  if (!runResult) return (
    <div className="flex flex-col items-center justify-center h-40 opacity-30 gap-3">
      <div className="text-4xl">▶</div>
      <p className="text-sm">Run your code to see test results</p>
    </div>
  );

  return (
    <div className="p-4 space-y-3">
      {/* Status banner */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${
        runResult.success
          ? 'bg-green-500/10 border border-green-500/30 text-green-400'
          : 'bg-red-500/10 border border-red-500/30 text-red-400'
      }`}>
        <span className="text-xl">{runResult.success ? '✅' : '❌'}</span>
        <span>{runResult.success ? 'All test cases passed!' : 'Some test cases failed'}</span>
        {runResult.success && (
          <div className="ml-auto flex gap-4 text-xs font-normal opacity-70">
            <span>⏱ {runResult.runtime}s</span>
            <span>💾 {runResult.memory} KB</span>
          </div>
        )}
      </div>

      {/* Compile/runtime error */}
      {!runResult.success && (runResult.compileError || runResult.runtimeError) && (
        <pre className="rounded-xl p-4 text-xs font-mono text-red-400 overflow-x-auto"
          style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
          {runResult.compileError || runResult.runtimeError}
        </pre>
      )}

      {/* Test case rows */}
      {runResult.testCases?.length > 0 && (
        <div className="space-y-2">
          {runResult.testCases.map((tc, i) => <TestCaseRow key={i} tc={tc} index={i} />)}
        </div>
      )}
    </div>
  );
}

// ─── Submit Result Panel ──────────────────────────────────────────────────────
export function SubmitResultPanel({ submitResult }) {
  if (!submitResult) return (
    <div className="flex flex-col items-center justify-center h-40 opacity-30 gap-3">
      <div className="text-4xl">📤</div>
      <p className="text-sm">Submit your solution to see results</p>
    </div>
  );

  const pct = submitResult.totalTestCases > 0
    ? Math.round((submitResult.passedTestCases / submitResult.totalTestCases) * 100)
    : 0;

  return (
    <div className="p-4 space-y-4">
      {/* Big status */}
      <div className={`rounded-2xl p-6 text-center border ${
        submitResult.accepted
          ? 'border-green-500/30 bg-green-500/5'
          : 'border-red-500/30 bg-red-500/5'
      }`}>
        <div className="text-5xl mb-3">{submitResult.accepted ? '🎉' : '❌'}</div>
        <h2 className={`text-2xl font-extrabold ${submitResult.accepted ? 'text-green-400' : 'text-red-400'}`}>
          {submitResult.accepted ? 'Accepted' : 'Wrong Answer'}
        </h2>

        {/* Stats */}
        <div className="flex justify-center gap-8 mt-4 text-sm">
          {submitResult.accepted && (
            <>
              <div className="text-center">
                <div className="font-bold text-lg">{submitResult.runtime}s</div>
                <div className="opacity-50 text-xs">Runtime</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{submitResult.memory} KB</div>
                <div className="opacity-50 text-xs">Memory</div>
              </div>
            </>
          )}
          <div className="text-center">
            <div className="font-bold text-lg">{submitResult.passedTestCases}/{submitResult.totalTestCases}</div>
            <div className="opacity-50 text-xs">Test Cases</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 bg-base-300 rounded-full h-2 overflow-hidden">
          <div className="h-2 rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: submitResult.accepted
                ? 'linear-gradient(90deg,#22c55e,#16a34a)'
                : 'linear-gradient(90deg,#ef4444,#dc2626)'
            }} />
        </div>
      </div>

      {/* Error detail */}
      {!submitResult.accepted && submitResult.error && (
        <pre className="rounded-xl p-4 text-xs font-mono text-red-400 overflow-x-auto"
          style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
          {submitResult.error}
        </pre>
      )}
    </div>
  );
}
