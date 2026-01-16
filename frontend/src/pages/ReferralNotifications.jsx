import { db } from "../firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ReferralNotifications = ({ hospitalId: propHospitalId }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  // Auto-detect hospitalId
  const hospitalId = propHospitalId || localStorage.getItem("hospitalID");

  useEffect(() => {
    if (!hospitalId) {
      console.warn("ReferralNotifications: Missing hospitalId");
      return;
    }

    const notifRef = collection(db, "hospitals", hospitalId, "notifications");
    const q = query(notifRef);

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // newest first
        list.sort(
          (a, b) =>
            (b.timestamp?.toMillis?.() || 0) -
            (a.timestamp?.toMillis?.() || 0)
        );

        setNotifications(list);
      },
      (err) => console.error("Notification listener error:", err)
    );

    return () => unsub();
  }, [hospitalId]);

  // Correct navigation function
  const openReferral = (notif) => {
    console.log("🔍 Opening referral from notification:", notif);

    if (!notif.referralId) {
      alert("This notification has no referralId.");
      return;
    }

    // Fully correct route
    navigate(`/dashboard/${hospitalId}/referrals/${notif.referralId}`);
  };

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-semibold">Notifications</h2>

      {notifications.length === 0 && (
        <p className="text-gray-500 text-sm">No notifications available.</p>
      )}

      {notifications.map((n) => (
        <div
          key={n.id}
          className="p-5 rounded-lg border bg-white shadow-sm space-y-3"
        >
          <p className="font-semibold text-gray-900">
            {n.title || "Notification"}
          </p>

          <p className="text-gray-700">{n.message}</p>

          <p className="text-xs text-gray-500">
            {n.timestamp?.toDate
              ? n.timestamp.toDate().toLocaleString()
              : ""}
          </p>

          {/* Show button for referral-related notifications */}
          {(n.type === "referral-request" ||
            n.type === "referral-status-update") && (
            <button
              onClick={() => openReferral(n)}
              disabled={!n.referralId}
              className={`${
                n.referralId
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white px-4 py-2 rounded-md`}
            >
              {n.referralId ? "View Referral" : "Invalid Referral"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReferralNotifications;
