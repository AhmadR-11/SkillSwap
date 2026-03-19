import React, { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminAnalyticsPage() {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState(null);

  useEffect(() => {
    api
      .get('/admin/analytics', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setData(res.data))
      .catch(console.error);
  }, [token]);

  if (!data) return <p>Loading analytics…</p>;

  // Helper to extract labels & values
  const makeChart = (arr, labelKey = '_id', valKey = 'count') => ({
    labels: arr.map(x => x[labelKey]),
    datasets: [
      {
        label: valKey,
        data: arr.map(x => x[valKey]),
        backgroundColor: 'rgba(59,130,246,0.5)',
        borderColor: 'rgba(59,130,246,1)',
        borderWidth: 1
      }
    ]
  });

  return (
    <div className="flex h-screen">
      <AdminSidebar />

      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-semibold mb-6">Platform Analytics</h1>

        {/* User Growth */}
        <section className="mb-8">
          <h2 className="text-xl font-medium mb-2">User Growth (Clients vs Freelancers)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded shadow">
              <Line
                data={{
                  labels: data.userGrowth.map(u => u._id),
                  datasets: [
                    {
                      label: 'Clients',
                      data: data.userGrowth.map(u => u.count),
                      borderColor: 'rgba(16,185,129,1)',
                      backgroundColor: 'rgba(16,185,129,0.3)'
                    }
                  ]
                }}
                options={{ responsive: true }}
              />
            </div>
            <div className="bg-white p-4 rounded shadow">
              <Line
                data={{
                  labels: data.freelancerGrowth.map(u => u._id),
                  datasets: [
                    {
                      label: 'Freelancers',
                      data: data.freelancerGrowth.map(u => u.count),
                      borderColor: 'rgba(234,179,8,1)',
                      backgroundColor: 'rgba(234,179,8,0.3)'
                    }
                  ]
                }}
                options={{ responsive: true }}
              />
            </div>
          </div>
        </section>

        {/* Popular Skills */}
        <section className="mb-8 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-medium mb-2">Top 10 Skills</h2>
          <Bar
            data={makeChart(data.popularSkills, '_id', 'count')}
            options={{ responsive: true, indexAxis: 'y' }}
          />
        </section>

        {/* Revenue */}
        <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-medium mb-2">Monthly Revenue</h2>
            <Bar
              data={{
                labels: data.revenue.map(r => r._id),
                datasets: [
                  {
                    label: 'Revenue',
                    data: data.revenue.map(r => r.revenue),
                    backgroundColor: 'rgba(248,113,113,0.5)',
                    borderColor: 'rgba(248,113,113,1)'
                  }
                ]
              }}
              options={{ responsive: true }}
            />
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-medium mb-2">Transactions (Bids vs Accepted)</h2>
            <Bar
              data={{
                labels: data.transactions.map(t => t._id),
                datasets: [
                  {
                    label: 'Total Bids',
                    data: data.transactions.map(t => t.totalBids),
                    backgroundColor: 'rgba(59,130,246,0.5)',
                  },
                  {
                    label: 'Accepted',
                    data: data.transactions.map(t => t.accepted),
                    backgroundColor: 'rgba(16,185,129,0.5)',
                  }
                ]
              }}
              options={{ responsive: true }}
            />
          </div>
        </section>

        {/* Projections / Placeholder */}
        <section className="mb-8 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-medium mb-2">Revenue Projections</h2>
          <p className="text-gray-600">[Future: add forecasting model here]</p>
        </section>
      </main>
    </div>
  );
}
