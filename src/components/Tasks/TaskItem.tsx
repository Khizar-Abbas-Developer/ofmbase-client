import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Database } from "../../lib/database.types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface TaskItemProps {
  task: Task;
  taskId: string;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (task: any, value: any) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  taskId,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-50 text-red-700";
      case "medium":
        return "bg-yellow-50 text-yellow-700";
      case "low":
        return "bg-green-50 text-green-700";
      default:
        return "bg-slate-50 text-slate-700";
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-700";
      case "in-progress":
        return "bg-blue-50 text-blue-700";
      case "pending":
        return "bg-yellow-50 text-yellow-700";
      default:
        return "bg-slate-50 text-slate-700";
    }
  };

  const handleEdit = () => {
    if (task) {
      onEdit(task);
    } else {
      console.error("Cannot edit task: Invalid task or task ID is missing");
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-x-2">
            <div>
              <h3
                className={`text-base font-medium ${
                  task.status === "completed"
                    ? "text-slate-400 line-through"
                    : "text-slate-900"
                }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p
                  className={`mt-1 text-sm ${
                    task.status === "completed"
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  {task.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={task.status}
                onChange={(e) => onStatusChange(task, e.target.value)}
                className={`text-xs px-2 py-1 rounded-full border-0 ${getStatusColor(
                  task.status
                )}`}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <button
                onClick={handleEdit}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors duration-150"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-1 text-red-400 hover:text-red-600 transition-colors duration-150"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(
                task.priority
              )}`}
            >
              {task.priority}
            </span>
            {task.assigned_to && (
              <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700">
                {task.assigned_to}
              </span>
            )}
            {task.due_date && (
              <span className="text-xs text-slate-500">
                Due {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
