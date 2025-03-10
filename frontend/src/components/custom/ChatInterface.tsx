"use client"

import React from 'react';
import { Card } from '../ui/card';

const ChatInterface: React.FC = () => {
    return (
        <Card className="h-full p-6 border-2 border-[#8b7355] rounded-lg bg-transparent">
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4 border-b-2 border-[#8b7355]/20 pb-2">
                    <h2 className="text-xl font-bold text-[#8b7355] font-mono tracking-tight">Chat Console</h2>
                    <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#8b7355] opacity-50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#8b7355] opacity-70"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#8b7355] opacity-90"></div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto mb-4 font-mono p-4 rounded-lg border-2 border-[#8b7355]/20">
                    <div className="space-y-4">
                        <div className="flex gap-3 items-start">
                            <div className="w-8 h-8 rounded-lg bg-[#8b7355] flex items-center justify-center text-[#f5f5dc] font-mono text-sm border border-[#8b7355]/20">
                                AI
                            </div>
                            <div className="flex-1 bg-white p-3 rounded-lg border-2 border-[#8b7355]/20 text-[#8b7355]">
                                Hello! How can I assist you today?
                            </div>
                        </div>
                        {/* Example user message */}
                        <div className="flex gap-3 items-start justify-end">
                            <div className="flex-1 bg-[#8b7355]/5 p-3 rounded-lg border-2 border-[#8b7355]/20 text-[#8b7355] text-right">
                                I'd like to create a new agent.
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-[#8b7355]/10 flex items-center justify-center text-[#8b7355] font-mono text-sm border-2 border-[#8b7355]/20">
                                YOU
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <textarea 
                            className="w-full min-h-[50px] p-3 rounded-lg font-mono bg-white border-2 border-[#8b7355]/20 resize-none focus:outline-none focus:ring-2 focus:ring-[#8b7355]/20 placeholder:text-[#8b7355]/40 text-[#8b7355]"
                            placeholder="Type your message here..."
                        />
                        <div className="absolute right-3 bottom-3 text-[#8b7355]/40 text-sm font-mono">_</div>
                    </div>
                    <button className="px-6 py-3 bg-[#8b7355] text-[#f5f5dc] rounded-lg font-mono hover:bg-[#8b7355]/90 transition-all duration-200 border-2 border-[#8b7355]/20">
                        Send
                    </button>
                </div>
            </div>
        </Card>
    );
};

export default ChatInterface; 