import Link from 'next/link';
import { Home, Inbox, HelpCircle, FileText, History, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

// Định nghĩa kiểu dữ liệu cho cuộc trò chuyện
interface ChatThread {
    id: string;
    agentId: string;
    title: string;
    createdAt: Date;
}

const Sidebar = () => {
    const [recentThreads, setRecentThreads] = useState<ChatThread[]>([]);
    const pathname = usePathname();

    useEffect(() => {
        // Tạm thời dùng dữ liệu mẫu, sau này sẽ fetch từ API
        const mockThreads: ChatThread[] = [
            {
                id: '1',
                agentId: 'agent-1',
                title: `Chat from ${formatDate(new Date('2024-03-15'))}`,
                createdAt: new Date('2024-03-15')
            },
            {
                id: '2',
                agentId: 'agent-2', 
                title: `Chat from ${formatDate(new Date('2024-03-14'))}`,
                createdAt: new Date('2024-03-14')
            },
            // Thêm các cuộc trò chuyện mẫu khác...
        ];
        setRecentThreads(mockThreads);
    }, []);

    // Thêm hàm format date
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: '2-digit'
        });
    };

    return (
        <div className="h-full bg-background border-r border-border p-6 flex flex-col">
            <Link href="/" className="bg-secondary hover:bg-accent text-foreground px-4 py-3 rounded-lg mb-8 w-full transition-colors flex items-center gap-3 shadow-sm">
                <Plus className="w-5 h-5" />
                <span className="font-medium">New Thread</span>
            </Link>
            
            <div className="space-y-8 mb-8">
                <div className="space-y-4">
                    <Link href="/" className="flex items-center space-x-3 text-foreground hover:text-primary transition-colors">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">M</div>
                        <span className="font-medium">Sloth Ai</span>
                    </Link>
                    <Link href="/home" className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-colors">
                        <Home className="w-5 h-5" />
                        <span>Home</span>
                    </Link>
                    <Link href="/inbox" className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-colors">
                        <Inbox className="w-5 h-5" />
                        <span>Inbox</span>
                    </Link>
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-medium text-muted-foreground">Recent Threads</h2>
                    {recentThreads.slice(0, 5).map((thread) => (
                        <Link 
                            key={thread.id}
                            href={`/agents/${thread.agentId}?thread=${thread.id}`}
                            className={`text-muted-foreground hover:text-primary cursor-pointer transition-colors block ${
                                pathname.includes(thread.agentId) ? 'text-primary' : ''
                            }`}
                        >
                            {thread.title}
                        </Link>
                    ))}
                    {recentThreads.length > 5 && (
                        <Link 
                            href="/history" 
                            className="text-muted-foreground hover:text-primary cursor-pointer transition-colors font-medium block"
                        >
                            ... View More
                        </Link>
                    )}
                </div>
            </div>

            <div className="mt-auto space-y-4">
                <Link href="/support" className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-colors">
                    <HelpCircle className="w-8 h-8" />
                    <span className="text-lg">Support</span>
                </Link>
                <Link href="/docs" className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-colors">
                    <FileText className="w-7 h-7" />
                    <span className="text-lg">Docs</span>
                </Link>
                <Link href="/changelog" className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-colors">
                    <History className="w-7 h-7" />
                    <span className="text-lg">Changelog</span>
                </Link>
                <button className="mt-6 bg-secondary hover:bg-accent text-foreground px-6 py-3 rounded-lg w-full transition-colors text-lg font-medium shadow-sm">
                    Memetrade
                </button>
            </div>
        </div>
    );
};

export default Sidebar;