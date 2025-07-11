import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, DollarSign, Percent } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import type { Employee } from "../index";
import BonusSystemModal from "./BonusSystemModal";
import axios from "axios";
import { useAppSelector } from "../../../redux/hooks"; // Adjust the path as needed
import toast from "react-hot-toast";

interface BonusSystem {
  _id: string;
  name: string;
  threshold_amount: number;
  bonus_amount: number;
  bonus_type: "fixed" | "percentage";
  employee_id?: string;
  created_at: string;
  employee?: {
    name: string;
  };
}

interface BonusesProps {
  employees: Employee[];
}

const Bonuses: React.FC<BonusesProps> = ({ employees }) => {
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  const { currentUser } = useAppSelector((state) => state.user);
  const [bonusSystems, setBonusSystems] = useState<BonusSystem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<BonusSystem | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBonusSystems();
  }, []);

  const fetchBonusSystems = async () => {
    try {
      const requiredId =
        currentUser?.ownerId === "Agency Owner itself"
          ? currentUser.id
          : currentUser.ownerId;
      const response = await axios.get(
        `${URL}/api/bonus/fetch-bonus/${requiredId}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );
      setBonusSystems(response.data || []);
    } catch (error) {
      console.error("Error fetching bonus systems:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBonusSystem = async (
    bonusSystem: Omit<BonusSystem, "id" | "created_at">
  ) => {
    try {
      const requiredId =
        currentUser?.ownerId === "Agency Owner itself"
          ? currentUser.id
          : currentUser.ownerId;
      const dataToSend = { ...bonusSystem, ownerId: requiredId };
      const response = await axios.post(
        `${URL}/api/bonus/create-bonus`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );

      setBonusSystems((prev) => [response.data, ...prev]);
      setShowModal(false);
    } catch (error) {
      console.error("Error creating bonus system:", error);
    }
  };

  const handleUpdateBonusSystem = async (bonusSystem: BonusSystem) => {
    try {
      // setIsLoading(true);
      if (!selectedSystem?._id) {
        toast.error("ID is required");
      }
      const response = await axios.put(
        `${URL}/api/bonus/update-bonus/${selectedSystem?._id}`,
        bonusSystem,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );
      fetchBonusSystems();
      setShowModal(false);
      setSelectedSystem(null);
    } catch (error) {
      console.error("Error updating bonus system:", error);
    }
  };

  const handleDeleteBonusSystem = async (id: string) => {
    try {
      await axios.delete(`${URL}/api/bonus/delete-bonus/${id}`, {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      });

      setBonusSystems((prev) => prev.filter((system) => system._id !== id));
    } catch (error) {
      console.error("Error deleting bonus system:", error);
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
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setSelectedSystem(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Create Bonus System
        </button>
      </div>

      {bonusSystems.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            No bonus systems yet
          </h3>
          <p className="text-slate-500 mb-6">
            Create your first bonus system to incentivize your team
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Bonus System
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bonusSystems.map((system, i) => (
            <div
              key={i + 1}
              className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-blue-500 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-slate-800">
                  {system.name}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedSystem(system);
                      setShowModal(true);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBonusSystem(system._id)}
                    className="p-1 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-600">
                  Threshold: ${system.threshold_amount.toLocaleString()}
                </p>
                <p className="text-sm text-slate-600 flex items-center gap-1">
                  Bonus:{" "}
                  {system.bonus_type === "fixed" ? (
                    <>
                      <DollarSign className="h-4 w-4" />
                      {system.bonus_amount.toLocaleString()}
                    </>
                  ) : (
                    <>
                      {system.bonus_amount}
                      <Percent className="h-4 w-4" />
                    </>
                  )}
                </p>
                <p className="text-sm text-slate-600">
                  Assigned to: {system.employee?.name || "All Employees"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <BonusSystemModal
          onClose={() => {
            setShowModal(false);
            setSelectedSystem(null);
          }}
          onSave={
            selectedSystem ? handleUpdateBonusSystem : handleCreateBonusSystem
          }
          bonusSystem={selectedSystem}
          employees={employees}
        />
      )}
    </div>
  );
};

export default Bonuses;
