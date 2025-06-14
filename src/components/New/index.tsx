import { useEffect, useState } from "react";
import {
  Plus,
  Folder,
  Upload,
  FolderPlus,
  Trash2,
  Download,
  Eye,
  TextIcon,
  ChevronLeft,
} from "lucide-react";
import { File, ImageIcon, VideoIcon, FileText } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import axios from "axios";
import { useAppSelector } from "../../redux/hooks";
import DocumentPreviewModal from "./FilePreviewModal";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";

interface Tab {
  _id: string;
  name: string;
  folders: Folder[];
}

interface Folder {
  _id: string;
  name: string;
  documents: Document[];
}

interface Document {
  _id: string;
  name: string;
  url: string;
  uploadDate: string;
}

const New = () => {
  const [downloadingDocument, setDownloadingDocument] = useState(false);
  const [deletingDocument, setDeletingDocument] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [previewDocument, setPreviewDocumetn] = useState(null);
  const { currentUser } = useAppSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState(tabs[0]?._id ?? "");
  const [showNewTabInput, setShowNewTabInput] = useState(false);
  const [newTabName, setNewTabName] = useState("");
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [DocumentsToDisplay, setDocumentsToDisplay] = useState<Document[]>([]);
  //
  const setDocumentsWhichHaveToDisplay = async () => {
    if (selectedFolderId) {
      // Traverse all tabs
      for (const tab of tabs) {
        // Traverse all folders inside each tab
        const matchedFolder = tab.folders?.find(
          (folder) => folder._id === selectedFolderId
        );

        // If a matching folder is found, extract its documents and break
        if (matchedFolder) {
          setDocumentsToDisplay(matchedFolder.documents || []);
          break;
        }
      }
    }
  };
  useEffect(() => {
    setDocumentsWhichHaveToDisplay();
  }, [selectedFolderId]);

  //
  const fetchTabs = async () => {
    try {
      const requiredId =
        currentUser?.ownerId === "Agency Owner itself"
          ? currentUser?.id
          : currentUser?.ownerId;
      const response = await axios.get(
        `${URL}/api/document/tabs/tabs/${requiredId}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );
      setTabs(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTabs();
  }, []);

  const handleAddTab = async () => {
    try {
      setLoading(true);
      const requiredId =
        currentUser?.ownerId === "Agency Owner itself"
          ? currentUser?.id
          : currentUser?.ownerId;

      if (newTabName.trim()) {
        const dataToSend = {
          name: newTabName,
          folders: [],
          ownerId: requiredId,
        };

        const response = await axios.post(
          `${URL}/api/document/tabs/tabs/create-document-tab`,
          dataToSend,
          {
            headers: {
              Authorization: `Bearer ${currentUser?.token}`,
            },
          }
        );

        const newTab = response.data; // Adjust based on your API response
        setTabs([...tabs, newTab]);
        setNewTabName("");
        setShowNewTabInput(false);
        setActiveTab(newTab._id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFolder = async () => {
    try {
      if (newFolderName.trim()) {
        setCreatingFolder(true);
        const { data } = await axios.post(
          `${URL}/api/document/tabs/tabs/${activeTab}/folders`,
          { name: newFolderName },
          { headers: { Authorization: `Bearer ${currentUser?.token}` } }
        );
        setTabs(tabs.map((tab) => (tab._id === activeTab ? data : tab)));
        setNewFolderName("");
        setCreatingFolder(false);

        setShowNewFolderInput(false);
      }
    } catch (error) {
      console.error(error);
      setCreatingFolder(false);
    }
  };

  const handleFileUpload = async (folderId: string, files: FileList) => {
    try {
      setUploadingDocument(true);
      const formData = new FormData();

      Array.from(files).forEach((file) => {
        formData.append("file", file); // 👈 backend uses upload.array("file")
      });
      if (!activeTab) {
        toast.error("Active Tab isn't available!");
        return;
      }
      const { data } = await axios.post(
        `${URL}/api/document/tabs/${activeTab}/folders/${folderId}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );
      setTabs(
        tabs.map((tab) =>
          tab._id === activeTab
            ? {
                ...tab,
                folders: tab.folders.map((f) =>
                  f._id === folderId ? data : f
                ),
              }
            : tab
        )
      );
      setDocumentsToDisplay([...data.documents]);

      fetchTabs();
    } catch (error) {
      console.error(error);
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleOpenFolder = async (folderId: string) => {
    setSelectedFolderId(folderId);
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
    if (type.startsWith("application/pdf")) return FileText;
    if (type.startsWith("text/")) return TextIcon;

    return DefaultFileIcon;
  };
  const handleDeleteDocument = async (id: string) => {
    try {
      setDeletingDocument(true);
      const response = await axios.delete(
        `${URL}/api/document/tabs/delete-document/${id}`
      );
      const deletedId = response.data.deletedDocument._id;
      // Remove the deleted document from the state
      setDocumentsToDisplay((prev) =>
        prev.filter((doc) => doc._id !== deletedId)
      );
      fetchTabs();
      setPreviewDocumetn(null);
      setSelectedFolderId(selectedFolderId);
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingDocument(false);
    }
  };
  const handleTabSelect = async (value: any) => {
    setActiveTab(value);
    if (selectedFolderId) {
      setSelectedFolderId(null); // optional
    }
  };
  //Download functionality
  const handleDownloadDocument = (item: any) => {
    const url = item?.url;
    if (!url) {
      console.error("No downloadable URL found.");
      return;
    }

    setDownloadingDocument(true); // Set loading state before download starts

    fetch(url, { mode: "cors" }) // Ensure CORS if needed
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = item.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch((err) => {
        console.error("Download failed", err);
      })
      .finally(() => {
        setDownloadingDocument(false); // Always reset state after completion
      });
  };

  return (
    <>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto pt-16 lg:pt-0">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-slate-800">
              Document Management
            </h1>
            <div className="flex items-center gap-4">
              {!showNewTabInput && (
                <button
                  onClick={() => setShowNewTabInput(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Add Tab
                </button>
              )}
            </div>
          </div>

          {showNewTabInput && (
            <div className="mb-6 flex items-center gap-4">
              <input
                type="text"
                value={newTabName}
                onChange={(e) => setNewTabName(e.target.value)}
                placeholder="Enter tab name"
                className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddTab}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowNewTabInput(false);
                  setNewTabName("");
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm p-6">
            {tabs.length > 0 ? (
              <Tabs value={activeTab} className="w-full">
                <TabsList className="mb-6">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab._id}
                      value={tab._id}
                      tabChangeFunction={handleTabSelect}
                      onClick={() => setActiveTab(tab._id)}
                    >
                      {tab.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {tabs.map((tab) => (
                  <TabsContent key={tab._id} value={tab._id}>
                    <div className="space-y-6">
                      {!selectedFolderId && (
                        <div className="flex justify-between items-center">
                          <h2 className="text-lg font-semibold text-slate-800">
                            {tab.name}
                          </h2>
                          {!showNewFolderInput && (
                            <button
                              onClick={() => setShowNewFolderInput(true)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                            >
                              <FolderPlus className="h-5 w-5" />
                              New Folder
                            </button>
                          )}
                        </div>
                      )}

                      {showNewFolderInput && (
                        <div className="flex items-center gap-4">
                          <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Enter folder name"
                            className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={handleAddFolder}
                            disabled={creatingFolder}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                          >
                            {creatingFolder ? (
                              <div className="flex justify-center items-center gap-2">
                                <p>Creating...</p>
                                <p>
                                  <ClipLoader size={14} />
                                </p>
                              </div>
                            ) : (
                              "Create Folder"
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setShowNewFolderInput(false);
                              setNewFolderName("");
                            }}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {selectedFolderId ? (
                        <>
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <button
                                className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
                                onClick={() => setSelectedFolderId(null)}
                              >
                                <ChevronLeft className="h-5 w-5" />
                                Back to Folders
                              </button>
                              <div className="flex  gap-4 items-center px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors">
                                <label className="cursor-pointer ">
                                  <input
                                    type="file"
                                    disabled={uploadingDocument}
                                    multiple
                                    className="hidden"
                                    onChange={(e) =>
                                      e.target.files &&
                                      handleFileUpload(
                                        selectedFolderId,
                                        e.target.files
                                      )
                                    }
                                  />
                                  <div className="flex p-0 lg:p-1 gap-0 lg:gap-2 items-center justify-center">
                                    {uploadingDocument ? (
                                      <>
                                        <p>Please wait...</p>
                                        <p>
                                          <ClipLoader size={14} color="white" />
                                        </p>
                                      </>
                                    ) : (
                                      <p className="text-xs">Upload Document</p>
                                    )}
                                    <Upload className="h-5 w-5 text-white hover:text-slate-600 transition-colors" />
                                  </div>
                                </label>
                              </div>
                            </div>
                            {DocumentsToDisplay.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {DocumentsToDisplay.map((item) => {
                                  const fileType = item.type;
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
                                            {item.name}
                                          </h3>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                                          <button
                                            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                                            aria-label="View"
                                            onClick={() =>
                                              setPreviewDocumetn(item)
                                            }
                                          >
                                            <Eye className="h-4 w-4" />
                                          </button>
                                          <button
                                            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                                            aria-label="Download"
                                            onClick={() =>
                                              handleDownloadDocument(item)
                                            }
                                          >
                                            {downloadingDocument ? (
                                              <ClipLoader
                                                size={14}
                                                color="green"
                                              />
                                            ) : (
                                              <Download className="h-4 w-4" />
                                            )}
                                          </button>
                                          <button
                                            className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                            aria-label="Delete"
                                            onClick={() =>
                                              handleDeleteDocument(item._id)
                                            }
                                          >
                                            {deletingDocument ? (
                                              <ClipLoader
                                                size={14}
                                                color="red"
                                              />
                                            ) : (
                                              <Trash2 className="h-4 w-4" />
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-center py-12 bg-white rounded-2xl">
                                <Upload className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                                  No document yet
                                </h3>
                                <p className="text-slate-500 mb-6">
                                  Upload your first Document to this folder
                                </p>
                                <div className="flex gap-4 items-center px-4 py-0 bg-black w-[15%] lg:w-[15%] mx-auto text-white rounded-xl hover:bg-gray-800 transition-colors">
                                  <label className="cursor-pointer ">
                                    <input
                                      type="file"
                                      disabled={uploadingDocument}
                                      multiple
                                      className="hidden"
                                      onChange={(e) =>
                                        e.target.files &&
                                        handleFileUpload(
                                          selectedFolderId,
                                          e.target.files
                                        )
                                      }
                                    />
                                    <div className="flex p-0 lg:p-1 gap-0 lg:gap-2 items-center justify-center">
                                      {uploadingDocument ? (
                                        <>
                                          <p>Please wait...</p>
                                          <p>
                                            <ClipLoader
                                              size={14}
                                              color="white"
                                            />
                                          </p>
                                        </>
                                      ) : (
                                        <p className="text-xs">
                                          Upload Document
                                        </p>
                                      )}
                                      <Upload className="h-5 w-5 text-white hover:text-slate-600 transition-colors" />
                                    </div>
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {tab.folders.map((folder) => (
                              <div
                                key={folder._id}
                                onClick={() => handleOpenFolder(folder._id)}
                                className="p-6 border border-slate-200 cursor-pointer rounded-2xl hover:border-blue-500 transition-colors"
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-2">
                                    <Folder className="h-5 w-5 text-blue-500" />
                                    <h3 className="font-medium text-slate-800">
                                      {folder.name}
                                    </h3>
                                  </div>
                                </div>
                                {folder.documents.length === 0 ? (
                                  <p className="text-sm text-slate-500 text-center py-4">
                                    No documents yet
                                  </p>
                                ) : (
                                  <>
                                    <p>{folder.documents.length} Items</p>
                                  </>
                                  // <ul className="space-y-2">
                                  //   {folder.documents.map((doc) => (
                                  //     <li
                                  //       key={doc._id}
                                  //       className="text-sm text-slate-600"
                                  //     >
                                  //       {doc.name}
                                  //     </li>
                                  //   ))}
                                  // </ul>
                                )}
                              </div>
                            ))}
                          </div>

                          {tab.folders.length === 0 && (
                            <div className="text-center py-12">
                              <Folder className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                                No folders yet
                              </h3>
                              <p className="text-slate-500 mb-6">
                                Create your first folder to get started
                              </p>
                              <button
                                onClick={() => setShowNewFolderInput(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                              >
                                <FolderPlus className="h-5 w-5" />
                                Create Folder
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="text-center py-20">
                <h2 className="text-xl font-semibold text-slate-700 mb-2">
                  No Tabs Found
                </h2>
                <p className="text-slate-500 mb-4">
                  Start by creating a new tab.
                </p>
                <button
                  onClick={() => setShowNewTabInput(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Create Tab
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {previewDocument && (
        <DocumentPreviewModal
          request={previewDocument}
          onClose={() => setPreviewDocumetn(null)}
          onDelete={handleDeleteDocument}
          deletingDocument={deletingDocument}
          handleDownload={handleDownloadDocument}
          downloadingDocument={downloadingDocument}
        />
      )}
    </>
  );
};

export default New;
