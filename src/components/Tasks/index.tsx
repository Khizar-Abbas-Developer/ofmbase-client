import React, { useState, useEffect } from "react";
import { Plus, Filter } from "lucide-react";
import { supabase } from "../../lib/supabase";
import TaskModal from "./TaskModal";
import TaskItem from "./TaskItem";
import { useAppSelector } from "../../redux/hooks"; // Adjust the path as needed
import { Employee } from "../Employees";
import type { Database } from "../../lib/database.types";
import axios from "axios";
import toast from "react-hot-toast";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface TasksProps {
  employees: Employee[];
}

const Tasks: React.FC<TasksProps> = ({ employees = [] }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("priority");
  const [isLoading, setIsLoading] = useState(true);
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  const [fetchedEmployees, setFetchedEmployees] = useState<Employee[]>([]);

  const { currentUser } = useAppSelector((state) => state.user);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const requiredId =
        currentUser.ownerId === "Agency Owner itself"
          ? currentUser.id
          : currentUser.ownerId;
      setIsLoading(true);

      const response = await axios.get(
        `${URL}/api/task/get-tasks/${requiredId}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );

      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error); // ✅ move inside catch
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async (
    task: Omit<Task, "id" | "created_at" | "updated_at">
  ) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert([task])
        .select()
        .single();

      if (error) throw error;

      setTasks((prev) => [data, ...prev]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleEditTask = async (task: Task) => {
    try {
      // Validate task and task.id before proceeding
      if (!task || !task.id) {
        console.error("Invalid task or task ID is missing");
        return;
      }

      const { error } = await supabase
        .from("tasks")
        .update({
          title: task.title,
          description: task.description,
          priority: task.priority,
          assigned_to: task.assigned_to,
          due_date: task.due_date,
          status: task.status,
        })
        .eq("id", task.id);

      if (error) throw error;

      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      setIsModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      if (!id) {
        toast.error("Invalid task ID");
        return;
      }
      await axios.delete(`${URL}/api/task/delete-task/${id}`, {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      });
      fetchTasks();
      toast.success("Task deleted successfully");

      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleStatusChange = async (id: string, status: Task["status"]) => {
    try {
      if (!id) {
        console.error("Invalid task ID for status update");
        return;
      }

      const { error } = await supabase
        .from("tasks")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    if (priorityFilter !== "all" && task.priority !== priorityFilter)
      return false;
    if (assigneeFilter !== "all" && task.assigned_to !== assigneeFilter)
      return false;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case "priority":
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case "dueDate":
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      default:
        return 0;
    }
  });

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  //
  const fetchEmployees = async () => {
    try {
      const requiredId =
        currentUser.ownerId === "Agency Owner itself"
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
      setFetchedEmployees(response.data.employees);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto pt-16 lg:pt-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Tasks</h1>
              <p className="text-slate-500 mt-1">
                Manage and track your team's tasks
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedTask(null);
                setIsModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-150"
            >
              <Plus className="h-5 w-5" />
              Add New Task
            </button>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Assignees</option>
              {fetchedEmployees &&
                fetchedEmployees.length > 0 &&
                fetchedEmployees.map((employee) => (
                  <option key={employee._id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
            </select>

            <div className="flex-1" />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="priority">Sort by Priority</option>
              <option value="dueDate">Sort by Due Date</option>
            </select>
          </div>

          <div className="space-y-4">
            {sortedTasks.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Filter className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  No tasks found
                </h3>
                <p className="text-slate-500 mb-6">
                  Create your first task to get started
                </p>
                <button
                  onClick={() => {
                    setSelectedTask(null);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-150"
                >
                  <Plus className="h-5 w-5" />
                  Add New Task
                </button>
              </div>
            ) : (
              sortedTasks.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  taskId={task._id}
                  onEdit={() => {
                    if (task && task._id) {
                      setSelectedTask(task);
                      setIsModalOpen(true);
                    } else {
                      console.error("Invalid task or task ID is missing");
                    }
                  }}
                  onDelete={() => handleDeleteTask(task._id)}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </div>

          {isModalOpen && (
            <TaskModal
              mode={selectedTask ? "edit" : "add"}
              task={selectedTask}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedTask(null);
              }}
              onSave={selectedTask ? handleEditTask : handleAddTask}
              employees={fetchedEmployees}
              refresh={fetchTasks}
            />
          )}
        </div>
      )}
    </>
  );
};

export default Tasks;
