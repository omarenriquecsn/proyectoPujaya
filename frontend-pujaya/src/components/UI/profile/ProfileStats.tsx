import React from 'react';

interface ProfileStatsProps {
  stats?: { bidsWon: number; itemsSold: number; totalSold: number };
  activeTime: string;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ stats, activeTime }) => {
  const safeStats = stats || { bidsWon: 0, itemsSold: 0, totalSold: 0 };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-3">
      <div className="flex flex-col items-center bg-gray-50 rounded-xl px-8 py-4 shadow text-center min-w-[120px]">
        <span className="text-2xl font-bold text-blue-700">{safeStats.bidsWon}</span>
        <span className="text-sm text-gray-500 font-semibold mt-1">Bids Won</span>
      </div>
      <div className="flex flex-col items-center bg-gray-50 rounded-xl px-4 py-4 shadow text-center w-full">
        <span className="text-2xl font-bold text-green-600">{safeStats.itemsSold}</span>
        <span className="text-sm text-gray-500 font-semibold mt-1">Items Sold</span>
      </div>
      <div className="flex flex-col items-center bg-gray-50 rounded-xl px-4 py-4 shadow text-center w-full">
        <span className="text-2xl font-bold text-orange-500">${safeStats.totalSold}K</span>
        <span className="text-sm text-gray-500 font-semibold mt-1">Total Sold</span>
      </div>
      <div className="flex flex-col items-center bg-gray-50 rounded-xl px-4 py-4 shadow text-center w-full">
        <span className="text-2xl font-bold text-purple-600">{activeTime}</span>
        <span className="text-sm text-gray-500 font-semibold mt-1">Active</span>
      </div>
    </div>
  );
};

export default ProfileStats;
