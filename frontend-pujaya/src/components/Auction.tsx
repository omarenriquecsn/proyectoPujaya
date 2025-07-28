import React from 'react';
import Image from 'next/image';

// Cambiar el tipo de prop para que Auction reciba una subasta (auction) y no un producto directamente
interface AuctionProps {
  id: string;
  product: {
    name: string;
    imgProduct: string[];
    description: string;
    initialPrice: number;
    currentHighestBid?: number;
  };
  currentHighestBid?: number;
  name?: string;
}

const Auction: React.FC<{ auction: AuctionProps }> = ({ auction }) => {
  const price =
    auction.currentHighestBid ?? auction.product.currentHighestBid ?? auction.product.initialPrice;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col transition hover:scale-105 duration-200">
      {/* Imagen del producto */}
      <div className="bg-gray-100 h-48 flex items-center justify-center">
        <Image
          src={
            auction.product.imgProduct && auction.product.imgProduct.length > 0
              ? auction.product.imgProduct[0]
              : '/no-image.png'
          }
          width={400}
          height={300}
          priority
          alt={auction.product.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
      </div>
      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 min-h-[48px]">
          {auction.product.name}
        </h3>
        <p className="text-gray-500 text-sm mb-2 line-clamp-3 min-h-[60px]">
          {auction.product.description}
        </p>
        <span className="text-blue-700 text-xl font-bold mb-2">${price} USD</span>
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold mt-auto transition">
          Bid Now
        </button>
      </div>
    </div>
  );
};

export default Auction;
