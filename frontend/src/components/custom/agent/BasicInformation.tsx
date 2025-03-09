import React, { useEffect } from 'react';
import { Input } from "../../ui/input";
import { Switch } from "../../ui/switch";
import { Label } from "../../ui/label";

interface BasicInformationProps {
    agentName: string;
    description: string;
    ticker: string;
    onNameChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onTickerChange: (value: string) => void;
    onValidationChange?: (isValid: boolean) => void;
    showValidation?: boolean;
    selectedNetwork: string|null;
    onSwitchNetwork: (network: string,id: number) => void;
}

interface ValidationErrors {
    agentName: string;
    description: string;
    ticker: string;
}

const BasicInformation: React.FC<BasicInformationProps> = ({
    agentName,
    description,
    ticker,
    onNameChange,
    onDescriptionChange,
    onTickerChange,
    onValidationChange,
    showValidation = false,
    selectedNetwork,
    onSwitchNetwork,
}) => {
    const [createToken, setCreateToken] = React.useState(false);
    const [errors, setErrors] = React.useState<ValidationErrors>({
        agentName: '',
        description: '',
        ticker: '',
    });

    const networks = [
        {
            icon: <img src="/assets/chains/a8.png" alt="Ancient8" className="w-4 h-4" />,
            label: "Ancient8",
            id: 28122024
        },
        {
            icon: <img src="https://testnet.sonicscan.org/assets/sonic/images/svg/logos/chain-dark.svg?v=25.2.3.0" alt="Sonic" className="w-4 h-4" />,
            label: "Sonic",
            id: 57054
        }
    ]

    const validateFields = () => {
        const newErrors: ValidationErrors = {
            agentName: '',
            description: '',
            ticker: '',
        };

        // Only show errors if showValidation is true
        if (showValidation) {
            // Validate agent name
            if (!agentName) {
                newErrors.agentName = 'Agent name is required';
            } else if (agentName.length < 3) {
                newErrors.agentName = 'Agent name must be at least 3 characters';
            }

            // Validate description
            if (!description) {
                newErrors.description = 'Description is required';
            } else if (description.length < 10) {
                newErrors.description = 'Description must be at least 10 characters';
            }

            // Validate ticker if createToken is true
            if (createToken) {
                if (!ticker) {
                    newErrors.ticker = 'Ticker is required when creating a token';
                } else if (!/^[A-Z0-9]{2,5}$/.test(ticker)) {
                    newErrors.ticker = 'Ticker must be 2-5 uppercase letters/numbers';
                }
            }
        }

        setErrors(newErrors);

        // Always check validation state even if not showing errors
        const isValid = !Object.values({
            agentName: !agentName || agentName.length < 3,
            description: !description || description.length < 10,
            ticker: createToken && (!ticker || !/^[A-Z0-9]{2,5}$/.test(ticker)),
        }).some(invalid => invalid);

        if (onValidationChange) {
            onValidationChange(isValid);
        }

        return isValid;
    };

    useEffect(() => {
        validateFields();
    }, [agentName, description, ticker, createToken, showValidation]);

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Agent Name</label>
                <Input
                    value={agentName}
                    onChange={(e) => onNameChange(e.target.value)}
                    placeholder="Enter agent name"
                    className={`w-full bg-[#0B0E17] border-[#1F2937] text-white placeholder:text-gray-500 focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3] ${
                        errors.agentName ? 'border-red-500' : ''
                    }`}
                />
                {errors.agentName && (
                    <p className="text-sm text-red-500">{errors.agentName}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder="Enter agent description"
                    rows={4}
                    className={`w-full bg-[#0B0E17] border border-[#1F2937] rounded-md p-3 text-white placeholder:text-gray-500 focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3] focus:outline-none resize-none ${
                        errors.description ? 'border-red-500' : ''
                    }`}
                />
                {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                )}
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Network</label>
                <div className="flex flex-wrap gap-2">
                    {networks.map(({ icon, label,id }) => (
                        <button
                            key={label}
                            onClick={() => onSwitchNetwork(label,id)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
                                selectedNetwork === label
                                    ? 'bg-[#2196F3] text-white'
                                    : 'bg-[#1F2937] text-gray-300 hover:bg-[#374151]'
                            }`}
                        >
                            <span>{icon}</span>
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <Switch
                    id="create-token"
                    checked={createToken}
                    onCheckedChange={setCreateToken}
                    className="data-[state=checked]:bg-[#2196F3]"
                />
                <Label htmlFor="create-token" className="text-sm font-medium text-gray-400">
                    Launch a token for Agent
                </Label>
            </div>

            {createToken && (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Ticker</label>
                    <Input
                        value={ticker}
                        onChange={(e) => onTickerChange(e.target.value.toUpperCase())}
                        placeholder="Enter ticker symbol (e.g. BTC)"
                        className={`w-full bg-[#0B0E17] border-[#1F2937] text-white placeholder:text-gray-500 focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3] uppercase ${
                            errors.ticker ? 'border-red-500' : ''
                        }`}
                        maxLength={5}
                    />
                    {errors.ticker ? (
                        <p className="text-sm text-red-500">{errors.ticker}</p>
                    ) : (
                        <p className="text-xs text-gray-500">Maximum 5 characters, automatically converted to uppercase</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BasicInformation; 