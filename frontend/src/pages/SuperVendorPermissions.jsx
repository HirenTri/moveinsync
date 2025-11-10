import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import Sidebar from "../components/Sidebar";

export default function SuperVendorPermissions() {
  const [perms, setPerms] = useState([]);
  const [users, setUsers] = useState([]);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedPermission, setSelectedPermission] = useState("");

  // Load data on mount
  useEffect(() => {
    loadPermissions();
    loadUsers();
  }, []);

  const loadPermissions = () => api.get("/permissions").then(r => setPerms(r.data));
  const loadUsers = () => api.get("/users").then(r => setUsers(r.data));

  // Add new permission
  const handleAdd = async e => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/permissions", {
        permissionName: newName,
        description: newDesc,
      });
      setNewName("");
      setNewDesc("");
      loadPermissions();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to add");
    }
  };

  // Delete permission
  const handleDelete = async name => {
    setError("");
    try {
      await api.delete(`/permissions/${name}`);
      loadPermissions();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to delete");
    }
  };

  // Assign permission to user
 const handleAssignPermission = async e => {
    e.preventDefault();
    setError("");
    if (!selectedUser || !selectedPermission) {
      setError("Please select both user and permission");
      return;
    }
    try {
      // Find the current user to get existing permissions
      const currentUser = users.find(user => user._id === selectedUser);
      const existingPermissions = currentUser?.customPermissions || [];
      
      // Check if permission already exists
      if (existingPermissions.includes(selectedPermission)) {
        setError("Permission already assigned to this user");
        return;
      }
      
      // Add new permission to existing array
      const updatedPermissions = [...existingPermissions, selectedPermission];
      
      await api.patch(`/users/${selectedUser}/permissions`, {
        customPermissions: updatedPermissions
      });
      
      setSelectedUser("");
      setSelectedPermission("");
      loadUsers(); // Refresh users to show updated permissions
      alert("Permission assigned successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign permission");
    }
  };

  // Remove permission from user
  const handleRemovePermission = async (userId, permissionName) => {
    setError("");
    try {
      await api.delete(`/users/${userId}/permissions/${permissionName}`);
      loadUsers(); // Refresh users to show updated permissions
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to remove permission");
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-100 p-8 overflow-auto">
        <h1 className="text-3xl font-bold mb-4">Manage Permissions</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}

        {/* Add new permission form */}
        <form onSubmit={handleAdd} className="mb-6 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Add New Permission</h2>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Permission Name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </form>

        {/* Assign permission to user form */}
        <form onSubmit={handleAssignPermission} className="mb-6 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Assign Permission to User</h2>
          <div className="flex space-x-2">
            <select
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
              required
            >
              <option value="">Select User</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <select
              value={selectedPermission}
              onChange={e => setSelectedPermission(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
              required
            >
              <option value="">Select Permission</option>
              {perms.map(perm => (
                <option key={perm.permissionName} value={perm.permissionName}>
                  {perm.permissionName}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Assign
            </button>
          </div>
        </form>

        {/* Permissions table */}
        <div className="bg-white rounded shadow overflow-auto mb-6">
          <h2 className="text-xl font-semibold p-4 border-b">Available Permissions</h2>
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left">Permission</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {perms.map(p => (
                <tr key={p.permissionName} className="border-b hover:bg-gray-50">
                  <td className="p-3">{p.permissionName}</td>
                  <td className="p-3">{p.description}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDelete(p.permissionName)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {perms.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-3 text-center text-gray-500">
                    No permissions defined.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Users and their permissions table */}
        <div className="bg-white rounded shadow overflow-auto">
          <h2 className="text-xl font-semibold p-4 border-b">Users and Their Permissions</h2>
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Custom Permissions</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">
                    {user.customPermissions && user.customPermissions.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.customPermissions.map(perm => (
                          <span
                            key={perm}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">No permissions assigned</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {user.customPermissions && user.customPermissions.length > 0 && (
                      <select
                        onChange={e => {
                          if (e.target.value) {
                            handleRemovePermission(user._id, e.target.value);
                            e.target.value = "";
                          }
                        }}
                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        <option value="">Remove Permission</option>
                        {user.customPermissions.map(perm => (
                          <option key={perm} value={perm}>
                            {perm}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}