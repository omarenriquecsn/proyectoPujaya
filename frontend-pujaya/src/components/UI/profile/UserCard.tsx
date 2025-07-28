import React from 'react';

interface UserCardProps {
  name: string;
  email: string;
  role?: string;
  topSeller?: boolean;
  rating?: number;
  reviews?: number;
}

const UserCard: React.FC<UserCardProps> = ({ name, email, role, topSeller, rating, reviews }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold text-gray-800">{name}</span>
        <span className="text-gray-500 text-sm">{email}</span>
        {role && (
          <span className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-0.5 mt-1 font-semibold uppercase tracking-wider">
            {role}
          </span>
        )}
        <div className="flex gap-2 mt-2">
          {topSeller && (
            <span className="bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded text-xs font-semibold">
              Top Seller
            </span>
          )}
          {rating && (
            <span className="bg-gray-100 text-yellow-600 px-2 py-0.5 rounded text-xs font-semibold">
              ⭐ {rating} ({reviews} reviews)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
