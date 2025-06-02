import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAppSelector } from "../../redux/hooks"; // Adjust the path as needed
import { ClipLoader } from "react-spinners";

interface CostumeRequest {
  _id: string;
  name: string;
  creatorId: string;
  constumeNumber: string;
  videoType?: string;
  videoLength?: string;
  subRequest?: string;
  outFitDescription?: string;
  paymentAmount: number;
  status: "pending" | "approved" | "rejected" | "completed";
}

interface Creator {
  _id: string;
  name: string;
}

interface CostumeRequestModalProps {
  onClose: () => void;
  onSave: (
    request: CostumeRequest | Omit<CostumeRequest, "id" | "status">
  ) => void;
  creators: Creator[];
  request?: CostumeRequest | null;
  mode?: "add" | "edit";
  refreshRequests: () => void;
}
const CostumeRequestModal: React.FC<CostumeRequestModalProps> = ({
  onClose,
  // onSave,
  creators = [],
  request,
  mode = "add",
  refreshRequests,
}) => {
  const { currentUser } = useAppSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;

  const [formData, setFormData] = useState({
    name: "",
    creatorId: "",
    constumeNumber: "",
    videoType: "",
    videoLength: "",
    subRequest: "",
    outFitDescription: "",
    paymentAmount: "",
    status: "pending" as CostumeRequest["status"],
  });

  useEffect(() => {
    if (request && mode === "edit") {
      setFormData({
        name: request.name,
        creatorId: request.creatorId,
        constumeNumber: request.constumeNumber,
        videoType: request.videoType || "",
        videoLength: request.videoLength || "",
        subRequest: request.subRequest || "",
        outFitDescription: request.outFitDescription || "",
        paymentAmount: request.paymentAmount.toString(),
        status: request.status,
      });
    }
  }, [request, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log(formData);

      setIsLoading(true);
      const requiredId =
        currentUser?.ownerId === "Agency Owner itself"
          ? currentUser?.id
          : currentUser?.ownerId;
      const creator = creators.find((i) => i._id === formData.creatorId);
      if (!creator) {
        toast.error("Creator not found");
        return;
      }
      const newFormData = {
        ...formData,
        creatorName: creator ? creator.name : "", // fallback to empty string if not found
        ownerId: requiredId,
      };
      await axios.post(
        `${URL}/api/content-request/create-request`,
        newFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      refreshRequests();
      toast.success(
        mode === "edit"
          ? "Costume request updated successfully"
          : "Costume request created successfully"
      );
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleUpdateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const requiredId =
        currentUser?.ownerId === "Agency Owner itself"
          ? currentUser?.id
          : currentUser?.ownerId;
      const creator = creators.find((i) => i._id === formData.creatorId);
      if (!creator) {
        toast.error("Creator not found");
        return;
      }
      const newFormData = {
        ...formData,
        creatorName: creator ? creator.name : "", // fallback to empty string if not found
        ownerId: requiredId,
      };

      await axios.put(
        `${URL}/api/content-request/update-request/${request?._id}`,
        newFormData,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
            // Don't set Content-Type manually — Axios does it automatically for JSON
          },
        }
      );

      refreshRequests();
      toast.success("Costume request updated successfully");
      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const constumeNumbers = [
    { value: "first", label: "First Costume" },
    { value: "second", label: "Second Costume" },
    { value: "third", label: "Third Costume" },
    { value: "fourth", label: "Fourth Costume" },
    { value: "fifth", label: "Fifth Costume" },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl max-w-2xl w-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">
              {mode === "edit"
                ? "Edit Costume Request"
                : "Create New Costume Request"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-150"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <form
            onSubmit={mode === "edit" ? handleUpdateRequest : handleSubmit}
            className="p-6 space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sub Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter subscriber name"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Creator *
                </label>
                <select
                  name="creatorId"
                  required
                  value={formData.creatorId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select creator</option>
                  {creators.map((creator) => (
                    <option key={creator._id} value={creator._id}>
                      {creator.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Costume Number *
                </label>
                <select
                  name="constumeNumber"
                  required
                  value={formData.constumeNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select costume number</option>
                  {constumeNumbers.map((costume) => (
                    <option key={costume.value} value={costume.value}>
                      {costume.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  paymentAmount Amount ($) *
                </label>
                <input
                  type="number"
                  name="paymentAmount"
                  required
                  min="0"
                  step="0.01"
                  value={formData.paymentAmount}
                  onChange={handleChange}
                  placeholder="Amount paid by subscriber"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Video Type
                </label>
                <input
                  type="text"
                  name="videoType"
                  value={formData.videoType}
                  onChange={handleChange}
                  placeholder="E.g. Solo, JOI, etc."
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Video Length
                </label>
                <input
                  type="text"
                  name="videoLength"
                  value={formData.videoLength}
                  onChange={handleChange}
                  placeholder="E.g. 5 minutes, 10 minutes"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Sub Request
              </label>
              <textarea
                name="subRequest"
                value={formData.subRequest}
                onChange={handleChange}
                rows={4}
                placeholder="Detailed request from the subscriber"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Outfit Description
              </label>
              <textarea
                name="outFitDescription"
                value={formData.outFitDescription}
                onChange={handleChange}
                rows={4}
                placeholder="Description of the outfit requested"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {mode === "edit" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}

            <div className="flex justify-end gap-4 pt-4">
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
                className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors duration-150"
              >
                {isLoading ? (
                  <div className="flex justify-center items-center gap-2">
                    <p>{mode === "add" ? "Creating" : "Saving"}</p>
                    <ClipLoader size={14} />
                  </div>
                ) : mode === "add" ? (
                  "Create Request"
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

export default CostumeRequestModal;
