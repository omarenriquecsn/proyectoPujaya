import React from 'react';
import SellerInfo from './SellerInfo';

interface AuctionTabsProps {
  tab: string;
  setTab: (tab: string) => void;
  isPremium: boolean;
  description: string;
  details: string;
  owner?: {
    id: string;
    name: string;
    email: string;
    createdAt?: string;
  };
}

const tabs = ['Description', 'Details', 'Shipping', 'Return Policy', 'Seller info'];

const AuctionTabs: React.FC<AuctionTabsProps> = ({
  tab,
  setTab,
  isPremium,
  description,
  details,
  owner,
}) => {
  return (
    <>
      <nav className="flex gap-2 border-b mb-4 bg-white">
        {tabs.map((t) =>
          t === 'Seller info' && !isPremium ? null : (
            <span
              key={t}
              className={`relative cursor-pointer px-5 py-3 text-base font-semibold transition-colors duration-200
                ${
                  tab === t
                    ? 'text-blue-700 after:absolute after:left-0 after:bottom-0 after:w-full after:h-0.5 after:bg-blue-700 after:rounded-full after:transition-all after:duration-300'
                    : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-t-md'
                }
              `}
              style={{
                display: 'inline-block',
                minWidth: 120,
                textAlign: 'center',
                position: 'relative',
                zIndex: 1,
              }}
              onClick={() => setTab(t)}
              role="tab"
              aria-selected={tab === t}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setTab(t);
              }}
            >
              {t}
            </span>
          )
        )}
      </nav>
      <div className="mt-2">
        {tab === 'Description' && (
          <div>
            <p className="text-gray-700 text-base mb-6">{description}</p>
            <div className="flex flex-wrap gap-6 items-center text-sm text-gray-600">
              <div className="flex items-center gap-1">
                {/* Authenticity icon (circle check) */}
                <svg width="18" height="18" fill="none" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="9" stroke="#22C55E" strokeWidth="2" fill="white" />
                  <path
                    d="M6.5 10.5l2.5 2.5 4.5-5"
                    stroke="#22C55E"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Authenticity guaranteed</span>
              </div>
              <div className="flex items-center gap-1">
                {/* Eye icon */}
                <svg width="18" height="18" fill="none" viewBox="0 0 20 20">
                  <path
                    d="M1.458 10C2.732 5.943 6.522 3 10 3c3.478 0 7.268 2.943 8.542 7-1.274 4.057-5.064 7-8.542 7-3.478 0-7.268-2.943-8.542-7z"
                    stroke="#2563EB"
                    strokeWidth="2"
                  />
                  <circle cx="10" cy="10" r="3" stroke="#2563EB" strokeWidth="2" />
                </svg>
                <span>45 people watching</span>
              </div>
            </div>
          </div>
        )}
        {tab === 'Details' && (
          <div>
            <p className="text-gray-700 text-base mb-6">{details || '-'}</p>
          </div>
        )}
        {tab === 'Shipping' && (
          <div className="text-gray-700 text-base space-y-2">
            <ul className="list-disc pl-5">
              <li>Standard shipping (5-7 business days) - $20 USD</li>
              <li>Express shipping (2-3 business days) - $40 USD</li>
            </ul>
            <div>
              <b>Free shipping</b> on purchases over $500 USD.
            </div>
            <div>Shipping to: Argentina, Chile, Uruguay, Brazil, Mexico, Spain.</div>
            <div className="text-xs text-gray-500">
              * Delivery times may vary depending on location.
            </div>
          </div>
        )}
        {tab === 'Return Policy' && (
          <div className="text-gray-700 text-base space-y-2">
            <ul className="list-disc pl-5">
              <li>
                <b>Returns accepted within 7 days</b> after receipt.
              </li>
              <li>The product must be unused and in its original packaging.</li>
              <li>To request a return, contact the seller from your profile.</li>
            </ul>
            <div className="text-xs text-gray-500 mt-2">
              * Return shipping costs are the responsibility of the buyer.
            </div>
          </div>
        )}
        {tab === 'Seller info' && owner && (
          <SellerInfo
            owner={owner}
            onViewMoreProducts={(sellerId) => {
              window.location.href = `/auctions?seller=${sellerId}`;
            }}
            show={isPremium}
          />
        )}
      </div>
    </>
  );
};

export default AuctionTabs;
