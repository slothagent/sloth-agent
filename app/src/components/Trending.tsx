const Trending = () => {
    return (
        <div className="relative px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-900/10 to-pink-900/10 overflow-hidden">
            <div className="max-w-[340px] md:w-full mx-auto flex items-center gap-4 overflow-x-auto overflow-y-hidden scrollbar-hide">
                <span className="text-gray-500 whitespace-nowrap flex items-center gap-2 shrink-0">
                    <svg 
                        className="w-4 h-4 animate-pulse text-neon-pink" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                    >
                        <path d="M1 5h2v10H1V5zM5 5h2v10H5V5zm4 0h2v10H9V5zm4 0h2v10h-2V5zm4 0h2v10h-2V5z"/>
                    </svg>
                    Trending
                </span>
                {['ROG', 'DENGO', 'Stealth #0', 'JGLY', 'drunker', 'rkgrok', 'SOL', 'FROGG', 'TAXI', 'TUC'].map((token, index) => (
                    <div 
                        key={token} 
                        className="flex items-center gap-1 whitespace-nowrap hover:scale-105 transition-transform cursor-pointer group shrink-0"
                    >
                        <span className="text-gray-500 group-hover:text-neon-pink transition-colors">#{index + 1}</span>
                        <span className="bg-gradient-to-r from-neon-pink to-purple-500 bg-clip-text text-transparent font-medium">
                            {token}
                        </span>
                    </div>
                ))}
            </div>
            <div className="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
            <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
        </div>
    )
}

export default Trending;