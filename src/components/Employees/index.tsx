import React, { useState } from "react";
import {
  Plus,
  Search,
  UserCircle,
  Clock,
  DollarSign,
  Gift,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import EmployeeModal from "./EmployeeModal";
import EmployeeCard from "./EmployeeCard";
import EmployeeDetailModal from "./EmployeeDetailModal";
import TimeTracking from "./TimeTracking";
import { useAppSelector } from "../../redux/hooks"; // Adjust the path as needed
import axios from "axios";
import Payments from "./Payments";
import Bonuses from "./Bonuses";

export interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
  hourly_rate: number;
  payment_schedule: string;
  payment_method: string;
  paypal_email?: string;
  status: "invited" | "active" | "inactive";
  created_at?: string;
  updated_at?: string;
}

const Employees = () => {
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  const { currentUser } = useAppSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState<"employees" | "timeTracking">(
    "employees"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const requiredId =
        currentUser?.ownerId === "Agency Owner itself"
          ? currentUser.id
          : currentUser.ownerId;
      const response = await axios.get(
        `${URL}/api/employee/get-employee/${requiredId}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );
      setEmployees(response.data.employees);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmployee = async (employeeData: Omit<Employee, "id">) => {
    try {
      // First, create the employee auth account and get the user ID
      const apiUrl = `${
        import.meta.env.VITE_SUPABASE_URL
      }/functions/v1/invite-employee`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          name: employeeData.name,
          email: employeeData.email,
          role: employeeData.role,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create employee account");
      }

      const { userId } = await response.json();

      // Then create the employee record
      const { data, error } = await supabase
        .from("employees")
        .insert([{ ...employeeData, id: userId }])
        .select()
        .single();

      if (error) throw error;

      setEmployees((prev) => [data, ...prev]);
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error adding employee:", error);
      alert(error.message);
    }
  };

  const handleUpdateEmployee = async (employee: Employee) => {
    try {
      const { error } = await supabase
        .from("employees")
        .update({
          name: employee.name,
          role: employee.role,
          hourly_rate: employee.hourly_rate,
          payment_schedule: employee.payment_schedule,
          payment_method: employee.payment_method,
          paypal_email: employee.paypal_email,
          status: employee.status,
        })
        .eq("id", employee.id);

      if (error) throw error;

      setEmployees((prev) =>
        prev.map((e) => (e.id === employee.id ? employee : e))
      );
      setIsModalOpen(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      setIsLoading(true);
      const requiredId =
        currentUser?.ownerId === "Agency Owner itself"
          ? currentUser?.id
          : currentUser.ownerId;
      await axios.delete(`${URL}/api/employee/delete-employee/${requiredId}`, {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      });
      fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  const handleCardClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowDetailModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pt-16 lg:pt-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Employees</h1>
          <p className="text-slate-500 mt-1">
            Manage your agency's team members
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder="Search employees..."
              className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>

          {currentUser?.accountType === "owner" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-150"
            >
              <Plus className="h-5 w-5" />
              Add Employee
            </button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("employees")}
              className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-medium ${
                activeTab === "employees"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              Employees
            </button>
            <button
              onClick={() => setActiveTab("timeTracking")}
              className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-medium ${
                activeTab === "timeTracking"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <Clock className="h-4 w-4" />
              Time Tracking
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-medium ${
                activeTab === "payments"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <DollarSign className="h-4 w-4" />
              Payments
            </button>
            <button
              onClick={() => setActiveTab("bonuses")}
              className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-medium ${
                activeTab === "bonuses"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <Gift className="h-4 w-4" />
              Bonuses
            </button>
          </nav>
        </div>
      </div>

      {activeTab === "employees" ? (
        <>
          {employees.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <UserCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                No employees yet
              </h3>
              <p className="text-slate-500 mb-6">
                Get started by adding your first team member
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-150"
              >
                <Plus className="h-5 w-5" />
                Add Employee
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map((employee) => (
                <EmployeeCard
                  key={employee._id}
                  employee={employee}
                  onEdit={() => {
                    setSelectedEmployee(employee);
                    setIsModalOpen(true);
                  }}
                  onDelete={() => handleDeleteEmployee(employee._id)}
                  onClick={() => handleCardClick(employee)}
                />
              ))}
            </div>
          )}
        </>
      ) : activeTab === "timeTracking" ? (
        <TimeTracking employees={employees} />
      ) : activeTab === "payments" ? (
        <Payments employees={employees} />
      ) : (
        <Bonuses employees={employees} />
      )}

      {isModalOpen && (
        <EmployeeModal
          mode={selectedEmployee ? "edit" : "add"}
          employee={selectedEmployee}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEmployee(null);
          }}
          refresh={fetchEmployees}
          onSave={selectedEmployee ? handleUpdateEmployee : handleAddEmployee}
        />
      )}

      {showDetailModal && selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedEmployee(null);
          }}
        />
      )}
    </div>
  );
};

export default Employees;
