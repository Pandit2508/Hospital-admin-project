// App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import HospitalRegistration from "./pages/HospitalRegistration";

import HospitalNetwork from "./pages/HospitalNetwork";
import SendReferral from "./pages/SendReferral";
import ReferralDetails from "./pages/ReferralDetails";
import ReferralNotifications from "./pages/ReferralNotifications";
import ResourceManagement from "./pages/ResourceManagement";

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard */}
        <Route path="/dashboard/:hospitalId" element={<Dashboard />} />

        {/* Registration */}
        <Route path="/HospitalRegistration" element={<HospitalRegistration />} />

        {/* Network */}
        <Route path="/hospital-network" element={<HospitalNetwork />} />

        {/* Send Referral */}
        <Route path="/refer-patient/:hospitalId" element={<SendReferral />} />

        {/* Referral Details */}
        <Route
          path="/dashboard/:hospitalId/referrals/:referralId"
          element={<ReferralDetails />}
        />

        {/* Notification list */}
        <Route
          path="/referral-notifications"
          element={<ReferralNotifications />}
        />

        {/* Resources & Analytics */}
        <Route
          path="/resource-management/:hospitalId"
          element={<ResourceManagement />}
        />

        {/* GLOBAL CATCH-ALL ROUTE */}
        <Route
          path="*"
          element={
            localStorage.getItem("hospitalID") ? (
              <Navigate
                to={`/dashboard/${localStorage.getItem("hospitalID")}`}
                replace
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </>
  );
}   

export default App;
