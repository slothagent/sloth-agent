import React from 'react';
import EngagementChart from '../chart/EngagementChart';
import EngagementAVGChart from '../chart/EngagementAVGChart';

const Social = () => {
    // Mock data for engagement charts
    const engagementData: {
        postEngagement: number;
        smartEngagement: number;
        postEngagementGrowth: number;
        smartEngagementGrowth: number;
        comparisonPercentage: number;
        series: {
            postEngagement: [number, number][];
            smartEngagement: [number, number][];
        };
    } = {
        postEngagement: 297.27,
        smartEngagement: 135,
        postEngagementGrowth: 34.7,
        smartEngagementGrowth: 25.5,
        comparisonPercentage: -44.57,
        series: {
            postEngagement: [
                [Date.UTC(2024, 1, 1), 100] as [number, number],
                [Date.UTC(2024, 1, 2), 120] as [number, number],
                [Date.UTC(2024, 1, 3), 115] as [number, number],
                [Date.UTC(2024, 1, 4), 130] as [number, number],
                [Date.UTC(2024, 1, 5), 145] as [number, number],
                [Date.UTC(2024, 1, 6), 135] as [number, number],
                [Date.UTC(2024, 1, 7), 150] as [number, number]
            ],
            smartEngagement: [
                [Date.UTC(2024, 1, 1), 80] as [number, number],
                [Date.UTC(2024, 1, 2), 90] as [number, number],
                [Date.UTC(2024, 1, 3), 85] as [number, number],
                [Date.UTC(2024, 1, 4), 100] as [number, number],
                [Date.UTC(2024, 1, 5), 110] as [number, number],
                [Date.UTC(2024, 1, 6), 105] as [number, number],
                [Date.UTC(2024, 1, 7), 135] as [number, number]
            ]
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Main Engagement Chart */}
            <div className="md:col-span-2">
                <EngagementChart 
                    postEngagement={engagementData.postEngagement}
                    smartEngagement={engagementData.smartEngagement}
                    postEngagementGrowth={engagementData.postEngagementGrowth}
                    smartEngagementGrowth={engagementData.smartEngagementGrowth}
                    comparisonPercentage={engagementData.comparisonPercentage}
                    series={engagementData.series}
                />
            </div>

            {/* Average Engagement Charts */}
            <EngagementAVGChart 
                title="Engagement (Avg.)"
                currentValue="297.27"
                percentageChange={-34.7}
                timeFrame="7D"
                comparisonPercen="-44.57%"
                data={[100, 105, 105, 105, 120, 130, 135, 135]}
            />

            <EngagementAVGChart 
                title="Smart Engagement (Avg.)"
                currentValue="135"
                percentageChange={25.5}
                timeFrame="7D"
                comparisonPercen="-44.57%"
                data={[80, 85, 90, 95, 100, 110, 120, 135]}
            />
        </div>
    );
};

export default Social;
