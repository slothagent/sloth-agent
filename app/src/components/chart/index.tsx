import React, { useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

interface ChartProps {
  data?: number[][];
  height?: string;
}

const Chart: React.FC<ChartProps> = ({ data = [], height = '300px' }) => {
    const chartOptions = {
        chart: {
            type: 'area',
            backgroundColor: 'transparent',
            style: {
                fontFamily: 'Space Grotesk, sans-serif'
            }
        },
        title: {
            text: undefined
        },
        xAxis: {
            type: 'datetime',
            labels: {
                style: {
                    color: '#666'
                }
            },
            lineColor: '#ddd',
            tickColor: '#ddd'
        },
        yAxis: {
            title: {
                text: undefined
            },
            labels: {
                style: {
                    color: '#666'
                }
            },
            gridLineColor: '#ddd'
        },
        tooltip: {
            shared: true,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: '#ddd',
            borderRadius: 10,
            shadow: false,
            style: {
                color: '#333'
            }
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, 'rgba(0, 255, 0, 0.3)'],
                        [1, 'rgba(0, 255, 0, 0.05)']
                    ]
                },
                marker: {
                    enabled: false
                },
                lineWidth: 2,
                lineColor: '#00ff00',
                states: {
                    hover: {
                        lineWidth: 2
                    }
                },
                threshold: null
            }
        },
        series: [{
            name: 'Price',
            data: data.length > 0 ? data : [
                // Mock data for the last 7 days
                [Date.UTC(2024, 2, 1), 0.50],
                [Date.UTC(2024, 2, 2), 0.52],
                [Date.UTC(2024, 2, 3), 0.48],
                [Date.UTC(2024, 2, 4), 0.55],
                [Date.UTC(2024, 2, 5), 0.57],
                [Date.UTC(2024, 2, 6), 0.54],
                [Date.UTC(2024, 2, 7), 0.60],
            ]
        }]
    };

    return (
        <div style={{ height }}>
            <HighchartsReact
                highcharts={Highcharts}
                options={chartOptions}
                containerProps={{ style: { height: '100%', width: '100%' } }}
            />
        </div>
    );
};

export default Chart;