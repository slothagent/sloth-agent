import TrendingCards from './TrendingCards';

const Hero: React.FC = () => {

  return (
    <div className="w-full bg-[#0B0E17] border-y border-[#1F2937]">
      <div className="container mx-auto py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Add TrendingCards component */}
          <div className="flex-1">
            <TrendingCards />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero; 