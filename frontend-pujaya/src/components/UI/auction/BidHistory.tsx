import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Bid {
  id: string;
  amount: number;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  };
}

interface BidHistoryProps {
  bids: Bid[];
  bidsLoading: boolean;
  bidsError: string | null;
}

const BidHistory: React.FC<BidHistoryProps> = ({ bids, bidsLoading, bidsError }) => {
  return (
    <div className="bg-white rounded-2xl shadow p-6 mb-2">
      <h3 className="text-lg font-semibold mb-3 text-gray-900">Bid history</h3>
      {bidsLoading ? (
        <div className="text-blue-600">Loading bids...</div>
      ) : bidsError ? (
        <div className="text-red-600">{bidsError}</div>
      ) : bids.length === 0 ? (
        <div className="text-gray-500">No bids yet.</div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {bids.map((bid, idx) => {
            let timeAgo = '';
            if (bid.createdAt) {
              const bidDate = new Date(bid.createdAt);
              const now = new Date();
              timeAgo = formatDistanceToNow(bidDate > now ? now : bidDate, {
                addSuffix: true,
              });
            }
            return (
              <li
                key={bid.id}
                className={`flex justify-between items-center py-3 ${
                  idx === 0 ? 'font-bold text-green-700' : 'text-gray-700'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-base">
                    {bid.user && bid.user.name
                      ? bid.user.name.replace(/(.{4}).*(.{2})/, '$1***$2')
                      : 'Anonymous'}
                  </span>
                  <span className="text-xs text-gray-400">{timeAgo}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-lg ${idx === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    ${bid.amount.toLocaleString()}
                  </span>
                  {idx === 0 && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full mt-1">
                      Winning
                    </span>
                  )}
                  {/* Chat button removed for all users */}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default BidHistory;
