import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Creator } from "./index";
import ErrorDialog from "../ErrorDialog";
import { useAppSelector } from "../../redux/hooks"; // Adjust the path as needed
import axios from "axios";
import toast from "react-hot-toast";

interface CreatorModalProps {
  mode: "add" | "edit" | "view";
  creator?: Creator | null;
  onClose: () => void;
  onSave: (creator: Creator | Omit<Creator, "id">) => void;
}

const CreatorModal: React.FC<CreatorModalProps> = ({
  mode,
  creator,
  onClose,
  onSave,
}) => {
  const { currentUser } = useAppSelector((state) => state.user);
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  const [formData, setFormData] = useState<Partial<Creator>>({
    name: "",
    email: "",
    age: undefined,
    country: "",
    status: "invited",
    bio: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
    },
    measurements: {
      height: undefined,
      weight: undefined,
      shoeSize: "",
      dressSize: "",
      waist: undefined,
      hips: undefined,
    },
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (creator && (mode === "edit" || mode === "view")) {
      setFormData(creator);
    }
  }, [creator, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // if (!formData.name || !formData.email) {
    //   setError("Name and email are required");
    //   return;
    // }

    setIsLoading(true);
    setError(null);

    try {
      const dataToSend = {
        email: formData.email,
        name: formData.name,
        age: formData.age,
        country: formData.country,
        status: formData.status,
        bio: formData.bio.trim(),
        address: formData.address,
        measurements: formData.measurements,
      };
      const response = await axios.post(
        `${URL}/api/creator/add-creator/${currentUser?.id}`,

        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`, // Replace `token` with your actual token variable
            // Optional: other headers if needed
            // "Content-Type": "application/json",
          },
        }
      );
      toast.success(response.data.message);
      onSave();
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.message);
      setError(error.response.data.errors[0].message);
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
    if (name.includes(".")) {
      const [section, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section as keyof Creator],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleEditCreator = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        email: formData.email,
        name: formData.name,
        age: formData.age,
        country: formData.country,
        status: formData.status,
        bio: formData.bio.trim(),
        address: formData.address,
        measurements: formData.measurements,
      };
      const response = await axios.patch(
        `${URL}/api/creator/update-creator/${creator?._id}`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`, // Replace `token` with your actual token variable
            // Optional: other headers if needed
            // "Content-Type": "application/json",
          },
        }
      );
      console.log(response);
      toast.success(response.data.message);
      onSave();
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">
              {mode === "add"
                ? "Add New Creator"
                : mode === "edit"
                ? "Edit Creator"
                : "Creator Details"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-150"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <form
            onSubmit={mode === "add" ? handleSubmit : handleEditCreator}
            className="p-6 space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Name*
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={mode === "view"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email*
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={mode === "view" || mode === "edit"}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={mode === "view"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={mode === "view"}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Street
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address?.street || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={mode === "view"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address?.city || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={mode === "view"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address?.state || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={mode === "view"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="address.postalCode"
                    value={formData.address?.postalCode || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={mode === "view"}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Body Measurements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    name="measurements.height"
                    value={formData.measurements?.height || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={mode === "view"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="measurements.weight"
                    value={formData.measurements?.weight || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={mode === "view"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Shoe Size
                  </label>
                  <input
                    type="text"
                    name="measurements.shoeSize"
                    value={formData.measurements?.shoeSize || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={mode === "view"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Dress Size
                  </label>
                  <input
                    type="text"
                    name="measurements.dressSize"
                    value={formData.measurements?.dressSize || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={mode === "view"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Waist (cm)
                  </label>
                  <input
                    type="number"
                    name="measurements.waist"
                    value={formData.measurements?.waist || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={mode === "view"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Hips (cm)
                  </label>
                  <input
                    type="number"
                    name="measurements.hips"
                    value={formData.measurements?.hips || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={mode === "view"}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">Bio</h3>
              <textarea
                name="bio"
                value={formData.bio || ""}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={mode === "view"}
              />
            </div>

            {mode !== "view" && (
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
                  {isLoading
                    ? "Creating..."
                    : mode === "add"
                    ? "Add Creator"
                    : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {error && <ErrorDialog message={error} onClose={() => setError(null)} />}
    </div>
  );
};

export default CreatorModal;
