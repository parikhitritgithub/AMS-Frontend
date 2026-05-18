import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Plus, Search, Filter, X, ChevronLeft, ChevronRight, CheckCircle, XCircle, Edit, Trash2, User, Mail, Building, Award, RefreshCw } from "lucide-react";

import AdminSidebar from "../../components/admin/AdminSidebar";

// Status Badge Component
function StatusBadge({ isActive }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
      isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
    }`}>
      {isActive ? <CheckCircle size={10} /> : <XCircle size={10} />}
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

// Role Badge Component
function RoleBadge({ role }) {
  const roleConfig = {
    SCIENTIST: { label: "Scientist", color: "bg-blue-100 text-blue-700" },
    REVIEWER: { label: "Reviewer", color: "bg-purple-100 text-purple-700" },
    ADMIN: { label: "Admin", color: "bg-red-100 text-red-700" }
  };
  const config = roleConfig[role] || { label: role, color: "bg-gray-100 text-gray-700" };
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
}

// Skeleton Loader
function TableRowSkeleton() {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      <td className="py-3 px-4"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
      <td className="py-3 px-4"><div className="h-4 w-40 bg-gray-200 rounded"></div></td>
      <td className="py-3 px-4"><div className="h-6 w-20 bg-gray-200 rounded-full"></div></td>
      <td className="py-3 px-4"><div className="h-6 w-16 bg-gray-200 rounded-full"></div></td>
      <td className="py-3 px-4"><div className="h-8 w-24 bg-gray-200 rounded"></div></td>
    </tr>
  );
}

// Change Role Modal// Change Role Modal - ensure expertise is being collected properly
function ChangeRoleModal({ user, onClose, onUpdate }) {
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [expertise, setExpertise] = useState(user.expertise || []);
  const [loading, setLoading] = useState(false);
  const [showExpertise, setShowExpertise] = useState(selectedRole === "REVIEWER");

  const expertiseOptions = [
    "COMPUTER_SCIENCE",
    "AGRICULTURE",
    "BIOTECHNOLOGY",
    "MECHANICAL",
    "CIVIL",
    "Soil Science",
    "Crop Science",
    "Forestry",
    "Food Technology"
  ];

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setShowExpertise(role === "REVIEWER");
    if (role !== "REVIEWER") {
      setExpertise([]);
    }
  };

  const handleExpertiseChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    console.log("Selected expertise in modal:", selectedOptions); // Debug
    setExpertise(selectedOptions);
  };

  const handleSubmit = async () => {
    // Validate expertise for reviewer role
    if (selectedRole === "REVIEWER" && expertise.length === 0) {
      toast.error("Please select at least one expertise area for reviewer");
      return;
    }
    
    setLoading(true);
    console.log("Submitting role update:", { 
      userId: user.id, 
      role: selectedRole, 
      expertise: expertise 
    });
    
    // Pass the expertise array to the update function
    await onUpdate(user.id, selectedRole, expertise);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Change Role</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User: {user.name}</label>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select New Role</label>
            <select
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SCIENTIST">Scientist</option>
              <option value="REVIEWER">Reviewer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {showExpertise && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expertise Areas *</label>
              <select
                multiple
                value={expertise}
                onChange={handleExpertiseChange}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                size={5}
              >
                {expertiseOptions.map(exp => (
                  <option key={exp} value={exp}>
                    {exp.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Hold Ctrl (Windows) or Cmd (Mac) to select multiple
              </p>
              {expertise.length > 0 && (
                <div className="mt-2 text-xs text-green-600">
                  Selected: {expertise.map(e => e.replaceAll("_", " ")).join(", ")}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Role"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// User Row Component
function UserRow({ user, onUpdateRole, onToggleStatus, onDelete }) {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleRoleUpdate = async (userId, newRole, expertise) => {
    setUpdating(true);
    await onUpdateRole(userId, newRole, expertise);
    setUpdating(false);
  };

  const handleToggleStatus = async () => {
    setUpdating(true);
    await onToggleStatus(user.id, user.isActive);
    setUpdating(false);
  };

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td className="py-3 px-4">
          <div>
            <p className="font-medium text-gray-800">{user.name}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </td>
        <td className="py-3 px-4">
          <div>
            <p className="text-sm text-gray-600">{user.institution || "—"}</p>
            <p className="text-xs text-gray-400">{user.department || "—"}</p>
          </div>
        </td>
        <td className="py-3 px-4">
          <RoleBadge role={user.role} />
        </td>
        <td className="py-3 px-4">
          <StatusBadge isActive={user.isActive} />
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRoleModal(true)}
              disabled={updating}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Change Role"
            >
              <Edit size={16} />
            </button>

            <button
              onClick={handleToggleStatus}
              disabled={updating}
              className={`p-1.5 rounded-lg transition-colors ${
                user.isActive 
                  ? "text-green-600 hover:bg-green-50" 
                  : "text-gray-400 hover:bg-gray-100"
              }`}
              title={user.isActive ? "Deactivate User" : "Activate User"}
            >
              <RefreshCw size={16} />
            </button>

            <button
              onClick={() => onDelete(user.id, user.name)}
              disabled={updating}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete User"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </td>
       </tr>
       
      {showRoleModal && (
        <ChangeRoleModal
          user={user}
          onClose={() => setShowRoleModal(false)}
          onUpdate={handleRoleUpdate}
        />
      )}
    </>
  );
}

// Main Component
export default function UserManagement({ onLogout, user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Add User Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "SCIENTIST",
    expertise: [],
    institution: "",
    department: ""
  });

  const LIMIT = 5;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch users from API
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

        const params = new URLSearchParams();
        params.append("page", currentPage);
        params.append("limit", LIMIT);
        
        if (filterRole !== "all") {
          params.append("role", filterRole);
        }
        
        if (searchTerm) {
          params.append("search", searchTerm);
        }

        if (filterStatus !== "all") {
          params.append("isActive", filterStatus === "active");
        }

        const res = await axios.get(
          `${API_BASE_URL}/api/admin/users?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUsers(res.data.users || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalItems(res.data.pagination?.totalItems || 0);

      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          toast.error("Session expired. Please login again.");
          setTimeout(() => onLogout?.(), 2000);
        } else if (err.response?.status === 403) {
          toast.error("Access denied. Admin privileges required.");
        } else {
          toast.error(err.response?.data?.message || "Failed to load users");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, filterRole, searchTerm, filterStatus]);

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
    
    if (newUser.role === "REVIEWER" && newUser.expertise.length === 0) {
      toast.error("Please select at least one expertise area for reviewer");
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error("You must be logged in to add users");
        return;
      }
  
      const payload = {
        name: newUser.name.trim(),
        email: newUser.email.trim().toLowerCase(),
        role: newUser.role,
        expertise: newUser.expertise,
        institution: newUser.institution || undefined,
        department: newUser.department || undefined
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
  
      // Single toast message with both user creation and default password
      toast.success(
        `${res.data?.message || "User added successfully"}\nDefault password: ${res.data?.defaultPassword || "default1234"}`,
        {
          duration: 5000,
        }
      );
  
      setShowAddModal(false);
      setNewUser({
        name: "",
        email: "",
        role: "SCIENTIST",
        expertise: [],
        institution: "",
        department: ""
      });
      setCurrentPage(1);
  
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add user");
    }
  };

  const handleUpdateUserRole = async (userId, newRole, expertise) => {
  try {
    const token = localStorage.getItem("token");
    
    // Make sure expertise is always an array
    const expertiseArray = expertise || [];
    
    const res = await axios.patch(
      `${API_BASE_URL}/api/admin/id/${userId}/role`,
      { 
        role: newRole, 
        expertise: expertiseArray  // Send expertise array
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    toast.success(res.data?.message || "User role updated successfully");
    
    // Update local state with the new role and expertise
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, role: newRole, expertise: expertiseArray } 
        : user
    ));
    
  } catch (err) {
    console.error("Error updating user role:", err);
    console.error("Request payload:", { role: newRole, expertise });
    toast.error(err.response?.data?.message || "Failed to update user role");
  }
};

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      
      const res = await axios.patch(
        `${API_BASE_URL}/api/admin/users/status/${userId}`,
        { isActive: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(res.data?.message || `User ${!currentStatus ? "activated" : "deactivated"} successfully`);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isActive: !currentStatus } : user
      ));
      
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      await axios.delete(
        `${API_BASE_URL}/api/admin/id/${userId}`,
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

  const handleExpertiseChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setNewUser({ ...newUser, expertise: selectedOptions });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterRole("all");
    setFilterStatus("all");
    setCurrentPage(1);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filterRole !== "all") count++;
    if (filterStatus !== "all") count++;
    if (searchTerm) count++;
    return count;
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const expertiseOptions = [
    "COMPUTER_SCIENCE",
    "AGRICULTURE",
    "BIOTECHNOLOGY",
    "MECHANICAL",
    "CIVIL",
    "Soil Science",
    "Crop Science",
    "Forestry",
    "Food Technology"
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar onLogout={onLogout} user={user} />

      <main className="flex-1 px-4 md:px-8 py-6 md:py-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">User Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage all users in the system and assign roles.</p>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by name, email, institution..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition-colors ${
                    showFilters || getActiveFilterCount() > 0
                      ? "bg-blue-50 border-blue-300 text-blue-600"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Filter size={16} />
                  Filters
                  {getActiveFilterCount() > 0 && (
                    <span className="px-1.5 py-0.5 bg-blue-500 text-white rounded-full text-xs">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                >
                  <Plus size={16} />
                  Add User
                </button>

                {(searchTerm || filterRole !== "all" || filterStatus !== "all") && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-red-500 hover:text-red-700"
                  >
                    <X size={14} />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                    <select
                      value={filterRole}
                      onChange={(e) => {
                        setFilterRole(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="all">All Roles</option>
                      <option value="SCIENTIST">Scientist</option>
                      <option value="REVIEWER">Reviewer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Institution</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <User size={48} className="text-gray-300" />
                          <p className="text-gray-500">No users found</p>
                          {(searchTerm || filterRole !== "all" || filterStatus !== "all") && (
                            <button
                              onClick={clearFilters}
                              className="text-blue-500 text-sm hover:underline mt-2"
                            >
                              Clear filters to see all users
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <UserRow
                        key={user.id}
                        user={user}
                        onUpdateRole={handleUpdateUserRole}
                        onToggleStatus={handleToggleUserStatus}
                        onDelete={handleDeleteUser}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination - Consistent with reviewer format */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              
              <div className="flex gap-1">
                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages || loading}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}

          {/* Add User Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Add New User</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="SCIENTIST">Scientist</option>
                      <option value="REVIEWER">Reviewer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Institution (Optional)</label>
                    <input
                      type="text"
                      value={newUser.institution}
                      onChange={(e) => setNewUser({ ...newUser, institution: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department (Optional)</label>
                    <input
                      type="text"
                      value={newUser.department}
                      onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {newUser.role === "REVIEWER" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expertise Areas *</label>
                      <select
                        multiple
                        value={newUser.expertise}
                        onChange={handleExpertiseChange}
                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        size={5}
                      >
                        {expertiseOptions.map(exp => (
                          <option key={exp} value={exp}>
                            {exp.replaceAll("_", " ")}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Hold Ctrl (Windows) or Cmd (Mac) to select multiple
                      </p>
                    </div>
                  )}

                  <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium mb-1">Note:</p>
                    <p>• Default password will be sent to the user</p>
                    <p>• User can change password after first login</p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-colors"
                    >
                      Add User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}