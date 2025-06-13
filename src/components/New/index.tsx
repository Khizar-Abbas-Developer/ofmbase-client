import { useEffect, useState } from "react";
import { Plus, Folder, Upload, FolderPlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import axios from "axios";
import { useAppSelector } from "../../redux/hooks";

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
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  const { currentUser } = useAppSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [showNewTabInput, setShowNewTabInput] = useState(false);
  const [newTabName, setNewTabName] = useState("");
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Set active tab whenever tabs are updated
  useEffect(() => {
    if (tabs.length > 0 && !activeTab) {
      setActiveTab(tabs[0]._id);
    }
  }, [tabs, activeTab]);

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
  };

  const handleAddFolder = async () => {
    if (newFolderName.trim()) {
      const { data } = await axios.post(
        `${URL}/api/document/tabs/tabs/${activeTab}/folders`,
        { name: newFolderName },
        { headers: { Authorization: `Bearer ${currentUser?.token}` } }
      );
      setTabs(tabs.map((tab) => (tab._id === activeTab ? data : tab)));
      setNewFolderName("");
      setShowNewFolderInput(false);
    }
  };

  const handleFileUpload = async (folderId: string, files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("file", file); // key is still 'file', same as upload.array("file")
    });

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
              folders: tab.folders.map((f) => (f._id === folderId ? data : f)),
            }
          : tab
      )
    );
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
                      onClick={() => setActiveTab(tab._id)}
                    >
                      {tab.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {tabs.map((tab) => (
                  <TabsContent key={tab._id} value={tab._id}>
                    <div className="space-y-6">
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
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                          >
                            Add
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

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {tab.folders.map((folder) => (
                          <div
                            key={folder._id}
                            className="p-6 border border-slate-200 rounded-2xl hover:border-blue-500 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <Folder className="h-5 w-5 text-blue-500" />
                                <h3 className="font-medium text-slate-800">
                                  {folder.name}
                                </h3>
                              </div>
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  multiple
                                  className="hidden"
                                  onChange={(e) =>
                                    e.target.files &&
                                    handleFileUpload(folder._id, e.target.files)
                                  }
                                />
                                <Upload className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                              </label>
                            </div>
                            {folder.documents.length === 0 ? (
                              <p className="text-sm text-slate-500 text-center py-4">
                                No documents yet
                              </p>
                            ) : (
                              <ul className="space-y-2">
                                {folder.documents.map((doc) => (
                                  <li
                                    key={doc._id}
                                    className="text-sm text-slate-600"
                                  >
                                    {doc.name}
                                  </li>
                                ))}
                              </ul>
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
    </>
  );
};

export default New;
