import { useReadContract } from "wagmi";
import { tokenAbi } from "../../abi/tokenAbi";
import { INITIAL_SUPPLY } from "../../lib/contants";
import { configSonicBlaze } from "../../config/wagmi";
import { configAncient8 } from "../../config/wagmi";

interface TableLaunchingProps {
    address: string;
    index: number;
    totalValue: number;
    tokenAddress: string;
    network: string;
}

const TableLaunching: React.FC<TableLaunchingProps> = ({address,index,tokenAddress,network}) => {

    const formatAddress = (address: string) => {
        if (!address) return '-';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const {data: balanceOfToken} = useReadContract({
        address: tokenAddress as `0x${string}`,
        abi: tokenAbi,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
        config: network == "Sonic" ? configSonicBlaze : configAncient8
    });

    // console.log(balanceOfToken)

    return (
        <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="text-gray-400">{index + 2}.</span>
                <a href={network == "Sonic" ? `https://testnet.sonicscan.org/address/${address}` : `https://scanv2-testnet.ancient8.gg/address/${address}`} target="_blank" className="hover:underline hover:text-white">{formatAddress(address)}</a>
            </div>
            <span>{parseFloat((((Number(balanceOfToken)/INITIAL_SUPPLY)*100)/10**18).toFixed(5))}%</span>
        </div>
    );
};

export default TableLaunching;