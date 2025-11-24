import { db } from "../firebase";
import {
  collection,
  query,
  onSnapshot,
  updateDoc,
  doc
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ReferralNotifications = ({ hospitalId: propHospitalId }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

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

  // -------------------------------
  // markAsRead (used ONLY from ReferralDetails)
  // -------------------------------
  const markAsRead = async (notif) => {
    try {
      const ref = doc(db, "hospitals", hospitalId, "notifications", notif.id);
      await updateDoc(ref, { read: true });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // -------------------------------
  // OPEN REFERRAL (button always active)
  // -------------------------------
  const openReferral = (notif) => {
    if (!notif.referralId) {
      alert("This notification has no referral ID");
      return;
    }

    // ❌ DO NOT mark as read here  
    // Accept/Reject inside ReferralDetails will mark it read.

    navigate(`/dashboard/${hospitalId}/referrals/${notif.referralId}`);
  };

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-semibold">Notifications</h2>

      {notifications.length === 0 && (
        <p className="text-gray-500 text-sm">No notifications available.</p>
      )}

      {notifications.map((n) => {
        const isReferral =
          n.type === "referral-request" ||
          n.type === "referral-status-update";

        return (
          <div
            key={n.id}
            className={`p-5 rounded-lg border shadow-sm space-y-3 ${
              n.read
                ? "bg-gray-100 border-gray-300"
                : "bg-white border-blue-400"
            }`}
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

            {isReferral && (
              <button
                onClick={() => openReferral(n)}
                className={`px-4 py-2 rounded-md text-white transition ${
                  n.read
                    ? "bg-gray-500 hover:bg-gray-600" // viewed but clickable
                    : "bg-blue-600 hover:bg-blue-700" // unread
                }`}
              >
                {n.read ? "Viewed" : "View Referral"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ReferralNotifications;
