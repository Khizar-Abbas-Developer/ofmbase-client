import React, { useState, useEffect } from "react";
import { Clock, Plus } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import TimeEntryModal from "./TimeEntryModal";
import TimeTrackingTable from "./TimeTrackingTable";
import { Employee } from "../index";
import axios from "axios";
import { useAppSelector } from "../../../redux/hooks";

interface TimeEntry {
  id: string;
  date: string;
  employee_id: string;
  hours: number;
  description: string;
  creator_sales?: {
    creator_id: string;
    amount: number;
  }[];
}

interface TimeTrackingProps {
  employees: Employee[];
}

const TimeTracking: React.FC<TimeTrackingProps> = ({ employees }) => {
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  const { currentUser } = useAppSelector((state) => state.user);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("week");

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetchTimeEntries();
  }, []);

  const fetchTimeEntries = async () => {
    try {
      setIsLoading(true);
      const requiredId =
        currentUser?.ownerId === "Agency Owner itself"
          ? currentUser?.id
          : currentUser?.ownerId;
      const response = await axios.get(
        `${URL}/api/time-tracking/fetch-time-tracking/${requiredId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
      setTimeEntries(response.data.data || []);
    } catch (error) {
      console.error("Error fetching time entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTimeEntry = async (entry: Omit<TimeEntry, "id">) => {
    try {
      // First, create the time entry
      const { data: timeEntry, error: timeEntryError } = await supabase
        .from("time_entries")
        .insert({
          date: entry.date,
          employee_id: entry.employee_id,
          hours: entry.hours,
          description: entry.description,
        })
        .select()
        .single();

      if (timeEntryError) throw timeEntryError;

      // Then, create the creator sales records
      if (entry.creator_sales && entry.creator_sales.length > 0) {
        const creatorSalesData = entry.creator_sales.map((sale) => ({
          time_entry_id: timeEntry.id,
          creator_id: sale.creator_id,
          amount: sale.amount,
        }));

        const { error: salesError } = await supabase
          .from("creator_sales")
          .insert(creatorSalesData);

        if (salesError) throw salesError;
      }

      // Fetch the updated time entries
      fetchTimeEntries();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding time entry:", error);
    }
  };

  const handleEditTimeEntry = async (entry: TimeEntry) => {
    try {
      // Update the time entry
      const { error: timeEntryError } = await supabase
        .from("time_entries")
        .update({
          date: entry.date,
          employee_id: entry.employee_id,
          hours: entry.hours,
          description: entry.description,
        })
        .eq("id", entry.id);

      if (timeEntryError) throw timeEntryError;

      // Delete existing creator sales
      const { error: deleteError } = await supabase
        .from("creator_sales")
        .delete()
        .eq("time_entry_id", entry.id);

      if (deleteError) throw deleteError;

      // Create new creator sales records
      if (entry.creator_sales && entry.creator_sales.length > 0) {
        const creatorSalesData = entry.creator_sales.map((sale) => ({
          time_entry_id: entry.id,
          creator_id: sale.creator_id,
          amount: sale.amount,
        }));

        const { error: salesError } = await supabase
          .from("creator_sales")
          .insert(creatorSalesData);

        if (salesError) throw salesError;
      }

      // Fetch the updated time entries
      fetchTimeEntries();
      setIsModalOpen(false);
      setSelectedEntry(null);
    } catch (error) {
      console.error("Error updating time entry:", error);
    }
  };

  const handleDeleteTimeEntry = async (id: string) => {
    try {
      const response = await axios.delete(
        `${URL}/api/time-tracking/delete-time-tracking/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
      fetchTimeEntries();
    } catch (error) {
      console.error("Error deleting time entry:", error);
    }
  };

  const filteredEntries = timeEntries.filter((entry) => {
    if (selectedEmployee !== "all" && entry.employee_id !== selectedEmployee) {
      return false;
    }

    const entryDate = new Date(entry.date);
    const now = new Date();

    switch (selectedPeriod) {
      case "today":
        return entryDate.toDateString() === now.toDateString();
      case "week":
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        return entryDate >= weekAgo;
      case "month":
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        return entryDate >= monthAgo;
      default:
        return true;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-4">
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Employees</option>
            {employees.map((employee) => (
              <option key={employee._id} value={employee._id}>
                {employee.name}
              </option>
            ))}
          </select>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-150"
        >
          <Clock className="h-5 w-5" />
          Add Time Entry
        </button>
      </div>

      {timeEntries.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            No time entries yet
          </h3>
          <p className="text-slate-500 mb-6">
            Start tracking time for your employees
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-150"
          >
            <Plus className="h-5 w-5" />
            Add Time Entry
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl">
          <TimeTrackingTable
            timeEntries={filteredEntries}
            employees={employees}
            onEdit={(entry) => {
              setSelectedEntry(entry);
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteTimeEntry}
          />
        </div>
      )}

      {isModalOpen && (
        <TimeEntryModal
          employees={employees}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEntry(null);
          }}
          refresh={fetchTimeEntries}
          onSave={selectedEntry ? handleEditTimeEntry : handleAddTimeEntry}
          entry={selectedEntry}
        />
      )}
    </div>
  );
};

export default TimeTracking;
