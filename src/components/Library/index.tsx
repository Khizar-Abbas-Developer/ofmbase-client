import React, { useState, useEffect } from "react";
import {
  Plus,
  Folder,
  FileText,
  Upload,
  ChevronLeft,
  Image,
  Video,
  File,
  Download,
  Trash2,
  Eye,
} from "lucide-react";
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
  const { currentUser } = useAppSelector((state) => state.user);
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  const [activeTab, setActiveTab] = useState<"library" | "requests">("library");
  const [folders, setFolders] = useState<ContentFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [requests, setRequests] = useState<ContentRequest[]>([]);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
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
    fetchContent();
    fetchCreators();
    fetchRequests();
  }, []);

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
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setFolders(data || []);
    } catch (error) {
      console.error("Error fetching folders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from("content")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setContent(data || []);
    } catch (error) {
      console.error("Error fetching content:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      const requiredId =
        currentUser.ownerId === "Agency Owner itself"
          ? currentUser.id
          : currentUser.ownerId;
      const response = await axios.get(
        `${URL}/api/content-request/get-requests/${requiredId}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );
      console.log(response);
      setRequests(response.data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async (
    folder: Omit<ContentFolder, "id" | "created_at" | "updated_at">
  ) => {
    try {
      const { data, error } = await supabase
        .from("folders")
        .insert([folder])
        .select()
        .single();

      if (error) throw error;

      setFolders((prev) => [data, ...prev]);
      setShowFolderModal(false);
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const handleUploadContent = async (files: File[]) => {
    try {
      const newContent = files.map((file) => ({
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
        folder_id: selectedFolder,
      }));

      const { data, error } = await supabase
        .from("content")
        .insert(newContent)
        .select();

      if (error) throw error;

      setContent((prev) => [...data, ...prev]);
      setShowUploadModal(false);
    } catch (error) {
      console.error("Error uploading content:", error);
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
      const { error } = await supabase.from("content").delete().eq("id", id);

      if (error) throw error;

      setContent((prev) => prev.filter((item) => item.id !== id));
      setSelectedContent(null);
    } catch (error) {
      console.error("Error deleting content:", error);
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
      setSelectedRequest(null);
      toast.success("Request deleted successfully");
    } catch (error) {
      console.error("Error deleting request:", error);
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
  console.log("Folders:", folders);
  console.log("Selected Folder:", selectedFolder);
  console.log("Content:", content);
  console.log("Requests:", requests);
  console.log("Selected Content:", selectedContent);
  console.log("Selected Request:", selectedRequest);
  console.log("Creators:", creators);
  console.log("Selected Folder For Request:", selectedFolderForRequest);

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.id) return;

    try {
      if (deleteConfirmation.type === "folder") {
        const { error } = await supabase
          .from("folders")
          .delete()
          .eq("id", deleteConfirmation.id);

        if (error) throw error;

        setFolders((prev) =>
          prev.filter((f) => f.id !== deleteConfirmation.id)
        );
        setContent((prev) =>
          prev.filter((c) => c.folder_id !== deleteConfirmation.id)
        );
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

  const handleDownloadContent = (item: ContentItem) => {
    const link = document.createElement("a");
    link.href = item.url;
    link.download = item.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRequestContent = (folder: ContentFolder) => {
    setSelectedFolderForRequest(folder);
    setShowRequestModal(true);
  };

  const getCurrentFolder = () => {
    return folders.find((folder) => folder.id === selectedFolder);
  };

  const getFolderContent = () => {
    return content.filter((item) => item.folder_id === selectedFolder);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return Image;
    if (type.startsWith("video/")) return Video;
    return File;
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

          {folderContent.length === 0 ? (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {folderContent.map((item) => {
                const FileIcon = getFileIcon(item.type);
                return (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-500 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <FileIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <h3 className="text-sm font-medium text-slate-800 truncate">
                          {item.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                        <button
                          onClick={() => setSelectedContent(item)}
                          className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadContent(item)}
                          className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteContent(item.id)}
                          className="p-1 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      Added{" "}
                      {new Date(item.created_at || "").toLocaleDateString()}
                    </p>
                  </div>
                );
              })}
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
                  key={folder.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-500 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      onClick={() => setSelectedFolder(folder.id)}
                      className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                    >
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
                        onClick={(e) => handleDeleteFolder(e, folder.id)}
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
                    <p className="text-xs text-slate-400">
                      {folderContent.length}{" "}
                      {folderContent.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
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
                  <tbody className="divide-y divide-slate-100">
                    {requests.map((request) => (
                      <tr
                        key={request._id}
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
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              request.status === "pending"
                                ? "bg-yellow-50 text-yellow-800"
                                : request.status === "completed"
                                ? "bg-green-50 text-green-800"
                                : "bg-red-50 text-red-800"
                            }`}
                          >
                            {request.status.charAt(0).toUpperCase() +
                              request.status.slice(1)}
                          </span>
                        </td>
                      </tr>
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
          onDelete={handleDeleteContent}
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
          onUpload={handleUploadContent}
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
          refreshRequests={fetchRequests}
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
