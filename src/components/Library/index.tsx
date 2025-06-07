import React, { useState, useEffect } from "react";
import {
  Plus,
  Folder,
  Upload,
  ChevronLeft,
  Image,
  Video,
  Download,
  Trash2,
  Eye,
  TextIcon,
} from "lucide-react";
import { File, ImageIcon, VideoIcon, FileText, FilePdf } from "lucide-react";

import { supabase } from "../../lib/supabase";
import FolderModal from "./FolderModal";
import UploadModal from "./UploadModal";
import RequestModal from "./RequestModal";
import ContentPreviewModal from "./ContentPreviewModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import RequestPreviewModal from "./RequestPreviewModal";
import type { Database } from "../../lib/database.types";
import { useAppSelector } from "../../redux/hooks"; // Adjust the path as needed
import axios from "axios";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";

type ContentFolder = Database["public"]["Tables"]["folders"]["Row"];
type ContentItem = Database["public"]["Tables"]["content"]["Row"];

interface Creator {
  id: string;
  name: string;
  status: string;
}

interface ContentRequest {
  id: string;
  title: string;
  description: string;
  due_date: string;
  creator_id?: string;
  status: "pending" | "completed" | "rejected";
  created_at: string;
}

const Library = () => {
  const location = useLocation();
  const [selectedContentRequest, setSelectedContentRequest] = useState({});
  const [uploadContentRequest, setUploadContentRequest] = useState(false);
  const secondSection = location.state?.secondSection;
  const { currentUser } = useAppSelector((state) => state.user);
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  const [activeTab, setActiveTab] = useState<"library" | "requests">("library");
  useEffect(() => {
    if (secondSection) {
      setActiveTab("requests");
    }
  }, [secondSection]);
  const [folders, setFolders] = useState<ContentFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [requests, setRequests] = useState<ContentRequest[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [folderContentCounts, setFolderContentCounts] = useState<
    Record<string, number>
  >({});
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(
    null
  );
  const [selectedRequest, setSelectedRequest] = useState<ContentRequest | null>(
    null
  );
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    show: boolean;
    id?: string;
    type: "folder" | "content" | "request";
  }>({ show: false, type: "folder" });
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFolderForRequest, setSelectedFolderForRequest] =
    useState<ContentFolder | null>(null);

  useEffect(() => {
    fetchFolders();
    fetchCreators();
    fetchAllContentAndRequests();
  }, []);
  useEffect(() => {
    if (creators.length > 0 && currentUser.email) {
      const creator = creators.find((c) => c.email === currentUser.email);
      fetchAllContentAndRequests;
    }
  }, [creators, currentUser.email]);

  useEffect(() => {
    if (selectedFolder) {
      fetchAllContentAndRequests();
    }
  }, [selectedFolder]);
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
    fetchCreators();
  }, [currentUser]);

  const fetchFolders = async () => {
    try {
      const requiredId =
        currentUser.ownerId === "Agency Owner itself"
          ? currentUser.id
          : currentUser.ownerId;
      const response = await axios.get(
        `${URL}/api/folders//get-folder/${requiredId}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );
      setFolders(response.data || []);
    } catch (error) {
      console.error("Error fetching folders:", error);
    } finally {
    }
  };

  const fetchAllContentAndRequests = async () => {
    try {
      setIsLoading(true);

      const requiredId =
        currentUser?.ownerId === "Agency Owner itself"
          ? currentUser.id
          : currentUser.ownerId;

      const creator = creators.find((c) => c.email === currentUser.email);
      const creatorId = creator?._id;

      const [contentRes, requestRes] = await Promise.all([
        axios.get(`${URL}/api/content/get-content/${requiredId}`),
        axios.get(`${URL}/api/content-request/get-requests/${currentUser.id}`, {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }),
      ]);

      const contentItems = contentRes.data || [];
      const contentRequests = requestRes.data || [];

      setContent(contentItems);
      setRequests(contentRequests);

      const counts: Record<string, number> = {};

      [...contentItems, ...contentRequests].forEach((item: any) => {
        const isValid =
          item?._id &&
          item?.fileName &&
          (item?.contentType || item?.type) &&
          item?.folderId;

        if (isValid) {
          counts[item.folderId] = (counts[item.folderId] || 0) + 1;
        }
      });

      // Only set folder content counts if we have at least one valid item
      const hasValidItems = Object.keys(counts).length > 0;
      if (hasValidItems) {
        setFolderContentCounts(counts);
      }
    } catch (error) {
      console.error("Error fetching content or requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async (folder: {
    name: string;
    description?: string;
  }) => {
    try {
      const userId = currentUser.id;
      const requiredId =
        currentUser.ownerId === "Agency Owner itself"
          ? currentUser.id
          : currentUser.ownerId;
      const dataToSend = { ...folder, creator: userId, ownerId: requiredId };
      const response = await axios.post(
        `${URL}/api/folders/create-folder`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );
      fetchFolders();
      // setFolders((prev) => [data, ...prev]);
      setShowFolderModal(false);
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const handleUploadContent = async (files: File[]) => {
    try {
      const creator = creators.find((c) => c.email === currentUser.email);
      let creatorId: any;
      let creatorName: any;
      if (creator) {
        creatorId = creator._id;
        creatorName = creator?.name;
      }

      const ownerId =
        currentUser.ownerId === "Agency Owner itself"
          ? currentUser.id
          : currentUser.ownerId;

      const totalSize = files.reduce((acc, file) => acc + file.size, 0);
      let uploadedBytes = 0;

      const media_urls = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          if (creator) {
            formData.append("creatorId", creatorId);
            formData.append("creatorName", creatorName);
          }
          formData.append("ownerId", ownerId);
          formData.append("folderId", selectedFolder);
          formData.append("file", file);
          formData.append("fileName", file.name);

          // Determine type based on file MIME
          const mimeType = file.type;
          let type = "";

          if (mimeType.startsWith("video/")) {
            type = "video/";
          } else if (mimeType.startsWith("image/")) {
            type = "image/";
          }

          // Add the detected type
          formData.append("type", type);

          const response = await axios.post(
            `${URL}/api/content/send-request`,
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
      fetchAllContentAndRequests();
      setShowUploadModal(false);
      toast.success("Files uploaded successfully");
      // refreshContent(); // Optional: refetch or update state
    } catch (error) {
      console.error("Error uploading content:", error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
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

  const handleCreateRequest = async (request: {
    title: string;
    description: string;
    due_date: string;
    creator_id?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from("content_requests")
        .insert([
          {
            title: request.title,
            description: `${request.description}\n\nFolder: ${
              selectedFolderForRequest?.name || "None"
            }`,
            due_date: new Date(request.due_date).toISOString(),
            creator_id: request.creator_id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setRequests((prev) => [data, ...prev]);
      setShowRequestModal(false);
      setSelectedFolderForRequest(null);
    } catch (error) {
      console.error("Error creating request:", error);
    }
  };

  const handleDeleteContent = async (id: string) => {
    try {
      setIsLoading(true);
      await axios.delete(`${URL}/api/content/delete-content/${id}`);
      setSelectedContent(null);
      fetchAllContentAndRequests();
    } catch (error) {
      console.error("Error deleting content:", error);
      setIsLoading(false);
    }
  };
  const handleDeleteContentRequestOnly = async (id: string) => {
    try {
      setIsLoading(true);
      await axios.delete(`${URL}/api/content-request//delete-request/${id}`, {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      });
      setSelectedContentRequest({});
      setSelectedContent(null);
      fetchAllContentAndRequests();
    } catch (error) {
      console.error("Error deleting content:", error);
      setIsLoading(false);
    }
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
      fetchAllContentAndRequests();
    } catch (error) {
      console.error("Error deleting content:", error);
      setIsLoading(false);
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
      setSelectedRequest(null);
      fetchAllContentAndRequests();
      toast.success("Request deleted successfully");
    } catch (error) {
      console.error("Error deleting request:", error);
      setIsLoading(false);
    }
  };

  const handleDeleteFolder = async (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    setDeleteConfirmation({
      show: true,
      id: folderId,
      type: "folder",
    });
  };

  const handleConfirmDelete = async () => {
    try {
      if (deleteConfirmation.type === "folder") {
        if (!deleteConfirmation.id) return;
        // const { error } = await supabase
        //   .from("folders")
        //   .delete()
        //   .eq("id", deleteConfirmation.id);

        // if (error) throw error;
        const response = await axios.delete(
          `${URL}/api/folders/delete-folder/${deleteConfirmation.id}`,
          {
            headers: {
              Authorization: `Bearer ${currentUser?.token}`,
            },
          }
        );
        fetchFolders();
        setSelectedFolder(null);
      } else if (deleteConfirmation.type === "content") {
        const { error } = await supabase
          .from("content")
          .delete()
          .eq("id", deleteConfirmation.id);

        if (error) throw error;

        setContent((prev) =>
          prev.filter((c) => c.id !== deleteConfirmation.id)
        );
        setSelectedContent(null);
      } else {
        const { error } = await supabase
          .from("content_requests")
          .delete()
          .eq("id", deleteConfirmation.id);

        if (error) throw error;

        setRequests((prev) =>
          prev.filter((r) => r.id !== deleteConfirmation.id)
        );
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error("Error deleting:", error);
    } finally {
      setDeleteConfirmation({ show: false, type: "folder" });
    }
  };

  interface ContentItem {
    media_urls?: string[];
    content_urls?: string[];
    fileName: string; // Corrected key
  }

  const handleDownloadContent = (
    item: ContentItem,
    typeOfTheUrl: "content" | "media"
  ) => {
    const url =
      typeOfTheUrl === "content" ? item.content_urls?.[0] : item.media_urls;
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

  const handleRequestContent = (folder: ContentFolder) => {
    setSelectedFolderForRequest(folder);
    setShowRequestModal(true);
  };

  const getCurrentFolder = () => {
    return folders.find((folder) => folder.id === selectedFolder);
  };

  const getFolderContent = () => {
    const requestContents = requests.filter(
      (item) => item.folderId === selectedFolder
    );

    const otherContents = content.filter(
      (item) => item.folderId === selectedFolder
    );
    const totalContent = [...requestContents, ...otherContents];

    return totalContent;
  };
  const DefaultFileIcon = () => (
    <svg
      className="h-5 w-5 text-gray-400"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V7.414A2 2 0 0017.414 6L14 2.586A2 2 0 0012.586 2H4z" />
    </svg>
  );

  const getFileIcon = (type: string) => {
    if (!type || typeof type !== "string") return DefaultFileIcon;

    if (type.startsWith("image/")) return ImageIcon;
    if (type.startsWith("video/")) return VideoIcon;
    if (type.startsWith("application/pdf")) return PdfIcon;
    if (type.startsWith("text/")) return TextIcon;

    return DefaultFileIcon;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderLibraryContent = () => {
    const currentFolder = getCurrentFolder();
    const folderContent = getFolderContent();
    if (selectedFolder) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedFolder(null)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              Back to Folders
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleRequestContent(currentFolder!)}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                <FileText className="h-5 w-5" />
                Request Content
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                <Upload className="h-5 w-5" />
                Upload Content
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              {currentFolder?.name}
            </h2>
            {currentFolder?.description && (
              <p className="text-sm text-slate-500 mb-6">
                {currentFolder.description}
              </p>
            )}
          </div>
          {folderContent?.filter(
            (item) =>
              item?._id && item?.fileName && (item?.contentType || item?.type)
          ).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {folderContent
                .filter(
                  (item) =>
                    item?._id &&
                    item?.fileName &&
                    (item?.contentType || item?.type)
                )
                .map((item) => {
                  const fileType = item.contentType || item.type;
                  const FileIcon = getFileIcon(fileType);

                  return (
                    <div
                      key={item._id}
                      className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-500 transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {FileIcon ? (
                            <FileIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                          ) : (
                            <span className="h-5 w-5 flex-shrink-0 text-slate-400">
                              ?
                            </span>
                          )}
                          <h3 className="text-sm font-medium text-slate-800 truncate">
                            {item.fileName}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                          <button
                            onClick={() => setSelectedContent(item)}
                            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                            aria-label="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDownloadContent(item, "content")
                            }
                            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                            aria-label="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteContent(item._id)}
                            className="p-1 text-red-400 hover:text-red-600 transition-colors"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        Added{" "}
                        {item?.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "Unknown Date"}
                      </p>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl">
              <Upload className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                No content yet
              </h3>
              <p className="text-slate-500 mb-6">
                Upload your first file to this folder
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                Upload Content
              </button>
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            onClick={() => setShowFolderModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            <Plus className="h-5 w-5" />
            New Folder
          </button>
        </div>

        {folders.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              No folders yet
            </h3>
            <p className="text-slate-500 mb-6">
              Create your first folder to organize your content
            </p>
            <button
              onClick={() => setShowFolderModal(true)}
              className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
            >
              Create Folder
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {folders.map((folder) => {
              const folderContent = content.filter(
                (item) => item.folder_id === folder.id
              );
              return (
                <div
                  key={folder._id}
                  onClick={() => setSelectedFolder(folder._id)}
                  className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-500 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                      <Folder className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <h3 className="text-lg font-medium text-slate-800 truncate">
                        {folder.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestContent(folder);
                        }}
                        className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteFolder(e, folder._id)}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div
                    onClick={() => setSelectedFolder(folder.id)}
                    className="cursor-pointer"
                  >
                    {folder.description && (
                      <p className="text-sm text-slate-500 mb-2 line-clamp-2">
                        {folder.description}
                      </p>
                    )}
                    {folderContentCounts[folder._id] || 0} items
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

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
      fetchAllContentAndRequests();
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

  return (
    <div className="max-w-7xl mx-auto pt-16 lg:pt-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Content Library</h1>
        <div className="mt-4 border-b border-slate-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("library")}
              className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-medium ${
                activeTab === "library"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <Folder className="h-4 w-4" />
              Library
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-medium ${
                activeTab === "requests"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <FileText className="h-4 w-4" />
              Content Requests
            </button>
          </nav>
        </div>
      </div>

      {activeTab === "library" ? (
        renderLibraryContent()
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowRequestModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
            >
              <Plus className="h-5 w-5" />
              New Request
            </button>
          </div>

          {requests && requests.length > 0 ? (
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">
                        Creator
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">
                        Due Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-transparent">
                    {requests.map((request, index) => (
                      <React.Fragment key={request._id}>
                        {/* Main row */}
                        <tr
                          className="hover:bg-slate-50 cursor-pointer"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <td className="px-6 py-4">
                            <div>
                              <h4 className="text-sm font-medium text-slate-800">
                                {request.title}
                              </h4>
                              <p className="text-sm text-slate-500">
                                {request.description}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {request.creatorName || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(request.due_date).toLocaleDateString()}
                          </td>
                          <td
                            className="px-6 py-4"
                            onClick={handleContentStatus}
                          >
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
                        </tr>

                        {/* Upload content row */}
                        <tr>
                          {Array.isArray(requests) &&
                          requests.some(
                            (item) =>
                              Array.isArray(item?.content_urls) &&
                              item.content_urls.length > 0
                          ) ? (
                            <td colSpan="4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {requests.map((item, index) => {
                                  if (
                                    !item ||
                                    typeof item !== "object" ||
                                    !Array.isArray(item.content_urls) ||
                                    item.content_urls.length === 0
                                  )
                                    return null;

                                  const contentType = item.contentType || "";
                                  const fileName =
                                    item.fileName || "Unnamed File";
                                  const createdAt = item.createdAt
                                    ? new Date(
                                        item.createdAt
                                      ).toLocaleDateString()
                                    : "Unknown Date";
                                  const fileId = item._id || `unknown-${index}`;

                                  let FileIcon;
                                  try {
                                    FileIcon = getFileIcon(contentType);
                                  } catch (error) {
                                    console.error(
                                      "Error getting file icon:",
                                      error
                                    );
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
                                              item && setSelectedContent(item)
                                            }
                                            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                                          >
                                            <Eye className="h-4 w-4" />
                                          </button>
                                          <button
                                            onClick={() =>
                                              item &&
                                              handleDownloadContent(
                                                item,
                                                "content"
                                              )
                                            }
                                            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                                          >
                                            <Download className="h-4 w-4" />
                                          </button>
                                          <button
                                            onClick={() =>
                                              item?._id &&
                                              handleDeleteContentRequest(
                                                item._id
                                              )
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
                            <td colSpan="4" className="py-6">
                              <div className="text-center bg-white rounded-2xl">
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
                                    setUploadContentRequest(true);
                                  }}
                                  className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                                >
                                  Upload Content
                                </button>
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
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                No content requests
              </h3>
              <p className="text-slate-500 mb-6">
                Create your first content request
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
      )}

      {selectedContent && (
        <ContentPreviewModal
          content={selectedContent}
          onClose={() => setSelectedContent(null)}
          onDelete={
            selectedContentRequest
              ? handleDeleteContentRequestOnly
              : handleDeleteContent
          }
          typeOfTheURL={
            selectedContent.content_urls?.[0]?.startsWith("https")
              ? "content"
              : !selectedContent.content_urls?.[0]?.startsWith("https") &&
                selectedContent.media_urls?.[0]?.startsWith("https")
              ? "media"
              : null
          }
          onDownload={handleDownloadContent}
        />
      )}

      {selectedRequest && (
        <RequestPreviewModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onDelete={handleDeleteRequest}
        />
      )}

      {showFolderModal && (
        <FolderModal
          onClose={() => setShowFolderModal(false)}
          onSave={handleCreateFolder}
        />
      )}

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={
            uploadContentRequest
              ? handleUploadContentRequest
              : handleUploadContent
          }
        />
      )}

      {showRequestModal && (
        <RequestModal
          onClose={() => {
            setShowRequestModal(false);
            setSelectedFolderForRequest(null);
          }}
          onSave={handleCreateRequest}
          creators={creators}
          folder={selectedFolderForRequest}
          refreshRequests={fetchAllContentAndRequests}
          folders={folders}
        />
      )}

      {deleteConfirmation.show && (
        <DeleteConfirmationModal
          title={
            deleteConfirmation.type === "folder"
              ? "Delete Folder"
              : "Delete Content"
          }
          message={
            deleteConfirmation.type === "folder"
              ? "Are you sure you want to delete this folder and all its contents? This action cannot be undone."
              : "Are you sure you want to delete this content? This action cannot be undone."
          }
          onClose={() => setDeleteConfirmation({ show: false, type: "folder" })}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default Library;
