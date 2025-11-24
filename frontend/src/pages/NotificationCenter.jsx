"use client";

import { Card, CardContent } from "../components/ui/card";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  // ⭐ Load dynamic hospitalId
  const hospitalId = localStorage.getItem("hospitalID");

  useEffect(() => {
    if (!hospitalId) {
      console.warn("NotificationCenter: hospitalId missing");
      return;
    }

    const notifRef = collection(db, "hospitals", hospitalId, "notifications");

    const unsubscribe = onSnapshot(
      notifRef,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // sort by latest
        list.sort((a, b) => {
          const t1 = a?.timestamp?.toMillis?.() || 0;
          const t2 = b?.timestamp?.toMillis?.() || 0;
          return t2 - t1;
        });

        setNotifications(list);
      },
      (err) => console.error("Notification listener error:", err)
    );

    return () => unsubscribe();
  }, [hospitalId]);

  // 🔹 Styles & Icons
  const typeStyles = {
    critical: "bg-red-50 border-l-4 border-red-500",
    warning: "bg-orange-50 border-l-4 border-orange-500",
    "referral-request": "bg-blue-50 border-l-4 border-blue-500",
    "referral-status-update": "bg-blue-50 border-l-4 border-blue-500",
    default: "bg-green-50 border-l-4 border-green-500",
  };

  const typeColors = {
    critical: "text-red-600",
    warning: "text-orange-600",
    "referral-request": "text-blue-600",
    "referral-status-update": "text-blue-600",
    default: "text-green-600",
  };

  const typeIcons = {
    critical: AlertCircle,
    warning: AlertTriangle,
    "referral-request": Info,
    "referral-status-update": CheckCircle,
    default: CheckCircle,
  };

  const getStyle = (type) => typeStyles[type] || typeStyles.default;
  const getIconColor = (type) => typeColors[type] || typeColors.default;
  const getIcon = (type) => typeIcons[type] || typeIcons.default;

  // 🔥 NEW — referral notifications are always clickable
  const handleNotificationClick = (n) => {
    if (
      (n.type === "referral-request" || n.type === "referral-status-update") &&
      n.referralId
    ) {
      navigate(`/referral/${n.referralId}`);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Notification Center</h1>
      <p className="text-gray-600 mt-1">View all alerts and notifications</p>

      <div className="space-y-3">
        {notifications.length === 0 && (
          <p className="text-gray-600 text-center mt-10">
            No notifications yet.
          </p>
        )}

        {notifications.map((n) => {
          const IconComponent = getIcon(n.type);

          return (
            <Card
              key={n.id}
              className={`${getStyle(n.type)} border-0 cursor-pointer`}
              onClick={() => handleNotificationClick(n)}
            >
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <IconComponent
                    className={`w-6 h-6 flex-shrink-0 ${getIconColor(
                      n.type
                    )}`}
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {n.title ||
                        (n.type === "referral-request"
                          ? "New Referral Request"
                          : n.type === "referral-status-update"
                          ? "Referral Status Update"
                          : "Notification")}
                    </h3>

                    <p className="text-sm text-gray-700 mt-1">{n.message}</p>

                    <p className="text-xs text-gray-500 mt-2">
                      {n.timestamp?.toDate
                        ? n.timestamp.toDate().toLocaleString()
                        : ""}
                    </p>

                    {n.type === "referral-status-update" && n.status && (
                      <p className="text-sm mt-2 font-semibold text-blue-700">
                        Referral Status: {n.status}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
