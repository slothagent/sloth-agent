'use client'

import { useEffect, useState } from "react";

const CampaignBanner = () => {

    const [width, setWidth] = useState<number>(0);
  
    useEffect(() => {
      setWidth(window.innerWidth);
      
      const handleResize = () => {
        setWidth(window.innerWidth);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    const isMobile = width < 768;
    const isDesktop = width >= 1024;

    return (
        <div className="p-2 pr-4 sm:p-3 md:p-4">
            <div className="md:max-w-7xl md:mx-auto relative overflow-hidden rounded-xl">
                <div className="relative bg-gradient-to-r from-[#FF0080]/90 via-[#7928CA]/90 to-[#FF0080]/90 rounded-2xl p-3 sm:p-4 md:p-6  border border-white/20 shadow-xl">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-start gap-3 sm:gap-4 w-full md:w-auto">
                            {/* Gift icon container */}
                            <div className={`bg-white/20 ${isMobile ? 'p-2' : 'p-3'} rounded-xl backdrop-blur-sm relative overflow-hidden group shrink-0`}>
                                <span className={`${isMobile ? 'text-xl' : 'text-2xl'} relative z-10`}>🎁</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>

                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-1.5 sm:mb-2">
                                    <span className={`bg-white/20 ${isMobile ? 'px-2 py-1' : 'px-3 py-1'} rounded-full text-xs font-medium text-white backdrop-blur-sm`}>
                                        New
                                    </span>
                                    <h2 className={`font-bold text-white ${isMobile ? 'text-base' : 'text-lg'}`}>
                                        New campaign has arrived
                                    </h2>
                                    <span className="animate-bounce">🚀</span>
                                </div>
                                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/90 max-w-2xl`}>
                                    {isDesktop 
                                        ? 'Create a new token (except Eclipse chain). Once bonding curve is completely filled, all fees will be refunded, and you will receive a $1,000 bonus.'
                                        : 'Create a new token. Get fees refunded and $1,000 bonus when curve fills.'}
                                </p>
                            </div>
                        </div>

                        <button className={`relative ${isMobile ? 'w-full' : 'w-auto'} px-4 sm:px-6 py-2 sm:py-2.5 bg-white text-[#7928CA] font-medium rounded-full hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 overflow-hidden group`}>
                            <span className="relative z-10">{isDesktop ? 'Start Campaign' : 'Go'}</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shine" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CampaignBanner;