import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import { Slider } from '@/components/ui/slider';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  CategoryScale,
  LinearScale,
  BarElement
);

interface ComparisonData {
  tool: string;
  easeOfSetup: number;
  learningCurve: number;
  usability: number;
  communitySupport: number;
  executionSpeed: number;
  scriptMaintenance: number;
  cost: number;
  color: string;
}

const initialComparisonData: ComparisonData[] = [
  {
    tool: 'Selenium',
    easeOfSetup: 3,
    learningCurve: 3,
    usability: 3,
    communitySupport: 5,
    executionSpeed: 3,
    scriptMaintenance: 2,
    cost: 5,
    color: '#10B981',
  },
  {
    tool: 'Playwright',
    easeOfSetup: 4,
    learningCurve: 4,
    usability: 4,
    communitySupport: 4,
    executionSpeed: 5,
    scriptMaintenance: 4,
    cost: 5,
    color: '#3B82F6',
  },
  {
    tool: 'Testim',
    easeOfSetup: 5,
    learningCurve: 5,
    usability: 5,
    communitySupport: 5,
    executionSpeed: 4,
    scriptMaintenance: 5,
    cost: 3,
    color: '#A18FFF',
  },
  {
    tool: 'Mabl',
    easeOfSetup: 4,
    learningCurve: 4,
    usability: 5,
    communitySupport: 5,
    executionSpeed: 5,
    scriptMaintenance: 5,
    cost: 2,
    color: '#F97316',
  },
];

export const ComparisonCharts = () => {
  const [weights, setWeights] = useState({
    easeOfSetup: Math.round(100 / 7),
    learningCurve: Math.round(100 / 7),
    usability: Math.round(100 / 7),
    communitySupport: Math.round(100 / 7),
    executionSpeed: Math.round(100 / 7),
    scriptMaintenance: Math.round(100 / 7),
    cost: Math.round(100 / 7),
  });


  // Calculate weighted scores with tie-breaker
  const calculateWeightedScores = () => {
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    // If total weight is 0, use equal weights
    const normalizedWeights = totalWeight > 0 ? {
      easeOfSetup: weights.easeOfSetup / totalWeight,
      learningCurve: weights.learningCurve / totalWeight,
      usability: weights.usability / totalWeight,
      communitySupport: weights.communitySupport / totalWeight,
      executionSpeed: weights.executionSpeed / totalWeight,
      scriptMaintenance: weights.scriptMaintenance / totalWeight,
      cost: weights.cost / totalWeight,
    } : {
      easeOfSetup: 1 / 7,
      learningCurve: 1 / 7,
      usability: 1 / 7,
      communitySupport: 1 / 7,
      executionSpeed: 1 / 7,
      scriptMaintenance: 1 / 7,
      cost: 1 / 7,
    };

    return initialComparisonData.map((tool, index) => {
      const weightedScore =
        (tool.easeOfSetup * normalizedWeights.easeOfSetup) +
        (tool.learningCurve * normalizedWeights.learningCurve) +
        (tool.usability * normalizedWeights.usability) +
        (tool.communitySupport * normalizedWeights.communitySupport) +
        (tool.executionSpeed * normalizedWeights.executionSpeed) +
        (tool.scriptMaintenance * normalizedWeights.scriptMaintenance) +
        (tool.cost * normalizedWeights.cost);

      // Add tiny tie-breaker based on tool index to ensure unique scores
      // This ensures no ties while maintaining score accuracy
      const tieBreaker = index * 0.0001;

      return {
        ...tool,
        weightedScore: Math.round((weightedScore + tieBreaker) * 100) / 100, // 2 decimal places for precision
      };
    });
  };

  const weightedData = calculateWeightedScores();

  // Radar Chart Data - Display actual values (2-5 range) scaled to 0-10 for visualization
  // Scale from 2-5 range to 0-10 range: ((value - 2) / 3) * 10
  const scaleToRadar = (value: number) => {
    return ((value - 2) / 3) * 10;
  };

  const radarChartData = {
    labels: [
      'Ease of Setup and Installation',
      'Learning Curve / Understanding',
      'Usability of User Interface',
      'Community Support & Documentation',
      'Execution Speed & Performance',
      'Script Maintenance Effort',
      'Cost & Licensing',
    ],
    datasets: initialComparisonData.map((tool) => ({
      label: tool.tool,
      data: [
        scaleToRadar(tool.easeOfSetup),
        scaleToRadar(tool.learningCurve),
        scaleToRadar(tool.usability),
        scaleToRadar(tool.communitySupport),
        scaleToRadar(tool.executionSpeed),
        scaleToRadar(tool.scriptMaintenance),
        scaleToRadar(tool.cost),
      ],
      backgroundColor: tool.color + '40',
      borderColor: tool.color,
      borderWidth: 2,
      pointBackgroundColor: tool.color,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: tool.color,
    })),
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: "'Inter', 'Montserrat', sans-serif",
            size: 12,
          },
          color: '#2E1869',
        },
      },
      title: {
        display: true,
        text: 'Tool Comparison',
        font: {
          family: "'Space Grotesk', 'Inter', sans-serif",
          size: 18,
          weight: 'bold' as const,
        },
        color: '#2E1869',
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 10,
        ticks: {
          font: {
            family: "'Inter', 'Montserrat', sans-serif",
          },
          color: '#2E1869',
          stepSize: 2,
        },
        grid: {
          color: 'rgba(46, 24, 105, 0.1)',
        },
        pointLabels: {
          font: {
            family: "'Inter', 'Montserrat', sans-serif",
            size: 12,
          },
          color: '#2E1869',
        },
      },
    },
  };

  const handleWeightChange = (criterion: keyof typeof weights, value: number[]) => {
    const newValue = Math.max(0, Math.min(100, value[0]));
    setWeights((prevWeights) => ({
      ...prevWeights,
      [criterion]: newValue,
    }));
  };

  const resetWeights = () => {
    setWeights({
      easeOfSetup: Math.round(100 / 7),
      learningCurve: Math.round(100 / 7),
      usability: Math.round(100 / 7),
      communitySupport: Math.round(100 / 7),
      executionSpeed: Math.round(100 / 7),
      scriptMaintenance: Math.round(100 / 7),
      cost: Math.round(100 / 7),
    });
  };

  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      <div
        className="p-8 rounded-3xl"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(46, 24, 105, 0.2)',
        }}
      >
        <h2
          className="text-3xl font-bold mb-6"
          style={{
            color: '#2E1869',
            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            fontWeight: 700,
          }}
        >
          Interactive Comparison Dashboard
        </h2>

        {/* Interactive Filters */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-xl font-semibold"
              style={{
                color: '#2E1869',
                fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                fontWeight: 600,
              }}
            >
              Adjust Criteria Weights
            </h3>
            <button
              onClick={resetWeights}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.3)',
                color: '#2E1869',
                fontFamily: "'Inter', 'Montserrat', sans-serif",
                border: '1px solid rgba(46, 24, 105, 0.2)',
              }}
            >
              Reset
            </button>
          </div>

          <div className="space-y-4">
            {Object.entries(weights).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    className="text-sm font-medium"
                    style={{
                      color: '#2E1869',
                      fontFamily: "'Inter', 'Montserrat', sans-serif",
                      textTransform: 'capitalize',
                    }}
                  >
                    {key === 'easeOfSetup' ? 'Ease of Setup and Installation' :
                     key === 'learningCurve' ? 'Learning Curve / Understanding' :
                     key === 'usability' ? 'Usability of User Interface' :
                     key === 'communitySupport' ? 'Community Support & Documentation' :
                     key === 'executionSpeed' ? 'Execution Speed & Performance' :
                     key === 'scriptMaintenance' ? 'Script Maintenance Effort' :
                     key === 'cost' ? 'Cost & Licensing' :
                     key.replace(/([A-Z])/g, ' $1').trim()}: {value}%
                  </label>
                </div>
                <Slider
                  value={[value]}
                  onValueChange={(val) => handleWeightChange(key as keyof typeof weights, val)}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            ))}
          </div>

          {totalWeight !== 100 && (
            <p className="text-sm mt-2" style={{ color: '#EF4444', fontFamily: "'Inter', 'Montserrat', sans-serif" }}>
              Total weight: {totalWeight}% (should be 100%)
            </p>
          )}
        </div>

        {/* Chart Container */}
        <div className="mb-6" style={{ height: '400px' }}>
          <Radar data={radarChartData} options={radarOptions} />
        </div>

        {/* Heatmap */}
        <div className="mb-6">
          <h3
            className="text-xl font-semibold mb-4"
            style={{
              color: '#2E1869',
              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
              fontWeight: 600,
            }}
          >
            Criteria Heatmap
          </h3>
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th
                      className="p-4 text-left font-semibold sticky left-0 z-10"
                      style={{
                        background: 'rgba(255, 255, 255, 0.3)',
                        color: '#2E1869',
                        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                        minWidth: '150px',
                      }}
                    >
                      Tool / Criteria
                    </th>
                    {[
                      'Ease of Setup',
                      'Learning Curve',
                      'Usability',
                      'Community Support',
                      'Execution Speed',
                      'Script Maintenance',
                      'Cost',
                    ].map((label) => (
                      <th
                        key={label}
                        className="p-4 text-center font-semibold"
                        style={{
                          background: 'rgba(255, 255, 255, 0.3)',
                          color: '#2E1869',
                          fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                          minWidth: '120px',
                        }}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {initialComparisonData.map((tool) => {
                    const scores = [
                      tool.easeOfSetup,
                      tool.learningCurve,
                      tool.usability,
                      tool.communitySupport,
                      tool.executionSpeed,
                      tool.scriptMaintenance,
                      tool.cost,
                    ];

                    // Calculate color intensity (2-5 range maps to 0-100% opacity)
                    const getColorIntensity = (score: number) => {
                      // Map 2-5 to 0-1 range
                      const normalized = (score - 2) / 3;
                      return normalized;
                    };

                    return (
                      <tr key={tool.tool}>
                        <td
                          className="p-4 font-semibold sticky left-0 z-10"
                          style={{
                            background: 'rgba(255, 255, 255, 0.25)',
                            color: tool.color,
                            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                            borderRight: '2px solid rgba(46, 24, 105, 0.2)',
                          }}
                        >
                          {tool.tool}
                        </td>
                        {scores.map((score, index) => {
                          const intensity = getColorIntensity(score);
                          // Create gradient from light to tool color
                          const r = parseInt(tool.color.slice(1, 3), 16);
                          const g = parseInt(tool.color.slice(3, 5), 16);
                          const b = parseInt(tool.color.slice(5, 7), 16);
                          
                          // Blend with white based on intensity
                          const bgR = Math.round(255 + (r - 255) * intensity);
                          const bgG = Math.round(255 + (g - 255) * intensity);
                          const bgB = Math.round(255 + (b - 255) * intensity);
                          const bgColor = `rgb(${bgR}, ${bgG}, ${bgB})`;

                          return (
                            <td
                              key={index}
                              className="p-4 text-center font-bold transition-all hover:scale-105"
                              style={{
                                background: bgColor,
                                color: intensity > 0.5 ? '#FFFFFF' : '#2E1869',
                                fontFamily: "'Inter', 'Montserrat', sans-serif",
                                fontSize: '16px',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                cursor: 'default',
                              }}
                            >
                              {score}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Weighted Score Stacked Bar Chart */}
        <div className="mb-6">
          <h3
            className="text-xl font-semibold mb-4"
            style={{
              color: '#2E1869',
              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
              fontWeight: 600,
            }}
          >
            Weighted Score Comparison
          </h3>
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              height: '300px',
            }}
          >
            <Bar
              data={{
                labels: weightedData
                  .sort((a, b) => b.weightedScore - a.weightedScore)
                  .map((tool) => tool.tool),
                datasets: [
                  {
                    label: 'Weighted Score',
                    data: weightedData
                      .sort((a, b) => b.weightedScore - a.weightedScore)
                      .map((tool) => tool.weightedScore),
                    backgroundColor: weightedData
                      .sort((a, b) => b.weightedScore - a.weightedScore)
                      .map((tool) => {
                        // Light colors for each tool
                        if (tool.tool === 'Selenium') return '#86EFAC'; // Light green
                        if (tool.tool === 'Playwright') return '#93C5FD'; // Light blue
                        if (tool.tool === 'Testim') return '#C4B5FD'; // Light purple
                        if (tool.tool === 'Mabl') return '#FED7AA'; // Light orange
                        return tool.color + '80'; // Fallback with opacity
                      }),
                    borderColor: weightedData
                      .sort((a, b) => b.weightedScore - a.weightedScore)
                      .map((tool) => tool.color),
                    borderWidth: 2,
                    borderRadius: 8,
                  },
                ],
              }}
              options={{
                indexAxis: 'y' as const,
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#2E1869',
                    bodyColor: '#2E1869',
                    borderColor: 'rgba(46, 24, 105, 0.2)',
                    borderWidth: 1,
                    padding: 12,
                    titleFont: {
                      family: "'Space Grotesk', 'Inter', sans-serif",
                      size: 14,
                      weight: 'bold' as const,
                    },
                    bodyFont: {
                      family: "'Inter', 'Montserrat', sans-serif",
                      size: 12,
                    },
                    callbacks: {
                      label: (context) => {
                        return `Score: ${context.parsed.x?.toFixed(2) ?? '0.00'}`;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    ticks: {
                      font: {
                        family: "'Inter', 'Montserrat', sans-serif",
                        size: 11,
                      },
                      color: '#2E1869',
                    },
                    grid: {
                      color: 'rgba(46, 24, 105, 0.1)',
                    },
                    title: {
                      display: true,
                      text: 'Weighted Score',
                      font: {
                        family: "'Inter', 'Montserrat', sans-serif",
                        size: 12,
                        weight: 600 as const,
                      },
                      color: '#2E1869',
                    },
                  },
                  y: {
                    ticks: {
                      font: {
                        family: "'Inter', 'Montserrat', sans-serif",
                        size: 12,
                        weight: 600 as const,
                      },
                      color: '#2E1869',
                    },
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Weighted Scores Summary */}
        <div>
          <h3
            className="text-xl font-semibold mb-4"
            style={{
              color: '#2E1869',
              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
              fontWeight: 600,
            }}
          >
            Weighted Overall Scores
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {weightedData
              .sort((a, b) => {
                // Primary sort by score (descending)
                if (b.weightedScore !== a.weightedScore) {
                  return b.weightedScore - a.weightedScore;
                }
                // Secondary sort by tool name to ensure consistent ordering
                return a.tool.localeCompare(b.tool);
              })
              .map((tool) => (
                <div
                  key={tool.tool}
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: `2px solid ${tool.color}`,
                  }}
                >
                  <div
                    className="text-lg font-bold mb-1"
                    style={{
                      color: tool.color,
                      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                    }}
                  >
                    {tool.tool}
                  </div>
                  <div
                    className="text-2xl font-bold"
                    style={{
                      color: '#2E1869',
                      fontFamily: "'Inter', 'Montserrat', sans-serif",
                    }}
                  >
                    {tool.weightedScore.toFixed(2)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

