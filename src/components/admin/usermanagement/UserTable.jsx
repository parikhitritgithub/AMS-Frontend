import { useState } from "react";
import { Pencil, Trash2, Save, X } from "lucide-react";
import toast from "react-hot-toast";

export default function UserTable({ users, onDeleteUser, onEditUser }) {
  const [editingUserId, setEditingUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    role: "",
    expertise: "",
  });

  const handleEditClick = (user) => {
    setEditingUserId(user.id);
    setEditFormData({
      name: user.name,
      role: user.role,
      expertise: Array.isArray(user.expertise) ? user.expertise.join(", ") : user.expertise,
    });
  };

  const handleSaveClick = async (userId) => {
    if (!editFormData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    
    await onEditUser(userId, editFormData);
    setEditingUserId(null);
  };

  const handleCancelClick = () => {
    setEditingUserId(null);
    setEditFormData({ name: "", role: "", expertise: "" });
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700';
      case 'REVIEWER': return 'bg-blue-100 text-blue-700';
      case 'STUDENT': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ACTIVE': return 'bg-green-100 text-green-700';
      case 'INACTIVE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto">
      <table className="min-w-[1000px] w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-400 uppercase text-xs tracking-wide">
            <th className="px-6 py-4 text-left">Name</th>
            <th className="px-6 py-4 text-left">Email</th>
            <th className="px-6 py-4 text-left">Role</th>
            <th className="px-6 py-4 text-left">Status</th>
            <th className="px-6 py-4 text-left">Expertise</th>
            <th className="px-6 py-4 text-left">Created Date</th>
            <th className="px-6 py-4 text-left">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {users.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-5">
                  {editingUserId === user.id ? (
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="border rounded-lg px-3 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="font-semibold text-gray-800">{user.name}</span>
                  )}
                </td>

                <td className="px-6 py-5 text-gray-500">{user.email}</td>

                <td className="px-6 py-5">
                  {editingUserId === user.id ? (
                    <select
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                      className="border rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="REVIEWER">Reviewer</option>
                      <option value="STUDENT">Student</option>
                    </select>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  )}
                </td>

                <td className="px-6 py-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(user.status || 'ACTIVE')}`}>
                    {user.status || 'ACTIVE'}
                  </span>
                </td>

                <td className="px-6 py-5 text-gray-700">
                  {editingUserId === user.id ? (
                    <input
                      type="text"
                      value={editFormData.expertise}
                      onChange={(e) => setEditFormData({ ...editFormData, expertise: e.target.value })}
                      placeholder="e.g., Computer Science, Agriculture"
                      className="border rounded-lg px-3 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    Array.isArray(user.expertise) ? user.expertise.join(", ") : user.expertise
                  )}
                </td>

                <td className="px-6 py-5 text-gray-500">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </td>

                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    {editingUserId === user.id ? (
                      <>
                        <button 
                          onClick={() => handleSaveClick(user.id)}
                          className="text-green-500 hover:text-green-700 transition"
                          title="Save"
                        >
                          <Save size={16} />
                        </button>
                        <button 
                          onClick={handleCancelClick}
                          className="text-gray-500 hover:text-gray-700 transition"
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleEditClick(user)}
                          className="text-blue-500 hover:text-blue-700 transition"
                          title="Edit User"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => onDeleteUser(user.id, user.name)}
                          className="text-red-500 hover:text-red-700 transition"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}