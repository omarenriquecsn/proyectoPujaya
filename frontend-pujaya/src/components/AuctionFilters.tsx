import React from 'react';

interface AuctionFiltersProps {
  search: string;
  setSearch: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
  categories: string[];
  onLocationClick: () => void;
  locationActive: boolean;
}

const AuctionFilters: React.FC<AuctionFiltersProps> = ({
  search,
  setSearch,
  category,
  setCategory,
  sort,
  setSort,
  categories,
  onLocationClick,
  locationActive,
}) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
        <input
          type="text"
          placeholder="Search auctions..."
          className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border border-gray-300 rounded-lg px-4 py-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          className="border border-gray-300 rounded-lg px-4 py-2"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="ending">Ending Soon</option>
          <option value="newest">Newest</option>
          <option value="lowest">Lowest Price</option>
          <option value="highest">Highest Price</option>
        </select>
      </div>
      <button
        className={`bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold px-4 py-2 rounded-lg shadow-sm transition ml-0 md:ml-4 ${locationActive ? 'border border-blue-700' : ''}`}
        onClick={onLocationClick}
      >
        {locationActive ? 'Edit location filter' : 'Filter by location'}
      </button>
    </div>
  );
};

export default AuctionFilters;
