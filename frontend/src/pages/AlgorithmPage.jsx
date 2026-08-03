import { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink } from 'react-router';
import { useSelector } from 'react-redux';
import useTheme from '../hooks/useTheme';

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
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

// ══════════════════════════════════════════════════════════════════════════════
//  BUBBLE SORT VISUALIZER
// ══════════════════════════════════════════════════════════════════════════════
const BUBBLE_CODE = [
  { line: 'function bubbleSort(arr) {',             label: 'Define function' },
  { line: '  for (let i = 0; i < arr.length; i++) {', label: 'Outer loop — each pass' },
  { line: '    for (let j = 0; j < arr.length - i - 1; j++) {', label: 'Inner loop — compare pairs' },
  { line: '      if (arr[j] > arr[j + 1]) {',       label: 'Compare adjacent elements' },
  { line: '        // swap',                          label: 'Elements out of order — swap!' },
  { line: '        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];', label: 'Destructuring swap' },
  { line: '      }',                                  label: '' },
  { line: '    }',                                   label: '' },
  { line: '  }',                                     label: '' },
  { line: '  return arr;',                           label: 'Array is sorted!' },
  { line: '}',                                       label: '' },
];

function generateBubbleSteps(arr) {
  const steps = [];
  const a = [...arr];
  const n = a.length;
  steps.push({ arr: [...a], comparing: [], swapping: [], sorted: [], codeLine: 0, info: 'Starting Bubble Sort...' });

  for (let i = 0; i < n; i++) {
    steps.push({ arr: [...a], comparing: [], swapping: [], sorted: Array.from({ length: i }, (_, k) => n - 1 - k + i), codeLine: 1, info: `Pass ${i + 1} of ${n}` });
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({ arr: [...a], comparing: [j, j + 1], swapping: [], sorted: [], codeLine: 2, info: `Comparing index ${j} and ${j + 1}` });
      steps.push({ arr: [...a], comparing: [j, j + 1], swapping: [], sorted: [], codeLine: 3, info: `arr[${j}]=${a[j]} vs arr[${j + 1}]=${a[j + 1]}` });
      if (a[j] > a[j + 1]) {
        steps.push({ arr: [...a], comparing: [j, j + 1], swapping: [j, j + 1], sorted: [], codeLine: 4, info: `${a[j]} > ${a[j + 1]} → Swapping!` });
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({ arr: [...a], comparing: [], swapping: [j, j + 1], sorted: [], codeLine: 5, info: `Swapped! arr[${j}]=${a[j]}, arr[${j + 1}]=${a[j + 1]}` });
      } else {
        steps.push({ arr: [...a], comparing: [j, j + 1], swapping: [], sorted: [], codeLine: 3, info: `${a[j]} ≤ ${a[j + 1]} → No swap needed` });
      }
    }
  }
  steps.push({ arr: [...a], comparing: [], swapping: [], sorted: a.map((_, k) => k), codeLine: 9, info: '✅ Array is fully sorted!' });
  return steps;
}

// ══════════════════════════════════════════════════════════════════════════════
//  BINARY SEARCH VISUALIZER
// ══════════════════════════════════════════════════════════════════════════════
const BINARY_CODE = [
  { line: 'function binarySearch(arr, target) {', label: 'Define function' },
  { line: '  let left = 0, right = arr.length - 1;', label: 'Initialize pointers' },
  { line: '  while (left <= right) {',              label: 'Search while range is valid' },
  { line: '    const mid = Math.floor((left + right) / 2);', label: 'Calculate midpoint' },
  { line: '    if (arr[mid] === target) {',          label: 'Check if found' },
  { line: '      return mid; // Found!',             label: '🎉 Target found at mid' },
  { line: '    } else if (arr[mid] < target) {',     label: 'Target is in right half' },
  { line: '      left = mid + 1;',                   label: 'Move left pointer right' },
  { line: '    } else {',                            label: 'Target is in left half' },
  { line: '      right = mid - 1;',                  label: 'Move right pointer left' },
  { line: '    }',                                   label: '' },
  { line: '  }',                                    label: '' },
  { line: '  return -1; // Not found',              label: '❌ Target not in array' },
  { line: '}',                                      label: '' },
];

function generateBinarySteps(arr, target) {
  const steps = [];
  let left = 0, right = arr.length - 1;
  steps.push({ arr, left, right, mid: -1, found: -1, codeLine: 0, info: `Searching for ${target} in sorted array`, eliminated: [] });
  steps.push({ arr, left, right, mid: -1, found: -1, codeLine: 1, info: `left=0, right=${arr.length - 1}`, eliminated: [] });

  while (left <= right) {
    const eliminated = [];
    steps.push({ arr, left, right, mid: -1, found: -1, codeLine: 2, info: `Checking: left(${left}) ≤ right(${right})`, eliminated });
    const mid = Math.floor((left + right) / 2);
    steps.push({ arr, left, right, mid, found: -1, codeLine: 3, info: `mid = (${left} + ${right}) / 2 = ${mid}`, eliminated });
    steps.push({ arr, left, right, mid, found: -1, codeLine: 4, info: `arr[${mid}] = ${arr[mid]} vs target = ${target}`, eliminated });

    if (arr[mid] === target) {
      steps.push({ arr, left, right, mid, found: mid, codeLine: 5, info: `🎉 Found ${target} at index ${mid}!`, eliminated });
      return steps;
    } else if (arr[mid] < target) {
      steps.push({ arr, left, right, mid, found: -1, codeLine: 6, info: `${arr[mid]} < ${target} → search right half`, eliminated });
      left = mid + 1;
      steps.push({ arr, left, right, mid, found: -1, codeLine: 7, info: `left = ${mid} + 1 = ${left}`, eliminated });
    } else {
      steps.push({ arr, left, right, mid, found: -1, codeLine: 8, info: `${arr[mid]} > ${target} → search left half`, eliminated });
      right = mid - 1;
      steps.push({ arr, left, right, mid, found: -1, codeLine: 9, info: `right = ${mid} - 1 = ${right}`, eliminated });
    }
  }
  steps.push({ arr, left, right, mid: -1, found: -1, codeLine: 12, info: `❌ ${target} not found in array`, eliminated: [] });
  return steps;
}

// ══════════════════════════════════════════════════════════════════════════════
//  SELECTION SORT VISUALIZER
// ══════════════════════════════════════════════════════════════════════════════
const SELECTION_CODE = [
  { line: 'function selectionSort(arr) {',               label: 'Define function' },
  { line: '  for (let i = 0; i < arr.length - 1; i++) {', label: 'Position to fill' },
  { line: '    let minIdx = i;',                          label: 'Assume current pos is min' },
  { line: '    for (let j = i + 1; j < arr.length; j++) {', label: 'Scan rest of array' },
  { line: '      if (arr[j] < arr[minIdx]) {',             label: 'Found smaller element!' },
  { line: '        minIdx = j;',                          label: 'Update minimum index' },
  { line: '      }',                                      label: '' },
  { line: '    }',                                        label: '' },
  { line: '    if (minIdx !== i) {',                      label: 'Swap if needed' },
  { line: '      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];', label: 'Place minimum at position i' },
  { line: '    }',                                        label: '' },
  { line: '  }',                                         label: '' },
  { line: '  return arr;',                               label: 'Array is sorted!' },
  { line: '}',                                           label: '' },
];

function generateSelectionSteps(arr) {
  const steps = [];
  const a = [...arr];
  const n = a.length;
  steps.push({ arr: [...a], current: -1, minIdx: -1, comparing: -1, swapping: [], sorted: [], codeLine: 0, info: 'Starting Selection Sort...' });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    steps.push({ arr: [...a], current: i, minIdx, comparing: -1, swapping: [], sorted: Array.from({ length: i }, (_, k) => k), codeLine: 1, info: `Finding minimum in positions ${i}..${n - 1}` });
    steps.push({ arr: [...a], current: i, minIdx, comparing: -1, swapping: [], sorted: Array.from({ length: i }, (_, k) => k), codeLine: 2, info: `Assume minimum is arr[${i}] = ${a[i]}` });

    for (let j = i + 1; j < n; j++) {
      steps.push({ arr: [...a], current: i, minIdx, comparing: j, swapping: [], sorted: Array.from({ length: i }, (_, k) => k), codeLine: 3, info: `Scanning index ${j}` });
      steps.push({ arr: [...a], current: i, minIdx, comparing: j, swapping: [], sorted: Array.from({ length: i }, (_, k) => k), codeLine: 4, info: `arr[${j}]=${a[j]} < arr[${minIdx}]=${a[minIdx]}?` });
      if (a[j] < a[minIdx]) {
        minIdx = j;
        steps.push({ arr: [...a], current: i, minIdx, comparing: j, swapping: [], sorted: Array.from({ length: i }, (_, k) => k), codeLine: 5, info: `New minimum found! minIdx = ${j}, value = ${a[j]}` });
      }
    }
    steps.push({ arr: [...a], current: i, minIdx, comparing: -1, swapping: [], sorted: Array.from({ length: i }, (_, k) => k), codeLine: 8, info: `Swap arr[${i}] with arr[${minIdx}]?` });
    if (minIdx !== i) {
      steps.push({ arr: [...a], current: i, minIdx, comparing: -1, swapping: [i, minIdx], sorted: Array.from({ length: i }, (_, k) => k), codeLine: 9, info: `Swapping ${a[i]} ↔ ${a[minIdx]}` });
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      steps.push({ arr: [...a], current: i, minIdx: i, comparing: -1, swapping: [i, minIdx], sorted: Array.from({ length: i }, (_, k) => k), codeLine: 9, info: `${a[i]} placed at position ${i} ✓` });
    }
  }
  steps.push({ arr: [...a], current: -1, minIdx: -1, comparing: -1, swapping: [], sorted: a.map((_, k) => k), codeLine: 12, info: '✅ Array is fully sorted!' });
  return steps;
}

// ══════════════════════════════════════════════════════════════════════════════
//  TWO POINTERS VISUALIZER  (find pair with given sum)
// ══════════════════════════════════════════════════════════════════════════════
const TWO_PTR_CODE = [
  { line: 'function twoSum(arr, target) {',          label: 'Sorted array input' },
  { line: '  let left = 0, right = arr.length - 1;', label: 'Initialize pointers at ends' },
  { line: '  while (left < right) {',                label: 'Search while pointers dont cross' },
  { line: '    const sum = arr[left] + arr[right];', label: 'Calculate current sum' },
  { line: '    if (sum === target) {',               label: 'Check if target found' },
  { line: '      return [left, right]; // Found!',   label: '🎉 Pair found!' },
  { line: '    } else if (sum < target) {',          label: 'Sum too small' },
  { line: '      left++;',                           label: 'Move left pointer right' },
  { line: '    } else {',                            label: 'Sum too large' },
  { line: '      right--;',                          label: 'Move right pointer left' },
  { line: '    }',                                   label: '' },
  { line: '  }',                                    label: '' },
  { line: '  return [-1, -1]; // Not found',        label: '❌ No pair found' },
  { line: '}',                                      label: '' },
];

function generateTwoPtrSteps(arr, target) {
  const steps = [];
  let left = 0, right = arr.length - 1;
  steps.push({ arr, left, right, sum: null, found: false, codeLine: 0, info: `Finding pair that sums to ${target}` });
  steps.push({ arr, left, right, sum: null, found: false, codeLine: 1, info: `left=0, right=${arr.length - 1}` });

  while (left < right) {
    steps.push({ arr, left, right, sum: null, found: false, codeLine: 2, info: `left(${left}) < right(${right}) ✓` });
    const sum = arr[left] + arr[right];
    steps.push({ arr, left, right, sum, found: false, codeLine: 3, info: `arr[${left}] + arr[${right}] = ${arr[left]} + ${arr[right]} = ${sum}` });
    steps.push({ arr, left, right, sum, found: false, codeLine: 4, info: `${sum} === ${target}?` });

    if (sum === target) {
      steps.push({ arr, left, right, sum, found: true, codeLine: 5, info: `🎉 Found! Indices [${left}, ${right}], values [${arr[left]}, ${arr[right]}]` });
      return steps;
    } else if (sum < target) {
      steps.push({ arr, left, right, sum, found: false, codeLine: 6, info: `${sum} < ${target} → need bigger sum` });
      left++;
      steps.push({ arr, left, right, sum, found: false, codeLine: 7, info: `left++ → left = ${left}` });
    } else {
      steps.push({ arr, left, right, sum, found: false, codeLine: 8, info: `${sum} > ${target} → need smaller sum` });
      right--;
      steps.push({ arr, left, right, sum, found: false, codeLine: 9, info: `right-- → right = ${right}` });
    }
  }
  steps.push({ arr, left, right, sum: null, found: false, codeLine: 12, info: `❌ No pair found that sums to ${target}` });
  return steps;
}

// ══════════════════════════════════════════════════════════════════════════════
//  SHARED: Player Controls
// ══════════════════════════════════════════════════════════════════════════════
function PlayerControls({ step, total, playing, speed, onPrev, onNext, onPlay, onReset, onSpeedChange }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-base-200 rounded-xl border border-base-300">
      <div className="flex items-center gap-2">
        <button onClick={onReset} className="btn btn-sm btn-ghost" title="Reset">↩</button>
        <button onClick={onPrev} disabled={step === 0} className="btn btn-sm btn-ghost disabled:opacity-30">
          ⏮ Prev
        </button>
        <button onClick={onPlay}
          className="btn btn-sm font-bold text-white border-0"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', minWidth: 80 }}>
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        <button onClick={onNext} disabled={step >= total - 1} className="btn btn-sm btn-ghost disabled:opacity-30">
          Next ⏭
        </button>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs opacity-50">Step {step + 1}/{total}</span>
        <div className="flex items-center gap-2 text-xs">
          <span className="opacity-50">Speed:</span>
          {[1, 2, 4].map(s => (
            <button key={s} onClick={() => onSpeedChange(s)}
              className={`btn btn-xs ${speed === s ? 'btn-primary' : 'btn-ghost'}`}>
              {s}x
            </button>
          ))}
        </div>
      </div>
      {/* Progress bar */}
      <div className="w-full bg-base-300 h-1.5 rounded-full">
        <div className="h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((step + 1) / total) * 100}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
      </div>
    </div>
  );
}

// Shared: Code Panel with line highlighting
function CodePanel({ code, activeLine, title }) {
  return (
    <div className="rounded-xl overflow-hidden border border-base-300 h-full">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-base-300/60 border-b border-base-300">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-80" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-80" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-80" />
        <span className="text-xs opacity-40 ml-1 font-mono">{title}</span>
      </div>
      <div className="p-3 font-mono text-xs leading-6 overflow-auto" style={{ background: '#1e1e2e', maxHeight: 340 }}>
        {code.map((item, i) => (
          <div key={i} className="flex gap-2 rounded-md px-2 py-0.5 transition-all duration-200"
            style={{
              background: activeLine === i ? 'rgba(99,102,241,0.25)' : 'transparent',
              borderLeft: activeLine === i ? '3px solid #6366f1' : '3px solid transparent',
            }}>
            <span className="select-none opacity-25 w-5 shrink-0 text-right">{i + 1}</span>
            <span style={{ color: activeLine === i ? '#c084fc' : '#9ca3af' }}>{item.line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  BUBBLE SORT PANEL
// ══════════════════════════════════════════════════════════════════════════════
function BubbleSortPanel() {
  const INITIAL = [64, 34, 25, 12, 22, 11, 90];
  const [steps] = useState(() => generateBubbleSteps(INITIAL));
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef(null);

  const cur = steps[stepIdx];
  const maxVal = Math.max(...cur.arr);

  const tick = useCallback(() => {
    setStepIdx(s => {
      if (s >= steps.length - 1) { setPlaying(false); return s; }
      return s + 1;
    });
  }, [steps.length]);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(tick, 1100 / speed);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, speed, tick]);

  const barColor = (i) => {
    if (cur.sorted?.includes(i)) return '#22c55e';
    if (cur.swapping?.includes(i)) return '#ef4444';
    if (cur.comparing?.includes(i)) return '#f59e0b';
    return '#6366f1';
  };

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="flex items-center gap-3 p-3 rounded-xl text-sm font-medium animate-fadeIn"
        style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}>
        <span className="text-lg">ℹ️</span>
        <span className="text-indigo-400">{cur.info}</span>
      </div>

      {/* Bar chart */}
      <div className="bg-base-200 rounded-xl p-4 border border-base-300">
        <div className="flex items-end justify-center gap-2 h-40">
          {cur.arr.map((val, i) => (
            <div key={i} className="flex flex-col items-center gap-1 transition-all duration-300" style={{ minWidth: 36 }}>
              <span className="text-xs font-bold" style={{ color: barColor(i) }}>{val}</span>
              <div className="rounded-t-lg transition-all duration-500 w-8"
                style={{
                  height: `${(val / maxVal) * 120}px`,
                  background: barColor(i),
                  boxShadow: cur.comparing?.includes(i) || cur.swapping?.includes(i)
                    ? `0 0 16px ${barColor(i)}80` : 'none',
                }} />
              <span className="text-xs opacity-30">{i}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {[['#6366f1', 'Normal'], ['#f59e0b', 'Comparing'], ['#ef4444', 'Swapping'], ['#22c55e', 'Sorted']].map(([c, l]) => (
          <div key={l} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: c }} />
            <span className="opacity-60">{l}</span>
          </div>
        ))}
      </div>

      {/* Code + controls */}
      <CodePanel code={BUBBLE_CODE} activeLine={cur.codeLine} title="bubbleSort.js" />
      <PlayerControls step={stepIdx} total={steps.length} playing={playing} speed={speed}
        onPrev={() => { setPlaying(false); setStepIdx(s => Math.max(0, s - 1)); }}
        onNext={() => { setPlaying(false); setStepIdx(s => Math.min(steps.length - 1, s + 1)); }}
        onPlay={() => { if (stepIdx >= steps.length - 1) setStepIdx(0); setPlaying(p => !p); }}
        onReset={() => { setPlaying(false); setStepIdx(0); }}
        onSpeedChange={setSpeed} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  BINARY SEARCH PANEL
// ══════════════════════════════════════════════════════════════════════════════
function BinarySearchPanel() {
  const ARR = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72];
  const TARGET = 23;
  const [steps] = useState(() => generateBinarySteps(ARR, TARGET));
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef(null);

  const cur = steps[stepIdx];

  const tick = useCallback(() => {
    setStepIdx(s => { if (s >= steps.length - 1) { setPlaying(false); return s; } return s + 1; });
  }, [steps.length]);

  useEffect(() => {
    if (playing) { timerRef.current = setInterval(tick, 1100 / speed); }
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [playing, speed, tick]);

  const cellColor = (i) => {
    if (cur.found === i) return { bg: '#22c55e', border: '#16a34a' };
    if (cur.mid === i) return { bg: '#f59e0b', border: '#d97706' };
    if (i >= cur.left && i <= cur.right) return { bg: '#6366f1', border: '#4f46e5' };
    return { bg: 'transparent', border: 'rgba(99,102,241,0.2)' };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 rounded-xl text-sm font-medium animate-fadeIn"
        style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}>
        <span className="text-lg">🎯</span>
        <span className="text-indigo-400">{cur.info}</span>
      </div>

      {/* Target display */}
      <div className="flex items-center gap-3 text-sm">
        <span className="opacity-50">Target:</span>
        <span className="font-bold text-yellow-400 text-lg">{TARGET}</span>
        {cur.left !== undefined && <span className="opacity-50 ml-4">left={cur.left}, right={cur.right}{cur.mid >= 0 ? `, mid=${cur.mid}` : ''}</span>}
      </div>

      {/* Array cells */}
      <div className="bg-base-200 rounded-xl p-4 border border-base-300">
        <div className="flex flex-wrap gap-2 justify-center">
          {ARR.map((val, i) => {
            const c = cellColor(i);
            return (
              <div key={i} className="flex flex-col items-center gap-1 transition-all duration-500">
                {/* Pointer labels */}
                <div className="h-5 text-xs font-bold flex items-center gap-0.5">
                  {cur.left === i && <span className="text-green-400">L</span>}
                  {cur.mid === i && <span className="text-yellow-400">M</span>}
                  {cur.right === i && <span className="text-red-400">R</span>}
                </div>
                <div className="w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-all duration-500 border-2"
                  style={{
                    background: c.bg,
                    borderColor: c.border,
                    color: c.bg === 'transparent' ? '#6b7280' : 'white',
                    transform: cur.mid === i || cur.found === i ? 'scale(1.15)' : 'scale(1)',
                    boxShadow: cur.found === i ? '0 0 20px #22c55e80' : cur.mid === i ? '0 0 20px #f59e0b80' : 'none',
                  }}>
                  {val}
                </div>
                <span className="text-xs opacity-30">{i}</span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs mt-4 justify-center">
          {[['#6366f1', 'Search Range'], ['#f59e0b', 'Mid (checking)'], ['#22c55e', 'Found!'], ['gray', 'Eliminated']].map(([c, l]) => (
            <div key={l} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: c }} />
              <span className="opacity-60">{l}</span>
            </div>
          ))}
        </div>
      </div>

      <CodePanel code={BINARY_CODE} activeLine={cur.codeLine} title="binarySearch.js" />
      <PlayerControls step={stepIdx} total={steps.length} playing={playing} speed={speed}
        onPrev={() => { setPlaying(false); setStepIdx(s => Math.max(0, s - 1)); }}
        onNext={() => { setPlaying(false); setStepIdx(s => Math.min(steps.length - 1, s + 1)); }}
        onPlay={() => { if (stepIdx >= steps.length - 1) setStepIdx(0); setPlaying(p => !p); }}
        onReset={() => { setPlaying(false); setStepIdx(0); }}
        onSpeedChange={setSpeed} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  SELECTION SORT PANEL
// ══════════════════════════════════════════════════════════════════════════════
function SelectionSortPanel() {
  const INITIAL = [64, 25, 12, 22, 11];
  const [steps] = useState(() => generateSelectionSteps(INITIAL));
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef(null);
  const cur = steps[stepIdx];
  const maxVal = Math.max(...cur.arr);

  const tick = useCallback(() => {
    setStepIdx(s => { if (s >= steps.length - 1) { setPlaying(false); return s; } return s + 1; });
  }, [steps.length]);

  useEffect(() => {
    if (playing) { timerRef.current = setInterval(tick, 1200 / speed); }
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [playing, speed, tick]);

  const barColor = (i) => {
    if (cur.sorted?.includes(i)) return '#22c55e';
    if (cur.swapping?.includes(i)) return '#ef4444';
    if (i === cur.minIdx) return '#f59e0b';
    if (i === cur.comparing) return '#c084fc';
    if (i === cur.current) return '#06b6d4';
    return '#6366f1';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 rounded-xl text-sm font-medium animate-fadeIn"
        style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}>
        <span className="text-lg">🔍</span>
        <span className="text-indigo-400">{cur.info}</span>
      </div>

      <div className="bg-base-200 rounded-xl p-4 border border-base-300">
        <div className="flex items-end justify-center gap-4 h-44">
          {cur.arr.map((val, i) => (
            <div key={i} className="flex flex-col items-center gap-1 transition-all duration-300" style={{ minWidth: 48 }}>
              <span className="text-sm font-bold" style={{ color: barColor(i) }}>{val}</span>
              <div className="rounded-t-lg transition-all duration-500 w-10"
                style={{
                  height: `${(val / maxVal) * 140}px`,
                  background: barColor(i),
                  boxShadow: [cur.minIdx, cur.comparing, cur.current].includes(i) ? `0 0 16px ${barColor(i)}80` : 'none',
                }} />
              <span className="text-xs opacity-30">{i}</span>
              <div className="text-xs h-4 font-bold">
                {i === cur.current && <span className="text-cyan-400">pos</span>}
                {i === cur.minIdx && i !== cur.current && <span className="text-yellow-400">min</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs">
        {[['#06b6d4', 'Current Pos'], ['#f59e0b', 'Minimum Found'], ['#c084fc', 'Scanning'], ['#ef4444', 'Swapping'], ['#22c55e', 'Sorted']].map(([c, l]) => (
          <div key={l} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: c }} />
            <span className="opacity-60">{l}</span>
          </div>
        ))}
      </div>

      <CodePanel code={SELECTION_CODE} activeLine={cur.codeLine} title="selectionSort.js" />
      <PlayerControls step={stepIdx} total={steps.length} playing={playing} speed={speed}
        onPrev={() => { setPlaying(false); setStepIdx(s => Math.max(0, s - 1)); }}
        onNext={() => { setPlaying(false); setStepIdx(s => Math.min(steps.length - 1, s + 1)); }}
        onPlay={() => { if (stepIdx >= steps.length - 1) setStepIdx(0); setPlaying(p => !p); }}
        onReset={() => { setPlaying(false); setStepIdx(0); }}
        onSpeedChange={setSpeed} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  TWO POINTERS PANEL
// ══════════════════════════════════════════════════════════════════════════════
function TwoPointersPanel() {
  const ARR = [1, 3, 4, 6, 8, 11, 15];
  const TARGET = 9;
  const [steps] = useState(() => generateTwoPtrSteps(ARR, TARGET));
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef(null);
  const cur = steps[stepIdx];

  const tick = useCallback(() => {
    setStepIdx(s => { if (s >= steps.length - 1) { setPlaying(false); return s; } return s + 1; });
  }, [steps.length]);

  useEffect(() => {
    if (playing) { timerRef.current = setInterval(tick, 1200 / speed); }
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [playing, speed, tick]);

  const cellColor = (i) => {
    if (cur.found && (i === cur.left || i === cur.right)) return '#22c55e';
    if (i === cur.left && i === cur.right) return '#f59e0b';
    if (i === cur.left) return '#6366f1';
    if (i === cur.right) return '#ec4899';
    return 'transparent';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 rounded-xl text-sm font-medium animate-fadeIn"
        style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}>
        <span className="text-lg">👆👆</span>
        <span className="text-indigo-400">{cur.info}</span>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <span className="opacity-50">Target Sum:</span>
        <span className="font-bold text-yellow-400 text-lg">{TARGET}</span>
        {cur.sum !== null && (
          <span className={`ml-4 font-bold ${cur.found ? 'text-green-400' : cur.sum < TARGET ? 'text-blue-400' : 'text-red-400'}`}>
            Current Sum: {cur.sum}
          </span>
        )}
      </div>

      <div className="bg-base-200 rounded-xl p-6 border border-base-300">
        <div className="flex flex-wrap gap-3 justify-center">
          {ARR.map((val, i) => {
            const bg = cellColor(i);
            return (
              <div key={i} className="flex flex-col items-center gap-1 transition-all duration-400">
                <div className="h-6 text-xs font-bold flex items-center gap-0.5">
                  {i === cur.left && <span className="text-indigo-400">L</span>}
                  {i === cur.right && <span className="text-pink-400">R</span>}
                </div>
                <div className="w-12 h-12 flex items-center justify-center rounded-xl font-bold text-base transition-all duration-500 border-2"
                  style={{
                    background: bg,
                    borderColor: bg === 'transparent' ? 'rgba(99,102,241,0.2)' : bg,
                    color: bg === 'transparent' ? '#6b7280' : 'white',
                    transform: (i === cur.left || i === cur.right) ? 'scale(1.2)' : 'scale(1)',
                    boxShadow: cur.found && (i === cur.left || i === cur.right) ? '0 0 20px #22c55e80' : 'none',
                  }}>
                  {val}
                </div>
                <span className="text-xs opacity-30">{i}</span>
              </div>
            );
          })}
        </div>

        {/* Arrow visualization */}
        <div className="mt-4 text-center text-sm">
          {cur.sum !== null && !cur.found && (
            <span className="opacity-60">
              {cur.sum < TARGET ? '→ Sum too small, move L right' : '← Sum too big, move R left'}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs">
        {[['#6366f1', 'Left Pointer'], ['#ec4899', 'Right Pointer'], ['#22c55e', 'Found Pair']].map(([c, l]) => (
          <div key={l} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: c }} />
            <span className="opacity-60">{l}</span>
          </div>
        ))}
      </div>

      <CodePanel code={TWO_PTR_CODE} activeLine={cur.codeLine} title="twoPointers.js" />
      <PlayerControls step={stepIdx} total={steps.length} playing={playing} speed={speed}
        onPrev={() => { setPlaying(false); setStepIdx(s => Math.max(0, s - 1)); }}
        onNext={() => { setPlaying(false); setStepIdx(s => Math.min(steps.length - 1, s + 1)); }}
        onPlay={() => { if (stepIdx >= steps.length - 1) setStepIdx(0); setPlaying(p => !p); }}
        onReset={() => { setPlaying(false); setStepIdx(0); }}
        onSpeedChange={setSpeed} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  ALGORITHM INFO CARDS
// ══════════════════════════════════════════════════════════════════════════════
const ALGO_META = {
  bubble:    { name: 'Bubble Sort',    icon: '🫧', time: 'O(n²)', space: 'O(1)', best: 'O(n)', color: '#6366f1', desc: 'Repeatedly swaps adjacent elements if they are in wrong order. Simple but slow.' },
  binary:    { name: 'Binary Search',  icon: '🔍', time: 'O(log n)', space: 'O(1)', best: 'O(1)', color: '#8b5cf6', desc: 'Divides search space in half each time. Requires sorted array.' },
  selection: { name: 'Selection Sort', icon: '🎯', time: 'O(n²)', space: 'O(1)', best: 'O(n²)', color: '#06b6d4', desc: 'Finds the minimum element and places it at beginning each pass.' },
  twoptr:    { name: 'Two Pointers',   icon: '👆', time: 'O(n)', space: 'O(1)', best: 'O(n)', color: '#22d3ee', desc: 'Uses two pointers moving toward each other. Great for sorted arrays.' },
};

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function AlgorithmPage() {
  const [active, setActive] = useState('bubble');
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useSelector(s => s.auth);
  const meta = ALGO_META[active];

  const tabs = [
    { key: 'bubble', label: '🫧 Bubble Sort' },
    { key: 'binary', label: '🔍 Binary Search' },
    { key: 'selection', label: '🎯 Selection Sort' },
    { key: 'twoptr', label: '👆 Two Pointers' },
  ];

  return (
    <div className="min-h-screen bg-base-200">

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-base-100/90 backdrop-blur-md border-b border-base-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              &lt;/&gt;
            </div>
            <span className="text-lg font-extrabold hidden sm:block">
              Code<span style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Arena</span>
            </span>
          </NavLink>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {isAuthenticated && <NavLink to="/home" className="opacity-70 hover:opacity-100 transition-opacity">Problems</NavLink>}
            <NavLink to="/algorithms" className="font-semibold" style={{ color: '#6366f1' }}>Visualizer</NavLink>
            <NavLink to="/" className="opacity-70 hover:opacity-100 transition-opacity">Blog</NavLink>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            {isAuthenticated
              ? <NavLink to="/home" className="btn btn-sm font-semibold text-white border-0 shadow" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>Dashboard</NavLink>
              : <NavLink to="/login" className="btn btn-sm btn-ghost font-semibold">Login</NavLink>}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10 animate-slideUp">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}>
            🎬 Step-by-Step Algorithm Visualizer
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            See Every Step,{' '}
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Understand Every Move
            </span>
          </h1>
          <p className="opacity-60 text-base max-w-lg mx-auto">
            Watch algorithms run in real time — see which line of code executes at each step, with animated visualizations.
          </p>
        </div>

        {/* Algorithm selector tabs */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActive(t.key)}
              className="btn btn-sm font-semibold transition-all"
              style={active === t.key ? {
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', border: 'none',
              } : {}}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Algorithm info card */}
        <div className="rounded-2xl p-5 mb-6 border animate-fadeIn"
          style={{ background: `${meta.color}10`, borderColor: `${meta.color}30` }}>
          <div className="flex flex-wrap items-start gap-4">
            <div className="text-4xl">{meta.icon}</div>
            <div className="flex-1">
              <h2 className="text-xl font-extrabold mb-1">{meta.name}</h2>
              <p className="text-sm opacity-70 mb-3">{meta.desc}</p>
              <div className="flex flex-wrap gap-4 text-xs">
                <span className="px-3 py-1 rounded-full font-semibold" style={{ background: `${meta.color}20`, color: meta.color }}>
                  ⏱ Avg: {meta.time}
                </span>
                <span className="px-3 py-1 rounded-full font-semibold" style={{ background: `${meta.color}20`, color: meta.color }}>
                  ⚡ Best: {meta.best}
                </span>
                <span className="px-3 py-1 rounded-full font-semibold" style={{ background: `${meta.color}20`, color: meta.color }}>
                  💾 Space: {meta.space}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Visualizer area */}
        <div className="bg-base-100 rounded-2xl border border-base-300 p-6 shadow-sm">
          <div key={active} className="animate-fadeIn">
            {active === 'bubble' && <BubbleSortPanel />}
            {active === 'binary' && <BinarySearchPanel />}
            {active === 'selection' && <SelectionSortPanel />}
            {active === 'twoptr' && <TwoPointersPanel />}
          </div>
        </div>

        {/* How to use */}
        <div className="mt-6 rounded-2xl p-5 border border-base-300 bg-base-100">
          <h3 className="font-bold mb-3 text-sm">💡 How to use the visualizer</h3>
          <div className="grid md:grid-cols-4 gap-3 text-xs opacity-60">
            {[
              ['▶ Play', 'Auto-play all steps at selected speed'],
              ['⏮/⏭ Step', 'Move one step backward or forward'],
              ['1x/2x/4x', 'Control animation speed'],
              ['↩ Reset', 'Go back to the beginning'],
            ].map(([cmd, desc]) => (
              <div key={cmd} className="flex items-start gap-2">
                <span className="font-bold text-indigo-500 shrink-0">{cmd}</span>
                <span>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
