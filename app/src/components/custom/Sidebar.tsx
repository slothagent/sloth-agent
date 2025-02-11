import { useRouter } from "next/navigation";

export default function Sidebar() {
    const router = useRouter();
    return (
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex flex-col">
          <div>
            <button onClick={() => router.push('/playground')} className="bg-transparent border border-gray-200 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg mb-6 w-full transition-colors">
              + New Thread
            </button>
            
            <div className="space-y-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 text-lg">G</div>
                  <span className="text-gray-700">Memetrade</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6">🏠</div>
                  <span className="text-gray-700">Home</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6">📥</div>
                  <span className="text-gray-700">Inbox</span>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm text-gray-500">Recent Threads</h2>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="text-gray-600 text-sm">Thread from 01/09</div>
                ))}
                <div className="text-gray-500 text-sm cursor-pointer hover:text-gray-700">
                  ... View More
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-3">
            <div className="flex items-center space-x-3 text-gray-600">
              <div className="w-6 h-6">❓</div>
              <span>Support</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-600">
              <div className="w-6 h-6">📄</div>
              <span>Docs</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-600">
              <div className="w-6 h-6">🔄</div>
              <span>Changelog</span>
            </div>
            <button className="mt-4 bg-transparent border border-gray-200 text-gray-700 px-4 py-2 rounded-lg w-full hover:bg-gray-100 transition-colors">
              Memetrade
            </button>
          </div>
        </div>
    )
}