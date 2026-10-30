import { Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Activity from "./pages/Activity";
import Nutrition from "./pages/Nutrition";
import Workout from "./pages/Workout";
import Suggestions from "./pages/Suggestions";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";

function MainLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Header />
        <main className="p-6">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/workout" element={<Workout />} />
            <Route path="/suggestions" element={<Suggestions />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// Only admin users can access /admin
function AdminRoute() {
  let user = null;

  try {
    user = JSON.parse(
      localStorage.getItem("fittrack-current-user") || "null"
    );
  } catch {
    user = null;
  }

  if (!localStorage.getItem("fittrack-token")) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <AdminDashboard />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<AdminRoute />} />
      <Route path="/*" element={<MainLayout />} />
    </Routes>
  );
}