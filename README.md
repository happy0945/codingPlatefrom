# 🚀 Project Setup Guide

This project consists of both **Backend** and **Frontend**.  
Follow the steps below to set up and run the project successfully.

---

# 📌 Prerequisites

Make sure you have installed:

- Node.js
- npm (Node Package Manager)
- MongoDB (or your database)
- Redis (if required)

---

# ⚙️ Environment Variables

Create a `.env` file inside the `backend` folder and add the following variables:

```env
PORT=5000
DB_CONNECT_STRING=your_database_url
JWT_KEY=your_secret_jwt_key
REDIS_PASS=your_redis_password
JUDGE0_KEY=your_judge0_api_key
GEMINI_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_secret_key
```

⚠️ Replace all placeholder values with your actual credentials.

---

# 📦 Installation Steps

Open terminal and follow these steps:

## 1️⃣ Install Backend Dependencies

```bash
cd backend
npm install
```

## 2️⃣ Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

# ▶️ Run the Project

You need to run both backend and frontend separately.

## 🔹 Start Backend Server

```bash
cd backend
npm run dev
```

## 🔹 Start Frontend Server

```bash
cd frontend
npm run dev
```

---

# 🧩 Project Structure

```bash
project-root/
│
├── backend/      # Node.js Backend
├── frontend/     # React Frontend
└── README.md
```

---

# 🔑 Features Used

- JWT Authentication
- Redis Caching
- Judge0 API (Code Execution)
- Gemini API (AI Features)
- Cloudinary (Media Storage)

---

# ❗ Notes

- Ensure `.env` file is correctly configured before running the backend.
- Run backend and frontend in separate terminals.
- Make sure all APIs and services are active.
