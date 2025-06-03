import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Employee } from "../index";
import { useAppSelector } from "../../../redux/hooks";
import axios from "axios";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";

export interface TimeEntry {
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

interface TimeEntryModalProps {
  employees: Employee[];
  onClose: () => void;
  onSave: (entry: TimeEntry) => void;
  entry?: TimeEntry | null;
  refresh: () => void;
}

const TimeEntryModal: React.FC<TimeEntryModalProps> = ({
  employees,
  onClose,
  onSave,
  entry,
  refresh,
}) => {
  const [loading, setLoding] = useState(false);
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  const { currentUser } = useAppSelector((state) => state.user);
  const [formData, setFormData] = useState<Partial<TimeEntry>>({
    date: new Date().toISOString().split("T")[0],
    employee_id: "",
    hours: 0,
    description: "",
    creator_sales: [],
  });
  const [creators, setCreators] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchCreators();

    // Initialize form with entry data if editing
    if (entry) {
      setFormData({
        date: new Date(entry.date).toISOString().split("T")[0],
        employee_id: entry.employee_id,
        hours: entry.hours,
        description: entry.description,
        creator_sales: entry.creator_sales || [],
      });
    }
  }, [entry]);

  const fetchCreators = async () => {
    try {
      const requiredId =
        currentUser?.ownerId === "Agency Owner itself"
          ? currentUser?.id
          : currentUser?.ownerId;
      const response = await axios.get(
        `${URL}/api/creator/get-creators/${requiredId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
      setCreators(response.data.creators || []);
    } catch (error) {
      console.error("Error fetching creators:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoding(true);
      const requiredId =
        currentUser?.ownerId === "Agency Owner itself"
          ? currentUser?.id
          : currentUser?.ownerId;
      if (!formData.employee_id || !formData.date) return;
      const dataToSend = { ...formData, ownerId: requiredId };
      await axios.post(
        `${URL}/api/time-tracking/create-time-tracking`,
        dataToSend,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
      toast.success("Entry created successfully");
      onClose();
      refresh();
    } catch (error) {
      console.error("Error creating time tracking entry:", error);
    } finally {
      setLoding(false);
    }
  };

  const updateEntry = async (e: React.FocusEvent) => {
    e.preventDefault();
    try {
      setLoding(true);
      const response = await axios.patch(
        `${URL}/api/time-tracking/update-time-tracking/${entry._id}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
      toast.success("Entry Updated successfully");
      onClose();
      refresh();
    } catch (error) {
      console.error("Error updating time tracking entry:", error);
    } finally {
      setLoding(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "hours" ? (value === "" ? "" : parseFloat(value)) : value,
    }));
  };

  const handleCreatorSaleChange = (
    index: number,
    field: "creator_id" | "amount",
    value: string
  ) => {
    setFormData((prev) => {
      const creatorSales = [...(prev.creator_sales || [])];
      creatorSales[index] = {
        ...creatorSales[index],
        [field]: field === "amount" ? parseFloat(value) : value,
      };
      return { ...prev, creator_sales: creatorSales };
    });
  };

  const addCreatorSale = () => {
    setFormData((prev) => ({
      ...prev,
      creator_sales: [
        ...(prev.creator_sales || []),
        { creator_id: "", amount: 0 },
      ],
    }));
  };

  const removeCreatorSale = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      creator_sales: (prev.creator_sales || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl max-w-lg w-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">
              {entry ? "Edit Time Entry" : "New Time Entry"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-150"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <form
            onSubmit={entry ? updateEntry : handleSubmit}
            className="p-6 space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Employee
              </label>
              <select
                name="employee_id"
                required
                value={formData.employee_id}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select an employee</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Hours
              </label>
              <input
                type="number"
                name="hours"
                required
                min="0"
                step="0.5"
                value={formData.hours}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what was done..."
                rows={4}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-slate-700">
                  Creator Sales
                </label>
                <button
                  type="button"
                  onClick={addCreatorSale}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Creator
                </button>
              </div>

              <div className="space-y-4">
                {formData.creator_sales?.map((sale, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-1">
                      <select
                        value={sale.creator_id}
                        onChange={(e) =>
                          handleCreatorSaleChange(
                            index,
                            "creator_id",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select creator</option>
                        {creators.map((creator) => (
                          <option key={creator._id} value={creator.id}>
                            {creator.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Sales amount"
                        value={sale.amount || ""}
                        onChange={(e) =>
                          handleCreatorSaleChange(
                            index,
                            "amount",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCreatorSale(index)}
                      className="p-2 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

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
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-150"
              >
                {loading ? (
                  <div className="flex justify-center items-center gap-2">
                    <p>{entry ? "Save Changes" : "Create Entry"}</p>
                    <ClipLoader size={14} />
                  </div>
                ) : (
                  <p>{entry ? "Save Changes" : "Create Entry"}</p>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TimeEntryModal;
