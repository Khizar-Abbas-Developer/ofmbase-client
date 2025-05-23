import React, { useState, useEffect } from "react";
import { Eye, MoreHorizontal } from "lucide-react";
import { supabase } from "../../lib/supabase";
import CostumeRequestModal from "./CostumeRequestModal";
import CostumeDetailModal from "./CostumeDetailModal";
import { useAppSelector } from "../../redux/hooks"; // Adjust the path as needed

import axios from "axios";
import toast from "react-hot-toast";

interface CostumeRequest {
  id: string;
  name: string;
  creatorId: string;
  costumeNumber: string;
  videoType?: string;
  videoLength?: string;
  subRequest?: string;
  outFitDescription?: string;
  paymentAmount: number;
  status: "pending" | "approved" | "rejected" | "completed";
  created_at: string;
  creator?: {
    name: string;
  };
}

interface CostumesProps {
  creators: Creator[];
}

const Costumes: React.FC<CostumesProps> = () => {
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  // Add default empty array
  const [requests, setRequests] = useState<CostumeRequest[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CostumeRequest | null>(
    null
  );
  const [creators, setCreators] = useState<Creator[]>([]);
  const { currentUser } = useAppSelector((state: any) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCreators = async () => {
    try {
      const requiredId =
        currentUser.ownerId === "Agency Owner itself"
          ? currentUser.id
          : currentUser.ownerId;
      const response = await axios.get(
        `${
          import.meta.env.VITE_PUBLIC_BASE_URL
        }/api/creator/get-creators/${requiredId}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );

      setCreators(response.data.creators || []);
    } catch (error) {
      console.error("Error fetching creators:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchCreators();
  }, []);

  const fetchRequests = async () => {
    try {
      const requierdId =
        currentUser.ownerId === "Agency Owner itself"
          ? currentUser.id
          : currentUser.ownerId;
      const response = await axios.get(
        `${URL}/api/content-request/get-requests-detail/${requierdId}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );
      setRequests(response.data || []);
    } catch (error) {
      console.error("Error fetching costume requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRequest = async (
    request: Omit<CostumeRequest, "id" | "status" | "created_at">
  ) => {
    try {
      const { data, error } = await supabase
        .from("costume_requests")
        .insert([request])
        .select(
          `
          *,
          creator:creators(name)
        `
        )
        .single();

      if (error) throw error;

      setRequests((prev) => [data, ...prev]);
      setShowRequestModal(false);
    } catch (error) {
      console.error("Error creating costume request:", error);
    }
  };

  const handleEditRequest = async (request: CostumeRequest) => {
    try {
      console.log(request);

      const { data, error } = await supabase
        .from("costume_requests")
        .update({
          name: request.name,
          creatorId: request.creatorId,
          costumeNumber: request.costumeNumber,
          videoType: request.videoType,
          videoLength: request.videoLength,
          subRequest: request.subRequest,
          outFitDescription: request.outFitDescription,
          paymentAmount: request.paymentAmount,
          status: request.status,
        })
        .eq("id", request.id)
        .select(
          `
          *,
          creator:creators(name)
        `
        )
        .single();

      if (error) throw error;

      setRequests((prev) => prev.map((r) => (r.id === request.id ? data : r)));
      setShowRequestModal(false);
      setSelectedRequest(null);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating costume request:", error);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      console.log(id);
      const response = await axios.delete(
        `${URL}/api/content-request/delete-request/${id}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );
      fetchRequests();
      setShowDetailModal(false);
      setSelectedRequest(null);
      toast.success("Request deleted successfully");
    } catch (error) {
      console.error("Error deleting costume request:", error);
    }
  };

  const handleViewRequest = (request: CostumeRequest) => {
    setSelectedRequest(request);
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Costumes</h1>
        <button
          onClick={() => {
            setSelectedRequest(null);
            setIsEditing(false);
            setShowRequestModal(true);
          }}
          className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
        >
          Create Costume Request
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">
                  Sub Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">
                  Creator
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">
                  paymentAmount
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">
                  Created Date
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((request) => (
                <tr key={request._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {request.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {request.creatorName || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.status === "pending"
                          ? "bg-yellow-50 text-yellow-800"
                          : request.status === "approved"
                          ? "bg-blue-50 text-blue-800"
                          : request.status === "completed"
                          ? "bg-green-50 text-green-800"
                          : "bg-red-50 text-red-800"
                      }`}
                    >
                      {request.status.charAt(0).toUpperCase() +
                        request.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    ${request.paymentAmount}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {/* {new Date(request.createdAt).toLocaleDateString()} */}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => handleViewRequest(request)}
                        className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setIsEditing(true);
                          setShowRequestModal(true);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {requests.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                No costume requests yet
              </h3>
              <p className="text-slate-500 mb-6">
                Create your first costume request
              </p>
              <button
                onClick={() => setShowRequestModal(true)}
                className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                Create Request
              </button>
            </div>
          )}
        </div>
      </div>

      {showRequestModal && (
        <CostumeRequestModal
          onClose={() => {
            setShowRequestModal(false);
            setSelectedRequest(null);
            setIsEditing(false);
          }}
          onSave={
            isEditing && selectedRequest
              ? handleEditRequest
              : handleCreateRequest
          }
          creators={creators}
          request={selectedRequest}
          mode={isEditing ? "edit" : "add"}
          refreshRequests={fetchRequests}
        />
      )}

      {showDetailModal && selectedRequest && (
        <CostumeDetailModal
          request={selectedRequest}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRequest(null);
          }}
          onEdit={() => {
            setShowDetailModal(false);
            setIsEditing(true);
            setShowRequestModal(true);
          }}
          onDelete={() => handleDeleteRequest(selectedRequest._id)}
        />
      )}
    </div>
  );
};

export default Costumes;
