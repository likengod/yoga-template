
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Users, Eye, MessageSquare, Calendar, TrendingUp, Clock, Globe, Smartphone } from 'lucide-react';

const AdminDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalVisitors: 12450,
    dailyVisitors: 345,
    bookings: 89,
    inquiries: 156,
    pageViews: 23890,
    averageSessionTime: '3m 45s',
    bounceRate: '34%',
    conversionRate: '2.8%'
  });

  // Mock data for charts
  const visitorsData = [
    { name: 'Mon', visitors: 120, sessions: 98 },
    { name: 'Tue', visitors: 189, sessions: 145 },
    { name: 'Wed', visitors: 234, sessions: 198 },
    { name: 'Thu', visitors: 156, sessions: 132 },
    { name: 'Fri', visitors: 298, sessions: 245 },
    { name: 'Sat', visitors: 445, sessions: 389 },
    { name: 'Sun', visitors: 356, sessions: 298 }
  ];

  const pageViewsData = [
    { name: 'Home', views: 8450 },
    { name: 'Programs', views: 4230 },
    { name: 'About', views: 3120 },
    { name: 'Contact', views: 2890 },
    { name: 'Gallery', views: 2340 },
    { name: 'Articles', views: 1950 }
  ];

  const deviceData = [
    { name: 'Desktop', value: 45, color: '#8B5CF6' },
    { name: 'Mobile', value: 38, color: '#06B6D4' },
    { name: 'Tablet', value: 17, color: '#10B981' }
  ];

  const monthlyData = [
    { month: 'Jan', visitors: 2400, bookings: 24 },
    { month: 'Feb', visitors: 2890, bookings: 32 },
    { month: 'Mar', visitors: 3200, bookings: 28 },
    { month: 'Apr', visitors: 3890, bookings: 45 },
    { month: 'May', visitors: 4100, bookings: 52 },
    { month: 'Jun', visitors: 4450, bookings: 48 }
  ];

  const chartConfig = {
    visitors: {
      label: "Visitors",
      color: "#8B5CF6",
    },
    sessions: {
      label: "Sessions", 
      color: "#06B6D4",
    },
    bookings: {
      label: "Bookings",
      color: "#10B981",
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-yoga-forest">Analytics Dashboard</h2>
          <p className="text-yoga-forest/70">Track your website performance and user engagement</p>
        </div>
        <div className="text-sm text-yoga-forest/70">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yoga-sage/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-yoga-sage" />
            </div>
            <div>
              <p className="text-sm text-yoga-forest/70">Total Visitors</p>
              <p className="text-2xl font-bold text-yoga-forest">{analyticsData.totalVisitors.toLocaleString()}</p>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% from last month
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yoga-terracotta/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yoga-terracotta" />
            </div>
            <div>
              <p className="text-sm text-yoga-forest/70">Bookings</p>
              <p className="text-2xl font-bold text-yoga-forest">{analyticsData.bookings}</p>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8% from last week
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yoga-forest/20 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-yoga-forest" />
            </div>
            <div>
              <p className="text-sm text-yoga-forest/70">Page Views</p>
              <p className="text-2xl font-bold text-yoga-forest">{analyticsData.pageViews.toLocaleString()}</p>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +15% from last month
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-yoga-forest/70">Inquiries</p>
              <p className="text-2xl font-bold text-yoga-forest">{analyticsData.inquiries}</p>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +5% from last week
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Visitors Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-yoga-forest mb-4">Weekly Visitors & Sessions</h3>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={visitorsData}>
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="visitors" fill="var(--color-visitors)" />
              <Bar dataKey="sessions" fill="var(--color-sessions)" />
            </BarChart>
          </ChartContainer>
        </Card>

        {/* Device Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-yoga-forest mb-4">Device Distribution</h3>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <PieChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {deviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        </Card>

        {/* Monthly Trends */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-yoga-forest mb-4">Monthly Trends</h3>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <AreaChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area 
                type="monotone" 
                dataKey="visitors" 
                stackId="1" 
                stroke="var(--color-visitors)" 
                fill="var(--color-visitors)" 
                fillOpacity={0.3}
              />
              <Area 
                type="monotone" 
                dataKey="bookings" 
                stackId="2" 
                stroke="var(--color-bookings)" 
                fill="var(--color-bookings)" 
                fillOpacity={0.8}
              />
            </AreaChart>
          </ChartContainer>
        </Card>

        {/* Top Pages */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-yoga-forest mb-4">Top Pages</h3>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={pageViewsData} layout="horizontal">
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="views" fill="var(--color-visitors)" />
            </BarChart>
          </ChartContainer>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4 text-center">
          <Clock className="w-8 h-8 text-yoga-sage mx-auto mb-2" />
          <p className="text-sm text-yoga-forest/70">Avg. Session Time</p>
          <p className="text-xl font-bold text-yoga-forest">{analyticsData.averageSessionTime}</p>
        </Card>

        <Card className="p-4 text-center">
          <Globe className="w-8 h-8 text-yoga-terracotta mx-auto mb-2" />
          <p className="text-sm text-yoga-forest/70">Bounce Rate</p>
          <p className="text-xl font-bold text-yoga-forest">{analyticsData.bounceRate}</p>
        </Card>

        <Card className="p-4 text-center">
          <TrendingUp className="w-8 h-8 text-yoga-forest mx-auto mb-2" />
          <p className="text-sm text-yoga-forest/70">Conversion Rate</p>
          <p className="text-xl font-bold text-yoga-forest">{analyticsData.conversionRate}</p>
        </Card>

        <Card className="p-4 text-center">
          <Smartphone className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-yoga-forest/70">Mobile Traffic</p>
          <p className="text-xl font-bold text-yoga-forest">38%</p>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
