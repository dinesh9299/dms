import React from 'react';
import { BarChart3, Flame, Users, MessageCircle, RefreshCcw } from 'lucide-react';

const dashboardData = [
  {
    title: 'Total Documents',
    count: 128,
    icon: <BarChart3 className="text-purple-500 w-6 h-6" />,
  },
  {
    title: 'Types',
    count: 12,
    icon: <Flame className="text-red-500 w-6 h-6" />,
  },
  {
    title: 'Users',
    count: 245,
    icon: <Users className="text-blue-500 w-6 h-6" />,
  },
  {
    title: 'Downloads',
    count: 54,
    icon: <MessageCircle className="text-green-500 w-6 h-6" />,
  },
  {
    title: 'Uploads',
    count: 7,
    icon: <RefreshCcw className="text-yellow-500 w-6 h-6" />,
  },
];

function Admindashboard() {
  return (
    <div className="min-h-screen bg-purple-100 p-6">
      <h2 className="text-3xl font-bold mb-6 text-purple-700">Admin Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dashboardData.map((item, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-2xl p-4 hover:scale-105 transition-transform"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-medium">{item.title}</p>
                <h3 className="text-2xl font-bold text-purple-800">{item.count}</h3>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                {item.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Admindashboard;
