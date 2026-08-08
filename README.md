# ⚡ CodeArena — Full-Stack Algorithmic Coding Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://coding-platefrom.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend_API-Render-06b6d4?style=for-the-badge&logo=render&logoColor=white)](https://codingplatefrom.onrender.com)

> 🔗 **Live Web Application**: [https://coding-platefrom.vercel.app](https://coding-platefrom.vercel.app)  
> 🔗 **Live Backend API**: [https://codingplatefrom.onrender.com](https://codingplatefrom.onrender.com)

CodeArena is a modern, high-performance **LeetCode-style Competitive Programming Platform** built with **React, Node.js, Express, MongoDB, Redis, BullMQ, and Judge0**.

It features real-time code execution, asynchronous task queues, interactive algorithm visualizers, an AI tutor powered by Gemini, an admin management dashboard, and a public DSA blog.

---

## ✨ Features & Highlights

### 🎯 Core Platform Features
- 💻 **Monaco Code Editor**: Multi-language code editor supporting **JavaScript, C++, and Java** with syntax highlighting and auto-formatting.
- ⚡ **Asynchronous Code Execution (BullMQ + Judge0)**: Submissions and test-runs are offloaded to **BullMQ background workers** backed by **Redis**, returning fast `202 Accepted` status responses and smooth polling.
- 📊 **Submission History & Detailed Diagnostics**: Tracks runtime, memory usage, test cases passed/failed, and error output (Compilation Error, Runtime Error, Wrong Answer).
- 🎨 **LeetCode-Style Split Interface**: Resizable split panels allowing seamless context switching between Problem Description, Video Editorial, Solutions, Submissions, and AI Tutor.

### 🤖 AI Tutor & Interactive Tools
- 🤖 **AI Code Tutor (Gemini AI)**: Integrated AI assistant that provides hints, code explanations, and time complexity analysis tailored to the specific problem.
- 📊 **Algorithm Visualizer**: Interactive step-by-step animations for **Bubble Sort, Binary Search, Selection Sort, and Two Pointers**.
- 📚 **Public DSA Blog**: Comprehensive tutorials on Data Structures & Algorithms (Arrays, Binary Search, Dynamic Programming, Graphs) with syntax-highlighted code blocks — accessible without login.

### 🛡️ Admin Dashboard & Security
- ⚙️ **Admin Control Panel**: Full CRUD operations for creating, updating, and deleting coding problems, test cases, and video solution links.
- 🔒 **Secure Authentication**: User registration & login using **bcrypt** password hashing, **JWT tokens** stored in HTTP-only cross-site cookies, and role-based access control (User/Admin).
- 🌗 **Dark / Light Mode System**: Full theme toggling with smooth transitions and persistent state.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: TailwindCSS v4, DaisyUI v5
- **Code Editor**: `@monaco-editor/react`
- **State & Routing**: Redux Toolkit, React Router v7
- **Forms & Validation**: React Hook Form, Zod
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js, Express v5
- **Database**: MongoDB (Mongoose ORM)
- **Task Queue & Caching**: BullMQ, Redis (ioredis & redis client)
- **Code Execution Engine**: Judge0 API
- **AI Integration**: Google GenAI SDK (Gemini)
- **Authentication**: JWT, bcrypt, Cookie Parser

---

## 📂 Project Architecture

```
Coding Platform/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Redis & BullMQ Queue configurations
│   │   ├── controllers/     # Express route handlers (auth, problem, submission, AI)
│   │   ├── middleware/      # Auth & role validation middlewares
│   │   ├── models/          # Mongoose Schemas (User, Problem, Submission)
│   │   ├── routes/          # Express Routers
│   │   ├── utils/           # Judge0 helpers, validators, utility functions
│   │   ├── workers/         # BullMQ background queue workers (submissionWorker, runWorker)
│   │   └── index.js         # Server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Admin panels, ChatAI, Editorials, Visualizers
│   │   ├── hooks/           # Custom React hooks (useTheme, etc.)
│   │   ├── pages/           # Landing, Homepage, ProblemPage, Blog, Admin, Auth
│   │   ├── utils/           # Axios Client configuration
│   │   ├── App.jsx          # Routes & main layout
│   │   └── index.css        # Global CSS & Tailwind utilities
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## ⚙️ Environment Configuration

### Backend Setup (`backend/.env`)

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
DB_CONNECT_STRING=mongodb+srv://<username>:<password>@cluster.mongodb.net/codearena
JWT_KEY=your_jwt_secret_key

# Redis Configuration (Used by BullMQ & Caching)
REDIS_HOST=your_redis_host
REDIS_PORT=14670
REDIS_PASS=your_redis_password

# External APIs
JUDGE0_URL=https://judge0-ce.p.rapidapi.com  # or self-hosted Judge0 instance
JUDGE0_KEY=your_rapidapi_judge0_key
GEMINI_KEY=your_google_gemini_api_key

# Cloudinary (Video Editorials)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend Setup (`frontend/.env`)

Create a `.env` file inside the `frontend/` directory for local development:

```env
VITE_API_URL=http://localhost:5000
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm
- MongoDB Instance
- Redis Instance (Redis Cloud or Local Redis Server)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/CodeArena.git
cd CodeArena
```

### 2️⃣ Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### 3️⃣ Start the Servers

**Terminal 1 — Backend Server:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend Dev Server:**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser! 🚀

---

## ⚡ Asynchronous Task Flow (BullMQ + Judge0)

```
[ User Code Submission ] ──> [ Express Controller ] ──> Creates MongoDB Submission (pending)
                                      │
                                      ├──> Enqueues Job into BullMQ (submissionQueue / runQueue)
                                      └──> Immediately Returns 202 Accepted { submissionId }
                                                    │
                                                    ▼
                                      [ BullMQ Worker Process ]
                                            ├── Submits Batch to Judge0 API
                                            ├── Polls Execution Token Results
                                            └── Updates MongoDB / Caches in Redis
                                                    │
[ Frontend Polling ] ───────────────────────────────┴──> Receives Final Execution Results
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues tab.

---

## 📜 License

This project is licensed under the ISC License.
