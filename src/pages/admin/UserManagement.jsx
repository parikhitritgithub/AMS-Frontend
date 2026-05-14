import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import AdminSidebar from "../../components/admin/AdminSidebar";
import UserFilters from "../../components/admin/usermanagement/UserFilters";
import UserTable from "../../components/admin/usermanagement/UserTable";

export default function UserManagement({ onLogout, user }) {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Add User Modal
  const [showAddModal, setShowAddModal] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "REVIEWER",
    expertise: "",
  });

  const LIMIT = 5;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === "" || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === "all" || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          toast.error("No authentication token found");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `${API_BASE_URL}/api/admin/users?page=${currentPage}&limit=${LIMIT}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUsers(res.data.users || []);
        setTotalPages(res.data.pagination?.totalPages || 1);

      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          toast.error("Session expired. Please login again.");
          setTimeout(() => onLogout?.(), 2000);
        } else {
          toast.error(err.response?.data?.message || "Failed to load users");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, API_BASE_URL, onLogout]);

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!newUser.name.trim()) {
      toast.error("Please enter a name");
      return;
    }
    
    if (!newUser.email.trim()) {
      toast.error("Please enter an email");
      return;
    }
    
    if (!newUser.password.trim()) {
      toast.error("Please enter a password");
      return;
    }
    
    if (newUser.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    if (!newUser.expertise) {
      toast.error("Please select an expertise");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error("You must be logged in to add users");
        return;
      }

      let expertiseArray = [newUser.expertise];

      const payload = {
        name: newUser.name.trim(),
        email: newUser.email.trim().toLowerCase(),
        password: newUser.password,
        role: newUser.role,
        expertise: expertiseArray,
      };

      const res = await axios.post(
        `${API_BASE_URL}/api/auth/register`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(res.data?.message || "User added successfully");

      setShowAddModal(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "REVIEWER",
        expertise: "",
      });
      setCurrentPage(1);

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add user");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      await axios.delete(
        `${API_BASE_URL}/api/admin/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("User deleted successfully");
      setUsers(users.filter(user => user.id !== userId));
      
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleEditUser = async (userId, updatedData) => {
    try {
      const token = localStorage.getItem("token");
      
      const res = await axios.put(
        `${API_BASE_URL}/api/admin/users/${userId}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(res.data?.message || "User updated successfully");
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...updatedData } : user
      ));
      
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update user");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar onLogout={onLogout} user={user} />

      <main className="flex-1 px-8 py-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            User Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all users in the system and assign roles.
          </p>
        </div>

        <UserFilters
          onAddUser={() => setShowAddModal(true)}
          onSearch={setSearchTerm}
          onFilterRole={setFilterRole}
        />

        {loading ? (
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="divide-y divide-gray-100">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 flex-1 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <UserTable 
            users={filteredUsers} 
            onDeleteUser={handleDeleteUser}
            onEditUser={handleEditUser}
          />
        )}

        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || loading}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>

          <span className="font-medium">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage >= totalPages || loading}
            className="px-4 py-2 border rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            Next
          </button>
        </div>

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold mb-6">Add New User</h2>

              <form onSubmit={handleAddUser} className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                <input
                  type="email"
                  placeholder="Email Address *"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                <input
                  type="password"
                  placeholder="Password * (min 6 characters)"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="REVIEWER">Reviewer</option>
                  <option value="STUDENT">Student</option>
                </select>

                <select
                  value={newUser.expertise}
                  onChange={(e) => setNewUser({ ...newUser, expertise: e.target.value })}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled hidden>Select Expertise Area *</option>
                  <option value="COMPUTER_SCIENCE">Computer Science</option>
                  <option value="AGRICULTURE">Agriculture</option>
                  <option value="BIOTECHNOLOGY">Biotechnology</option>
                  <option value="MECHANICAL">Mechanical Engineering</option>
                  <option value="CIVIL">Civil Engineering</option>
                  <option value="Soil Science">Soil Science</option>
                  <option value="Crop Science">Crop Science</option>
                  <option value="Forestry">Forestry</option>
                  <option value="Food Technology">Food Technology</option>
                </select>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
                  >
                    Add User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}