import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Card, CardContent, CardHeader } from '../ui/card';

const MindShareChart: React.FC = () => {
  const [chartOptions, setChartOptions] = useState<any>(null);

  useEffect(() => {
    const generateMockData = () => {
      const priceData = [];
      const mindshareData = [];
      const categories = [];
      

      const startDate = new Date('2024-01-16');
      
      let price = 0.72;
      let mindshare = 8.0;
      
      for (let i = 0; i < 200; i++) {
        // Generate date
        const currentDate = new Date(startDate);
        currentDate.setHours(currentDate.getHours() + (i * 1.68)); // Spread over 7 days
        categories.push(currentDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit'
        }));

        const priceChange = (Math.random() - 0.5) * 0.02;
        price = Math.max(0.48, Math.min(0.96, price + priceChange));
        priceData.push(Number(price.toFixed(2)));

        const mindshareChange = (Math.random() - 0.48) * 0.15;
        mindshare = Math.max(7.5, Math.min(9.8, mindshare + mindshareChange));
        mindshareData.push(Number(mindshare.toFixed(2)));
      }

      priceData[priceData.length - 1] = 0.86;
      mindshareData[mindshareData.length - 1] = 9.57;

      return { categories, priceData, mindshareData };
    };

    const { categories, priceData, mindshareData } = generateMockData();

    const options = {
      chart: {
        backgroundColor: '#161B28',
        height: 400,
        style: {
          fontFamily: '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        },
        spacingBottom: 20,
        spacingRight: 20
      },
      title: {
        text: '',
        align: 'left'
      },
      xAxis: {
        categories: categories,
        gridLineWidth: 0,
        labels: {
          step: 24,
          style: {
            color: '#9CA3AF',
            fontSize: '12px'
          }
        },
        lineColor: '#1F2937',
        tickLength: 0
      },
      yAxis: [{
        title: {
          text: ''
        },
        labels: {
          format: '${value}',
          align: 'left',
          x: 0,
          style: {
            color: '#9CA3AF',
            fontSize: '12px'
          }
        },
        gridLineColor: '#1F2937',
        min: 0.48,
        max: 0.96,
        tickAmount: 5
      }, {
        title: {
          text: ''
        },
        labels: {
          format: '{value}%',
          align: 'right',
          style: {
            color: '#9CA3AF',
            fontSize: '12px'
          }
        },
        opposite: true,
        min: 7.5,
        max: 9.8,
        tickAmount: 5,
        gridLineColor: '#1F2937'
      }],
      legend: {
        align: 'left',
        verticalAlign: 'top',
        symbolRadius: 0,
        itemStyle: {
          color: '#9CA3AF',
          fontSize: '12px',
          fontWeight: 'normal'
        },
        itemDistance: 40,
        backgroundColor: 'transparent'
      },
      series: [{
        name: 'Mindshare',
        type: 'column',
        yAxis: 1,
        data: mindshareData,
        color: 'rgba(37, 99, 235, 0.5)',
        borderWidth: 0,
      }, {
        name: 'Price',
        type: 'line',
        data: priceData,
        color: '#3B82F6',
        lineWidth: 2,
        marker: {
          enabled: true,
          radius: 0
        },
        states: {
          hover: {
            lineWidth: 2
          }
        }
      }],
      tooltip: {
        shared: true,
        backgroundColor: '#1F2937',
        borderColor: '#374151',
        borderRadius: 8,
        shadow: false,
        useHTML: true,
        headerFormat: '<div style="font-size: 12px; color: #9CA3AF">{point.key}</div>',
        pointFormat: '<div style="color: {series.color}">{series.name}: <b>{point.y:.2f}</b></div>',
        style: {
          color: '#E5E7EB'
        }
      },
      plotOptions: {
        series: {
          animation: {
            duration: 1000
          },
          states: {
            inactive: {
              opacity: 1
            },
            hover: {
              brightness: 0.2
            }
          }
        },
        column: {
          borderRadius: 0,
          pointPadding: 0.2,
          groupPadding: 0.1,
          maxPointWidth: 3
        }
      },
      credits: {
        enabled: false
      }
    };

    setChartOptions(options);
  }, []);

  if (!chartOptions) {
    return <div className="text-gray-300">Loading...</div>;
  }

  return (
    <Card className="bg-[#161B28] rounded-lg shadow-none border-none">
      <CardHeader className='p-2 px-4 border-b border-[#1F2937]'>
        <div className="space-y-2">
          <div className="flex items-center gap-10">
            <div>
              <div className="text-sm text-gray-300">Mindshare</div>
              <div className="flex items-center gap-2">
                <span className="text-lg md:text-xl text-gray-300 font-semibold">9.57%</span>
                <span className="text-xs md:text-sm text-red-500">-1.76 7D</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-300">Price</div>
              <div className="flex items-center gap-2">
                <span className="text-lg md:text-xl text-gray-300 font-semibold">$0.86</span>
                <span className="text-xs md:text-sm text-green-500">+28.44% 7D</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className='p-0 md:p-3'>
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
        />
      </CardContent>
    </Card>
  );
};

export default MindShareChart;