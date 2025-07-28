import React from "react";

interface ProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: string[];
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, setActiveTab, tabs }) => {
  return (
    <div className="flex gap-2 border-b mb-6 mt-4">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`px-5 py-2 font-semibold text-base rounded-t-lg transition-colors duration-200 focus:outline-none
            ${activeTab === tab ? "text-blue-700 border-b-2 border-blue-700 bg-white" : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"}
          `}
          onClick={() => setActiveTab(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default ProfileTabs;
