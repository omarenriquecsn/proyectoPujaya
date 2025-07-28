import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface AuctionProfileCardProps {
  title: string;
  category: string;
  image?: string;
  currentBid: number;
  id: string; // Ensure id is always present
}

const AuctionProfileCard: React.FC<AuctionProfileCardProps> = ({
  title,
  category,
  image,
  currentBid,
  id,
}) => {
  const cardContent = (
    <div className="bg-white rounded-xl shadow flex flex-col p-4 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xs cursor-pointer hover:shadow-lg transition-shadow min-w-0">
      <div className="relative flex items-center justify-center h-32 bg-gray-100 rounded-lg mb-3 w-full overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={title}
            width={500}
            height={500}
            className="object-contain h-full w-full rounded-lg"
          />
        ) : (
          <span className="text-gray-400">No Img</span>
        )}
      </div>
      <span className="text-xs text-gray-500 mb-1 break-words w-full">{category}</span>
      <span className="font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[40px] break-words w-full">
        {title}
      </span>
      <div className="flex flex-col gap-1 text-sm mb-2">
        <span>
          Current Bid: <span className="text-green-700 font-bold">${currentBid}</span>
        </span>
      </div>
    </div>
  );
  // Always use id for the link to the auction detail
  return <Link href={`/auctions/${id}`}>{cardContent}</Link>;
};

export default AuctionProfileCard;
