"use client";
import React from 'react';

const CookieContent = () => {
  return (
    <div className="flex-1">
      {/* Cookie Dao Content */}
      <div className="space-y-4 mb-6">
        <div className="space-y-4 border-b pb-4 border-gray-300">
          <h2 className="text-2xl font-semibold">Mindshare</h2>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold">2.92</span>
            <span className="text-red-500 bg-red-100 px-2 py-1 rounded">-7.61%</span>
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-extrabold mb-6">Trading</h2>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-gray-500 mb-2">Market Cap</p>
              <div className="space-y-1">
                <p className="text-2xl font-semibold">$186.59M</p>
                <p className="text-red-500">-11.49%</p>
              </div>
            </div>
            <div>
              <p className="text-gray-500 mb-2">Price</p>
              <div className="space-y-1">
                <p className="text-2xl font-semibold">$0.19</p>
                <p className="text-red-500">-11.67%</p>
              </div>
            </div>
            <div>
              <p className="text-gray-500 mb-2">Volume 24 Hours</p>
              <div className="space-y-1">
                <p className="text-2xl font-semibold">$40.95M</p>
                <p className="text-green-500">31.77%</p>
              </div>
            </div>
            <div>
              <p className="text-gray-500 mb-2">Holders Count</p>
              <div className="space-y-1">
                <p className="text-2xl font-semibold">64.65K</p>
                <p className="text-red-500">-0.19%</p>
              </div>
            </div>
            <div>
              <p className="text-gray-500 mb-2">Liquidity</p>
              <div className="space-y-1">
                <p className="text-2xl font-semibold">$6.25M</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieContent;
