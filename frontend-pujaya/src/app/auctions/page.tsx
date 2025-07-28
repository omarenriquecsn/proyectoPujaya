'use client';

import AuctionList from '@/components/AuctionList';
import AuctionFilters from '@/components/AuctionFilters';
import LocationFilterModal from '@/components/LocationFilterModal';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuctionsPage() {
  const { userData } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for filters: read the query params ONLY on the first render
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialSort = searchParams.get('sort') || 'ending';
  const initialSeller = searchParams.get('seller') || '';
  const initialPage = Number(searchParams.get('page') || 1);
  const initialRadius = Number(searchParams.get('radius') || 10);

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState(initialSort);
  const [sellerId, setSellerId] = useState(initialSeller);
  const [page, setPage] = useState(initialPage);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [radius, setRadius] = useState<number>(initialRadius);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isPremium, setIsPremium] = useState(false);

  // Fetch categories from backend using environment variable
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    fetch(`${apiUrl}/category`)
      .then((res) => res.json())
      .then((data: { items: { categoryName: string }[] }) => {
        setCategories(Array.isArray(data.items) ? data.items.map((cat) => cat.categoryName) : []);
      })
      .catch(() => {
        setCategories([]);
      });
  }, []);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          setUserLocation(null);
        }
      );
    }
  }, []);

  // Check the user's role when userData changes
  useEffect(() => {
    if (userData?.user?.role === 'premium') {
      setIsPremium(true);
    } else {
      setIsPremium(false);
    }
  }, [userData]);

  // Reset the page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, category, sort, sellerId]);

  // Synchronize filters and page with the URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (sort && sort !== 'ending') params.set('sort', sort);
    if (sellerId) params.set('seller', sellerId);
    if (page > 1) params.set('page', String(page));
    if (latitude !== null && longitude !== null) {
      params.set('lat', String(latitude));
      params.set('lng', String(longitude));
      params.set('radius', String(radius));
    }
    const paramString = params.toString();
    router.replace(`/auctions${paramString ? `?${paramString}` : ''}`);
  }, [search, category, sort, sellerId, page, latitude, longitude, radius, router]);

  // Handle location filter result
  const handleApplyLocation = (location: { lat: number; lng: number }, r: number) => {
    setLatitude(location.lat);
    setLongitude(location.lng);
    setRadius(r);
    setLocationModalOpen(false);
  };

  // Check if any filter is active (not in its initial value)
  const anyFilterActive =
    (latitude !== null && longitude !== null) ||
    search !== '' ||
    category !== '' ||
    sort !== 'ending' ||
    sellerId !== '';

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Active Auctions</h1>
          <p className="text-gray-500">Discover all active auctions in different categories</p>
        </div>
        {/* Premium user button */}
        {isPremium ? (
          <Link
            href="/auctions/create"
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <span>+</span>
            <span>Create Auction</span>
          </Link>
        ) : userData ? (
          <Link
            href={'/payment'}
            className="align-content-center px-6 py-3 bg-yellow-400 text-blue-900 font-semibold rounded-xl shadow-md hover:bg-yellow-500 transition"
          >
            Upgrade to Premium to create auctions
          </Link>
        ) : null}
      </div>

      <AuctionFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        sort={sort}
        setSort={setSort}
        categories={categories}
        onLocationClick={() => setLocationModalOpen(true)}
        locationActive={latitude !== null && longitude !== null}
      />
      <LocationFilterModal
        open={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        userLocation={userLocation}
        onApplyLocation={handleApplyLocation}
        initialRadius={radius}
      />

      {/* Button to clear the seller filter if it is active */}
      {sellerId && (
        <div className="mb-4 flex justify-end">
          <button
            className="flex items-center gap-1 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded-md text-sm font-medium shadow-sm transition-all"
            style={{ minHeight: 0, height: '32px' }}
            onClick={() => setSellerId('')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 14L14 6M6 6l8 8" />
            </svg>
            See all
          </button>
        </div>
      )}

      {/* Button to clear all filters, only if any filter is active */}
      {anyFilterActive && (
        <div className="mb-4 flex justify-end">
          <button
            className="flex items-center gap-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-md text-sm font-medium shadow-sm transition-all"
            style={{ minHeight: 0, height: '32px' }}
            onClick={() => {
              setLatitude(null);
              setLongitude(null);
              setRadius(10);
              setSearch('');
              setCategory('');
              setSort('ending');
              setSellerId('');
              setPage(1);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 14L14 6M6 6l8 8" />
            </svg>
            Clear all filters
          </button>
        </div>
      )}

      <AuctionList
        search={search}
        category={category}
        sort={sort}
        sellerId={sellerId}
        page={page}
        setPage={setPage}
        latitude={latitude}
        longitude={longitude}
        radius={radius}
      />
    </main>
  );
}
