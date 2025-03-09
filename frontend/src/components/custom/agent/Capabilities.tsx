import React, { useEffect } from 'react';
import { Input } from "@/components/ui/input";

interface CapabilitiesProps {
    knowledgeAreas: string;
    onKnowledgeChange: (value: string) => void;
    onValidationChange?: (isValid: boolean) => void;
    showValidation?: boolean;
}

const Capabilities: React.FC<CapabilitiesProps> = ({
    knowledgeAreas,
    onKnowledgeChange,
    onValidationChange,
    showValidation = false,
}) => {
    const [error, setError] = React.useState<string>('');

    const validateFields = () => {
        let errorMessage = '';
        let isValid = true;

        // Always check validation
        if (!knowledgeAreas || knowledgeAreas.length < 20) {
            isValid = false;
            // Only show error message if showValidation is true
            if (showValidation) {
                errorMessage = !knowledgeAreas ? 
                    'Knowledge areas are required' : 
                    'Knowledge areas description must be at least 20 characters';
            }
        }

        setError(errorMessage);
        if (onValidationChange) {
            onValidationChange(isValid);
        }

        return isValid;
    };

    useEffect(() => {
        validateFields();
    }, [knowledgeAreas, showValidation]);

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Knowledge Areas</label>
                <textarea
                    value={knowledgeAreas}
                    onChange={(e) => onKnowledgeChange(e.target.value)}
                    placeholder="Describe the areas of knowledge your agent specializes in"
                    rows={4}
                    className={`w-full bg-[#0B0E17] border border-[#1F2937] rounded-md p-3 text-white placeholder:text-gray-500 focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3] focus:outline-none resize-none ${
                        error ? 'border-red-500' : ''
                    }`}
                />
                {error && (
                    <p className="text-sm text-red-500">{error}</p>
                )}
            </div>
        </div>
    );
};

export default Capabilities; 