import React, { useEffect, useState } from "react";
import styles from "./Insights.module.css";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Insights() {
  const [role, setRole] = useState("learner");

  useEffect(() => {
    const storedRole = localStorage.getItem("role") || "learner";
    setRole(storedRole);
  }, []);

  const skillPieChart = {
    labels: ["Design", "Coding", "AI", "Marketing", "Data Science"],
    datasets: [
      {
        label: "Skill Mastery",
        data: [75, 60, 50, 80, 65],
        backgroundColor: ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"],
        borderWidth: 1,
      },
    ],
  };

  const performanceBarChart = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: role === "learner" ? "Learning Hours" : "Teaching Hours",
        data: role === "learner" ? [5, 7, 8, 6, 9, 10] : [12, 10, 11, 13, 14, 15],
        backgroundColor: "#4F46E5",
      },
    ],
  };

  return (
    <div className={styles.insightsPage}>
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>📊 Insights</h1>
          <p>Track your progress and performance professionally</p>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>✅ Skills Mastered</h3>
            <p>5</p>
          </div>
          <div className={styles.statCard}>
            <h3>⏱ Avg. Hours {role === "learner" ? "Learning" : "Teaching"}</h3>
            <p>{role === "learner" ? 8 : 13} hrs/week</p>
          </div>
          <div className={styles.statCard}>
            <h3>📈 Most Improved Skill</h3>
            <p>AI</p>
          </div>
          {role !== "learner" && (
            <div className={styles.statCard}>
              <h3>🏆 Top Engagement</h3>
              <p>15 hrs/week</p>
            </div>
          )}
        </div>

        {/* Charts */}
        <div className={styles.chartsContainer}>
          <div className={styles.chartBox}>
            <h3>Skill Distribution</h3>
            <Pie data={skillPieChart} />
          </div>
          <div className={styles.chartBox}>
            <h3>Performance Overview</h3>
            <Bar data={performanceBarChart} />
          </div>
        </div>
      </div>
    </div>
  );
}
