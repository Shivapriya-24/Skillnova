import React from 'react';
import CourseProgressChart from './CourseProgressChart'; 

export default function LearnerAnalytics() {
  return (
    <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
      <h2>Your Learning Progress</h2>
      <CourseProgressChart />
    </div>
  );
}
