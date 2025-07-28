import React from 'react';
import { FaGavel, FaEye } from 'react-icons/fa';

interface AuctionInfoBoxProps {
  auctionInfo: {
    name?: string;
    currentHighestBid?: number;
    initialPrice?: number;
    isActive?: boolean;
    endDate?: string;
    categoryName?: string;
    // otros campos relevantes
  };
  initialPrice: number;
  bidsCount?: number; // allow passing bid count
  viewsCount?: number; // allow passing views count
}

const AuctionInfoBox: React.FC<AuctionInfoBoxProps> = ({
  auctionInfo,
  bidsCount = 12, // fallback demo
  viewsCount = 45, // fallback demo
  initialPrice,
}) => {
  const currentPrice = auctionInfo?.currentHighestBid ?? auctionInfo?.initialPrice ?? initialPrice;
  const formattedCurrentPrice = currentPrice?.toLocaleString('en-US');
  return (
    <div className="bg-white rounded-2xl shadow p-6 mb-2 flex flex-col items-center">
      {/* 1. Auction name */}
      <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight text-center w-full">
        {auctionInfo?.name}
      </h2>
      {/* 2. Category badge */}
      <div className="mb-4 w-full flex justify-center">
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
          {auctionInfo?.categoryName || ''}
        </span>
      </div>
      {/* 3. Current price (blue box) */}
      <div className="mb-2 w-full flex justify-center">
        <div className="bg-blue-50 text-blue-700 text-3xl font-bold rounded-xl px-4 py-3 border border-blue-100 shadow-sm text-center w-full">
          ${formattedCurrentPrice} <span className="text-base font-medium">USD</span>
        </div>
      </div>
      {/* 4. Bid count */}
      <div className="text-center text-gray-500 text-sm mb-4 w-full">{bidsCount} bids placed</div>

      {/* 9. Bottom row: bids and watching */}
      <div className="flex justify-between items-center mt-2 pt-4 border-t border-gray-100 text-base text-gray-700 w-full">
        <div className="flex flex-col items-center flex-1">
          <FaGavel className="text-blue-700 mb-1" />
          <span className="font-bold">{bidsCount}</span>
          <span className="text-xs text-gray-500">Bids</span>
        </div>
        <div className="flex flex-col items-center flex-1">
          <FaEye className="text-blue-700 mb-1" />
          <span className="font-bold">{viewsCount}</span>
          <span className="text-xs text-gray-500">Watching</span>
        </div>
      </div>
    </div>
  );
};

export default AuctionInfoBox;
