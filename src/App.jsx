import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";

import ProtectedRoute from "./components/ProtectedRoute";

function Home() {
  return <h1>Home Page</h1>;
}

function AdminDashboard() {
  return <h1>Admin Dashboard</h1>;
}

function MentorDashboard() {
  return <h1>Mentor Dashboard</h1>;
}

function App() {
  return (
    <Routes>

      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/unauthorized"
        element={<Unauthorized />}
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute
            allowedRoles={["ADMIN", "SUPER_ADMIN"]}
          >
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mentor"
        element={
          <ProtectedRoute
            allowedRoles={["MENTOR", "ADMIN"]}
          >
            <MentorDashboard />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;