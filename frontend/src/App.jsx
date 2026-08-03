import { Routes, Route, Navigate } from "react-router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import LandingPage from "./pages/LandingPage";
import AlgorithmPage from "./pages/AlgorithmPage";
import { BlogListPage, BlogDetailPage } from "./pages/BlogPage";
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from "./authSlice";
import { useEffect } from "react";
import AdminPanel from "./components/AdminPanel";
import ProblemPage from "./pages/ProblemPage";
import Admin from "./pages/Admin";
import AdminVideo from "./components/AdminVideo";
import AdminDelete from "./components/AdminDelete";
import AdminUpload from "./components/AdminUpload";
import AdminUpdate from "./components/AdminUpdate";
import AdminUpdateList from "./components/AdminUpdateList";
import useTheme from "./hooks/useTheme";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  // Apply saved theme on boot
  useTheme();

  // Check initial authentication
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
        <p className="text-sm opacity-50 font-medium">Loading CodeArena...</p>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public landing page — always accessible */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth pages — redirect if already logged in */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/home" /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/home" /> : <Signup />}
        />

        {/* Protected home (problem list) */}
        <Route
          path="/home"
          element={isAuthenticated ? <Homepage /> : <Navigate to="/login" />}
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={isAuthenticated && user?.role === 'admin' ? <Admin /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/create"
          element={isAuthenticated && user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/delete"
          element={isAuthenticated && user?.role === 'admin' ? <AdminDelete /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/video"
          element={isAuthenticated && user?.role === 'admin' ? <AdminVideo /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/updateList"
          element={isAuthenticated && user?.role === 'admin' ? <AdminUpdateList /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/update/:problemId"
          element={isAuthenticated && user?.role === 'admin' ? <AdminUpdate /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/upload/:problemId"
          element={isAuthenticated && user?.role === 'admin' ? <AdminUpload /> : <Navigate to="/" />}
        />

        {/* Problem page */}
        <Route path="/problem/:problemId" element={<ProblemPage />} />

        {/* Public algorithm visualizer */}
        <Route path="/algorithms" element={<AlgorithmPage />} />

        {/* Public blog — no auth needed */}
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
      </Routes>
    </>
  );
}

export default App;