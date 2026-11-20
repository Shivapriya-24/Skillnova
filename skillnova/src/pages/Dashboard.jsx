import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LearnerPanel from "../components/LearnerPanel";
import LearnerAnalytics from "../components/LearnerAnalytics";
import TeacherPanel from "../components/TeacherPanel";
import TeacherAnalytics from "../components/TeacherAnalytics";
import styles from "./Dashboard.module.css";
import { Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function Dashboard() {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("learner");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState(""); 
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const usernameParam = params.get("username");
    const roleParam = params.get("role");
    const emailParam = params.get("email");

    const storedName = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");
    const storedEmail = localStorage.getItem("email");

    if (usernameParam) {
      localStorage.setItem("username", usernameParam);
      setUsername(usernameParam.charAt(0).toUpperCase() + usernameParam.slice(1));
    } else if (storedName) {
      setUsername(storedName.charAt(0).toUpperCase() + storedName.slice(1));
    }

    if (roleParam) {
      localStorage.setItem("role", roleParam);
      setRole(roleParam);
    } else if (storedRole) {
      setRole(storedRole);
    }

    if (emailParam) {
      localStorage.setItem("email", emailParam);
      setEmail(emailParam);
    } else if (storedEmail) {
      setEmail(storedEmail);
    }

    setTimeout(() => setLoading(false), 500);
  }, [location.search]);

  const motivationalQuotes = [
    "Start your journey of mastering skills today 🚀",
    "Every click brings you closer to expertise 💡",
    "Keep learning, keep growing 🌱",
    "Inspire. Learn. Teach. Repeat 🔁",
    "Small progress each day leads to big results ✨",
  ];
  const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  const skillProgressChart = {
    labels: ["Design", "Coding", "AI", "Marketing", "Data Science"],
    datasets: [
      {
        label: "Skill Mastery (%)",
        data: [75, 60, 50, 80, 65],
        borderColor: "#4F46E5",
        backgroundColor: "rgba(79,70,229,0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const performanceChart = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: role === "learner" ? "Learning Hours" : "Teaching Engagement (hrs)",
        data: role === "learner" ? [5, 7, 8, 6, 9, 10] : [12, 10, 11, 13, 14, 15],
        borderColor: "#10B981",
        backgroundColor: "rgba(16,185,129,0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loader}></div>
        <p>Loading your personalized dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <Sidebar role={role} />
      <div className={styles.mainContent}>
        <Topbar username={username} />

        <div className={styles.header}>
          <h1>{quote}</h1>
        </div>

        <div className={styles.statsGrid}>
          {/* Core Features */}
          <div className={styles.featureCard} onClick={() => navigate("/core-features")}>
            <h3>⚙️ Core Features</h3>
          </div>

          {/* Skills Offered */}
          <div className={styles.featureCard} onClick={() => navigate("/skills-offered")}>
            <h3>💼 Skills Offered</h3>
          </div>

          {/* Insights */}
          <div className={styles.featureCard} onClick={() => navigate("/insights")}>
            <h3>📊 Insights</h3>
          </div>

          {/* Role-based dashboard cards */}
          {role === "learner" && (
            <div className={styles.statCard} onClick={() => setActivePanel("learner")}>
              <h3>📘 Learner Dashboard</h3>
            </div>
          )}
          {role === "teacher" && (
            <div className={styles.statCard} onClick={() => setActivePanel("teacher")}>
              <h3>🧑‍🏫 Teacher Dashboard</h3>
            </div>
          )}
          {(role === "both" || !role) && (
            <div className={styles.statCard} onClick={() => setActivePanel("both")}>
              <h3>🌟 Learner & Teacher Dashboard</h3>
            </div>
          )}
        </div>

        {/* Charts */}
        <div className={styles.chartsContainer}>
          <div className={styles.chartBox}>
            <h3>{role === "learner" ? "Your Skill Progress" : "Teaching Impact"}</h3>
            <Line data={skillProgressChart} />
          </div>
          <div className={styles.chartBox}>
            <h3>Performance Overview</h3>
            <Line data={performanceChart} />
          </div>
        </div>

        {/* Panels for learner/teacher/both */}
        {activePanel && (
          <div className={styles.panelsContainer}>
            {(activePanel === "learner" || activePanel === "both") && (
              <>
                <LearnerPanel />
                <LearnerAnalytics />
              </>
            )}
            {(activePanel === "teacher" || activePanel === "both") && (
              <>
                <TeacherPanel />
                <TeacherAnalytics />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
