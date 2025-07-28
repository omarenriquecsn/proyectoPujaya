'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuctionList from '@/components/AuctionList';
import Image from 'next/image';
import { IAuction } from '@/app/types/index';

// The featured auction must be a complete product to have the id
export default function Home() {
  // State for search input
  const [search, setSearch] = useState('');
  const router = useRouter();

  // State and fetch for featured auction
  const [featured, setFeatured] = useState<IAuction | null>(null);
  const [showZoom, setShowZoom] = useState(false);
  useEffect(() => {
    // Fetch the active auction ending soonest
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auctions?limit=1&sort=ending`)
      .then((res) => res.json())
      .then((data) => {
        if (data.auctions && data.auctions.length > 0) {
          setFeatured(data.auctions[0]);
        }
      });
  }, []);

  // Handler for search form
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/auctions?search=${encodeURIComponent(search)}`);
    } else {
      router.push('/auctions');
    }
  };

  // Handler for explore button
  const handleExplore = () => {
    router.push('/auctions');
  };

  return (
    <main className="flex flex-col items-center min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="w-full bg-blue-700 py-16 px-4 flex flex-col items-center">
        <div className="max-w-6xl w-full flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Main Text */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Discover Treasures on <span className="text-yellow-400">Pujaya</span>
            </h1>
            <p className="text-white text-lg mb-8">
              The most reliable auction platform where you will find unique items, exclusive art,
              and extraordinary collectibles.
            </p>
            <form
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
              onSubmit={handleSearch}
            >
              <button
                type="button"
                className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold px-6 py-2 rounded transition"
                onClick={handleExplore}
              >
                Explore Auctions
              </button>
              <input
                type="text"
                placeholder="Search auctions..."
                className="px-4 py-2 rounded border border-gray-200 focus:outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
              >
                Search
              </button>
            </form>
            {/* Statistics */}
            <div className="flex gap-8 mt-10 justify-center md:justify-start">
              <div className="flex flex-col items-center">
                <span className="text-2xl text-white font-bold">24/7</span>
                <span className="text-white text-sm">Active Auctions</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl text-white font-bold">+50K</span>
                <span className="text-white text-sm">Active Users</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl text-white font-bold">100%</span>
                <span className="text-white text-sm">Secure</span>
              </div>
            </div>
          </div>
          {/* Featured Auction */}
          <div className="flex-1 flex justify-center">
            {featured && featured.product ? (
              <div className="bg-white bg-opacity-90 rounded-xl shadow-lg p-6 w-80 flex flex-col gap-4 transition-transform hover:scale-105 hover:shadow-2xl duration-200">
                <span className="text-gray-500 text-sm">Featured Auction</span>
                {/* Featured product image with zoom modal */}
                <div
                  className="bg-gray-100 h-40 flex items-center justify-center rounded-lg overflow-hidden mb-2 cursor-zoom-in"
                  onClick={() => setShowZoom(true)}
                >
                  <Image
                    src={featured.product.imgProduct[0]}
                    alt={featured.product.name}
                    width={320}
                    height={160}
                    className="object-contain h-full w-full"
                    style={{ height: 'auto' }}
                    priority
                  />
                </div>
                <h2 className="font-bold text-xl text-gray-800">{featured.product.name}</h2>
                <span className="text-blue-700 text-3xl font-bold">
                  ${featured.product.initialPrice}
                </span>
                <span className="text-gray-600 text-sm">{featured.product.description}</span>
                <div className="flex justify-between items-center">
                  <span className="bg-red-100 text-red-500 px-2 py-1 rounded text-xs">
                    Ends soon
                  </span>
                </div>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mt-2 transition"
                  onClick={() => router.push(`/auctions/${featured.id}`)}
                >
                  Bid Now
                </button>
                {/* Zoom modal */}
                {showZoom && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
                    onClick={() => setShowZoom(false)}
                  >
                    <div
                      className="bg-white rounded-lg p-4 max-w-2xl max-h-[80vh] flex flex-col items-center relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl"
                        onClick={() => setShowZoom(false)}
                      >
                        &times;
                      </button>
                      <Image
                        src={featured.product.imgProduct[0]}
                        alt={featured.product.name}
                        width={800}
                        height={600}
                        className="object-contain max-h-[70vh] w-auto"
                        style={{ maxWidth: '100%' }}
                        priority
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-white">No featured auction available.</div>
            )}
          </div>
        </div>
      </section>
      {/* Featured Auctions */}
      <section className="w-full max-w-6xl mx-auto mt-12 px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Featured Auctions</h2>
        <AuctionList />
      </section>
    </main>
  );
}
