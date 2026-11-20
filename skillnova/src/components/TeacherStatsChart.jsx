import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const data = [
  { month: 'Jan', students: 20, sessions: 5 },
  { month: 'Feb', students: 25, sessions: 7 },
  { month: 'Mar', students: 30, sessions: 10 },
  { month: 'Apr', students: 28, sessions: 9 },
  { month: 'May', students: 35, sessions: 11 },
];

export default function TeacherStatsChart() {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="students" stroke="#00b894" name="Students" />
          <Line type="monotone" dataKey="sessions" stroke="#0984e3" name="Sessions" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
