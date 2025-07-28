import { IAuction, IProduct, IUser } from '@/app/types/index';
import { getProductById } from '@/app/utils/products.helper';
import { getUserById } from '@/app/utils/users.helper';
import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';


interface Props {
  auction: IAuction | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AuctionDetailModal({ auction, isOpen, onClose }: Props) {
  const [product, setProduct] = useState<IProduct | null>(null);
  const [user, setUser] = useState<IUser | null>(null);

  const fetchData = useCallback(async () => {
    if (!auction?.product?.id || !auction?.owner?.id) return;

    try {
      const [productData, userData] = await Promise.all([
        getProductById(auction.product.id),
        getUserById(auction.owner.id),
      ]);

      setProduct(productData as IProduct);
      setUser(userData as IUser);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [auction]);

  useEffect(() => {
    if (isOpen && auction) {
      fetchData();
    } else {
      setProduct(null);
      setUser(null);
    }
  }, [isOpen, auction, fetchData]);

  if (!isOpen || !auction) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex flex-col items-center">
          {/* Header */}
          <div className="flex items-center justify-between w-full mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Auction Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <span className="text-2xl">&times;</span>
            </button>
          </div>

          {/* Image */}
          <div className="w-full h-48 mb-4">
            <Image
              src={product?.imgProduct?.[0] || '/default-auction.png'}
              alt={auction.name}
              className="w-full h-full object-cover rounded-lg"
              width={100}
              height={100}
            />
          </div>

                    {/* Content */}
                    <div className="w-full space-y-4">
                        <div>
                            <h4 className="text-xl font-semibold text-gray-900">{auction.name}</h4>
                            <p className="text-sm text-gray-500">{auction.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Initial Price</p>
                                <p className="text-lg font-semibold">${product?.initialPrice || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Current Price</p>
                                <p className="text-lg font-semibold">${product?.finalPrice || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
          {/* Content */}
          <div className="w-full space-y-4">
            <div>
              <h4 className="text-xl font-semibold text-gray-900">{auction.name}</h4>
              <p className="text-sm text-gray-500">{auction.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Initial Price</p>
                <p className="text-lg font-semibold">
                  ${auction.currentHighestBid ?? product?.initialPrice ?? 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Price</p>
                <p className="text-lg font-semibold">
                  ${auction.currentHighestBid ?? product?.initialPrice ?? 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">End Date</p>
                <p className="text-base">
                  {auction.endDate ? new Date(auction.endDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bids</p>
                <p className="text-base">{auction.bids?.length || 0}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Owner</p>
                <p className="text-base">{user?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    auction.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {auction.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}