'use client';
import { useAuth } from '../context/AuthContext';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UpdateUser from '@/components/Forms/users/UpdateUser';
import { toast } from 'react-toastify';
import { DashboardStats, IUser, IAuction } from '../types/index';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function AdminDashboard() {
  const { userData } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeAuctions: 0,
    totalAuctions: 0,
    premiumUsers: 0,
    regularUsers: 0,
  });
  const [users, setUsers] = useState<IUser[]>([]);
  const [activeAuctions, setActiveAuctions] = useState<IAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = userData?.token;

      // Fetch users
      const usersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersData = await usersResponse.json();
      setUsers(usersData);

      // Fetch auctions
      const auctionsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auctions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const auctionsDataResponse = await auctionsResponse.json();
      const auctionsData = auctionsDataResponse.auctions;
      setActiveAuctions(auctionsData.filter((auction: IAuction) => auction.isActive === true));

      // Calculate stats
      setStats({
        totalUsers: usersData.length,
        activeAuctions: auctionsData.filter((a: IAuction) => a.isActive === true).length,
        totalAuctions: auctionsData.length,
        premiumUsers: usersData.filter((u: IUser) => u.role === 'premium').length,
        regularUsers: usersData.filter((u: IUser) => u.role === 'regular').length,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    if (isInitializing && (!userData || userData.user.role !== 'admin')) {
      router.push('/');
    }

    if (userData?.user.role === 'admin') {
      setIsInitializing(false);
      fetchDashboardData();
    }
  }, [userData, router, isInitializing, fetchDashboardData]);

  const handleRoleChange = async (userId: string, newRole: 'regular' | 'premium' | 'admin') => {
    try {
      const token = userData?.token;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/assing-role`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid: userId, role: newRole }),
      });

      if (response.ok) {
        setUsers(
          users.map((user) => (user.firebaseUid === userId ? { ...user, role: newRole } : user))
        );
        toast.success('Role updated successfully');
      } else {
        throw new Error('Error updating role');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error updating role');
    }
  };

  const handleAuctionisActiveChange = async (auctionId: string, currentStatus: boolean) => {
    try {
      const token = userData?.token;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auctions/forAdmin/${auctionId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setActiveAuctions((prevAuctions) =>
          prevAuctions.map((auction) =>
            auction.id === auctionId ? { ...auction, isActive: !currentStatus } : auction
          )
        );
        toast.success(`Auction ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        throw new Error('Error updating auction status');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error updating auction status');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex items-center">
          {/* Espacio para el botón hamburguesa en móvil */}
          <div className="block md:hidden w-12 h-10 mr-2"></div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>

      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
        <div className="w-full max-w-lg sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto py-6 sm:px-2 px-1 lg:px-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-blue-500 rounded-md p-3">{/* Icon */}</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                      <dd className="text-3xl font-semibold text-gray-900">{stats.totalUsers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-green-500 rounded-md p-3">{/* Icon */}</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Auctions
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900">
                        {stats.activeAuctions}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-yellow-500 rounded-md p-3">{/* Icon */}</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Premium Users</dt>
                      <dd className="text-3xl font-semibold text-gray-900">{stats.premiumUsers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-purple-500 rounded-md p-3">{/* Icon */}</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Auctions</dt>
                      <dd className="text-3xl font-semibold text-gray-900">
                        {stats.totalAuctions}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="mt-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">User Management</h2>
              </div>
              <div className="border-t border-gray-200 overflow-x-auto w-full">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Change Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Update
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold p-1 rounded-full ${
                              user.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : user.role === 'premium'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-1"
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(
                                user.firebaseUid,
                                e.target.value as 'regular' | 'premium' | 'admin'
                              )
                            }
                            disabled={user.role === 'admin'}
                          >
                            <option value="regular">Regular</option>
                            <option value="premium">Premium</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedUserId(user.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                          <UpdateUser
                            key={user.id}
                            user={user}
                            isOpen={selectedUserId === user.id}
                            onClose={() => setSelectedUserId(null)}
                            onUpdateSuccess={fetchDashboardData}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Active Auctions Table */}
          <div className="mt-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">Active Auctions</h2>
              </div>
              <div className="border-t border-gray-200 overflow-x-auto w-full">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Auction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activeAuctions.map((auction) => (
                      <tr key={auction.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{auction.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`p-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              auction.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {auction.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() =>
                              handleAuctionisActiveChange(auction.id, auction.isActive)
                            }
                            className={`px-4 py-2 rounded-md ${
                              auction.isActive
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            {auction.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
