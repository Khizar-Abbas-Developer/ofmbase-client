import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Role {
  id?: string;
  name: string;
  permissions: {
    [key: string]: boolean;
  };
}

const MODULES = [
  'Dashboard',
  'Creators',
  'Employees',
  'TimeTracking',
  'Marketing',
  'Library',
  'Tasks',
  'Financials',
  'Credentials',
  'Settings',
];

const PermissionsSettings = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const { data: agency } = await supabase
        .from('agencies')
        .select('id')
        .eq('profile_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!agency) throw new Error('Agency not found');

      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select(`
          id,
          name,
          role_permissions (
            permission
          )
        `)
        .eq('agency_id', agency.id);

      if (rolesError) throw rolesError;

      const transformedRoles = rolesData.map(role => ({
        id: role.id,
        name: role.name,
        permissions: MODULES.reduce((acc, module) => ({
          ...acc,
          [module]: role.role_permissions?.some(
            p => p.permission.toLowerCase() === module.toLowerCase()
          ) || false
        }), {})
      }));

      setRoles(transformedRoles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError('Failed to load roles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRole = () => {
    if (!newRoleName.trim()) {
      setError('Role name is required');
      return;
    }

    if (roles.some(role => role.name.toLowerCase() === newRoleName.toLowerCase())) {
      setError('A role with this name already exists');
      return;
    }

    const newRole: Role = {
      name: newRoleName,
      permissions: MODULES.reduce((acc, module) => ({ ...acc, [module]: false }), {}),
    };

    setRoles(prev => [...prev, newRole]);
    setNewRoleName('');
    setShowAddRole(false);
    setError(null);
  };

  const handleDeleteRole = async (roleId?: string, roleName?: string) => {
    try {
      if (roleId) {
        const { error: deleteError } = await supabase
          .from('roles')
          .delete()
          .eq('id', roleId);

        if (deleteError) throw deleteError;
      }

      setRoles(prev => prev.filter(role => 
        roleId ? role.id !== roleId : role.name !== roleName
      ));
    } catch (error) {
      console.error('Error deleting role:', error);
      setError('Failed to delete role');
    }
  };

  const handlePermissionChange = (roleName: string, module: string, value: boolean) => {
    setRoles(roles.map(role => 
      role.name === roleName 
        ? { ...role, permissions: { ...role.permissions, [module]: value } }
        : role
    ));
  };

  const handleSavePermissions = async () => {
    try {
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { data: agency } = await supabase
        .from('agencies')
        .select('id')
        .eq('profile_id', session.user.id)
        .single();

      if (!agency) throw new Error('Agency not found');

      // Save each role
      for (const role of roles) {
        let roleId = role.id;

        // Create or update role
        if (!roleId) {
          const { data: newRole, error: roleError } = await supabase
            .from('roles')
            .insert({
              agency_id: agency.id,
              name: role.name,
            })
            .select()
            .single();

          if (roleError) throw roleError;
          roleId = newRole.id;
        }

        // Delete existing permissions
        const { error: deleteError } = await supabase
          .from('role_permissions')
          .delete()
          .eq('role_id', roleId);

        if (deleteError) throw deleteError;

        // Add new permissions
        const permissions = Object.entries(role.permissions)
          .filter(([_, enabled]) => enabled)
          .map(([module]) => ({
            role_id: roleId,
            permission: module.toLowerCase(),
          }));

        if (permissions.length > 0) {
          const { error: permError } = await supabase
            .from('role_permissions')
            .insert(permissions);

          if (permError) throw permError;
        }
      }

      // Show success message
      setSuccessMessage('Permissions saved successfully');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

      // Refresh roles
      await fetchRoles();
    } catch (error) {
      console.error('Error saving permissions:', error);
      setError('Failed to save permissions');
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
          <h2 className="text-lg font-semibold text-slate-800">Role Permissions</h2>
          <p className="text-sm text-slate-500">
            Manage role permissions across your organization. Changes will apply to all employees with the corresponding role.
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
                  setNewRoleName('');
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
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Role</th>
              {MODULES.map(module => (
                <th key={module} className="px-4 py-3 text-left text-sm font-medium text-slate-500">
                  {module}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(role => (
              <tr key={role.id || role.name} className="border-b border-slate-100">
                <td className="px-4 py-3 text-sm font-medium text-slate-700">{role.name}</td>
                {MODULES.map(module => (
                  <td key={module} className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={role.permissions[module] || false}
                      onChange={(e) => handlePermissionChange(role.name, module, e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                ))}
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDeleteRole(role.id, role.name)}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
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
}

export default PermissionsSettings;