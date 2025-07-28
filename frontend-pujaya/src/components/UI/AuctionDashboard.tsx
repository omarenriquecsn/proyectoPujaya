'use client';

import { useAuth } from '@/app/context/AuthContext';
import { IAuction } from '@/app/types/index';
import React, { useCallback, useEffect, useState } from 'react';
import AuctionDetailModal from '../AuctionDetailModal';
import { toast } from 'react-toastify';

const AuctionDashboard = () => {
  const { userData } = useAuth();
  const [auctions, setAuctions] = useState<IAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState<IAuction | null>(null);

  const fetchAuctions = useCallback(async () => {
    if (!userData?.token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auctions`, {
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAuctions(data.auctions || data);
      } else {
        toast.error('Error fetching auctions');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error connecting to server');
    } finally {
      setLoading(false);
    }
  }, [userData?.token]);

  useEffect(() => {
    if (userData?.user.role === 'admin') {
      fetchAuctions();
    }
  }, [userData, fetchAuctions]);

  const handleToggleStatus = useCallback(
    async (auctionId: string, currentStatus: boolean) => {
      if (!userData?.token) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auctions/forAdmin/${auctionId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${userData.token}`,
            },
          }
        );

        if (response.ok) {
          setAuctions((prevAuctions) =>
            prevAuctions.map((auction) =>
              auction.id === auctionId ? { ...auction, isActive: !currentStatus } : auction
            )
          );
          toast.success(`Auction ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        } else {
          toast.error('Error updating auction status');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error updating auction status');
      }
    },
    [userData?.token]
  );

  if (loading) {
    return (
      <>
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="block md:hidden w-12 h-10 mr-2"></div>
            <h1 className="text-3xl font-bold text-gray-900">Auctions Management</h1>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Auction Name
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
                  {auctions.map((auction) => (
                    <tr key={auction.id}>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedAuction(auction)}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                        >
                          {auction.name}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            auction.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {auction.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <button
                          onClick={() => handleToggleStatus(auction.id, auction.isActive)}
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
        </main>

        <AuctionDetailModal
          auction={selectedAuction}
          isOpen={selectedAuction !== null}
          onClose={() => setSelectedAuction(null)}
        />
      </>
    );
  }

  return (
    <>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="block md:hidden w-12 h-10 mr-2"></div>
          <h1 className="text-3xl font-bold text-gray-900">Auctions Management</h1>
        </div>
      </header>

      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auction Name
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
                {auctions.map((auction) => (
                  <tr key={auction.id}>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedAuction(auction)}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                      >
                        {auction.name}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          auction.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {auction.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => handleToggleStatus(auction.id, auction.isActive)}
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
      </main>

      <AuctionDetailModal
        auction={selectedAuction as IAuction}
        isOpen={selectedAuction !== null}
        onClose={() => setSelectedAuction(null)}
      />
    </>
  );
};

export default AuctionDashboard;
