import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface LineItem {
  description: string;
  amount: string;
}

interface PaymentInfo {
  method: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  routingNumber?: string;
  swiftCode?: string;
  appName?: string;
  confirmationNumber?: string;
  cardLastFour?: string;
  cardType?: string;
  numberOfPayments?: string;
  checkNumber?: string;
}

interface InvoiceModalProps {
  onClose: () => void;
  onSave: (invoice: any) => void;
  invoice?: any;
  settings?: any;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ onClose, onSave, invoice, settings }) => {
  const [formData, setFormData] = useState({
    number: '',
    date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lineItems: [{ description: '', amount: '' }] as LineItem[],
    paymentInfo: {
      method: 'bank_transfer',
    } as PaymentInfo,
  });

  useEffect(() => {
    if (invoice) {
      setFormData({
        number: invoice.number,
        date: new Date(invoice.date).toISOString().split('T')[0],
        due_date: new Date(invoice.due_date).toISOString().split('T')[0],
        lineItems: invoice.description.split('\n---\n').map((item: string) => {
          const [description, amount] = item.split(' - $');
          return { description, amount: amount || '' };
        }),
        paymentInfo: invoice.payment_info || { method: 'bank_transfer' },
      });
    }
  }, [invoice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate total amount
    const totalAmount = formData.lineItems.reduce((sum, item) => {
      return sum + (parseFloat(item.amount) || 0);
    }, 0);

    // Combine line items into description
    const description = formData.lineItems
      .map(item => `${item.description} - $${item.amount}`)
      .join('\n---\n');

    onSave({
      ...formData,
      amount: totalAmount,
      description,
      payment_info: formData.paymentInfo,
    });
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: '', amount: '' }],
    }));
  };

  const removeLineItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index),
    }));
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const updatePaymentInfo = (field: keyof PaymentInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      paymentInfo: { ...prev.paymentInfo, [field]: value },
    }));
  };

  const totalAmount = formData.lineItems.reduce((sum, item) => {
    return sum + (parseFloat(item.amount) || 0);
  }, 0);

  const renderPaymentFields = () => {
    switch (formData.paymentInfo.method) {
      case 'bank_transfer':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Bank Name
              </label>
              <input
                type="text"
                value={formData.paymentInfo.bankName || ''}
                onChange={(e) => updatePaymentInfo('bankName', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Account Name
              </label>
              <input
                type="text"
                value={formData.paymentInfo.accountName || ''}
                onChange={(e) => updatePaymentInfo('accountName', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Account Number
              </label>
              <input
                type="text"
                value={formData.paymentInfo.accountNumber || ''}
                onChange={(e) => updatePaymentInfo('accountNumber', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Routing Number
              </label>
              <input
                type="text"
                value={formData.paymentInfo.routingNumber || ''}
                onChange={(e) => updatePaymentInfo('routingNumber', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                SWIFT Code
              </label>
              <input
                type="text"
                value={formData.paymentInfo.swiftCode || ''}
                onChange={(e) => updatePaymentInfo('swiftCode', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        );
      case 'app':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                App Name
              </label>
              <input
                type="text"
                value={formData.paymentInfo.appName || ''}
                onChange={(e) => updatePaymentInfo('appName', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirmation Number
              </label>
              <input
                type="text"
                value={formData.paymentInfo.confirmationNumber || ''}
                onChange={(e) => updatePaymentInfo('confirmationNumber', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        );
      case 'credit_card':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Last 4 Digits
              </label>
              <input
                type="text"
                maxLength={4}
                value={formData.paymentInfo.cardLastFour || ''}
                onChange={(e) => updatePaymentInfo('cardLastFour', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Card Type
              </label>
              <select
                value={formData.paymentInfo.cardType || ''}
                onChange={(e) => updatePaymentInfo('cardType', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select card type</option>
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
                <option value="amex">American Express</option>
                <option value="discover">Discover</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Number of Payments
              </label>
              <input
                type="number"
                min="1"
                value={formData.paymentInfo.numberOfPayments || ''}
                onChange={(e) => updatePaymentInfo('numberOfPayments', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        );
      case 'check':
        return (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Check Number
            </label>
            <input
              type="text"
              value={formData.paymentInfo.checkNumber || ''}
              onChange={(e) => updatePaymentInfo('checkNumber', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );
      case 'cash':
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">
            {invoice ? 'Edit Receipt' : 'Create Receipt'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Invoice Number
              </label>
              <input
                type="text"
                required
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="INV-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Total Amount
              </label>
              <div className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700">
                ${totalAmount.toFixed(2)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                required
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-slate-700">
                Line Items
              </label>
              <button
                type="button"
                onClick={addLineItem}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {formData.lineItems.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      required
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      placeholder="Description"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={item.amount}
                      onChange={(e) => updateLineItem(index, 'amount', e.target.value)}
                      placeholder="Amount"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {formData.lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="p-2 text-red-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Payment Method
            </label>
            <select
              value={formData.paymentInfo.method}
              onChange={(e) => updatePaymentInfo('method', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="app">App</option>
              <option value="credit_card">Credit Card</option>
              <option value="cash">Cash</option>
              <option value="check">Check</option>
            </select>

            <div className="grid grid-cols-2 gap-4">
              {renderPaymentFields()}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
            >
              {invoice ? 'Update Receipt' : 'Create Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceModal;