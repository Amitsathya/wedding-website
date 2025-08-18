import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import { apiClient } from '../../lib/api';

export default function AdminPhotos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingPhotos, setPendingPhotos] = useState([]);

  useEffect(() => {
    fetchPhotos();
    fetchPendingPhotos();
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

  return (
    <ProtectedRoute>
      <AdminLayout>
        <Head>
          <title>Photo Management - Admin</title>
        </Head>

        <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Photo Management</h1>

        {pendingPhotos.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-yellow-600">
              Pending Approval ({pendingPhotos.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingPhotos.map((photo) => (
                <div key={photo.id} className="bg-white rounded-lg shadow-md overflow-hidden">
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
          <h2 className="text-xl font-semibold mb-4">
            Approved Photos ({photos.length})
          </h2>

          {loading ? (
            <div className="text-center py-12">Loading photos...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="bg-white rounded-lg shadow-md overflow-hidden">
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