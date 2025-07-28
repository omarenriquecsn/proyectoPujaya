'use-client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import AuctionGallery from './auction/AuctionGallery';
import AuctionInfoBox from './auction/AuctionInfoBox';
import BidForm from './auction/BidForm';
import BidHistory from './auction/BidHistory';
import AuctionTabs from './auction/AuctionTabs';
import FloatingAuctionChat from '../FloatingAuctionChat';
import Link from 'next/link';

// Tipos para pujas y usuario
interface Bid {
  id: string;
  amount: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

interface AuctionInfo {
  name: string;
  description: string;
  endDate: string;
  isActive: boolean;
  auctionId?: string;
  userId?: string;
  initialPrice?: number;
  finalPrice?: number;
  categoryName?: string;
}

// Inline IProduct type for props
interface ProductForAuctionDetail {
  id: string;
  name: string;
  imgProduct: string[];
  description: string;
  initialPrice: number;
  finalPrice?: number;
  category?: { categoryName?: string };
}

// Add minBid to AuctionDetail props
type AuctionDetailProps = ProductForAuctionDetail & {
  auctionData?: {
    name: string;
    description: string;
    endDate: string;
    isActive: boolean;
    auctionId?: string;
    userId?: string;
  };
  auctionId?: string;
  userId?: string;
  owner?: {
    id: string;
    name: string;
    email: string;
    createdAt?: string;
  };
  category?: { categoryName?: string };
  minBid: number;
};

// Agrega la prop owner a AuctionDetail
const AuctionDetail: React.FC<AuctionDetailProps> = ({
  id,
  name,
  imgProduct,
  description,
  initialPrice,
  auctionData,
  auctionId,
  userId,
  owner,
  category,
  minBid,
}) => {
  const { userData } = useAuth();
  const [mainImg, setMainImg] = useState(
    Array.isArray(imgProduct) && imgProduct.length > 0 ? imgProduct[0] : null
  );
  const [tab, setTab] = useState('Description');
  // Estado para el modal de zoom
  const [zoomOpen, setZoomOpen] = useState(false);
  // Bid form state
  const [bidAmount, setBidAmount] = useState('');
  const [bidLoading, setBidLoading] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState<string | null>(null);
  const [auctionInfo, setAuctionInfo] = useState<AuctionInfo | null>(auctionData || null);
  // Estado para historial de pujas
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [bidsError, setBidsError] = useState<string | null>(null);

  // Fetch auction info and bids
  const fetchAuctionAndBids = async () => {
    if (!auctionId) return;
    try {
      const [auctionRes, bidsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auctions/${auctionId}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/bids?auctionId=${auctionId}`),
      ]);
      if (auctionRes.ok) {
        const auctionData = await auctionRes.json();
        setAuctionInfo(auctionData);
      }
      if (bidsRes.ok) {
        const bidsData = await bidsRes.json();
        setBids(Array.isArray(bidsData) ? bidsData : bidsData.bids || []);
      }
    } catch {
      // Optionally handle error
    }
  };

  // Refresca historial de pujas
  const fetchBids = async () => {
    if (!auctionId) return;
    setBidsLoading(true);
    setBidsError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bids?auctionId=${auctionId}`);
      if (!res.ok) throw new Error('Error fetching bids');
      const data = await res.json();
      setBids(Array.isArray(data) ? data : []);
    } catch {
      setBidsError('Could not load bid history');
    } finally {
      setBidsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctionAndBids();
    fetchBids();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auctionId]);

  // Determine if the authenticated user is the owner
  const ownerId = auctionData?.userId || userId;
  const isOwner = Boolean(
    userData &&
      userData.user &&
      ownerId &&
      (String(userData.user.id) === String(ownerId) ||
        String(userData.user.firebaseUid) === String(ownerId))
  );

  // Helper: can the user bid?
  const canBid =
    userData &&
    userData.user?.role === 'premium' &&
    !isOwner &&
    (auctionInfo?.isActive ?? auctionData?.isActive);

  // Prevent bid if auction is not active
  const showBidForm = canBid && (auctionInfo?.isActive ?? auctionData?.isActive);

  // Handle bid submit
  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBidError(null);
    setBidSuccess(null);
    setBidLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: userData?.token ? `Bearer ${userData.token}` : '',
        },
        body: JSON.stringify({
          auctionId: auctionId,
          amount: parseFloat(bidAmount),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to place bid');
      }
      setBidSuccess('Bid placed successfully!');
      setBidAmount('');
      await fetchAuctionAndBids(); // Refresh auction and bids
      fetchBids(); // Refresh bid history
    } catch (err) {
      setBidError((err as Error).message || 'Failed to place bid');
    } finally {
      setBidLoading(false);
    }
  };

  // Determina si mostrar prompts
  const showLoginPrompt = !userData;
  const showUpgradePrompt = !!userData && userData.user?.role !== 'premium';
  const isPremium = !!userData && userData.user?.role === 'premium';

  // Determine if the authenticated user has placed a bid
  const userHasBid = !!(
    userData && bids.some((bid) => String(bid.user?.id) === String(userData.user?.id))
  );

  // Mostrar botón de login si el usuario NO está logueado
  if (!userData) {
    return (
      <div className="min-h-screen w-full bg-[#F6F8FA] pb-12 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-md p-8 text-center max-w-md w-full">
          <span className="font-semibold text-blue-700 text-lg block mb-4">
            Log in for more options.
          </span>
          <button
            className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded font-bold transition w-full"
            onClick={() => (window.location.href = '/login')}
          >
            Log in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F6F8FA] pb-12">
      <div className="max-w-7xl mx-auto pt-8 px-2 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left column: gallery and tabs */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-md p-0 md:p-6 flex flex-col justify-center">
              <AuctionGallery
                imgProduct={imgProduct}
                mainImg={mainImg}
                setMainImg={setMainImg}
                zoomOpen={zoomOpen}
                setZoomOpen={setZoomOpen}
                name={name}
                endDate={auctionInfo?.endDate || auctionData?.endDate}
              />
            </div>
            <div className="bg-white rounded-2xl shadow-md p-0 md:p-6">
              {/* Modular tab navigation */}
              <AuctionTabs
                tab={tab}
                setTab={setTab}
                isPremium={isPremium}
                description={auctionInfo?.description || auctionData?.description || '-'}
                details={description || '-'}
                owner={owner}
              />
            </div>
          </div>
          {/* Right column: auction info, bid, history, related */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-md p-6 relative">
              {/* Timer Figma-style en el bloque de info */}
              {/* Eliminado el timer de este bloque según pedido */}
              <AuctionInfoBox
                auctionInfo={{
                  ...auctionInfo,
                  categoryName: category?.categoryName || auctionInfo?.categoryName || '',
                }}
                initialPrice={initialPrice}
                bidsCount={bids.length}
                viewsCount={45} // TODO: replace with real views if available
              />
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6">
              {/* Mostrar BidForm solo si puede pujar, si no, mostrar botones de edición si es owner */}
              {showBidForm && (
                <BidForm
                  canBid={!!canBid}
                  bidAmount={bidAmount}
                  setBidAmount={setBidAmount}
                  bidLoading={bidLoading}
                  bidError={bidError}
                  bidSuccess={bidSuccess}
                  onSubmit={handleBidSubmit}
                  showLoginPrompt={!!showLoginPrompt}
                  showUpgradePrompt={!!showUpgradePrompt}
                  minBid={minBid}
                />
              )}
              {!showBidForm && isOwner && (
                <div className="flex flex-col gap-3 items-center justify-center">
                  <Link
                    href={`/auctions/${auctionId}/edit`}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full text-center"
                  >
                    Edit Auction
                  </Link>
                  <Link
                    href={`/products/${id}/edit`}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full text-center"
                  >
                    Edit Product
                  </Link>
                </div>
              )}
              {!showBidForm && !isOwner && showUpgradePrompt && (
                <div className="text-center mt-4">
                  <a
                    href="/payment"
                    className="inline-block bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold px-6 py-3 rounded-xl shadow transition"
                  >
                    Upgrade to Premium
                  </a>
                  <p className="text-gray-500 mt-2">
                    Only premium users can place bids in auctions.
                  </p>
                </div>
              )}
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6">
              <BidHistory bids={bids} bidsLoading={bidsLoading} bidsError={bidsError} />
            </div>
            {/* Floating chat for bidders: only show if user has placed a bid and is not owner */}
            {!isOwner && userHasBid && auctionId && userData.user?.name && ownerId && (
              <FloatingAuctionChat
                auctionId={auctionId}
                room={`auction-${auctionId}-owner-${ownerId}-user-${userData.user.id}`}
                username={userData.user.name}
                targetUserId={ownerId}
                uid={userData.user.firebaseUid}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;
