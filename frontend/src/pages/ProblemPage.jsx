import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams, NavLink } from 'react-router';
import { useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import useTheme from '../hooks/useTheme';
import { LeftPanel, RunResultPanel, SubmitResultPanel } from '../components/ProblemPagePanels';

// Language display mapping
const LANG_DISPLAY = { javascript: 'JavaScript', java: 'Java', cpp: 'C++' };
const LANG_TO_MONACO = { javascript: 'javascript', java: 'java', cpp: 'cpp' };
const LANG_TO_SERVER = { javascript: 'JavaScript', java: 'Java', cpp: 'C++' };

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
function ThemeToggle({ isDark, toggleTheme }) {
  return (
    <button onClick={toggleTheme}
      className="flex items-center justify-center w-8 h-8 rounded-full border transition-all hover:scale-105"
      style={{ borderColor: 'rgba(99,102,241,0.4)' }}
      aria-label="Toggle theme">
      {isDark
        ? <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 110 10A5 5 0 0112 7z" /></svg>
        : <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>}
    </button>
  );
}

// ─── Resizable Divider ────────────────────────────────────────────────────────
function Divider({ onDrag }) {
  const dragging = useRef(false);
  const onMouseDown = (e) => {
    dragging.current = true;
    e.preventDefault();
    const onMove = (ev) => { if (dragging.current) onDrag(ev.clientX); };
    const onUp   = ()  => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp, { once: true });
  };
  return (
    <div
      onMouseDown={onMouseDown}
      className="w-1.5 shrink-0 cursor-col-resize flex items-center justify-center group transition-colors hover:bg-indigo-500/30"
      style={{ background: 'rgba(99,102,241,0.1)' }}>
      <div className="w-0.5 h-8 rounded-full bg-indigo-500/30 group-hover:bg-indigo-400 transition-colors" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const ProblemPage = () => {
  const { problemId } = useParams();
  const { isDark, toggleTheme } = useTheme();
  const { user } = useSelector(s => s.auth);

  const [problem, setProblem]               = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode]                     = useState('');
  const [loading, setLoading]               = useState(false);
  const [runResult, setRunResult]           = useState(null);
  const [submitResult, setSubmitResult]     = useState(null);
  const [activeLeftTab, setActiveLeftTab]   = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const [leftWidth, setLeftWidth]           = useState(50); // percent
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const { handleSubmit } = useForm();

  // Fetch problem
  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const { data } = await axiosClient.get(`/problem/problemById/${problemId}`);
        const initial = data.startCode.find(sc => sc.language === LANG_TO_SERVER[selectedLanguage])?.initialCode || '';
        setProblem(data);
        setCode(initial);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchProblem();
  }, [problemId]);

  // Update starter code when language changes
  useEffect(() => {
    if (problem) {
      const initial = problem.startCode.find(sc => sc.language === LANG_TO_SERVER[selectedLanguage])?.initialCode || '';
      setCode(initial);
    }
  }, [selectedLanguage, problem]);

  // Handle resizable panels
  const handleDividerDrag = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct  = ((clientX - rect.left) / rect.width) * 100;
    setLeftWidth(Math.min(Math.max(pct, 25), 75));
  };

  // Run code
  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    try {
      const { data } = await axiosClient.post(`/submission/run/${problemId}`, {
        code, language: selectedLanguage
      });
      setRunResult(data);
      setActiveRightTab('testcase');
<<<<<<< HEAD
    } catch (err) {
      setRunResult({
        success: false,
        error: err.response?.data?.error || err.message || 'Compilation Error',
        testCases: []
      });
      setActiveRightTab('testcase');
    } finally { setLoading(false); }
=======
      
    } catch (error) {
  console.error(error);

  setRunResult({
    success: false,
    error:
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Compilation Error",
    testCases: []
  });

  setLoading(false);
  setActiveRightTab("testcase");
}
>>>>>>> 291ecfcc7d3e6c3d1cbd6f0d18a3b7cd6530858e
  };

  // Submit code
  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    try {
      const { data } = await axiosClient.post(`/submission/submit/${problemId}`, {
        code, language: selectedLanguage
      });
<<<<<<< HEAD
      setSubmitResult(data);
      setActiveRightTab('result');
    } catch (err) {
      setSubmitResult({
        accepted: false,
        error: err.response?.data?.error || err.message || 'Compilation Error',
        passedTestCases: 0, totalTestCases: 0, runtime: 0, memory: 0
      });
      setActiveRightTab('result');
    } finally { setLoading(false); }
=======

       setSubmitResult(response.data);
       setLoading(false);
       setActiveRightTab('result');
      
    } catch (error) {
  console.error(error);

  setSubmitResult({
    accepted: false,
    error:
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Compilation Error",
    passedTestCases: 0,
    totalTestCases: 0,
    runtime: 0,
    memory: 0
  });

  setLoading(false);
  setActiveRightTab("result");
}
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
>>>>>>> 291ecfcc7d3e6c3d1cbd6f0d18a3b7cd6530858e
  };

  // Loading skeleton
  if (loading && !problem) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-base-200">
        <div className="w-10 h-10 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
        <p className="text-sm opacity-40">Loading problem…</p>
      </div>
    );
  }

  const rightTabs = [
    { id: 'code',     label: 'Code',     icon: '📝' },
    { id: 'testcase', label: 'Testcase', icon: '🧪' },
    { id: 'result',   label: 'Result',   icon: '📊' },
  ];

  return (
    <div className="flex flex-col h-screen bg-base-200 overflow-hidden">

      {/* ── Top Navbar ─────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 py-2 bg-base-100 border-b border-base-300 shrink-0 z-20">
        {/* Left: logo + problem title */}
        <div className="flex items-center gap-3">
          <NavLink to="/home" className="flex items-center gap-1.5 group">
            <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>&lt;/&gt;</div>
            <span className="text-sm font-extrabold hidden sm:block">
              Code<span style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Arena</span>
            </span>
          </NavLink>
          <span className="opacity-20 hidden sm:block">|</span>
          {problem && (
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="font-medium opacity-70 truncate max-w-[200px]">{problem.title}</span>
            </div>
          )}
        </div>

        {/* Center: Run / Submit */}
        <div className="flex items-center gap-2">
          <button onClick={handleRun} disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold border border-base-300 hover:border-indigo-500/50 transition-all disabled:opacity-40"
            style={{ background: 'rgba(99,102,241,0.08)' }}>
            {loading
              ? <span className="w-3.5 h-3.5 rounded-full border border-indigo-500/40 border-t-indigo-400 animate-spin" />
              : <span>▶</span>}
            Run
          </button>
          <button onClick={handleSubmitCode} disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-40 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>
            {loading
              ? <span className="w-3.5 h-3.5 rounded-full border border-white/40 border-t-white animate-spin" />
              : <span>📤</span>}
            Submit
          </button>
        </div>

        {/* Right: theme + user */}
        <div className="flex items-center gap-2">
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </header>

      {/* ── Two-panel layout ───────────────────────────────────────────────── */}
      <div ref={containerRef} className="flex flex-1 min-h-0 gap-0">

        {/* LEFT PANEL */}
        <div className="flex flex-col min-h-0 bg-base-100 border-r border-base-300"
          style={{ width: `${leftWidth}%` }}>
          <LeftPanel
            problem={problem}
            activeTab={activeLeftTab}
            setActiveTab={setActiveLeftTab}
            problemId={problemId}
          />
        </div>

        {/* Resizable divider */}
        <Divider onDrag={handleDividerDrag} />

        {/* RIGHT PANEL */}
        <div className="flex flex-col min-h-0 bg-base-100" style={{ flex: 1 }}>
          {/* Right Tabs */}
          <div className="flex gap-0 border-b border-base-300 bg-base-100 shrink-0">
            {rightTabs.map(t => (
              <button key={t.id} onClick={() => setActiveRightTab(t.id)}
                className={`px-4 py-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                  activeRightTab === t.id
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                    : 'border-transparent opacity-50 hover:opacity-80'
                }`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Right Content */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">

            {/* ── CODE EDITOR ── */}
            {activeRightTab === 'code' && (
              <div className="flex-1 min-h-0 flex flex-col">
                {/* Language bar */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-base-300 bg-base-200/50 shrink-0">
                  <div className="flex gap-1">
                    {['javascript', 'java', 'cpp'].map(lang => (
                      <button key={lang} onClick={() => setSelectedLanguage(lang)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          selectedLanguage === lang
                            ? 'text-white'
                            : 'opacity-50 hover:opacity-70'
                        }`}
                        style={selectedLanguage === lang ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' } : {}}>
                        {LANG_DISPLAY[lang]}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs opacity-40">
                    <span>Ctrl+S to format</span>
                  </div>
                </div>

                {/* Monaco Editor */}
                <div className="flex-1 min-h-0">
                  <Editor
                    height="100%"
                    language={LANG_TO_MONACO[selectedLanguage]}
                    value={code}
                    onChange={v => setCode(v || '')}
                    onMount={editor => { editorRef.current = editor; }}
                    theme="vs-dark"
                    options={{
                      fontSize: 14,
                      fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                      fontLigatures: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: 'on',
                      lineNumbers: 'on',
                      glyphMargin: false,
                      folding: true,
                      lineDecorationsWidth: 8,
                      lineNumbersMinChars: 3,
                      renderLineHighlight: 'line',
                      mouseWheelZoom: true,
                      cursorBlinking: 'smooth',
                      smoothScrolling: true,
                      padding: { top: 12 },
                    }}
                  />
                </div>

                {/* Action buttons (bottom) */}
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-base-300 bg-base-200/50 shrink-0">
                  <button onClick={() => setActiveRightTab('testcase')}
                    className="text-xs opacity-50 hover:opacity-80 flex items-center gap-1.5 transition-opacity">
                    🧪 Console
                  </button>
                  <div className="flex gap-2">
                    <button onClick={handleRun} disabled={loading}
                      className="btn btn-sm border border-base-300 bg-transparent hover:border-indigo-500/50 text-xs gap-1 disabled:opacity-40">
                      ▶ Run
                    </button>
                    <button onClick={handleSubmitCode} disabled={loading}
                      className="btn btn-sm text-white text-xs gap-1 border-0 disabled:opacity-40"
                      style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>
                      📤 Submit
                    </button>
<<<<<<< HEAD
=======
                  ))}
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="flex-1">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    mouseWheelZoom: true,
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-base-300 flex justify-between">
                <div className="flex gap-2">
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={() => setActiveRightTab('testcase')}
                  >
                    Console
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    className={`btn btn-outline btn-sm ${loading ? 'loading' : ''}`}
                    onClick={handleRun}
                    disabled={loading}
                  >
                    Run
                  </button>
                  <button
                    className={`btn btn-primary btn-sm ${loading ? 'loading' : ''}`}
                    onClick={handleSubmitCode}
                    disabled={loading}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeRightTab === 'testcase' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4">Test Results</h3>
              {runResult ? (
                <div className={`alert ${runResult.success ? 'alert-success' : 'alert-error'} mb-4`}>
                  <div>
                    {runResult.success ? (
                      <div>
                        <h4 className="font-bold">✅ All test cases passed!</h4>
                        <p className="text-sm mt-2">Runtime: {runResult.runtime+" sec"}</p>
                        <p className="text-sm">Memory: {runResult.memory+" KB"}</p>
                        
                        <div className="mt-4 space-y-2">
                          {runResult.testCases?.map((tc, i) => (
                            <div key={i} className="bg-base-100 p-3 rounded text-xs">
                              <div className="font-mono">
                                <div><strong>Input:</strong> {tc.stdin}</div>
                                <div><strong>Expected:</strong> {tc.expected_output}</div>
                                <div><strong>Output:</strong> {tc.stdout}</div>
                                <div className={'text-green-600'}>
                                  {'✓ Passed'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                  <div>
                    <h4 className="font-bold text-red-500">❌ Compilation Error</h4>
            <pre className="mt-3 bg-base-200 rounded-lg p-3 whitespace-pre-wrap text-red-500 overflow-x-auto">
                {runResult.compileError ||
                runResult.runtimeError ||
                "Wrong Answer"}
            </pre>
                        <div className="mt-4 space-y-2">
                          {runResult.testCases?.map((tc, i) => (
                            <div key={i} className="bg-base-100 p-3 rounded text-xs">
                              <div className="font-mono">
                                <div><strong>Input:</strong> {tc.stdin}</div>
                                <div><strong>Expected:</strong> {tc.expected_output}</div>
                                <div><strong>Output:</strong> {tc.stdout}</div>
                                <div className={tc.status_id==3 ? 'text-green-600' : 'text-red-600'}>
                                  {tc.status_id==3 ? '✓ Passed' : '✗ Failed'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
>>>>>>> 291ecfcc7d3e6c3d1cbd6f0d18a3b7cd6530858e
                  </div>
                </div>
              </div>
            )}

<<<<<<< HEAD
            {/* ── TEST RESULTS ── */}
            {activeRightTab === 'testcase' && (
              <div className="flex-1 overflow-y-auto">
                <RunResultPanel runResult={runResult} />
              </div>
            )}

            {/* ── SUBMIT RESULT ── */}
            {activeRightTab === 'result' && (
              <div className="flex-1 overflow-y-auto">
                <SubmitResultPanel submitResult={submitResult} />
              </div>
            )}
          </div>
=======
          {activeRightTab === 'result' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4">Submission Result</h3>
              {submitResult ? (
                <div className={`alert ${submitResult.accepted ? 'alert-success' : 'alert-error'}`}>
                  <div>
                    {submitResult.accepted ? (
                      <div>
                        <h4 className="font-bold text-lg">🎉 Accepted</h4>
                        <div className="mt-4 space-y-2">
                          <p>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                          <p>Runtime: {submitResult.runtime + " sec"}</p>
                          <p>Memory: {submitResult.memory + "KB"} </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-lg text-red-500">❌ Failed</h4>
                        <pre className="bg-base-200 rounded-lg p-3 mt-3 whitespace-pre-wrap text-red-500">
                            {submitResult.error}
                        </pre>
                        <div className="mt-4 space-y-2">
                          <p>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  Click "Submit" to submit your solution for evaluation.
                </div>
              )}
            </div>
          )}
>>>>>>> 291ecfcc7d3e6c3d1cbd6f0d18a3b7cd6530858e
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;
