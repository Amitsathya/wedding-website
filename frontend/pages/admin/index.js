import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import { apiClient } from '../../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalGuests: 0,
    confirmedGuests: 0,
    pendingGuests: 0,
    totalPhotos: 0,
    pendingPhotos: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch guest stats
      const guestsResponse = await apiClient.get('/api/guests');
      const guests = guestsResponse.data;
      
      // Fetch photo stats
      const photosResponse = await apiClient.get('/api/admin/photos');
      const photos = photosResponse.data;

      setStats({
        totalGuests: guests.length,
        confirmedGuests: guests.filter(g => g.rsvpStatus === 'yes').length,
        pendingGuests: guests.filter(g => g.rsvpStatus === 'pending').length,
        totalPhotos: photos.length,
        pendingPhotos: photos.filter(p => p.status === 'pending').length
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, color, link }) => (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex items-center">
        <div className="flex-1">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">{title}</h3>
          <div className={`text-2xl sm:text-3xl font-bold ${color}`}>
            {loading ? '...' : value}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {link && (
        <div className="mt-3 sm:mt-4">
          <Link href={link} className="text-blue-600 hover:underline text-xs sm:text-sm">
            View details →
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <ProtectedRoute>
      <AdminLayout>
        <Head>
          <title>Wedding Admin Dashboard</title>
        </Head>

        <div className="p-4 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Wedding Dashboard</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Welcome to your wedding management dashboard
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Total Guests"
            value={stats.totalGuests}
            subtitle={`${stats.confirmedGuests} confirmed, ${stats.pendingGuests} pending`}
            color="text-blue-600"
            link="/admin/guests"
          />
          <StatCard
            title="RSVPs"
            value={`${stats.confirmedGuests}/${stats.totalGuests}`}
            subtitle="Confirmed responses"
            color="text-green-600"
            link="/admin/rsvps"
          />
          <StatCard
            title="Photos"
            value={stats.totalPhotos}
            subtitle={`${stats.pendingPhotos} pending approval`}
            color="text-purple-600"
            link="/admin/photos"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link 
                href="/admin/guests"
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-blue-900">Manage Guests</h3>
                  <p className="text-sm text-blue-600">Import, view, and send invites</p>
                </div>
              </Link>
              
              <Link 
                href="/admin/rsvps"
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-green-900">View RSVPs</h3>
                  <p className="text-sm text-green-600">Track responses and dietary needs</p>
                </div>
              </Link>
              
              <Link 
                href="/admin/photos"
                className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-purple-900">Manage Photos</h3>
                  <p className="text-sm text-purple-600">Review and approve uploads</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading recent activity...
              </div>
            ) : stats.pendingPhotos > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-yellow-900">
                      {stats.pendingPhotos} photo{stats.pendingPhotos !== 1 ? 's' : ''} awaiting approval
                    </p>
                    <p className="text-sm text-yellow-600">
                      Review and moderate uploaded photos
                    </p>
                  </div>
                  <Link 
                    href="/admin/photos"
                    className="text-yellow-600 hover:underline"
                  >
                    Review →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent activity
              </div>
            )}
          </div>
        </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}