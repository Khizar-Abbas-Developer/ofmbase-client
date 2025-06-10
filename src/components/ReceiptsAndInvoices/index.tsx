import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Settings } from "lucide-react";
import ReceiptsTab from "./ReceiptsTab";
import InvoicesTab from "./InvoicesTab";
import SettingsModal from "./SettingsModal";
import { useAppSelector } from "../../redux/hooks"; // Adjust the path as needed
import axios from "axios";

const Test = () => {
  const [receipts, setReceipts] = useState([]);
  const { currentUser } = useAppSelector((state) => state.user);
  const URL = import.meta.env.VITE_PUBLIC_BASE_URL;
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fetchReceipts = async () => {
    const requierdId =
      currentUser.ownerId === "Agency Owner itself"
        ? currentUser.id
        : currentUser.ownerId;
    try {
      const response = await axios.get(
        `${URL}/api/receipts/fetch-receipts/${requierdId}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
      setReceipts(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);
  return (
    <>
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto pt-16 lg:pt-0">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-slate-800">
              Receipts & Invoices
            </h1>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
            >
              <Settings className="h-5 w-5" />
              Business Settings
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <Tabs defaultValue="receipts" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="receipts">Receipts</TabsTrigger>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
              </TabsList>

              <TabsContent value="receipts">
                <ReceiptsTab fetchedReceipts={receipts} />
              </TabsContent>

              <TabsContent value="invoices">
                <InvoicesTab />
              </TabsContent>
            </Tabs>
          </div>

          {showSettings && (
            <SettingsModal onClose={() => setShowSettings(false)} />
          )}
        </div>
      )}
    </>
  );
};

export default Test;
