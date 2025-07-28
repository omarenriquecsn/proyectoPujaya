import React from 'react';
import Image from 'next/image';
import { FaPen } from 'react-icons/fa';

interface UserProfile {
  name: string;
  imgProfile?: string;
  isActive?: boolean;
  role?: string;
}

interface ProfileHeaderProps {
  userData: { user: UserProfile };
  showPhotoMenu: boolean;
  setShowPhotoMenu: (v: boolean) => void;
  photoInputRef: React.RefObject<HTMLInputElement>;
  handleImageChange: (file: File | undefined) => void;
  onEditProfile: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userData,
  showPhotoMenu,
  setShowPhotoMenu,
  photoInputRef,
  handleImageChange,
  onEditProfile,
}) => (
  <div className="flex flex-col sm:flex-row flex-wrap items-center sm:items-start w-full gap-4">
    {/* Left: Avatar + Info */}
    <div className="flex flex-col sm:flex-row items-center sm:items-start w-full sm:w-auto gap-4">
      <div className="relative">
        <Image
          src={userData.user.imgProfile || '/default-profile.png'}
          alt={userData.user.name}
          width={80}
          height={80}
          className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
        />
        <button
          className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-md border border-gray-200 hover:bg-blue-100 z-10"
          onClick={() => setShowPhotoMenu(!showPhotoMenu)}
          aria-label="Edit photo"
          type="button"
        >
          <FaPen className="text-blue-700 w-4 h-4" />
        </button>
        {showPhotoMenu && (
          <div className="absolute z-20 top-12 right-0 bg-white border rounded shadow-lg flex flex-col min-w-[140px] animate-fade-in">
            <button
              className="px-4 py-2 text-left hover:bg-gray-100 text-sm"
              onClick={() => {
                setShowPhotoMenu(false);
                window.open(userData.user.imgProfile || '/default-profile.png', '_blank');
              }}
            >
              View photo
            </button>
            <button
              className="px-4 py-2 text-left hover:bg-gray-100 text-sm"
              onClick={() => {
                setShowPhotoMenu(false);
                photoInputRef.current?.click();
              }}
            >
              Edit photo
            </button>
          </div>
        )}
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleImageChange(e.target.files?.[0])}
          className="hidden"
        />
      </div>

      <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
        <span className="text-2xl font-bold text-gray-900">{userData.user.name}</span>
        <span className="text-xs text-gray-500 mt-1">Art & Antiques Collector</span>
        <div className="flex flex-wrap gap-2 mt-2 items-center justify-center sm:justify-start">
          {userData.user.isActive === false ? (
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700">
              Inactive
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">
              Active
            </span>
          )}
          {userData.user.role && (
            <span
              className={`px-2 py-0.5 rounded text-xs font-semibold ${userData.user.role === 'premium'
                ? 'bg-yellow-200 text-yellow-800'
                : 'bg-blue-100 text-blue-700'
                }`}
            >
              {userData.user.role.charAt(0).toUpperCase() + userData.user.role.slice(1)}
            </span>
          )}
        </div>
      </div>
    </div>

    {/* Right: Edit Profile Button */}
    <div className="flex w-full sm:w-auto justify-center sm:justify-end mt-2 sm:mt-0">
      <button
        onClick={onEditProfile}
        className="bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 transition text-sm flex items-center"
      >
        Edit Profile <FaPen className="flex justify-center inline ml-2" />
      </button>
    </div>
  </div>
);

export default ProfileHeader;
