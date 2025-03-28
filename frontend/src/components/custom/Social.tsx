import TwitterView from './TwitterView';

const Social = ({ tokenData }: { tokenData: any }) => {
    return (
        <div className="w-full h-[calc(50vh-4rem)] overflow-y-auto bg-[#161B28]">
            <div className="p-2">
                <TwitterView tokenData={tokenData} />
            </div>
        </div>
    );
};

export default Social;
