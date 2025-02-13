import { Button } from "@/components/ui/button";
import { Brain, Edit2 } from "lucide-react";
import { useState } from "react";
  
  interface AgentDetails {
    name: string;
    description: string;
    image: string;
    isEditing: {
      name: boolean;
      description: boolean;
      instructions: boolean;
    };
    instructions: string;
  }
export default function TabOverview() {
    const [agentDetails, setAgentDetails] = useState<AgentDetails>({
        name: "trivia",
        description: "Agent Trivia challenges you with quick, engaging questions across various topics. Test your knowledge and keep your mind sharp.",
        image: "https://i.ibb.co/0r00000/trivia.png",
        instructions: "Agent Trivia challenges you with quick, engaging questions across various topics. Test your knowledge and keep your mind sharp.",
        isEditing: {
          name: false,
          description: false,
          instructions: false,
        }
      });
      const handleEdit = (field: keyof AgentDetails['isEditing']) => {
        setAgentDetails(prev => ({
          ...prev,
          isEditing: {
            ...prev.isEditing,
            [field]: true
          }
        }));
      };
    
      const handleSave = (field: keyof AgentDetails['isEditing'], value: string) => {
        setAgentDetails(prev => ({
          ...prev,
          [field]: value,
          isEditing: {
            ...prev.isEditing,
            [field]: false
          }
        }));
      };
    return (
        <div className="grid grid-cols-1 gap-4 md:gap-6 p-4 md:p-6">
            {/* Agent Details */}
            <div className="space-y-4 md:space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 py-3 md:py-4">
                    <span className="text-gray-500 mb-2 md:mb-0">Name</span>
                    <div className="flex items-center justify-between w-full md:w-1/2 gap-2">
                        {agentDetails.isEditing.name ? (
                            <input
                                type="text"
                                value={agentDetails.name}
                                onChange={(e) => setAgentDetails(prev => ({...prev, name: e.target.value}))}
                                onBlur={() => handleSave('name', agentDetails.name)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSave('name', agentDetails.name);
                                    }
                                }}
                                className="w-full px-2 py-1 border text-sm md:text-base"
                                autoFocus
                            />
                        ) : (
                            <>
                                <span className="text-sm md:text-base">{agentDetails.name}</span>
                                <Edit2 
                                    className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" 
                                    onClick={() => handleEdit('name')}
                                />
                            </>
                        )}
                    </div>
                </div>
                
                <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 py-3 md:py-4">
                    <span className="text-gray-500 mb-2 md:mb-0">Image</span>
                    <div className="w-full md:w-1/2 flex items-center justify-between gap-2">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Brain className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <Edit2 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                    </div>
                </div>  

                <div className="flex flex-col md:flex-row justify-between items-start border-b border-gray-200 py-3 md:py-4">
                    <span className="text-gray-500 mb-2 md:mb-0">Description</span>
                    <div className="flex items-start gap-2 w-full md:w-1/2">
                        {agentDetails.isEditing.description ? (
                            <textarea
                                value={agentDetails.description}
                                onChange={(e) => setAgentDetails(prev => ({...prev, description: e.target.value}))}
                                onBlur={() => handleSave('description', agentDetails.description)}
                                className="w-full px-2 py-1 border text-sm md:text-base"
                                rows={3}
                                autoFocus
                            />
                        ) : (
                            <>
                                <p className="text-sm md:text-base flex-1">{agentDetails.description}</p>
                                <Edit2 
                                    className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 mt-1 flex-shrink-0" 
                                    onClick={() => handleEdit('description')}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>  

            {/* Actions Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-base md:text-lg font-semibold">Actions</h2>
                        <p className="text-xs md:text-sm text-gray-500">What Agent Trivia can do</p>
                    </div>
                    <Edit2 className="w-4 h-4 text-gray-400" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                    <Button variant="outline" className="w-full text-sm md:text-base bg-gray-100 border border-gray-200 hover:bg-gray-200">
                        Get Trivia Question
                    </Button>
                    <Button variant="outline" className="w-full text-sm md:text-base bg-gray-100 border border-gray-200 hover:bg-gray-200">
                        Get Trivia Categories
                    </Button>
                    {/* Empty buttons */}
                    {Array(6).fill(null).map((_, i) => (
                        <Button 
                            key={i}
                            variant="outline" 
                            className="w-full bg-white border border-gray-200 hover:bg-gray-200"
                        />
                    ))}
                </div>
            </div>  

            {/* Instructions Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-base md:text-lg font-semibold">Instructions</h2>
                    </div>
                </div>
                <div className="flex items-start gap-2 w-full md:w-1/2">
                    {agentDetails.isEditing.instructions ? (
                        <textarea
                            value={agentDetails.instructions}
                            onChange={(e) => setAgentDetails(prev => ({...prev, instructions: e.target.value}))}
                            onBlur={() => handleSave('instructions', agentDetails.instructions)}
                            className="w-full px-2 py-1 border rounded text-sm md:text-base"
                            rows={3}
                            autoFocus
                        />
                    ) : (
                        <>
                            <p className="text-sm md:text-base flex-1">{agentDetails.instructions}</p>
                            <Edit2 
                                className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 mt-1 flex-shrink-0" 
                                onClick={() => handleEdit('instructions')}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}