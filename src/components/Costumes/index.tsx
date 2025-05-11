import React, { useState, useEffect } from 'react';
import { Eye, MoreHorizontal } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import CostumeRequestModal from './CostumeRequestModal';
import CostumeDetailModal from './CostumeDetailModal';
import { Creator } from '../Creators';

interface CostumeRequest {
  id: string;
  subname: string;
  creator_id: string;
  costumenumber: string;
  videotype?: string;
  videolength?: string;
  subrequest?: string;
  outfitdescription?: string;
  payment: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: string;
  creator?: {
    name: string;
  };
}

interface CostumesProps {
  creators: Creator[];
}

const Costumes: React.FC<CostumesProps> = ({ creators = [] }) => { // Add default empty array
  const [requests, setRequests] = useState<CostumeRequest[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CostumeRequest | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('costume_requests')
        .select(`
          *,
          creator:creators(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching costume requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRequest = async (request: Omit<CostumeRequest, 'id' | 'status' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('costume_requests')
        .insert([request])
        .select(`
          *,
          creator:creators(name)
        `)
        .single();

      if (error) throw error;

      setRequests(prev => [data, ...prev]);
      setShowRequestModal(false);
    } catch (error) {
      console.error('Error creating costume request:', error);
    }
  };

  const handleEditRequest = async (request: CostumeRequest) => {
    try {
      const { data, error } = await supabase
        .from('costume_requests')
        .update({
          subname: request.subname,
          creator_id: request.creator_id,
          costumenumber: request.costumenumber,
          videotype: request.videotype,
          videolength: request.videolength,
          subrequest: request.subrequest,
          outfitdescription: request.outfitdescription,
          payment: request.payment,
          status: request.status,
        })
        .eq('id', request.id)
        .select(`
          *,
          creator:creators(name)
        `)
        .single();

      if (error) throw error;

      setRequests(prev => prev.map(r => r.id === request.id ? data : r));
      setShowRequestModal(false);
      setSelectedRequest(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating costume request:', error);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('costume_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRequests(prev => prev.filter(r => r.id !== id));
      setShowDetailModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error deleting costume request:', error);
    }
  };

  const handleViewRequest = (request: CostumeRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pt-16 lg:pt-0">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Costumes</h1>
        <button
          onClick={() => {
            setSelectedRequest(null);
            setIsEditing(false);
            setShowRequestModal(true);
          }}
          className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
        >
          Create Costume Request
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Sub Name</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Creator</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Payment</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Created Date</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map(request => (
                <tr key={request.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-600">{request.subname}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{request.creator?.name || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      request.status === 'pending'
                        ? 'bg-yellow-50 text-yellow-800'
                        : request.status === 'approved'
                        ? 'bg-blue-50 text-blue-800'
                        : request.status === 'completed'
                        ? 'bg-green-50 text-green-800'
                        : 'bg-red-50 text-red-800'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">${request.payment}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(request.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => handleViewRequest(request)}
                        className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setIsEditing(true);
                          setShowRequestModal(true);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {requests.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No costume requests yet</h3>
              <p className="text-slate-500 mb-6">Create your first costume request</p>
              <button
                onClick={() => setShowRequestModal(true)}
                className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                Create Request
              </button>
            </div>
          )}
        </div>
      </div>

      {showRequestModal && (
        <CostumeRequestModal
          onClose={() => {
            setShowRequestModal(false);
            setSelectedRequest(null);
            setIsEditing(false);
          }}
          onSave={isEditing && selectedRequest ? handleEditRequest : handleCreateRequest}
          creators={creators}
          request={selectedRequest}
          mode={isEditing ? 'edit' : 'add'}
        />
      )}

      {showDetailModal && selectedRequest && (
        <CostumeDetailModal
          request={selectedRequest}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRequest(null);
          }}
          onEdit={() => {
            setShowDetailModal(false);
            setIsEditing(true);
            setShowRequestModal(true);
          }}
          onDelete={() => handleDeleteRequest(selectedRequest.id)}
        />
      )}
    </div>
  );
};

export default Costumes;