import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { supabase } from "../../lib/supabase";
import CredentialModal from "./CredentialModal";
import CredentialCard from "./CredentialCard";
import { useAppSelector } from "../../redux/hooks";
import axios from "axios";

interface Credential {
  id: string;
  platform: string;
  username: string;
  password: string;
  notes?: string;
  type: "agency" | "creator";
  creator_id?: string | null;
  creator?: {
    name: string;
  };
}

const Credentials = () => {
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  const { currentUser } = useAppSelector((state) => state.user);
  const [creators, setCreators] = useState([]);
  const [activeTab, setActiveTab] = useState<"agency" | "creator">("agency");
  const [showModal, setShowModal] = useState(false);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [selectedCredential, setSelectedCredential] =
    useState<Credential | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [creatorFilter, setCreatorFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"platform" | "creator">("platform");

  const fetchCreators = async () => {
    try {
      const requiredId =
        currentUser?.ownerId === "Agency Owner itself"
          ? currentUser?.id
          : currentUser?.ownerId;
      const response = await axios.get(
        `${URL}/api/creator/get-creators/${requiredId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
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
    fetchCredentials();
  }, [activeTab]);

  const fetchCredentials = async () => {
    try {
      const requiredId =
        currentUser?.ownerId === "Agency Owner itself"
          ? currentUser?.id
          : currentUser?.ownerId;
      const response = await axios.get(
        `${URL}/api/credentials/fetch-credentials/${requiredId}`
      );
      setCredentials(response.data.data || []);
    } catch (error) {
      console.error("Error fetching credentials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCredential = async (credential: Omit<Credential, "id">) => {
    try {
      const requiredId =
        currentUser?.ownerId === "Agency Owner itself"
          ? currentUser?.id
          : currentUser?.ownerId;
      const insertData = {
        ...credential,
        type: activeTab,
        ownerId: requiredId,
      };

      const response = await axios.post(
        `${URL}/api/credentials/create-credentials`,
        insertData
      );
      setCredentials((prev) => [response.data.data, ...prev]);
      setShowModal(false);
    } catch (error) {
      console.error("Error adding credential:", error);
    }
  };

  const handleEditCredential = async (credential: Credential) => {
    try {
      const updateData = { ...credential };

      // Remove creator_id if it's null or empty
      if (!updateData.creator_id) {
        delete updateData.creator_id;
      }
      const response = await axios.put(
        `${URL}/api/credentials/update-credentials/${updateData._id}`,
        updateData
      );
      setCredentials((prev) =>
        prev.map((c) => (c._id === credential._id ? response.data.data : c))
      );
      setShowModal(false);
      setSelectedCredential(null);
    } catch (error) {
      console.error("Error updating credential:", error);
    }
  };

  const handleDeleteCredential = async (id: string) => {
    try {
      setIsLoading(true);
      await axios.delete(`${URL}/api/credentials/delete-credentials/${id}`);
      setCredentials((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      console.error("Error deleting credential:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCredentials = credentials.filter((credential) => {
    if (activeTab === "creator" && creatorFilter !== "all") {
      return credential.creator_id === creatorFilter;
    }
    return true;
  });

  const sortedCredentials = [...filteredCredentials].sort((a, b) => {
    if (sortBy === "platform") {
      return a.platform.localeCompare(b.platform);
    } else {
      // Sort by creator name
      const creatorA = a.creator?.name || "";
      const creatorB = b.creator?.name || "";
      return creatorA.localeCompare(creatorB);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pt-16 lg:pt-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Credentials</h1>
        <button
          onClick={() => {
            setSelectedCredential(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Credentials
        </button>
      </div>
      <div className="mb-6">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("agency")}
              className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-medium ${
                activeTab === "agency"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              Agency Credentials
            </button>
            <button
              onClick={() => setActiveTab("creator")}
              className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-medium ${
                activeTab === "creator"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              Creator Credentials
            </button>
          </nav>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mb-6">
        {activeTab === "creator" && (
          <select
            value={creatorFilter}
            onChange={(e) => setCreatorFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Creators</option>
            {creators.map((creator) => (
              <option key={creator._id} value={creator._id}>
                {creator.name}
              </option>
            ))}
          </select>
        )}

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "platform" | "creator")}
          className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="platform">Sort by Platform</option>
          {activeTab === "creator" && (
            <option value="creator">Sort by Creator</option>
          )}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedCredentials
          .filter((credential) => {
            if (activeTab === "creator") {
              return !!credential.creator_id;
            } else if (activeTab === "agency") {
              return !credential.creator_id;
            }
            return true;
          })
          .map((credential) => {
            return (
              <CredentialCard
                key={credential._id}
                platform={credential.platform}
                username={credential.username}
                password={credential.password}
                notes={credential.notes}
                onEdit={() => {
                  setSelectedCredential(credential);
                  setShowModal(true);
                }}
                onDelete={() => handleDeleteCredential(credential._id)}
              />
            );
          })}
      </div>
      {sortedCredentials.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            No {activeTab} credentials yet
          </h3>
          <p className="text-slate-500 mb-6">
            Add your first credential to get started
          </p>
          <button
            onClick={() => {
              setSelectedCredential(null);
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Credentials
          </button>
        </div>
      )}
      {showModal && (
        <CredentialModal
          type={activeTab}
          creators={creators}
          credential={selectedCredential}
          onClose={() => {
            setShowModal(false);
            setSelectedCredential(null);
          }}
          onSave={
            selectedCredential ? handleEditCredential : handleAddCredential
          }
        />
      )}
    </div>
  );
};

export default Credentials;
