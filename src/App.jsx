import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

// Shared login
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Forget from "./pages/auth/Forget";

// Scientist pages
import Dashboard from "./pages/dashboard/Dashboard";
import SubmitProposal from "./pages/proposals/SubmitProposal";
import MyProposals from "./pages/proposals/MyProposals";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import ProposalManagement from "./pages/admin/ProposalManagement";
import ReviewerAssignment from "./pages/admin/ReviewerAssignment";
import ProposalDetails from "./components/proposal/ProposalDetails";

// Reviewer pages
import ReviewerDashboard from "./pages/reviewer pages/ReviewerDashboard";
import AssignedReviews from "./pages/reviewer pages/AssignedReviews";
import ReviewDetail from "./pages/reviewer pages/ReviewDetail";

// Helper
function getSavedRole() {
  try {

    const token = localStorage.getItem("token");

    if (!token) return null;

    const user = JSON.parse(localStorage.getItem("user"));

    return user?.role?.toUpperCase?.() ?? null;

  } catch {

    return null;

  }
}

export default function App() {

  const [role, setRole] = useState(() => {

    const saved = getSavedRole();

    const loggedIn =
      localStorage.getItem("loggedIn") === "true" ||
      localStorage.getItem("reviewerLoggedIn") === "true";

    return loggedIn ? saved : null;

  });

  const handleLogin = (data) => {

    const userRole = data.user?.role?.toUpperCase?.();

    if (userRole === "REVIEWER") {

      localStorage.setItem("reviewerLoggedIn", "true");
      localStorage.removeItem("loggedIn");

    } else {

      localStorage.setItem("loggedIn", "true");
      localStorage.removeItem("reviewerLoggedIn");

    }

    setRole(userRole);

  };

  const handleLogout = () => {

    localStorage.removeItem("loggedIn");
    localStorage.removeItem("reviewerLoggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setRole(null);

  };

  // Guards
  const scientistGuard = (element) =>
    role === "SCIENTIST"
      ? element
      : <Navigate to="/login" replace />;

  const reviewerGuard = (element) =>
    role === "REVIEWER"
      ? element
      : <Navigate to="/login" replace />;

  const adminGuard = (element) =>
    role === "ADMIN"
      ? element
      : <Navigate to="/login" replace />;

  // Redirect login
  const loginRedirect = () => {

    if (role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }

    if (role === "REVIEWER") {
      return <Navigate to="/reviewer/dashboard" replace />;
    }

    if (role === "SCIENTIST") {
      return <Navigate to="/dashboard" replace />;
    }

    return <Login onLogin={handleLogin} />;

  };

  // Default redirect
  const defaultRedirect = () => {

    if (role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }

    if (role === "REVIEWER") {
      return <Navigate to="/reviewer/dashboard" replace />;
    }

    if (role === "SCIENTIST") {
      return <Navigate to="/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;

  };

  return (

    <BrowserRouter>

      <Routes>

        {/* Login */}
        <Route
          path="/login"
          element={loginRedirect()}
        />

        <Route
          path="/reviewer/login"
          element={loginRedirect()}
        />

        {/*Signup*/}
        <Route path="/signup" element={<Signup />} />


        {/*Forget password*/}
        <Route
          path="/forget-password"
          element={<Forget />}
        />

        {/* Scientist */}
        <Route
          path="/dashboard"
          element={
            scientistGuard(
              <Dashboard onLogout={handleLogout} />
            )
          }
        />

        <Route
          path="/submit"
          element={
            scientistGuard(
              <SubmitProposal onLogout={handleLogout} />
            )
          }
        />

        <Route
          path="/myproposals"
          element={
            scientistGuard(
              <MyProposals onLogout={handleLogout} />
            )
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            adminGuard(
              <AdminDashboard onLogout={handleLogout} />
            )
          }
        />

        <Route
          path="/admin/users"
          element={
            adminGuard(
              <UserManagement onLogout={handleLogout} />
            )
          }
        />

        <Route
          path="/admin/proposals"
          element={
            adminGuard(
              <ProposalManagement onLogout={handleLogout} />
            )
          }
        />

        <Route
          path="/admin/proposals/:id"
          element={
            adminGuard(
              <ProposalDetails onLogout={handleLogout} />
            )
          }
        />

        <Route
          path="/admin/assignments"
          element={
            adminGuard(
              <ReviewerAssignment onLogout={handleLogout} />
            )
          }
        />
        {/* Reviewer */}
        <Route
          path="/reviewer/dashboard"
          element={
            reviewerGuard(
              <ReviewerDashboard onLogout={handleLogout} />
            )
          }
        />

        <Route
          path="/reviewer/assigned"
          element={
            reviewerGuard(
              <AssignedReviews onLogout={handleLogout} />
            )
          }
        />

        <Route
          path="/reviewer/project/:projectId"
          element={
            reviewerGuard(
              <ReviewDetail onLogout={handleLogout} />
            )
          }
        />

        {/* Fallback */}
        <Route
          path="*"
          element={defaultRedirect()}
        />

      </Routes>

    </BrowserRouter>
  );
}