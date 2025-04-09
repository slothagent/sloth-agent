import {Loader} from "lucide-react"


export const Loading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center text-white z-50">
      <div className="flex flex-col items-center gap-4  p-8 rounded-2xl shadow-lg">
        <Loader className="w-12 h-12 animate-spin" />
        <div className="text-xl">Loading chat...</div>
      </div>
    </div>
  );
}; 