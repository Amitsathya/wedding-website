import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import { apiClient } from '../../lib/api';

export default function AdminPhotos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingPhotos, setPendingPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState(new Set());
  const [selectedPendingPhotos, setSelectedPendingPhotos] = useState(new Set());
  const [autoApprove, setAutoApprove] = useState(false);
  const [loadingBulkAction, setLoadingBulkAction] = useState(false);

  useEffect(() => {
    fetchPhotos();
    fetchPendingPhotos();
    fetchAutoApproveSettings();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await apiClient.get('/api/admin/photos');
      setPhotos(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setLoading(false);
    }
  };

  const fetchPendingPhotos = async () => {
    try {
      const response = await apiClient.get('/api/admin/photos/pending');
      setPendingPhotos(response.data);
    } catch (error) {
      console.error('Error fetching pending photos:', error);
    }
  };

  const approvePhoto = async (photoId) => {
    try {
      await apiClient.patch(`/api/admin/photos/${photoId}/approve`);
      setPendingPhotos(prev => prev.filter(p => p.id !== photoId));
      fetchPhotos();
    } catch (error) {
      alert('Error approving photo');
    }
  };

  const rejectPhoto = async (photoId) => {
    try {
      await apiClient.patch(`/api/admin/photos/${photoId}/reject`);
      setPendingPhotos(prev => prev.filter(p => p.id !== photoId));
    } catch (error) {
      alert('Error rejecting photo');
    }
  };

  const deletePhoto = async (photoId) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    
    try {
      await apiClient.delete(`/api/admin/photos/${photoId}`);
      setPhotos(prev => prev.filter(p => p.id !== photoId));
    } catch (error) {
      alert('Error deleting photo');
    }
  };

  const fetchAutoApproveSettings = async () => {
    try {
      const response = await apiClient.get('/api/admin/settings/auto-approve');
      setAutoApprove(response.data.enabled);
    } catch (error) {
      console.error('Error fetching auto-approve setting:', error);
    }
  };

  const handleAutoApproveToggle = async () => {
    try {
      const newValue = !autoApprove;
      await apiClient.post('/api/admin/settings/auto-approve', { enabled: newValue });
      setAutoApprove(newValue);
    } catch (error) {
      alert('Error updating auto-approve setting');
    }
  };

  const handleSelectAll = (isPending = false) => {
    if (isPending) {
      if (selectedPendingPhotos.size === pendingPhotos.length) {
        setSelectedPendingPhotos(new Set());
      } else {
        setSelectedPendingPhotos(new Set(pendingPhotos.map(p => p.id)));
      }
    } else {
      if (selectedPhotos.size === photos.length) {
        setSelectedPhotos(new Set());
      } else {
        setSelectedPhotos(new Set(photos.map(p => p.id)));
      }
    }
  };

  const handlePhotoSelect = (photoId, isPending = false) => {
    if (isPending) {
      const newSelected = new Set(selectedPendingPhotos);
      if (newSelected.has(photoId)) {
        newSelected.delete(photoId);
      } else {
        newSelected.add(photoId);
      }
      setSelectedPendingPhotos(newSelected);
    } else {
      const newSelected = new Set(selectedPhotos);
      if (newSelected.has(photoId)) {
        newSelected.delete(photoId);
      } else {
        newSelected.add(photoId);
      }
      setSelectedPhotos(newSelected);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedPendingPhotos.size === 0) return;
    
    setLoadingBulkAction(true);
    try {
      await apiClient.post('/api/admin/photos/bulk-approve', {
        photoIds: Array.from(selectedPendingPhotos)
      });
      
      // Remove approved photos from pending list
      setPendingPhotos(prev => prev.filter(p => !selectedPendingPhotos.has(p.id)));
      setSelectedPendingPhotos(new Set());
      
      // Refresh approved photos list
      fetchPhotos();
      
      alert(`Successfully approved ${selectedPendingPhotos.size} photos`);
    } catch (error) {
      alert('Error approving photos');
    } finally {
      setLoadingBulkAction(false);
    }
  };

  const handleBulkDelete = async (isPending = false) => {
    const selected = isPending ? selectedPendingPhotos : selectedPhotos;
    const type = isPending ? 'pending' : 'approved';
    
    if (selected.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selected.size} ${type} photos? This action cannot be undone.`)) return;
    
    setLoadingBulkAction(true);
    try {
      await apiClient.post('/api/admin/photos/bulk-delete', {
        photoIds: Array.from(selected)
      });
      
      if (isPending) {
        setPendingPhotos(prev => prev.filter(p => !selected.has(p.id)));
        setSelectedPendingPhotos(new Set());
      } else {
        setPhotos(prev => prev.filter(p => !selected.has(p.id)));
        setSelectedPhotos(new Set());
      }
      
      alert(`Successfully deleted ${selected.size} photos`);
    } catch (error) {
      alert('Error deleting photos');
    } finally {
      setLoadingBulkAction(false);
    }
  };

  const handleBulkDownload = async () => {
    if (selectedPhotos.size === 0) return;
    
    setLoadingBulkAction(true);
    try {
      const response = await apiClient.post('/api/admin/photos/download-zip', {
        photoIds: Array.from(selectedPhotos)
      }, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `photos_${new Date().toISOString().split('T')[0]}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert(`Successfully downloaded ${selectedPhotos.size} photos`);
    } catch (error) {
      alert('Error downloading photos');
    } finally {
      setLoadingBulkAction(false);
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <Head>
          <title>Photo Management - Admin</title>
        </Head>

        <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Photo Management</h1>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoApprove}
                onChange={handleAutoApproveToggle}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Auto-approve new photos</span>
            </label>
          </div>
        </div>

        {pendingPhotos.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-yellow-600">
                Pending Approval ({pendingPhotos.length})
              </h2>
              
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedPendingPhotos.size === pendingPhotos.length && pendingPhotos.length > 0}
                    onChange={() => handleSelectAll(true)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm">Select all ({selectedPendingPhotos.size})</span>
                </label>
                
                {selectedPendingPhotos.size > 0 && (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleBulkApprove}
                      disabled={loadingBulkAction}
                      className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {loadingBulkAction ? 'Processing...' : `Approve (${selectedPendingPhotos.size})`}
                    </button>
                    <button
                      onClick={() => handleBulkDelete(true)}
                      disabled={loadingBulkAction}
                      className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      {loadingBulkAction ? 'Processing...' : `Delete (${selectedPendingPhotos.size})`}
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingPhotos.map((photo) => (
                <div key={photo.id} className="bg-white rounded-lg shadow-md overflow-hidden relative">
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedPendingPhotos.has(photo.id)}
                      onChange={() => handlePhotoSelect(photo.id, true)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <img 
                    src={photo.thumbnailUrl} 
                    alt="Pending photo"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Uploaded by: {photo.uploadedBy || 'Anonymous'}
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      {new Date(photo.uploadedAt).toLocaleString()}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => approvePhoto(photo.id)}
                        className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectPhoto(photo.id)}
                        className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => window.open(photo.fullUrl, '_blank')}
                        className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700"
                      >
                        View Full
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Approved Photos ({photos.length})
            </h2>
            
            {photos.length > 0 && (
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedPhotos.size === photos.length && photos.length > 0}
                    onChange={() => handleSelectAll(false)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm">Select all ({selectedPhotos.size})</span>
                </label>
                
                {selectedPhotos.size > 0 && (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleBulkDownload}
                      disabled={loadingBulkAction}
                      className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loadingBulkAction ? 'Processing...' : `Download ZIP (${selectedPhotos.size})`}
                    </button>
                    <button
                      onClick={() => handleBulkDelete(false)}
                      disabled={loadingBulkAction}
                      className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      {loadingBulkAction ? 'Processing...' : `Delete (${selectedPhotos.size})`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">Loading photos...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="bg-white rounded-lg shadow-md overflow-hidden relative">
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedPhotos.has(photo.id)}
                      onChange={() => handlePhotoSelect(photo.id, false)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <img 
                    src={photo.thumbnailUrl} 
                    alt="Wedding photo"
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3">
                    <p className="text-xs text-gray-600 mb-1">
                      by {photo.uploadedBy || 'Guest'}
                    </p>
                    <p className="text-xs text-gray-400 mb-2">
                      {new Date(photo.uploadedAt).toLocaleDateString()}
                    </p>
                    <div className="flex justify-between">
                      <button
                        onClick={() => window.open(photo.fullUrl, '_blank')}
                        className="text-blue-600 text-xs hover:underline"
                      >
                        View
                      </button>
                      <button
                        onClick={() => deletePhoto(photo.id)}
                        className="text-red-600 text-xs hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && photos.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No approved photos yet.
            </div>
          )}
        </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}