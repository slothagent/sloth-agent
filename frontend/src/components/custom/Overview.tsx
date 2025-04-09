import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import MindShareChart from "../chart/MindShareChart";

import MarketCapChart from "../chart/MarketCapChart";
import UniqueHolderChart from "../chart/UniqueHolderChart";
import EngagementAVGChart from "../chart/EngagementAVGChart";
import ImpressionsChart from "../chart/Impressions";
import ReachChart from "../chart/ReachChart";
import EngagementChart from "../chart/EngagementChart";

const mockData = {
  postEngagement: 3.27,
  smartEngagement: 27,
  postEngagementGrowth: 262.13,
  smartEngagementGrowth: 285.71,
  comparisonPercentage: -83.96,
  series: {
    postEngagement: [
      [Date.UTC(2023, 11, 14), 800],    
      [Date.UTC(2023, 11, 15), 1000],   
      [Date.UTC(2023, 11, 16), 1500],  
      [Date.UTC(2023, 11, 17), 2500],   
      [Date.UTC(2023, 11, 18), 3000],   
      [Date.UTC(2023, 11, 19), 3200],   
      [Date.UTC(2023, 11, 20), 3270],   
    ] as [number, number][],
    smartEngagement: [
      [Date.UTC(2023, 11, 14), 10],    
      [Date.UTC(2023, 11, 15), 12],    
      [Date.UTC(2023, 11, 16), 18],    
      [Date.UTC(2023, 11, 17), 22],    
      [Date.UTC(2023, 11, 18), 25],     
      [Date.UTC(2023, 11, 19), 26],     
      [Date.UTC(2023, 11, 20), 27],     
    ] as [number, number][]
  }
};

const Analytics = () => {
  return (
    <div className="w-full">
      <Tabs defaultValue="basic" className="w-full">
        <div className="mb-4">
          <Select defaultValue="7days">
            <SelectTrigger className="w-[120px] md:w-[180px] bg-[#161B28] border-[#1F2937] text-gray-300">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent className="bg-[#161B28] border-[#1F2937]">
              <SelectItem value="7days" className="text-gray-300 hover:bg-white hover:text-black">Last 7 days</SelectItem>
              <SelectItem value="30days" className="text-gray-300 hover:bg-white hover:text-black">Last 30 days</SelectItem>
              <SelectItem value="90days" className="text-gray-300 hover:bg-white hover:text-black">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <div className="space-y-4 md:space-y-6 w-full">
            <div className="bg-[#161B28] rounded-lg p-4">
              <MindShareChart />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#161B28] rounded-lg p-4">
                <MarketCapChart />
              </div>
              <div className="bg-[#161B28] rounded-lg p-4">
                <UniqueHolderChart />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#161B28] rounded-lg p-4">
                <EngagementAVGChart />
              </div>
              <div className="bg-[#161B28] rounded-lg p-4">
                <ImpressionsChart />
              </div>
            </div>
            <div>
              <span className="text-lg md:text-2xl font-semibold text-gray-300">Analytics</span>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#161B28] rounded-lg p-4">
                  <ReachChart />
                </div>
                <div className="bg-[#161B28] rounded-lg p-4">
                  <EngagementChart {...mockData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default Analytics;