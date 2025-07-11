import React, { useState, useEffect } from "react";
import { X, Plus, CheckCircle } from "lucide-react";
import { Employee } from "./index";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks"; // Adjust the path as needed

import axios from "axios";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";

interface Role {
  id: string;
  name: string;
}

interface EmployeeModalProps {
  mode?: "add" | "edit";
  employee?: Employee | null;
  onClose: () => void;
  refresh: () => void;
  onSave: (employee: Employee | Omit<Employee, "id">) => void;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({
  mode = "add",
  employee,
  onClose,
  onSave,
  refresh,
}) => {
  const navigate = useNavigate();
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  const { currentUser } = useAppSelector((state) => state.user);
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: employee ? employee.name : "",
    email: employee ? employee.email : "",
    role: employee ? employee.role : "",
    hourly_rate: employee ? employee.hourly_rate : 0,
    payment_schedule: employee ? employee.payment_schedule : "",
    payment_method: employee ? employee.payment_method : "",
    paypal_email: employee ? employee.paypal_email : "",
    status: employee ? employee.status : mode === "add" ? "invited" : "active",
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const employeeData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      hourly_rate: formData.hourly_rate || 0,
      payment_schedule: formData.payment_schedule || "monthly",
      payment_method: formData.payment_method || "paypal",
      paypal_email: formData.paypal_email,
      status: formData.status as Employee["status"],
    };

    try {
      setIsLoading(true);
      const requiredId =
        currentUser.ownerId === "Agency Owner itself"
          ? currentUser.id
          : currentUser.ownerId;
      const response = await axios.post(
        `${URL}/api/employee/add-employee/${requiredId}`,
        employeeData,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );

      setFormData({
        name: "",
        email: "",
        role: "",
        hourly_rate: 0,
        payment_schedule: "",
        payment_method: "",
        paypal_email: "",
        status: mode === "add" ? "invited" : "active",
      });
      refresh();
      setTimeout(() => {
        onClose();
      }, 500);
      onClose();
      toast.success(response.data.message);
    } catch (error: any) {
      toast.error(error.response.data.message);
      // Error handling is done in the parent component
    } finally {
      setIsLoading(false);
    }
  };

  const updateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const employeeData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      hourly_rate: formData.hourly_rate || 0,
      payment_schedule: formData.payment_schedule || "monthly",
      payment_method: formData.payment_method || "paypal",
      paypal_email: formData.paypal_email,
      status: formData.status as Employee["status"],
    };

    try {
      setIsLoading(true);
      const requiredId =
        currentUser.ownerId === "Agency Owner itself"
          ? currentUser.id
          : currentUser.ownerId;
      const response = await axios.patch(
        `${URL}/api/employee/update-employee/${requiredId}`,
        employeeData,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );

      setFormData({
        name: "",
        email: "",
        role: "",
        hourly_rate: 0,
        payment_schedule: "",
        payment_method: "",
        paypal_email: "",
        status: mode === "add" ? "invited" : "active",
      });
      refresh();
      setTimeout(() => {
        onClose();
      }, 500);
      onClose();
      toast.success(response.data.message);
    } catch (error: any) {
      toast.error(error.response.data.message);
      console.log(error);

      // Error handling is done in the parent component
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddRole = () => {
    onClose();
    navigate("/settings", { state: { activeTab: "permissions" } });
  };

  const fetchRoles = async () => {
    try {
      const requiredId =
        currentUser?.ownerId === "Agency Owner itself"
          ? currentUser.id
          : currentUser.ownerId;
      const response = await axios.get(
        `${URL}/api/role/get-all-roles/${requiredId}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );
      setRoles(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchRoles();
  }, []);

  if (success) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Employee Invited Successfully!
            </h3>
            <p className="text-slate-600 mb-4">
              An invitation email has been sent to {formData.email}. They'll
              need to verify their email and set up their account to access the
              system.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl max-w-lg w-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">
              {mode === "edit" ? "Edit Employee" : "Add New Employee"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-150"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <form
            onSubmit={mode === "edit" ? updateEmployee : handleSubmit}
            className="p-6 space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">
                  Role
                </label>
                {roles.length === 0 && (
                  <button
                    type="button"
                    onClick={handleAddRole}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add New Role
                  </button>
                )}
              </div>
              <select
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role._id} value={role.roleName}>
                    {role.roleName}
                  </option>
                ))}
              </select>
              {roles.length === 0 && (
                <p className="mt-1 text-sm text-slate-500">
                  No roles available. Create roles in the Permissions settings.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Hourly Rate ($)
              </label>
              <input
                type="number"
                name="hourly_rate"
                required
                min="0"
                step="0.01"
                value={formData.hourly_rate}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Payment Schedule
              </label>
              <select
                name="payment_schedule"
                required
                value={formData.payment_schedule}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select schedule</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                name="payment_method"
                required
                value={formData.payment_method}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select method</option>
                <option value="paypal">PayPal</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>

            {formData.payment_method === "paypal" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  PayPal Email
                </label>
                <input
                  type="email"
                  name="paypal_email"
                  required
                  value={formData.paypal_email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {mode === "edit" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  required
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="invited">Invited</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-150 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex justify-center items-center gap-2">
                    <p>{mode === "add" ? "Creating" : "Saving"}</p>
                    <ClipLoader size={14} />
                  </div>
                ) : mode === "add" ? (
                  "Add Creator"
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;
