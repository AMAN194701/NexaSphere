import { useAuth } from "../context/AuthContext";

const RoleSidebar = () => {
  const { user } = useAuth();

  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-5">

      <h1 className="text-2xl font-bold mb-6">
        Dashboard
      </h1>

      <ul className="space-y-4">

        <li>Home</li>

        {(user?.role === "ADMIN" ||
          user?.role === "SUPER_ADMIN") && (
          <li>User Management</li>
        )}

        {(user?.role === "MENTOR" ||
          user?.role === "ADMIN") && (
          <li>Mentor Panel</li>
        )}

        {user?.role === "STUDENT" && (
          <li>Student Dashboard</li>
        )}

      </ul>
    </div>
  );
};

export default RoleSidebar;