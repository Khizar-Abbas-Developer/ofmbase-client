import React, { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle } from "lucide-react";
import axios from "axios";

import { useAppSelector } from "../../redux/hooks"; // Adjust the path as needed
import toast from "react-hot-toast";

interface Role {
  id?: string;
  name: string;
  permissions: {
    [key: string]: boolean;
  };
}

const MODULES = [
  "Dashboard",
  "Creators",
  "Employees",
  "TimeTracking",
  "Marketing",
  "Library",
  "Tasks",
  "Financials",
  "Credentials",
  "Settings",
];

const PermissionsSettings = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  const { currentUser } = useAppSelector((state) => state.user);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get(
        `${URL}/api/role/get-role/${currentUser?.id}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );
      const fetched = response.data.data.map((r: any) => ({
        id: r.id || r._id, // depending on actual key name
        name: r.name || r.roleName, // depending on actual key name
        permissions: MODULES.reduce(
          (acc, module) => ({
            ...acc,
            [module]: r.permissions?.[module] || false,
          }),
          {}
        ),
      }));
      setRoles(fetched);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setError("Failed to load roles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRole = () => {
    if (!newRoleName.trim()) {
      setError("Role name is required");
      return;
    }

    if (
      roles.some(
        (role) => role.name.toLowerCase() === newRoleName.toLowerCase()
      )
    ) {
      setError("A role with this name already exists");
      return;
    }

    const newRole: Role = {
      name: newRoleName,
      permissions: MODULES.reduce(
        (acc, module) => ({ ...acc, [module]: false }),
        {}
      ),
    };

    setRoles((prev) => [...prev, newRole]);
    setShowAddRole(false);
  };

  const handleDeleteRole = async (roleId?: string, roleName?: string) => {
    try {
      if (roleId) {
        await axios.delete(`${URL}/api/role/delete-role/${roleId}`, {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        });
      }

      // Update local state
      setRoles((prev) =>
        prev.filter((role) =>
          roleId ? role.id !== roleId : role.name !== roleName
        )
      );
      toast.success("Role delete successfully");
    } catch (error) {
      console.error("Error deleting role:", error);
      setError("Failed to delete role");
    }
  };

  const handlePermissionChange = (
    roleName: string,
    module: string,
    value: boolean
  ) => {
    setRoles(
      roles.map((role) =>
        role.name === roleName
          ? { ...role, permissions: { ...role.permissions, [module]: value } }
          : role
      )
    );
  };

  const handleSavePermissions = async () => {
    try {
      setError(null);

      for (const role of roles) {
        const roleId = role.id;
        const roleName = role.name;

        const rolePermissionModules = Object.entries(role.permissions)
          .filter(([_, enabled]) => enabled)
          .map(([module]) => module.toLowerCase());

        const dataToSend = {
          roleId, // Include roleId for update, omit or set null to create new
          roleName,
          rolePermissionModules,
        };

        await axios.post(
          `${URL}/api/role/add-role/${currentUser?.id}`,
          dataToSend,
          {
            headers: {
              Authorization: `Bearer ${currentUser?.token}`,
            },
          }
        );
      }
      fetchRoles();
      toast.success("Roles saved successfully!");
    } catch (error) {
      console.error("Error saving permissions:", error);
      setError("Failed to save permissions");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Role Permissions
          </h2>
          <p className="text-sm text-slate-500">
            Manage role permissions across your organization. Changes will apply
            to all employees with the corresponding role.
          </p>
        </div>
        <button
          onClick={() => setShowAddRole(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Role
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          {successMessage}
        </div>
      )}

      {showAddRole && (
        <div className="mb-6 p-4 bg-slate-50 rounded-xl">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Role Name
              </label>
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Enter role name"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowAddRole(false);
                  setNewRoleName("");
                  setError(null);
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRole}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Add Role
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">
                Role
              </th>
              {MODULES.map((module) => (
                <th
                  key={module}
                  className="px-4 py-3 text-left text-sm font-medium text-slate-500"
                >
                  {module}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role, index) => {
              const permissionsSet = new Set(
                role.rolePermissionModules?.map((mod) => mod.toLowerCase()) ||
                  Object.keys(role.permissions)
                    .filter((key) => role.permissions[key])
                    .map((k) => k.toLowerCase())
              );

              return (
                <tr key={index} className="border-b border-slate-100">
                  <td className="px-4 py-3 text-sm font-medium text-slate-700">
                    {role.roleName || role.name}
                  </td>

                  {MODULES.map((module) => {
                    const isChecked = permissionsSet.has(module.toLowerCase());

                    return (
                      <td key={module} className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            handlePermissionChange(
                              role.roleName || role.name,
                              module,
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    );
                  })}

                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        handleDeleteRole(
                          role._id || role.id,
                          role.roleName || role.name
                        )
                      }
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSavePermissions}
          className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
        >
          Save Permissions
        </button>
      </div>
    </div>
  );
};

export default PermissionsSettings;
