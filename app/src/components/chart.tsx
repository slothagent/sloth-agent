import { FC } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

interface ChartProps {
    height?: string;
    transactionHistory?: {
        price: number;
        timestamp: string;
    }[];
}

const Chart: FC<ChartProps> = ({ height = '430px', transactionHistory = [] }) => {
    const options: Highcharts.Options = {
        title: {
            text: undefined
        },
        chart: {
            type: 'line',
            height: height,
            backgroundColor: 'transparent',
            style: {
                fontFamily: 'Inter, sans-serif'
            },
            animation: {
                duration: 1000
            }
        },
        credits: {
            enabled: false
        },
        xAxis: {
            type: 'datetime',
            labels: {
                style: {
                    color: '#9CA3AF',
                    fontSize: '10px'
                },
                formatter: function() {
                    const date = new Date(this.value);
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear();
                    return `${day}/${month}/${year}`;
                }
            },
            lineColor: '#1F2937',
            tickColor: '#1F2937',
            gridLineWidth: 0,
            minorGridLineWidth: 0,
            crosshair: {
                color: '#374151',
                width: 1,
                dashStyle: 'Dash'
            }
        },
        yAxis: {
            title: {
                text: undefined
            },
            labels: {
                align: 'right',
                x: -10,
                style: {
                    color: '#9CA3AF',
                    fontSize: '10px'
                },
                formatter: function() {
                    if (typeof this.value !== 'number') return '$' + this.value;
                    
                    // Format number without scientific notation
                    return '$' + this.value.toLocaleString('en-US', {
                        minimumFractionDigits: 8,
                        maximumFractionDigits: 8,
                        useGrouping: false
                    });
                }
            },
            gridLineColor: '#1F2937',
            gridLineDashStyle: 'Dash',
            gridLineWidth: 1,
            opposite: true
        },
        plotOptions: {
            line: {
                animation: {
                    duration: 1000
                },
                color: '#3B82F6',
                lineWidth: 2,
                states: {
                    hover: {
                        lineWidth: 2
                    }
                },
                marker: {
                    enabled: false,
                    radius: 2,
                    fillColor: '#3B82F6',
                    lineWidth: 2,
                    lineColor: '#3B82F6',
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            },
            area: {
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, 'rgba(59, 130, 246, 0.2)'],
                        [1, 'rgba(59, 130, 246, 0)']
                    ]
                }
            }
        },
        series: [{
            type: 'area',
            name: 'Price',
            data: transactionHistory.map(point => [
                new Date(point.timestamp).getTime(),
                point.price
            ]),
            tooltip: {
                valuePrefix: '$',
                valueDecimals: 8,
                pointFormatter: function() {
                    // Format price without scientific notation
                    return `<span style="color: #3B82F6">●</span> ${this.series.name}: <b>$${this.y?.toLocaleString('en-US', {
                        minimumFractionDigits: 8,
                        maximumFractionDigits: 8,
                        useGrouping: false
                    })}</b>`;
                }
            }
        }],
        tooltip: {
            backgroundColor: '#1F2937',
            style: {
                color: '#fff',
                fontSize: '12px'
            },
            borderWidth: 0,
            borderRadius: 4,
            shadow: false,
            padding: 8,
            headerFormat: '<span style="font-size: 10px">{point.key}</span><br/>',
            xDateFormat: '%d/%m/%Y',
            useHTML: true
        },
        legend: {
            enabled: false
        }
    };

    return (
        <div className="w-full h-full">
            <HighchartsReact
                highcharts={Highcharts}
                options={options}
                containerProps={{ style: { height: '100%' } }}
            />
        </div>
    );
};

export default Chart; 