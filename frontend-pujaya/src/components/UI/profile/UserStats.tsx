import React from "react";

interface UserStatsProps {
  stats: Array<{
    label: string;
    value: string | number;
    color?: string;
  }>;
}

const UserStats: React.FC<UserStatsProps> = ({ stats }) => {
  return (
    <div className="flex flex-wrap justify-center gap-6 my-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className={`flex flex-col items-center bg-gray-50 rounded-xl px-6 py-3 shadow text-center min-w-[90px]`}
        >
          <span className={`text-2xl font-bold ${stat.color || "text-blue-700"}`}>{stat.value}</span>
          <span className="text-xs text-gray-500 font-semibold mt-1">{stat.label}</span>
        </div>
      ))}
    </div>
  );
};

export default UserStats;
