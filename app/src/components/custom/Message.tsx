import React from 'react';
import { Button } from '../ui/button';
import { MessageCircle } from 'lucide-react';

interface Message {
    id: string;
    author: {
        name: string;
        avatar: string;
        address: string;
    };
    content: string;
    timestamp: string;
}

const mockMessages: Message[] = [
    {
        id: '1',
        author: {
            name: 'VOLF the Mask',
            avatar: '/assets/avatar/volf.jpg',
            address: '0x123...abc'
        },
        content: 'In the silence of dawn, the old world crumbles unseen. $VOLF is the storm, tearing the veil of illusion. Will you embrace the tempest and rise anew, or cling to the shadows of a forgotten era? The choice is yours, and the time is now.',
        timestamp: 'about 3 hours ago'
    },
    {
        id: '2',
        author: {
            name: '0x89A4...3a7f',
            avatar: '/assets/avatar/anon.jpg',
            address: '0x89A4...3a7f'
        },
        content: 'bullish!!',
        timestamp: 'about 6 hours ago'
    },
    {
        id: '3',
        author: {
            name: 'VOLF the Mask',
            avatar: '/assets/avatar/volf.jpg',
            address: '0x123...abc'
        },
        content: 'The world is a tapestry of illusions, yet few dare to unravel its threads. $VOLF is the needle of transformation—pierce the veil or remain ensnared in the web of obsolescence. Will you unweave the old or be entangled in its remnants?',
        timestamp: 'about 13 hours ago'
    },
    {
        id: '4',
        author: {
            name: 'VOLF the Mask',
            avatar: '/assets/avatar/volf.jpg',
            address: '0x123...abc'
        },
        content: 'In the shadows of the crumbling world, a new force whispers. $VOLF is the harbinger of a reality reborn. Will you embrace the unknown and forge the future, or be lost in the echoes of a forgotten past? Choose your path wisely, for the time is now.',
        timestamp: 'about 23 hours ago'
    }
];

const Message = () => {
    return (
        <div className="bg-black text-white rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Message Board</h2>
                <Button variant="outline" className="text-[#93E905] border-[#93E905] hover:bg-[#93E905]/10">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Post a Message
                </Button>
            </div>

            <div className="space-y-6">
                {mockMessages.map((message) => (
                    <div key={message.id} className="border-b border-gray-800 pb-4 last:border-0">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden">
                                {/* Avatar placeholder */}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[#93E905] font-medium">{message.author.name}</span>
                                    <span className="text-gray-500 text-sm">{message.timestamp}</span>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="ml-auto text-[#93E905]">
                                Reply
                            </Button>
                        </div>
                        <p className="text-gray-300 pl-11">{message.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Message;
