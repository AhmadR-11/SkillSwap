import React, { useState, useEffect, useContext, useCallback } from 'react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import ClientNavbar from '../../components/client/ClientNavbar';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsDashboardPage() {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState({
    statuses: [],
    bids: { totalBids: 0, avgAmount: 0 },
    performance: []
  });
  const [dateRange, setDateRange] = useState({
    from: '', to: ''
  });
  const [loading, setLoading] = useState(true);
  const [/*isVisible*/, setIsVisible] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (dateRange.from) params.append('date_from', dateRange.from);
    if (dateRange.to)   params.append('date_to', dateRange.to);
    try {
      const res = await api.get(`/client/analytics?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
      setIsVisible(true);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [token, dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Prepare chart data
  const statusLabels = data.statuses.map(s => s._id);
  const statusCounts = data.statuses.map(s => s.count);
  
  const barData = {
    labels: statusLabels,
    datasets: [
      {
        label: 'Projects',
        data: statusCounts,
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(107, 114, 128, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(59, 130, 246)',
          'rgb(107, 114, 128)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 1,
        hoverBackgroundColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(107, 114, 128, 1)',
          'rgba(239, 68, 68, 1)'
        ]
      }
    ]
  };

  // CSV export for performance
  const exportCSV = () => {
    const header = ['Freelancer','Accepted Bids','Avg. Bid Amount'];
    const rows = data.performance.map(p => [
      p.name,
      p.acceptedCount,
      p.avgAmount.toFixed(2)
    ]);
    const csvContent =
      [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'freelancer_performance.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Animation classes
  const fadeIn = "transition-opacity duration-500 ease-in-out";
  const scaleOnHover = "transition-transform duration-300 ease-in-out hover:scale-[1.01]";
  const buttonHover = "transition-all duration-300 hover:shadow-lg";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <ClientNavbar />

      <div className={`max-w-4xl mx-auto p-6 space-y-6 ${fadeIn}`}>
        <h1 className="text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Analytics Dashboard
        </h1>

        {/* Date Filters */}
        <div className={`flex items-end space-x-4 mb-6 ${fadeIn}`}>
          <div>
            <label className="block text-sm text-gray-300">From</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={e =>
                setDateRange(dr => ({ ...dr, from: e.target.value }))
              }
              className="border bg-gray-800 border-gray-700 p-2 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300">To</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={e =>
                setDateRange(dr => ({ ...dr, to: e.target.value }))
              }
              className="border bg-gray-800 border-gray-700 p-2 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            />
          </div>
          <button
            onClick={fetchAnalytics}
            className={`px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded shadow-lg hover:shadow-blue-500/50 active:scale-95 ${buttonHover}`}
          >
            Apply
          </button>
        </div>

        {loading ? (
          <div className={`flex justify-center items-center h-64 ${fadeIn}`}>
            <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Project Status Chart */}
            <div 
              className={`bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg shadow-xl ${scaleOnHover} backdrop-blur-sm border border-gray-700`}
              style={{
                perspective: "1000px",
                boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)"
              }}
            >
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                  },
                  plugins: {
                    legend: { 
                      position: 'top',
                      labels: {
                        color: 'rgba(229, 231, 235, 1)' // text-gray-200
                      }
                    },
                    title: { 
                      display: true, 
                      text: 'Project Status Breakdown',
                      color: 'rgba(229, 231, 235, 1)' // text-gray-200
                    },
                    tooltip: {
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      titleColor: 'rgba(229, 231, 235, 1)',
                      bodyColor: 'rgba(209, 213, 219, 1)',
                      borderColor: 'rgba(75, 85, 99, 1)',
                      borderWidth: 1,
                      padding: 10,
                      displayColors: true,
                      callbacks: {
                        labelTextColor: () => 'rgba(229, 231, 235, 1)'
                      }
                    }
                  },
                  scales: {
                    x: {
                      ticks: { color: 'rgba(209, 213, 219, 1)' },
                      grid: { color: 'rgba(75, 85, 99, 0.3)' }
                    },
                    y: {
                      ticks: { color: 'rgba(209, 213, 219, 1)' },
                      grid: { color: 'rgba(75, 85, 99, 0.3)' }
                    }
                  }
                }}
              />
            </div>

            {/* Bid Summary */}
            <div 
              className={`bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg shadow-xl flex justify-around ${scaleOnHover} backdrop-blur-sm border border-gray-700`}
              style={{
                perspective: "1000px",
                boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)"
              }}
            >
              <div 
                className="text-center p-4 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-lg transition-transform duration-300 hover:scale-105"
              >
                <p className="text-gray-400">Total Bids</p>
                <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                  {data.bids.totalBids}
                </p>
              </div>
              <div 
                className="text-center p-4 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-lg transition-transform duration-300 hover:scale-105"
              >
                <p className="text-gray-400">Avg. Bid Amount</p>
                <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-300">
                  ${data.bids.avgAmount.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Freelancer Performance Table */}
            <div 
              className={`bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg shadow-xl ${scaleOnHover} backdrop-blur-sm border border-gray-700`}
              style={{
                perspective: "1000px",
                boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)"
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                  Freelancer Performance
                </h2>
                <div className="space-x-2">
                  <button
                    onClick={exportCSV}
                    className={`px-3 py-1 bg-gradient-to-r from-green-600 to-green-700 text-white rounded shadow-lg hover:shadow-green-500/50 active:scale-95 ${buttonHover}`}
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => window.print()}
                    className={`px-3 py-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded shadow-lg hover:shadow-gray-500/50 active:scale-95 ${buttonHover}`}
                  >
                    Export PDF
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-700/50 to-gray-800/50">
                      <th className="border-b border-gray-700 p-3 text-gray-300">Freelancer</th>
                      <th className="border-b border-gray-700 p-3 text-gray-300">Accepted Bids</th>
                      <th className="border-b border-gray-700 p-3 text-gray-300">Avg. Bid ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.performance.map((row, index) => (
                      <tr 
                        key={row.freelancerId}
                        style={{ 
                          animationDelay: `${index * 100}ms`,
                          animation: 'fadeIn 0.5s ease-in-out forwards'
                        }}
                        className="hover:bg-gray-700/30 transition-colors duration-150"
                      >
                        <td className="border-b border-gray-700 p-3">{row.name}</td>
                        <td className="border-b border-gray-700 p-3">{row.acceptedCount}</td>
                        <td className="border-b border-gray-700 p-3 font-medium text-emerald-400">{row.avgAmount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add animation keyframes */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes floating {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        .animate-floating {
          animation: floating 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}