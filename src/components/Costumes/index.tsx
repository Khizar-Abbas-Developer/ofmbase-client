import React, { useState, useEffect } from "react";
import {
  Download,
  Eye,
  Image,
  MoreHorizontal,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import CostumeRequestModal from "./CostumeRequestModal";
import CostumeDetailModal from "./CostumeDetailModal";
import { useAppSelector } from "../../redux/hooks"; // Adjust the path as needed

import axios from "axios";
import toast from "react-hot-toast";
import UploadModal from "../Library/UploadModal";
import ContentPreviewModal from "../Library/ContentPreviewModal";

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
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(
    null
  );
  const [selectedContentRequest, setSelectedContentRequest] = useState({});

  const [showUploadModal, setShowUploadModal] = useState(false);

  const [folders, setFolders] = useState([]);
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
      setIsLoading(true);
      await axios.delete(`${URL}/api/content-request/delete-request/${id}`, {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      });
      fetchRequests();
      setShowDetailModal(false);
      setSelectedContent(null);
      toast.success("Request deleted successfully");
    } catch (error) {
      console.error("Error deleting costume request:", error);
      setIsLoading(false);
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

  const handleContentStatus = async (e) => {
    e.stopPropagation();
  };

  const onStatusChange = async (request: any, value) => {
    try {
      const newFormData = {
        ...request,
        status: value, // fallback to empty string if not found
      };
      setIsLoading(true);
      const response = await axios.put(
        `${URL}/api/content-request/update-request/${request?._id}`,
        newFormData,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
            // Don't set Content-Type manually — Axios does it automatically for JSON
          },
        }
      );
      fetchRequests();
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case "done":
        return "bg-blue-50 text-blue-700";
      case "approved":
        return "bg-green-50 text-green-700";
      case "pending":
        return "bg-yellow-50 text-yellow-700";
      case "rejected":
        return "bg-red-50 text-red-700";
      default:
        return "bg-slate-50 text-slate-700";
    }
  };

  const handleUploadContentRequest = async (files: File[]) => {
    try {
      const creator = creators.find((c) => c.email === currentUser.email);
      if (!creator) {
        toast.error("Creator can only upload the content");
        return;
      }

      const totalSize = files.reduce((acc, file) => acc + file.size, 0);
      let uploadedBytes = 0;

      const content_urls = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();

          formData.append("file", file);
          formData.append("fileName", file.name);
          formData.append("requestId", selectedContentRequest._id);
          formData.append("status", "done");

          // Determine type based on file MIME
          const mimeType = file.type;
          let type = "";

          if (mimeType.startsWith("video/")) {
            type = "video/";
          } else if (mimeType.startsWith("image/")) {
            type = "image/";
          }

          // Add the detected type
          formData.append("contentType", type);

          const response = await axios.post(
            `${URL}/api/content-request/upload-content`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
              onUploadProgress: (progressEvent) => {
                const currentUploaded = progressEvent.loaded;
                uploadedBytes += currentUploaded;
                const progress = Math.min(
                  (uploadedBytes / totalSize) * 100,
                  100
                );
                setUploadProgress(progress);
              },
            }
          );
          const { publicUrl } = response.data;
          return publicUrl;
        })
      );

      setShowUploadModal(false);
      fetchRequests();
      toast.success("Files uploaded successfully");
      // refreshContent(); // Optional: refetch or update state
      fetchAllContentAndRequests();
    } catch (error) {
      console.error("Error uploading content:", error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setShowUploadModal(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return Image;
    if (type.startsWith("video/")) return Video;
    return File;
  };

  const handleDownloadContent = (item: ContentItem) => {
    const url = item.media_urls?.[0] || item.content_urls?.[0];
    if (!url) {
      console.error("No downloadable URL found.");
      return;
    }

    // Try to force download via blob for better compatibility
    fetch(url, { mode: "cors" }) // make sure the URL allows CORS if cross-origin
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = item.fileName; // ✅ Correct file name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch((err) => {
        console.error("Download failed", err);
      });
  };

  const handleDeleteContentRequest = async (id: string) => {
    try {
      setIsLoading(true);
      await axios.delete(
        `${URL}/api/content-request/delete-content-request-only/${id}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      console.error("Error deleting content:", error);
      setIsLoading(false);
    }
  };

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
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((request, index) => (
                <React.Fragment key={request._id}>
                  <tr key={request._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {request.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {request.creatorName || "-"}
                    </td>
                    <td className="px-4 py-4" onClick={handleContentStatus}>
                      <select
                        value={request.status}
                        disabled={currentUser.accountType !== "owner"}
                        onChange={(e) =>
                          onStatusChange(request, e.target.value)
                        }
                        className={`text-xs px-2 py-1 rounded-full border-0 ${getStatusColor(
                          request.status
                        )}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="done">Done</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      ${request.paymentAmount}
                    </td>

                    {/* // */}

                    {/* // */}
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
                  <tr>
                    {Array.isArray(request.content_urls) &&
                    request.content_urls.length > 0 ? (
                      <td colSpan="4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {request.content_urls.map((url, i) => {
                            const contentType = request.contentType || "";
                            const fileName =
                              request.fileName || `Unnamed File ${i + 1}`;
                            const createdAt = request.createdAt
                              ? new Date(request.createdAt).toLocaleDateString()
                              : "Unknown Date";
                            const fileId = request._id + "-" + i;

                            let FileIcon;
                            try {
                              FileIcon = getFileIcon(contentType);
                            } catch (error) {
                              console.error("Error getting file icon:", error);
                              FileIcon = () => (
                                <span className="text-red-500">!</span>
                              );
                            }

                            return (
                              <div
                                key={fileId}
                                className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-500 transition-colors group"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <FileIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                    <h3 className="text-sm font-medium text-slate-800 truncate">
                                      {fileName}
                                    </h3>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                                    <button
                                      onClick={() =>
                                        setSelectedContent({ ...request, url })
                                      }
                                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDownloadContent({
                                          ...request,
                                          url,
                                        })
                                      }
                                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                      <Download className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        request._id &&
                                        handleDeleteContentRequest(request._id)
                                      }
                                      className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-500 truncate">
                                  Added {createdAt}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    ) : (
                      <td colSpan="5">
                        <div className="flex justify-center">
                          <div className="text-center bg-white rounded-2xl inline-block">
                            <Upload className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">
                              No content Uploaded
                            </h3>
                            <p className="text-slate-500 mb-6">
                              Upload content according to the request
                            </p>
                            <button
                              onClick={() => {
                                setSelectedContentRequest(request);
                                setShowUploadModal(true);
                              }}
                              className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                            >
                              Upload Content
                            </button>
                          </div>
                        </div>
                      </td>
                    )}
                  </tr>

                  {/* Spacer row */}
                  {index !== requests.length - 1 && (
                    <tr>
                      <td colSpan="4" className="h-8 bg-[#f0f3f8]"></td>
                    </tr>
                  )}
                </React.Fragment>
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

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUploadContentRequest}
        />
      )}

      {selectedContent && (
        <ContentPreviewModal
          content={selectedContent}
          onClose={() => setSelectedContent(null)}
          onDelete={handleDeleteRequest}
          onDownload={handleDownloadContent}
        />
      )}
    </div>
  );
};

export default Costumes;
