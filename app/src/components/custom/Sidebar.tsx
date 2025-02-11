import Link from 'next/link';
import { Home, Inbox, HelpCircle, FileText, History, Plus } from 'lucide-react';

const Sidebar = () => {
    return (
        <div className="h-full bg-gray-50 border-r border-gray-200 p-4 flex flex-col">
            <Link href="/playground" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg mb-6 w-full transition-colors flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span>New Thread</span>
            </Link>
            
            <div className="space-y-6 mb-8">
                <div className="space-y-4">
                    <Link href="/" className="flex items-center space-x-3 text-gray-700 hover:text-green-500 transition-colors">
                        <div className="w-5 h-5">M</div>
                        <span>Memetrade</span>
                    </Link>
                    <Link href="/home" className="flex items-center space-x-3 text-gray-700 hover:text-green-500 transition-colors">
                        <Home className="w-5 h-5" />
                        <span>Home</span>
                    </Link>
                    <Link href="/inbox" className="flex items-center space-x-3 text-gray-700 hover:text-green-500 transition-colors">
                        <Inbox className="w-5 h-5" />
                        <span>Inbox</span>
                    </Link>
                </div>

                <div className="space-y-3">
                    <h2 className="text-lg text-gray-500">Recent Threads</h2>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="text-gray-400 text-lg hover:text-[#4ADE80] cursor-pointer transition-colors">
                            Thread from 01/09
                        </div>
                    ))}
                    <div className="text-gray-500 text-lg cursor-pointer hover:text-[#4ADE80] transition-colors">
                        ... View More
                    </div>
                </div>
            </div>

            <div className="mt-auto space-y-3">
                <Link href="/support" className="flex items-center space-x-3 text-gray-600 hover:text-green-500 transition-colors">
                    <HelpCircle className="w-10 h-10" />
                    <span className="text-xl">Support</span>
                </Link>
                <Link href="/docs" className="flex items-center space-x-3 text-gray-600 hover:text-green-500 transition-colors">
                    <FileText className="w-8 h-8" />
                    <span className="text-lg">Docs</span>
                </Link>
                <Link href="/changelog" className="flex items-center space-x-3 text-gray-600 hover:text-green-500 transition-colors">
                    <History className="w-8 h-8" />
                    <span className="text-lg">Changelog</span>
                </Link>
                <button className="mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg w-full transition-colors text-lg">
                    Memetrade
                </button>
            </div>
        </div>
    );
};

export default Sidebar;