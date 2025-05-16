import React, { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";
import { Employee } from "../Employees";
import type { Database } from "../../lib/database.types";
import { useAppSelector } from "../../redux/hooks"; // Adjust the path as needed
import axios from "axios";
import toast from "react-hot-toast";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface TaskModalProps {
  mode?: "add" | "edit";
  task?: Task | null;
  onClose: () => void;
  refresh: () => void;
  onSave: (task: Omit<Task, "created_at" | "updated_at">) => void;
  employees: Employee[];
}

const TaskModal: React.FC<TaskModalProps> = ({
  mode = "add",
  task,
  onClose,
  onSave,
  refresh,
  employees,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState({});
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;

  const { currentUser } = useAppSelector((state) => state.user);

  const [formData, setFormData] = useState<Partial<Task>>({
    title: "",
    description: "",
    priority: "medium",
    assigned_to: undefined,
    due_date: undefined,
    status: "pending",
  });

  useEffect(() => {
    employees.forEach((employee) => {
      if (employee.name === formData.assigned_to) {
        setSelectedEmployee(employee);
      }
    });
  }, [formData.assigned_to, employees]);

  useEffect(() => {
    if (task && mode === "edit") {
      setFormData({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        assigned_to: task.assigned_to,
        employeeId: employees._id,
        due_date: task.due_date
          ? new Date(task.due_date).toISOString().split("T")[0]
          : undefined,
        status: task.status,
      });
    }
  }, [task, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.title || !formData.priority) return;
      const requiredId =
        currentUser.ownerId === "Agency Owner itself"
          ? currentUser.id
          : currentUser.ownerId;
      const taskData = {
        title: formData.title,
        description: formData.description || "",
        priority: formData.priority as Task["priority"],
        assigned_to: formData.assigned_to,
        employeeId: selectedEmployee._id,
        due_date: formData.due_date,
        status: formData.status as Task["status"],
      };
      await axios.post(`${URL}/api/task/add-task/${requiredId}`, taskData, {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      });
      toast.success("Task created successfully");
      onClose();
      refresh();
    } catch (error) {
      console.log(error);
    }

    // if (mode === 'edit' && task) {
    //   onSave({
    //     ...taskData,
    //     id: task.id,
    //   });
    // } else {
    //   onSave(taskData);
    // }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? undefined : value,
    }));
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.patch(
        `${URL}/api/task/update-task/${task?._id}`,
        {
          title: formData.title,
          description: formData.description || "",
          priority: formData.priority,
          assigned_to: formData.assigned_to,
          due_date: formData.due_date,
          status: formData.status,
          ownerId: task?.ownerId,
          employeeId: selectedEmployee._id,
        },
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );
      toast.success("Task updated successfully");
      onClose();
      refresh();
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl max-w-2xl w-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">
              {mode === "edit" ? "Edit Task" : "Add New Task"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-150"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <form
            onSubmit={mode === "add" ? handleSubmit : handleEditTask}
            className="p-6 space-y-6"
          >
            <div>
              <input
                type="text"
                name="title"
                placeholder="What needs to be done?"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <textarea
                name="description"
                placeholder="Add details..."
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div className="flex-1">
                <select
                  name="assigned_to"
                  value={formData.assigned_to || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Assign to</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <div className="relative">
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {mode === "edit" && (
              <div>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-150"
              >
                {mode === "edit" ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
