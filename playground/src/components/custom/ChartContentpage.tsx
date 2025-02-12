"use client";
import React from 'react';

const ChartContentpage = () => {
  return (
    <div className="flex-1">
      {/* Time interval buttons */}
      <div className="flex gap-4 mb-6">
        {["5m", "15m", "1H", "1D"].map((interval) => (
          <button
            key={interval}
            className={`px-6 py-2 text-lg ${
              interval === "15m"
                ? "border-2 border-black text-gray-900 font-medium"
                : "text-gray-500 hover:border-2 hover:border-black"
            }`}
          >
            {interval}
          </button>
        ))}
      </div>

      {/* Chart area */}
      <div className="w-full h-[500px] rounded-lg bg-white border border-gray-200 relative">
        {/* Grid lines would be implemented with the chart library */}
        <div className="absolute right-0 top-0 bottom-0 w-16 flex flex-col justify-between text-base text-gray-500 py-4">
          <span>0.24</span>
          <span>0.22</span>
          <span>0.20</span>
          <span>0.18</span>
          <span>0.16</span>
          <span>0.14</span>
          <span>0.12</span>
          <span>0.10</span>
        </div>
      </div>

      {/* Time range buttons */}
      <div className="flex gap-4 mt-6 w-full">
        {["30m", "1h", "2h", "4h"].map((range) => (
          <button
            key={range}
            className="flex-1 px-8 py-3 text-2xl bg-gray-200 hover:border-2 hover:border-black hover:bg-gray-300 text-gray-700 font-medium"
          >
            {range}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChartContentpage;
