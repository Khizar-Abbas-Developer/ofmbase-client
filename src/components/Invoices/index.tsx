import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Download, Send, Eye, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import InvoiceModal from './InvoiceModal';
import InvoiceSettingsModal from './InvoiceSettingsModal';
import { jsPDF } from 'jspdf';
import { useNavigate } from 'react-router-dom';

interface LineItem {
  description: string;
  quantity: number;
  price: number;
  amount: number;
}

interface Invoice {
  id: string;
  number: string;
  date: string;
  due_date: string;
  amount: number;
  description: string;
  created_at: string;
  line_items?: LineItem[];
}

interface InvoiceSettings {
  id: string;
  agency_id: string;
  company_name: string;
  tax_id?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  bank_info?: {
    bank_name?: string;
    account_name?: string;
    account_number?: string;
    routing_number?: string;
    swift_code?: string;
  };
  footer_text?: string;
}

const Invoices = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'invoices' | 'settings'>('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<InvoiceSettings | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkSession();
    Promise.all([fetchInvoices(), fetchSettings()]).finally(() => setIsLoading(false));
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/signin');
        return;
      }
    } catch (error) {
      console.error('Error checking session:', error);
      navigate('/signin');
    }
  };

  const fetchInvoices = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: agency } = await supabase
        .from('agencies')
        .select('id')
        .eq('profile_id', session.user.id)
        .single();

      if (!agency) {
        console.log('No agency found for user');
        return;
      }

      const { data: settings, error } = await supabase
        .from('invoice_settings')
        .select('*')
        .eq('agency_id', agency.id)
        .maybeSingle();

      if (error) throw error;
      setSettings(settings);
    } catch (error) {
      console.error('Error fetching invoice settings:', error);
    }
  };

  const handleCreateInvoice = async (invoice: Omit<Invoice, 'id' | 'created_at'>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/signin');
        return;
      }

      const { data, error } = await supabase
        .from('invoices')
        .insert([{
          number: invoice.number,
          date: invoice.date,
          due_date: invoice.due_date,
          amount: invoice.amount,
          description: invoice.description,
          line_items: invoice.line_items || []
        }])
        .select()
        .single();

      if (error) throw error;

      setInvoices(prev => [data, ...prev]);
      setShowInvoiceModal(false);
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const handleUpdateInvoice = async (invoice: Invoice) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/signin');
        return;
      }

      const { error } = await supabase
        .from('invoices')
        .update({
          number: invoice.number,
          date: invoice.date,
          due_date: invoice.due_date,
          amount: invoice.amount,
          description: invoice.description,
          line_items: invoice.line_items || []
        })
        .eq('id', invoice.id);

      if (error) throw error;

      setInvoices(prev =>
        prev.map(inv => inv.id === invoice.id ? invoice : inv)
      );
      setShowInvoiceModal(false);
      setSelectedInvoice(null);
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
  };

  const handleSaveSettings = async (settings: Omit<InvoiceSettings, 'id' | 'agency_id'>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/signin');
        return;
      }

      const { data: agency } = await supabase
        .from('agencies')
        .select('id')
        .eq('profile_id', session.user.id)
        .single();

      if (!agency) {
        console.error('Agency not found');
        return;
      }

      const { data, error } = await supabase
        .from('invoice_settings')
        .upsert([{
          ...settings,
          agency_id: agency.id,
        }], {
          onConflict: 'agency_id'
        })
        .select()
        .single();

      if (error) throw error;

      setSettings(data);
      setShowSettingsModal(false);
    } catch (error) {
      console.error('Error saving invoice settings:', error);
    }
  };

  const generateInvoicePDF = (invoice: Invoice) => {
    if (!settings) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = margin;
    const lineHeight = 7;

    const addLine = (text: string, fontSize = 12, isBold = false) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.text(text, margin, y);
      y += lineHeight;
    };

    if (settings.logo_url) {
      y += 20;
    }

    addLine(settings.company_name, 16, true);
    if (settings.address) addLine(settings.address);
    if (settings.phone) addLine(`Phone: ${settings.phone}`);
    if (settings.email) addLine(`Email: ${settings.email}`);
    if (settings.website) addLine(`Website: ${settings.website}`);
    if (settings.tax_id) addLine(`Tax ID: ${settings.tax_id}`);

    y += lineHeight;

    addLine('INVOICE', 16, true);
    addLine(`Invoice Number: ${invoice.number}`);
    addLine(`Date: ${new Date(invoice.date).toLocaleDateString()}`);
    addLine(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`);

    y += lineHeight;

    if (invoice.line_items && invoice.line_items.length > 0) {
      addLine('Line Items:', 12, true);
      invoice.line_items.forEach(item => {
        addLine(`${item.description} - Qty: ${item.quantity} x $${item.price} = $${item.amount}`);
      });
    } else {
      addLine('Description:', 12, true);
      const descriptionLines = doc.splitTextToSize(invoice.description, pageWidth - 2 * margin);
      descriptionLines.forEach((line: string) => {
        addLine(line);
      });
    }

    y += lineHeight;

    addLine(`Amount Due: $${invoice.amount.toLocaleString()}`, 14, true);

    y += lineHeight;

    if (settings.bank_info) {
      addLine('Payment Information:', 12, true);
      if (settings.bank_info.bank_name) addLine(`Bank: ${settings.bank_info.bank_name}`);
      if (settings.bank_info.account_name) addLine(`Account Name: ${settings.bank_info.account_name}`);
      if (settings.bank_info.account_number) addLine(`Account Number: ${settings.bank_info.account_number}`);
      if (settings.bank_info.routing_number) addLine(`Routing Number: ${settings.bank_info.routing_number}`);
      if (settings.bank_info.swift_code) addLine(`SWIFT Code: ${settings.bank_info.swift_code}`);
    }

    y += lineHeight;

    if (settings.footer_text) {
      const footerLines = doc.splitTextToSize(settings.footer_text, pageWidth - 2 * margin);
      footerLines.forEach((line: string) => {
        if (y > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        addLine(line, 10);
      });
    }

    doc.save(`invoice-${invoice.number}.pdf`);
  };

  const filteredInvoices = invoices.filter(invoice => {
    return searchQuery
      ? invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
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
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Receipts</h1>
          <p className="text-slate-500 mt-1">Create and manage your receipts</p>
        </div>

        <div className="flex items-center gap-4">
          {activeTab === 'invoices' && (
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create Receipt
            </button>
          )}
          {activeTab === 'settings' && !settings && (
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Set Up Receipt Template
            </button>
          )}
          {activeTab === 'settings' && settings && (
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
            >
              <Eye className="h-5 w-5" />
              Edit Receipt Template
            </button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-medium ${
                activeTab === 'invoices'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <FileText className="h-4 w-4" />
              Receipts
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-medium ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Settings className="h-4 w-4" />
              Receipt Template
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'invoices' ? (
        <>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search receipts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No receipts found</h3>
              <p className="text-slate-500 mb-6">Create your first receipt to get started</p>
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Create Receipt
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Receipt #</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Due Date</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-slate-500">Amount</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInvoices.map(invoice => (
                      <tr key={invoice.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-800">
                          {invoice.number}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(invoice.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(invoice.due_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium text-slate-800">
                          ${invoice.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setShowInvoiceModal(true);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => generateInvoicePDF(invoice)}
                              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                alert('Email sending coming soon!');
                              }}
                              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl p-8">
          {settings ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Company Information</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Company Name</p>
                    <p className="text-sm text-slate-800">{settings.company_name}</p>
                  </div>
                  {settings.tax_id && (
                    <div>
                      <p className="text-sm font-medium text-slate-500">Tax ID</p>
                      <p className="text-sm text-slate-800">{settings.tax_id}</p>
                    </div>
                  )}
                  {settings.address && (
                    <div>
                      <p className="text-sm font-medium text-slate-500">Address</p>
                      <p className="text-sm text-slate-800 whitespace-pre-wrap">{settings.address}</p>
                    </div>
                  )}
                  {settings.phone && (
                    <div>
                      <p className="text-sm font-medium text-slate-500">Phone</p>
                      <p className="text-sm text-slate-800">{settings.phone}</p>
                    </div>
                  )}
                  {settings.email && (
                    <div>
                      <p className="text-sm font-medium text-slate-500">Email</p>
                      <p className="text-sm text-slate-800">{settings.email}</p>
                    </div>
                  )}
                  {settings.website && (
                    <div>
                      <p className="text-sm font-medium text-slate-500">Website</p>
                      <p className="text-sm text-slate-800">{settings.website}</p>
                    </div>
                  )}
                </div>
              </div>

              {settings.bank_info && Object.keys(settings.bank_info).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Bank Information</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    {settings.bank_info.bank_name && (
                      <div>
                        <p className="text-sm font-medium text-slate-500">Bank Name</p>
                        <p className="text-sm text-slate-800">{settings.bank_info.bank_name}</p>
                      </div>
                    )}
                    {settings.bank_info.account_name && (
                      <div>
                        <p className="text-sm font-medium text-slate-500">Account Name</p>
                        <p className="text-sm text-slate-800">{settings.bank_info.account_name}</p>
                      </div>
                    )}
                    {settings.bank_info.account_number && (
                      <div>
                        <p className="text-sm font-medium text-slate-500">Account Number</p>
                        <p className="text-sm text-slate-800">{settings.bank_info.account_number}</p>
                      </div>
                    )}
                    {settings.bank_info.routing_number && (
                      <div>
                        <p className="text-sm font-medium text-slate-500">Routing Number</p>
                        <p className="text-sm text-slate-800">{settings.bank_info.routing_number}</p>
                      </div>
                    )}
                    {settings.bank_info.swift_code && (
                      <div>
                        <p className="text-sm font-medium text-slate-500">SWIFT Code</p>
                        <p className="text-sm text-slate-800">{settings.bank_info.swift_code}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {settings.footer_text && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Receipt Footer</h3>
                  <p className="text-sm text-slate-800 whitespace-pre-wrap">{settings.footer_text}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No receipt template set up</h3>
              <p className="text-slate-500 mb-6">Set up your receipt template to get started</p>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Set Up Receipt Template
              </button>
            </div>
          )}
        </div>
      )}

      {showInvoiceModal && (
        <InvoiceModal
          onClose={() => {
            setShowInvoiceModal(false);
            setSelectedInvoice(null);
          }}
          onSave={selectedInvoice ? handleUpdateInvoice : handleCreateInvoice}
          invoice={selectedInvoice}
          settings={settings}
        />
      )}

      {showSettingsModal && (
        <InvoiceSettingsModal
          onClose={() => setShowSettingsModal(false)}
          onSave={handleSaveSettings}
          settings={settings}
        />
      )}
    </div>
  );
};

export default Invoices;