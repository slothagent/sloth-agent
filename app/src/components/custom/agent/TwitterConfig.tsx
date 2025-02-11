import React from 'react';

interface TwitterConfigProps {
    username: string;
    password: string;
    email: string;
    onUsernameChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onEmailChange: (value: string) => void;
}

const TwitterConfig: React.FC<TwitterConfigProps> = ({
    username,
    password,
    email,
    onUsernameChange,
    onPasswordChange,
    onEmailChange
}) => {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-black mb-2">
                    Twitter Username
                </label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => onUsernameChange(e.target.value)}
                    className="w-full px-4 py-2 bg-white border-2 border-black rounded focus:ring-2 focus:ring-[#93E905] focus:border-[#93E905] text-black placeholder-gray-500"
                    placeholder="Enter Twitter username"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-black mb-2">
                    Twitter Password
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    className="w-full px-4 py-2 bg-white border-2 border-black rounded focus:ring-2 focus:ring-[#93E905] focus:border-[#93E905] text-black placeholder-gray-500"
                    placeholder="Enter Twitter password"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-black mb-2">
                    Twitter Email
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    className="w-full px-4 py-2 bg-white border-2 border-black rounded focus:ring-2 focus:ring-[#93E905] focus:border-[#93E905] text-black placeholder-gray-500"
                    placeholder="Enter Twitter email"
                />
            </div>
        </div>
    );
};

export default TwitterConfig; 