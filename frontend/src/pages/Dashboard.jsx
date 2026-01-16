// Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardOverview from "./DashboardOverview";
import HospitalNetwork from "./HospitalNetwork";
import HelpSupport from "./HelpSupport1";
import ResourceManagement from "./ResourceManagement";
import ReferralNotifications from "./ReferralNotifications";

import { Button } from "../components/ui/button";
import { auth } from "../firebase";

const Dashboard = () => {
  const navigate = useNavigate();
  const { hospitalId: urlHospitalId } = useParams();

  const [activeTab, setActiveTab] = useState("overview");
  const [hospitalId, setHospitalId] = useState(null);
  const [loading, setLoading] = useState(true);

  // -------------------------------------------------
  // AUTH + HOSPITAL ID SETUP
  // -------------------------------------------------
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      const storedId = localStorage.getItem("hospitalID");

      const finalId = urlHospitalId || storedId;

      if (!finalId) {
        navigate("/HospitalRegistration");
        return;
      }

      setHospitalId(finalId);

      if (storedId !== finalId) {
        localStorage.setItem("hospitalID", finalId);
      }

      if (!urlHospitalId) {
        navigate(`/dashboard/${finalId}`, { replace: true });
        return;
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, urlHospitalId]);

  // -------------------------------------------------
  // LOGOUT FUNCTION
  // -------------------------------------------------
  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("hospitalID");
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
      alert("Failed to logout. Try again.");
    }
  };

  // -------------------------------------------------
  // LOADING SCREEN
  // -------------------------------------------------
  if (loading || !hospitalId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-blue-600 font-semibold text-lg">
          Loading dashboard...
        </p>
      </div>
    );
  }

  // -------------------------------------------------
  // TAB SWITCHING
  // -------------------------------------------------
  const renderContent = () => {
    const props = { hospitalId };

    switch (activeTab) {
      case "overview":
        return <DashboardOverview {...props} />;
      case "network":
        return <HospitalNetwork {...props} />;
      case "resources":
        return <ResourceManagement {...props} />;
      case "notifications":
        return <ReferralNotifications {...props} />;
      case "help":
        return <HelpSupport />;
      default:
        return <DashboardOverview {...props} />;
    }
  };

  // -------------------------------------------------
  // UI
  // -------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="p-6 border-b bg-white shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Hospital Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Managing Hospital: <strong>{hospitalId}</strong>
          </p>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Logout
        </button>
      </header>

      {/* Tabs */}
      <nav className="flex flex-wrap gap-2 bg-white p-4 border-b sticky top-0 z-10">
        {[
          ["overview", "Overview"],
          ["network", "Hospital Network"],
          ["resources", "Resource Management"],
          ["notifications", "Notifications"],
          ["help", "Help & Support"],
        ].map(([key, label]) => (
          <Button
            key={key}
            variant={activeTab === key ? "default" : "outline"}
            onClick={() => setActiveTab(key)}
            className={activeTab === key ? "bg-blue-600 text-white" : ""}
          >
            {label}
          </Button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6">{renderContent()}</main>
    </div>
  );
};

export default Dashboard;
