'use client';
import React, { useEffect, useState } from 'react';
import Auction from './Auction';
import Link from 'next/link';
import { IAuction } from '@/app/types';
import { LoadingSpinner } from './LoadingSpinner';

const PAGE_SIZE = 6;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface AuctionListProps {
  search?: string;
  category?: string;
  sort?: string;
  sellerId?: string;
  page?: number;
  setPage?: React.Dispatch<React.SetStateAction<number>>;
  latitude?: number | null;
  longitude?: number | null;
  radius?: number;
}

// Definir un tipo mínimo para Auction (puedes reemplazarlo por el tipo real si lo tienes)
type AuctionType = {
  id: string;
  product: {
    name: string;
    imgProduct: string[];
    description: string;
    initialPrice: number;
  };
};

// Subcomponente para la tarjeta de subasta
function AuctionCard({ auction }: { auction: IAuction }) {
  return (
    <Link
      key={auction.id}
      href={`/auctions/${auction.id}`}
      className="block transition hover:scale-105"
    >
      <Auction auction={auction} />
    </Link>
  );
}

const AuctionList: React.FC<AuctionListProps> = ({
  search = '',
  category = '',
  sort = 'ending',
  sellerId = '',
  page: controlledPage,
  setPage: controlledSetPage,
  latitude = null,
  longitude = null,
  radius = 10,
}) => {
  const [products, setProducts] = useState<AuctionType[]>([]);
  const [internalPage, internalSetPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Usar page/setPage controlados si vienen del padre, si no usar internos
  const page = controlledPage !== undefined ? controlledPage : internalPage;
  const setPage = controlledSetPage !== undefined ? controlledSetPage : internalSetPage;

  useEffect(() => {
    setLoading(true);
    // Construir query params
    const params = new URLSearchParams();
    params.append('limit', PAGE_SIZE.toString());
    params.append('page', page.toString());
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (sort) params.append('sort', sort);
    if (sellerId) params.append('seller', sellerId);
    if (latitude !== null && longitude !== null) {
      params.append('lat', String(latitude));
      params.append('lng', String(longitude));
      params.append('radius', String(radius));
    }
    fetch(`${API_URL}/auctions?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        // Filtrar solo subastas activas
        const filtered = (data.auctions || []).filter(
          (auction: { isActive?: boolean }) => auction.isActive !== false
        );
        setProducts(filtered);
        setTotal(data.total || filtered.length); // Usar total real si viene del backend
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [page, search, category, sort, sellerId, latitude, longitude, radius]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      {loading ? (
        <LoadingSpinner />
      ) : products && products.length === 0 ? (
        <div className="text-center text-gray-500 py-10">No auctions found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {products &&
            products.map((auction) => (
              <AuctionCard key={auction.id} auction={auction as IAuction} />
            ))}
        </div>
      )}
      {/* Paginación */}
      <div className="flex justify-center items-center gap-2 mt-10">
        <button
          className={`px-3 py-1 rounded bg-gray-200 ${page === 1 ? 'text-gray-400' : 'text-gray-700'}`}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        {[...Array(totalPages)].map((_, idx) => (
          <button
            key={idx}
            className={`px-3 py-1 rounded ${
              page === idx + 1 ? 'bg-blue-700 text-white font-bold' : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setPage(idx + 1)}
          >
            {idx + 1}
          </button>
        ))}
        <button
          className={`px-3 py-1 rounded bg-gray-200 ${page === totalPages ? 'text-gray-400' : 'text-gray-700'}`}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AuctionList;
