import { Navigate, Outlet } from "react-router";

function ProtectedRoute({
  isAuthenticated,
  checkingAuth,
}) {

  // Still checking /user/check
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">

        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />

        <p className="text-sm opacity-50 font-medium">
          Loading CodeArena...
        </p>

      </div>
    );
  }

  // Authentication check completed but user isn't logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated
  return <Outlet />;
}

export default ProtectedRoute;