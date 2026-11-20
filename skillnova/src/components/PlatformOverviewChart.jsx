import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const data = [
  { month: 'Jan', users: 200 },
  { month: 'Feb', users: 300 },
  { month: 'Mar', users: 500 },
  { month: 'Apr', users: 650 },
  { month: 'May', users: 800 },
];

export default function PlatformOverviewChart() {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6c5ce7" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="month" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Area type="monotone" dataKey="users" stroke="#6c5ce7" fillOpacity={1} fill="url(#colorUsers)" name="Users" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
