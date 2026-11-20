import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import PopularSkills from './components/PopularSkills';
import InfoBoxes from './components/InfoBoxes';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';

import Welcome from './pages/welcome';
import Communicate from './pages/communicate';
import BeAnExpert from './pages/BeAnExpert';
import SignUp from './pages/SignUp';
import Login from './pages/Login'; 
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminPanel from './components/AdminPanel';
import TeacherPanel from './components/TeacherPanel';
import LearnerPanel from './components/LearnerPanel';
import SkillsOffered from './pages/SkillsOffered';
import SkillDetail from './pages/SkillDetail';
import CoreFeatures from './pages/CoreFeatures';
import SkillsPage from './pages/SkillsPage';
import UpcomingSessions from './pages/UpcomingSessions';
import Messages from './pages/Message';
import SettingsPage from './pages/SettingsPage';
import FeedbackPage from './pages/FeedbackPage';
import RecommendationsPage from './pages/RecommendationsPage';
import Achievements from './pages/Achievements';
import Collaboration from './pages/Collaboration';
import PublicBadge from './pages/PublicBadge';
import PublicCollaboration from './pages/PublicCollaboration';
import './App.css';
import NotificationsPage from './pages/NotificationsPage';
import BecomeMember from './components/BecomeMember';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import ContactUs from './pages/ContactUs';
import Insights from './pages/Insights';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
function Layout({ children }) {
  const location = useLocation();
  const hideLayout = ['/signup', '/login', '/core-features','/recommendations'].includes(location.pathname);
  return (
    <>
      {!hideLayout && <Header />}
      <main className="main">{children}</main>
      {!hideLayout && <Footer />}
    </>
  );
}

function HomePageLayout() {
  return (
    <>
      <Hero />
      <Features />
      <PopularSkills />
      <BecomeMember />
      <InfoBoxes />
      <Testimonials />
      <FAQ />
    </>
  );
}

export default function App() {
  const [currentUserEmail] = useState('alice@example.com');
  const [theme] = useState('light');

  return (
    <Router>
      <Routes>
        <Route path="/faq" element={<FAQ />} />
        <Route path="/" element={<Layout><HomePageLayout /></Layout>} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/welcome" element={<Layout><Welcome /></Layout>} />
        <Route path="/communicate" element={<Layout><Communicate /></Layout>} />
        <Route path="/be-an-expert" element={<Layout><BeAnExpert /></Layout>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} /> 
        <Route path="/admin-login" element={<AdminLogin />} /> 
        <Route path="/admin-dashboard" element={<AdminDashboard />} /> 
        <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
        <Route path="/dashboard/skills" element={<DashboardLayout><SkillsPage /></DashboardLayout>} />
        <Route path="/recommendations" element={<Layout><RecommendationsPage /></Layout>} />
        <Route path="/dashboard/sessions" element={<DashboardLayout><UpcomingSessions /></DashboardLayout>} />
        <Route path="/dashboard/achievements" element={<DashboardLayout><Achievements currentUserEmail={currentUserEmail} theme={theme}  /></DashboardLayout>} />
        <Route path="/dashboard/messages" element={<DashboardLayout><Messages currentUserEmail={currentUserEmail} theme={theme} /></DashboardLayout>} />
        <Route path="/dashboard/collaboration" element={<DashboardLayout><Collaboration /></DashboardLayout>} />
        <Route path="/dashboard/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
        <Route path="/dashboard/feedback" element={<DashboardLayout><FeedbackPage /></DashboardLayout>} />
        <Route path="/admin" element={<DashboardLayout><AdminPanel /></DashboardLayout>} />
        <Route path="/teacher" element={<DashboardLayout><TeacherPanel /></DashboardLayout>} />
        <Route path="/learner" element={<DashboardLayout><LearnerPanel /></DashboardLayout>} />
        <Route path="/skills-offered" element={<DashboardLayout><SkillsOffered /></DashboardLayout>} />
        <Route path="/insights" element={<DashboardLayout><Insights /> </DashboardLayout>} />
        <Route path="/skills/:skillName" element={<SkillDetail />} />
        <Route path="/core-features" element={<Layout><CoreFeatures /></Layout>} />
        <Route path="/dashboard/profile" element={<DashboardLayout><Profile /></DashboardLayout>} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/notifications" element={<DashboardLayout><NotificationsPage /></DashboardLayout>} />
        <Route path="/achievements/public/:email/:key" element={<Layout><PublicBadge /></Layout>} />
        <Route path="/collaboration/public/:id" element={<Layout><PublicCollaboration /></Layout>} />
      </Routes>
    </Router>
  );
}
