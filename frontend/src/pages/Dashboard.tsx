import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import UploadSection from "@/components/dashboard/UploadSection";
import PatientsSection from "@/components/dashboard/PatientsSection";
import AnalyticsSection from "@/components/dashboard/AnalyticsSection";
import { getCurrentUser } from "@/lib/auth";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const user = getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect regular users to their own dashboard
    if (user?.role === 'user') {
      navigate('/user-dashboard');
    }
  }, [user, navigate]);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'upload':
        return <UploadSection />;
      case 'patients':
        return user?.role === 'doctor' ? <PatientsSection /> : null;
      case 'analytics':
        return <AnalyticsSection />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default Dashboard;
