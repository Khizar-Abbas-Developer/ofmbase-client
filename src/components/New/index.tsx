import React, { useState } from "react";
import { Plus, Folder, Upload, FolderPlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface Tab {
  id: string;
  name: string;
  folders: Folder[];
}

interface Folder {
  id: string;
  name: string;
  documents: Document[];
}

interface Document {
  id: string;
  name: string;
  url: string;
  uploadDate: string;
}

const New = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: "1",
      name: "Expenses",
      folders: [],
    },
    {
      id: "2",
      name: "Legal",
      folders: [],
    },
  ]);

  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [showNewTabInput, setShowNewTabInput] = useState(false);
  const [newTabName, setNewTabName] = useState("");
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const handleAddTab = () => {
    if (newTabName.trim()) {
      setTabs([
        ...tabs,
        {
          id: Date.now().toString(),
          name: newTabName,
          folders: [],
        },
      ]);
      setNewTabName("");
      setShowNewTabInput(false);
    }
  };

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      setTabs(
        tabs.map((tab) => {
          if (tab.id === activeTab) {
            return {
              ...tab,
              folders: [
                ...tab.folders,
                {
                  id: Date.now().toString(),
                  name: newFolderName,
                  documents: [],
                },
              ],
            };
          }
          return tab;
        })
      );
      setNewFolderName("");
      setShowNewFolderInput(false);
    }
  };

  const handleFileUpload = (folderId: string, files: FileList) => {
    // Handle file upload logic here
    console.log("Uploading files to folder:", folderId, files);
  };

  return (
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
        <Tabs value={activeTab} className="w-full">
          <TabsList className="mb-6">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
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
                      key={folder.id}
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
                              handleFileUpload(folder.id, e.target.files)
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
                            <li key={doc.id} className="text-sm text-slate-600">
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
      </div>
    </div>
  );
};

export default New;
