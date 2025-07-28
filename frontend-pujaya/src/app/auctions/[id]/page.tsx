'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AuctionDetail from '@/components/UI/AuctionDetail';
import { IAuctionDetailType, IBid, IProduct } from '@/app/types/index';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AuctionDetailPage() {
  const { id } = useParams();
  const [auction, setAuction] = useState<IAuctionDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_URL}/auctions/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Auction not founded');
        return res.json();
      })
      .then((data) => {
        setAuction(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div className="text-center py-10">
        <LoadingSpinner />
      </div>
    );
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!auction) return null;

  // Use types from your types/index.ts
  const auctionDetail = auction as IAuctionDetailType & { bids?: IBid[] };
  const bids: IBid[] = auctionDetail.bids ?? [];
  const product: IProduct = auctionDetail.product as IProduct;
  const { initialPrice = 0, finalPrice, category, endDate } = product;

  // Calculate the minimum allowed bid
  const highestBid: number | null =
    bids.length > 0 ? Math.max(...bids.map((b) => Number(b.amount))) : null;
  const minBid = highestBid !== null ? highestBid + 1 : Number(initialPrice) + 1;

  // Pass the product and auction data to AuctionDetail
  return (
    <AuctionDetail
      {...{
        ...product,
        initialPrice: Number(initialPrice),
        finalPrice: Number(finalPrice),
        category,
        startDate: endDate,
        endDate,
      }}
      auctionData={{
        ...auction,
        name: auction.name,
        description: auction.description,
        endDate: auction.endDate,
        isActive: auction.isActive,
        auctionId: auction.id,
        userId: auction.owner?.id,
      }}
      auctionId={auction.id}
      userId={auction.owner?.id}
      owner={auction.owner}
      minBid={minBid}
    />
  );
}
