import React from 'react';

interface SellerInfoProps {
  owner: { id: string; name: string; email: string; createdAt?: string };
  onViewMoreProducts: (sellerId: string) => void;
  show?: boolean;
}

const SellerInfo: React.FC<SellerInfoProps> = ({ owner, onViewMoreProducts, show = true }) => {
  if (!show) return null;
  if (!owner) {
    return <div className="text-gray-500">Seller information not available.</div>;
  }
  return (
    <div className="text-gray-700 text-base space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-semibold"></span>
        <span className="text-blue-700">{owner.name || 'Unknown'}</span>
      </div>
      {owner.createdAt && (
        <div>
          <span className="text-gray-500 text-xs">
            On platform since {new Date(owner.createdAt).toLocaleDateString()}
          </span>
        </div>
      )}
      <button
        className="mt-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded font-semibold text-xs"
        onClick={() => onViewMoreProducts(owner.id)}
      >
        View more auctions from this seller
      </button>
    </div>
  );
};

export default SellerInfo;
