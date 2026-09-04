import { useState } from 'react';
import { NavLink, useParams } from 'react-router';
import { useSelector } from 'react-redux';
import useTheme from '../hooks/useTheme';

// ─── Full Blog Content ─────────────────────────────────────────────────────────
export const BLOG_POSTS = [
  {
    slug: 'arrays-two-pointers',
    tag: 'Arrays',
    tagColor: '#6366f1',
    title: 'Mastering Arrays: From Basics to Two Pointers',
    time: '8 min read',
    icon: '📦',
    topics: ['Traversal', 'Prefix Sum', 'Two Pointers', 'Sliding Window'],
    excerpt: 'Arrays are the foundation of DSA. Learn traversal, sliding window, prefix sums, and the two-pointer technique with real LeetCode problems.',
    content: [
      {
        heading: 'What is an Array?',
        body: `An array is a contiguous block of memory storing elements of the same type. Accessing any element by index is O(1) — the fundamental reason arrays are so powerful.

Key operations: access O(1), search O(n), insert/delete O(n).`,
        code: `// Traverse an array
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}

// Or with for...of
for (const val of arr) {
  console.log(val);
}`,
        lang: 'javascript',
      },
      {
        heading: 'Prefix Sum — Solve Range Queries in O(1)',
        body: `Instead of summing a subarray every time (O(n) per query), build a prefix sum array once (O(n)) and answer any range [l, r] query in O(1).`,
        code: `function buildPrefix(arr) {
  const prefix = [0];
  for (const x of arr) {
    prefix.push(prefix[prefix.length - 1] + x);
  }
  return prefix;
}

// Sum from index l to r (inclusive)
function rangeSum(prefix, l, r) {
  return prefix[r + 1] - prefix[l];
}`,
        lang: 'javascript',
      },
      {
        heading: 'Two Pointers Technique',
        body: `Two pointers work on sorted arrays or when you need to find a pair. One pointer starts at the left, one at the right. Move them based on the current sum vs target.

Time: O(n), Space: O(1).`,
        code: `function twoSum(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return [left, right];
    else if (sum < target) left++;
    else right--;
  }
  return [-1, -1];
}`,
        lang: 'javascript',
      },
      {
        heading: 'Sliding Window',
        body: `A sliding window maintains a "window" of elements and slides it across the array. Perfect for max/min subarray of fixed size or longest substring problems.`,
        code: `// Maximum sum subarray of size k
function maxSumK(arr, k) {
  let windowSum = arr.slice(0, k).reduce((a, b) => a + b, 0);
  let maxSum = windowSum;
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k];
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}`,
        lang: 'javascript',
      },
    ],
  },
  {
    slug: 'binary-search',
    tag: 'Binary Search',
    tagColor: '#8b5cf6',
    title: 'Binary Search: Think in Halves',
    time: '6 min read',
    icon: '🔍',
    topics: ['Classic BS', 'Rotated Array', 'Search Space', 'Lower Bound'],
    excerpt: 'Binary search is not just for sorted arrays. Discover how to apply it on answer spaces, rotated arrays, and monotonic functions.',
    content: [
      {
        heading: 'Classic Binary Search',
        body: `Binary search eliminates half the search space each step. Works on sorted arrays. Time: O(log n).`,
        code: `function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
        lang: 'javascript',
      },
      {
        heading: 'Lower Bound & Upper Bound',
        body: `Lower bound = first position where arr[pos] >= target. Upper bound = first position where arr[pos] > target. These are the building blocks of many binary search patterns.`,
        code: `function lowerBound(arr, target) {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}`,
        lang: 'javascript',
      },
      {
        heading: 'Binary Search on Answer Space',
        body: `Many problems ask "find minimum X such that condition(X) is true". If the condition is monotonic, binary search on the answer!

Example: Minimum days to make m bouquets.`,
        code: `// Is it possible to make m bouquets in 'days' days?
function isPossible(bloomDay, m, k, days) {
  let bouquets = 0, flowers = 0;
  for (const d of bloomDay) {
    if (d <= days) { flowers++; }
    else flowers = 0;
    if (flowers === k) { bouquets++; flowers = 0; }
  }
  return bouquets >= m;
}`,
        lang: 'javascript',
      },
    ],
  },
  {
    slug: 'dynamic-programming',
    tag: 'Dynamic Programming',
    tagColor: '#06b6d4',
    title: 'Dynamic Programming: From Recursion to Tabulation',
    time: '12 min read',
    icon: '🧩',
    topics: ['Memoization', 'Tabulation', 'Knapsack', 'LCS'],
    excerpt: 'Break down overlapping subproblems. We cover memoization, tabulation, knapsack, LCS, and the thought process behind every DP problem.',
    content: [
      {
        heading: 'What is Dynamic Programming?',
        body: `DP = Recursion + Memoization. If a problem has overlapping subproblems and optimal substructure, DP can reduce exponential time to polynomial.

Step 1: Define state. Step 2: Write recurrence. Step 3: Add base cases. Step 4: Optimize with memo/table.`,
        code: `// Fibonacci — Naive O(2^n)
function fib(n) {
  if (n <= 1) return n;
  return fib(n-1) + fib(n-2);
}

// Fibonacci — Memoized O(n)
function fibMemo(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  return memo[n] = fibMemo(n-1, memo) + fibMemo(n-2, memo);
}`,
        lang: 'javascript',
      },
      {
        heading: '0/1 Knapsack',
        body: `Given items with weights and values, and a capacity W, maximize value without exceeding capacity. Each item can be taken at most once.`,
        code: `function knapsack(weights, values, W) {
  const n = weights.length;
  // dp[i][w] = max value using first i items with capacity w
  const dp = Array.from({length: n+1}, () => new Array(W+1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= W; w++) {
      dp[i][w] = dp[i-1][w]; // skip item i
      if (weights[i-1] <= w)
        dp[i][w] = Math.max(dp[i][w], dp[i-1][w-weights[i-1]] + values[i-1]);
    }
  }
  return dp[n][W];
}`,
        lang: 'javascript',
      },
      {
        heading: 'Longest Common Subsequence',
        body: `LCS is the foundation for diff tools, DNA comparison, and spell checkers. The key insight: if characters match, add 1 to LCS of previous prefixes.`,
        code: `function lcs(s1, s2) {
  const m = s1.length, n = s2.length;
  const dp = Array.from({length: m+1}, () => new Array(n+1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i-1] === s2[j-1]) dp[i][j] = dp[i-1][j-1] + 1;
      else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
    }
  }
  return dp[m][n];
}`,
        lang: 'javascript',
      },
    ],
  },
  {
    slug: 'graph-algorithms',
    tag: 'Graphs',
    tagColor: '#22d3ee',
    title: 'Graph Algorithms: BFS, DFS & Beyond',
    time: '10 min read',
    icon: '🕸️',
    topics: ['BFS', 'DFS', 'Dijkstra', 'Union-Find'],
    excerpt: 'Graphs model real-world problems. Learn BFS, DFS, Dijkstra, topological sort, and union-find with step-by-step visualizations.',
    content: [
      {
        heading: 'BFS — Breadth-First Search',
        body: `BFS explores layer by layer using a queue. Perfect for shortest path in unweighted graphs. Time: O(V + E).`,
        code: `function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  while (queue.length) {
    const node = queue.shift();
    console.log(node);
    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
}`,
        lang: 'javascript',
      },
      {
        heading: 'Dijkstra\'s Algorithm',
        body: `Shortest path from source to all nodes in a weighted graph (no negative weights). Uses a min-heap for O((V+E) log V).`,
        code: `function dijkstra(graph, src) {
  const dist = {};
  const pq = [[0, src]]; // [distance, node]
  dist[src] = 0;
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift();
    if (d > (dist[u] ?? Infinity)) continue;
    for (const [v, w] of graph[u] || []) {
      if ((dist[u] + w) < (dist[v] ?? Infinity)) {
        dist[v] = dist[u] + w;
        pq.push([dist[v], v]);
      }
    }
  }
  return dist;
}`,
        lang: 'javascript',
      },
      {
        heading: 'Cycle Detection with Union-Find',
        body: `Union-Find (Disjoint Set Union) is the fastest way to detect cycles in undirected graphs. Find the root of each node; if two nodes share a root before union, a cycle exists.`,
        code: `class UnionFind {
  constructor(n) { this.parent = Array.from({length:n},(_,i)=>i); }
  find(x) { return this.parent[x]===x ? x : (this.parent[x]=this.find(this.parent[x])); }
  union(x, y) {
    const px=this.find(x), py=this.find(y);
    if(px===py) return false; // cycle!
    this.parent[px]=py;
    return true;
  }
}`,
        lang: 'javascript',
      },
    ],
  },
  {
    slug: 'stack-and-queue',
    tag: 'Stack & Queue',
    tagColor: '#a78bfa',
    title: 'Stack & Queue: Monotonic Patterns',
    time: '7 min read',
    icon: '📚',
    topics: ['Stack', 'Queue', 'Monotonic Stack', 'Next Greater Element'],
    excerpt: 'Stacks and queues power some of the most elegant patterns in DSA. Learn monotonic stacks, implement queue with stacks, and solve sliding window max.',
    content: [
      {
        heading: 'Stack Basics & Monotonic Stack',
        body: `A monotonic stack maintains elements in sorted order (increasing or decreasing). When you push a new element, pop everything that violates the invariant.\n\nPerfect for: Next Greater Element, Largest Rectangle in Histogram, Daily Temperatures.`,
        code: `// Next Greater Element to the right
function nextGreater(arr) {
  const result = new Array(arr.length).fill(-1);
  const stack = []; // stores indices
  for (let i = 0; i < arr.length; i++) {
    while (stack.length && arr[stack.at(-1)] < arr[i]) {
      result[stack.pop()] = arr[i];
    }
    stack.push(i);
  }
  return result;
}`,
        lang: 'javascript',
      },
      {
        heading: 'Implement Queue using Two Stacks',
        body: `A classic interview problem. Use two stacks: one for push (inbox), one for pop (outbox). When outbox is empty, pour all of inbox into it — amortized O(1) per operation.`,
        code: `class MyQueue {
  constructor() { this.inbox = []; this.outbox = []; }
  push(val) { this.inbox.push(val); }
  pop() {
    if (!this.outbox.length)
      while (this.inbox.length) this.outbox.push(this.inbox.pop());
    return this.outbox.pop();
  }
  peek() {
    if (!this.outbox.length)
      while (this.inbox.length) this.outbox.push(this.inbox.pop());
    return this.outbox.at(-1);
  }
  empty() { return !this.inbox.length && !this.outbox.length; }
}`,
        lang: 'javascript',
      },
      {
        heading: 'Sliding Window Maximum',
        body: `Find the maximum in every window of size k. Use a deque to maintain a decreasing monotonic queue of indices. O(n) total.`,
        code: `function maxSlidingWindow(nums, k) {
  const result = [];
  const deque = []; // stores indices, front = max
  for (let i = 0; i < nums.length; i++) {
    // Remove indices outside window
    while (deque.length && deque[0] < i - k + 1) deque.shift();
    // Remove smaller elements from back
    while (deque.length && nums[deque.at(-1)] < nums[i]) deque.pop();
    deque.push(i);
    if (i >= k - 1) result.push(nums[deque[0]]);
  }
  return result;
}`,
        lang: 'javascript',
      },
    ],
  },
  {
    slug: 'trees-and-bst',
    tag: 'Trees',
    tagColor: '#34d399',
    title: 'Trees & BSTs: Traversal, LCA & More',
    time: '9 min read',
    icon: '🌳',
    topics: ['DFS', 'BFS', 'Level Order', 'LCA', 'BST'],
    excerpt: 'From inorder traversal to lowest common ancestor — master every tree pattern used in interviews with clear examples and O(n) solutions.',
    content: [
      {
        heading: 'Tree Traversals (DFS)',
        body: `Three DFS orderings: Inorder (Left → Root → Right), Preorder (Root → Left → Right), Postorder (Left → Right → Root).\n\nFor a BST, inorder always gives a sorted sequence.`,
        code: `function inorder(root, result = []) {
  if (!root) return result;
  inorder(root.left, result);
  result.push(root.val);
  inorder(root.right, result);
  return result;
}

function preorder(root, result = []) {
  if (!root) return result;
  result.push(root.val);
  preorder(root.left, result);
  preorder(root.right, result);
  return result;
}`,
        lang: 'javascript',
      },
      {
        heading: 'Level Order Traversal (BFS)',
        body: `Use a queue. Each iteration processes one full level. Track level size to group nodes per level.`,
        code: `function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  while (queue.length) {
    const level = [];
    const size = queue.length;
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left)  queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}`,
        lang: 'javascript',
      },
      {
        heading: 'Lowest Common Ancestor (LCA)',
        body: `LCA of nodes p and q is the deepest node that has both as descendants. Classic recursive solution: if current node is p or q, return it. Otherwise merge answers from left and right subtrees.`,
        code: `function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root;
  const left  = lowestCommonAncestor(root.left,  p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  // If both sides return non-null, root is LCA
  if (left && right) return root;
  return left || right;
}`,
        lang: 'javascript',
      },
    ],
  },
];

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
function ThemeToggle({ isDark, toggleTheme }) {
  return (
    <button onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all"
      style={{ borderColor: '#E5E7EB', background: isDark ? '#1C1C1C' : '#F9FAFB' }}
      aria-label="Toggle theme">
      {isDark ? (
        <><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 110 10A5 5 0 0112 7z" /></svg></>
      ) : (
        <><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#64748B' }}><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg></>
      )}
    </button>
  );
}

// ─── Code Block Component ─────────────────────────────────────────────────────
function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="relative rounded-xl overflow-hidden my-4 code-surface border-0">
      <div className="flex items-center justify-between px-4 py-2" style={{ background: '#1E293B' }}>
        <div className="flex items-center gap-1.5">
          {['#ef4444','#eab308','#22c55e'].map(c => <div key={c} className="w-2.5 h-2.5 rounded-full opacity-80" style={{ background: c }} />)}
          <span className="text-xs opacity-40 ml-2 font-mono">{lang}</span>
        </div>
        <button onClick={copy} className="text-xs opacity-50 hover:opacity-100 transition-opacity px-2 py-0.5 rounded text-slate-300">
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-6 font-mono" style={{ background: '#0F172A', color: '#93C5FD' }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── Blog List Page ────────────────────────────────────────────────────────────
export function BlogListPage() {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated } = useSelector(s => s.auth);

  return (
    <div className="min-h-screen bg-base-200">
      <nav className="sticky top-0 z-40 navbar-clean shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: '#1D4ED8' }}>&lt;/&gt;</div>
            <span className="font-extrabold text-lg tracking-tight">CodeArena</span>
          </NavLink>
          <div className="flex items-center gap-3">
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            {isAuthenticated
              ? <NavLink to="/home" className="btn-blue px-4 py-2 rounded-lg text-sm">Dashboard →</NavLink>
              : <NavLink to="/login" className="btn-outline-blue px-4 py-2 rounded-lg text-sm">Login</NavLink>}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12 animate-slideUp">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#1D4ED8' }}>DSA Blog</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Learn the Concepts.
          </h1>
          <p className="max-w-xl" style={{ color: '#64748B' }}>Deep-dive articles on the most important DSA topics. No login required — read freely!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {BLOG_POSTS.map((post, i) => (
            <NavLink key={post.slug} to={`/blog/${post.slug}`}
              className="card-clean p-6 block animate-slideUp"
              style={{ animationDelay:`${i*0.07}s`, animationFillMode:'both' }}>
              <div className="text-4xl mb-4">{post.icon}</div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full mb-3 inline-block"
                style={{ background: '#EFF6FF', color: '#1D4ED8' }}>{post.tag}</span>
              <h2 className="text-xl font-bold mb-2 leading-snug">{post.title}</h2>
              <p className="text-sm leading-relaxed mb-4" style={{ color: '#64748B' }}>{post.excerpt}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {post.topics.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-md"
                  style={{ background: '#EFF6FF', color: '#1D4ED8' }}>{t}</span>)}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: '#94A3B8' }}>⏱ {post.time}</span>
                <span className="font-semibold" style={{ color: '#1D4ED8' }}>Read Article →</span>
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Blog Detail Page ─────────────────────────────────────────────────────────
export function BlogDetailPage() {
  const { slug } = useParams();
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated } = useSelector(s => s.auth);
  const post = BLOG_POSTS.find(p => p.slug === slug);

  if (!post) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="text-6xl">🔍</div>
      <p className="text-xl font-bold">Article not found</p>
      <NavLink to="/blog" className="btn-blue px-4 py-2 rounded-lg text-sm">← Back to Blog</NavLink>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-200">
      <nav className="sticky top-0 z-40 navbar-clean shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NavLink to="/blog" className="text-sm flex items-center gap-1 transition-colors hover:text-blue-700" style={{ color: '#64748B' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> Blog
            </NavLink>
            <span className="opacity-20">/</span>
            <span className="text-sm font-semibold truncate max-w-[200px]">{post.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            {isAuthenticated
              ? <NavLink to="/home" className="btn-blue px-4 py-2 rounded-lg text-sm">Dashboard →</NavLink>
              : <NavLink to="/login" className="btn-outline-blue px-4 py-2 rounded-lg text-sm">Login</NavLink>}
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Post header */}
        <div className="mb-10 animate-slideUp">
          <div className="text-5xl mb-4">{post.icon}</div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full mb-4 inline-block"
            style={{ background: '#EFF6FF', color: '#1D4ED8' }}>{post.tag}</span>
          <h1 className="text-4xl font-black tracking-tight mt-3 mb-3 leading-tight">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: '#94A3B8' }}>
            <span>⏱ {post.time}</span>
            <div className="flex gap-2">{post.topics.map(t => <span key={t} className="px-2 py-0.5 rounded-md text-xs"
              style={{ background: '#EFF6FF', color: '#1D4ED8' }}>{t}</span>)}</div>
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-10">
          {post.content.map((section, i) => (
            <div key={i} className="animate-slideUp" style={{ animationDelay:`${i*0.1}s`, animationFillMode:'both' }}>
              <h2 className="text-2xl font-bold mb-3" style={{ color: '#1D4ED8' }}>{section.heading}</h2>
              <p className="text-base leading-relaxed whitespace-pre-line mb-2" style={{ color: '#374151' }}>{section.body}</p>
              {section.code && <CodeBlock code={section.code} lang={section.lang} />}
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 rounded-2xl p-8 text-center card-clean animate-slideUp">
          <p className="font-bold text-lg mb-2">Ready to practice?</p>
          <p className="text-sm mb-6" style={{ color: '#64748B' }}>Solve {post.tag} problems on our platform</p>
          <div className="flex gap-3 justify-center">
            <NavLink to="/blog" className="btn-outline-blue px-4 py-2 rounded-lg text-sm">← More Articles</NavLink>
            <NavLink to={isAuthenticated ? '/home' : '/signup'}
              className="btn-blue px-4 py-2 rounded-lg text-sm">
              {isAuthenticated ? 'Solve Problems →' : 'Sign Up Free →'}
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}
