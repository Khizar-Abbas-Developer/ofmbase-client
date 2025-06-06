import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Settings } from 'lucide-react';
import ReceiptsTab from './ReceiptsTab';
import InvoicesTab from './InvoicesTab';
import SettingsModal from './SettingsModal';

const Receipts = () => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="max-w-7xl mx-auto pt-16 lg:pt-0">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Receipts & Invoices</h1>
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
            <ReceiptsTab />
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
  );
};

export default Receipts;