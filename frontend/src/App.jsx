import { Routes, Route, Navigate } from "react-router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import LandingPage from "./pages/LandingPage";
import AlgorithmPage from "./pages/AlgorithmPage";
import { BlogListPage, BlogDetailPage } from "./pages/BlogPage";
import { useDispatch, useSelector } from "react-redux";
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
import ProfilePage from "./pages/ProfilePage";

import useTheme from "./hooks/useTheme";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const dispatch = useDispatch();

  const {
    isAuthenticated,
    user,
    checkingAuth,
  } = useSelector((state) => state.auth);

  // Apply saved theme
  useTheme();

  // Check authentication when app starts
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <Routes>

      {/* =========================================
          PUBLIC ROUTES
          These routes DON'T wait for /user/check
      ========================================= */}

      <Route
        path="/"
        element={<LandingPage />}
      />

      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to="/home" replace />
            : <Login />
        }
      />

      <Route
        path="/signup"
        element={
          isAuthenticated
            ? <Navigate to="/home" replace />
            : <Signup />
        }
      />

      <Route
        path="/problem/:problemId"
        element={<ProblemPage />}
      />

      <Route
        path="/algorithms"
        element={<AlgorithmPage />}
      />

      <Route
        path="/blog"
        element={<BlogListPage />}
      />

      <Route
        path="/blog/:slug"
        element={<BlogDetailPage />}
      />


      {/* =========================================
          PROTECTED ROUTES
      ========================================= */}

      <Route
        element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            checkingAuth={checkingAuth}
          />
        }
      >

        {/* HOME */}
        <Route
          path="/home"
          element={<Homepage />}
        />

        {/* PROFILE */}
        <Route
          path="/profile"
          element={<ProfilePage />}
        />


        {/* =====================================
            ADMIN ROUTES
        ===================================== */}

        <Route
          path="/admin"
          element={
            user?.role === "admin"
              ? <Admin />
              : <Navigate to="/" replace />
          }
        />

        <Route
          path="/admin/create"
          element={
            user?.role === "admin"
              ? <AdminPanel />
              : <Navigate to="/" replace />
          }
        />

        <Route
          path="/admin/delete"
          element={
            user?.role === "admin"
              ? <AdminDelete />
              : <Navigate to="/" replace />
          }
        />

        <Route
          path="/admin/video"
          element={
            user?.role === "admin"
              ? <AdminVideo />
              : <Navigate to="/" replace />
          }
        />

        <Route
          path="/admin/updateList"
          element={
            user?.role === "admin"
              ? <AdminUpdateList />
              : <Navigate to="/" replace />
          }
        />

        <Route
          path="/admin/update/:problemId"
          element={
            user?.role === "admin"
              ? <AdminUpdate />
              : <Navigate to="/" replace />
          }
        />

        <Route
          path="/admin/upload/:problemId"
          element={
            user?.role === "admin"
              ? <AdminUpload />
              : <Navigate to="/" replace />
          }
        />

      </Route>

    </Routes>
  );
}

export default App;