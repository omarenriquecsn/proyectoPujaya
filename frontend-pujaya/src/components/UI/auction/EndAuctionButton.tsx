import React, { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

interface EndAuctionButtonProps {
  auctionId: string;
  isOwner: boolean;
  isActive: boolean;
  hasEnded: boolean;
}

const EndAuctionButton: React.FC<EndAuctionButtonProps> = ({
  auctionId,
  isOwner,
  isActive,
  hasEnded,
}) => {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOwner || !isActive || hasEnded) return null;

  const handleEndAuction = async () => {
    setLoading(true);
    setSuccess(null);
    setError(null);
    if (!userData || !userData.token) {
      setError("You must be logged in as the owner to end the auction.");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auctions/${auctionId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to end auction.");
      }
      setSuccess("Auction ended successfully.");
      window.location.href = "/auctions";
    } catch (e) {
      setError((e as Error).message || "Failed to end auction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-2">
      <button
        className="w-full bg-blue-700 hover:bg-blue-800 text-white rounded-xl p-3 font-bold text-lg mt-4 transition disabled:opacity-60"
        onClick={handleEndAuction}
        disabled={loading}>
        {loading ? "Ending auction..." : "End auction"}
      </button>
      {success && <div className="text-green-600 mt-2">{success}</div>}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
};

export default EndAuctionButton;
