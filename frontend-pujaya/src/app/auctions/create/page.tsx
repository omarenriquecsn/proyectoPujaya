'use client';

import { useAuth } from '@/app/context/AuthContext';
import { redirect } from 'next/navigation';
import FormAuction from '@/components/Forms/auction/FormAuction';

export default function CreateAuctionPage() {
  const { userData } = useAuth();

  if (!userData) {
    redirect('/auctions');
    return null;
  }

  if (userData.user?.role !== 'premium') {
    redirect('/auctions');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Auction</h1>
        <FormAuction />
      </div>
    </div>
  );
} 