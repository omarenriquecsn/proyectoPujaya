import React from 'react';
import AuctionProfileCard from './AuctionProfileCard';
import { AuctionProfile } from '@/app/types/auction';

interface ProfileAuctionsProps {
  auctions: AuctionProfile[];
}

const ProfileAuctions: React.FC<ProfileAuctionsProps> = ({ auctions }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0">
    {auctions.map((a, i) => (
      <AuctionProfileCard key={i} {...a} />
    ))}
  </div>
);

export default ProfileAuctions;
