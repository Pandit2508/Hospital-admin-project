import { useEffect, useState, useCallback } from "react";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  setDoc,
  collection,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";

import { useParams, useNavigate } from "react-router-dom";

const ReferralDetails = () => {
  const { hospitalId: paramHospitalId, referralId } = useParams();
  const navigate = useNavigate();

  const hospitalId = paramHospitalId || localStorage.getItem("hospitalID");
  const currentHospitalId = hospitalId;

  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [checking, setChecking] = useState(false);

  const ensureMirrorExists = useCallback(
    async (hid, data) => {
      const mirrorRef = doc(db, "hospitals", hid, "referrals", referralId);
      const snap = await getDoc(mirrorRef);

      if (!snap.exists()) {
        await setDoc(mirrorRef, {
          ...data,
          referralId,
          direction: data.toHospitalId === hid ? "incoming" : "outgoing",
          mirror: true,
        });
      }
    },
    [referralId]
  );

  useEffect(() => {
    const loadReferral = async () => {
      try {
        const mirrorRef = doc(
          db,
          "hospitals",
          currentHospitalId,
          "referrals",
          referralId
        );
        const mirrorSnap = await getDoc(mirrorRef);

        if (mirrorSnap.exists()) {
          setReferral({ id: referralId, ...mirrorSnap.data() });
          setLoading(false);
          return;
        }

        const mainRef = doc(db, "referrals", referralId);
        const mainSnap = await getDoc(mainRef);

        if (mainSnap.exists()) {
          const mainData = { id: mainSnap.id, ...mainSnap.data() };
          setReferral(mainData);

          await ensureMirrorExists(currentHospitalId, mainData);
        }
      } catch (err) {
        console.error("Error loading referral:", err);
      }

      setLoading(false);
    };

    if (referralId && currentHospitalId) {
      loadReferral();
    }
  }, [referralId, currentHospitalId, ensureMirrorExists]);

  if (!referralId) {
    return (
      <p className="text-center text-red-600 mt-10">
        Invalid referral URL.
        <br />
        Use: /dashboard/HOSPITAL_ID/referrals/REFERRAL_ID
      </p>
    );
  }

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  if (!referral)
    return (
      <p className="text-center text-red-500 mt-10">Referral not found.</p>
    );

  const { fromHospitalId, toHospitalId } = referral;

  const canView =
    currentHospitalId === fromHospitalId ||
    currentHospitalId === toHospitalId;

  if (!canView) {
    return (
      <p className="text-center text-red-500 mt-10">
        You do not have permission to view this referral.
      </p>
    );
  }

  const isReceiver = currentHospitalId === toHospitalId;

  const updateMirror = async (hid, data) => {
    const ref = doc(db, "hospitals", hid, "referrals", referralId);
    const snap = await getDoc(ref);
    if (snap.exists()) await updateDoc(ref, data);
  };

  const applyResourceAllocation = async () => {
    const resourcesRequested = referral.resourcesRequested || {};

    await runTransaction(db, async (transaction) => {
      const resRef = doc(
        db,
        "hospitals",
        toHospitalId,
        "resources",
        "resourceInfo"
      );
      const resSnap = await transaction.get(resRef);

      if (!resSnap.exists()) {
        throw new Error("Receiving hospital has no resource setup.");
      }

      const data = resSnap.data();

      const bedsReq = resourcesRequested.bed || 0;
      const icuReq = resourcesRequested.icuBeds || 0;
      const ventReq = resourcesRequested.ventilator || 0;
      const oxyReq = resourcesRequested.oxygenCylinders || 0;
      const ambReq = resourcesRequested.ambulances || 0;

      const bloodReq = resourcesRequested.bloodBank || {};

      const bedsTotal = data.beds.total || 0;
      const bedsOccupied = data.beds.occupied || 0;

      const icuTotal = data.icuBeds.total || 0;
      const icuOccupied = data.icuBeds.occupied || 0;

      const ventTotal = data.ventilators.total || 0;
      const ventOccupied = data.ventilators.occupied || 0;

      const oxyAvailable =
        typeof data.oxygenCylinders === "number"
          ? data.oxygenCylinders
          : data.oxygenCylinders.available || 0;

      const ambActive = data.ambulances.active || 0;

      const bloodUpdated = { ...data.bloodBank };
      Object.entries(bloodReq).forEach(([group, amount]) => {
        const current = data.bloodBank[group] || 0;
        bloodUpdated[group] = Math.max(0, current - amount);
      });

      transaction.update(resRef, {
        beds: {
          total: bedsTotal,
          occupied: Math.min(bedsTotal, bedsOccupied + bedsReq),
        },
        icuBeds: {
          total: icuTotal,
          occupied: Math.min(icuTotal, icuOccupied + icuReq),
        },
        ventilators: {
          total: ventTotal,
          occupied: Math.min(ventTotal, ventOccupied + ventReq),
        },
        oxygenCylinders:
          typeof data.oxygenCylinders === "number"
            ? oxyAvailable - oxyReq
            : {
                available: Math.max(0, oxyAvailable - oxyReq),
              },
        ambulances: {
          ...data.ambulances,
          active: Math.max(0, ambActive - ambReq),
        },
        bloodBank: bloodUpdated,
      });
    });
  };

  const acceptReferral = async () => {
    setProcessing(true);
    try {
      await applyResourceAllocation();

      const updateData = {
        status: "accepted",
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, "referrals", referralId), updateData);
      await updateMirror(fromHospitalId, updateData);
      await updateMirror(toHospitalId, updateData);

      await addDoc(
        collection(db, "hospitals", fromHospitalId, "notifications"),
        {
          referralId,
          title: "Referral Accepted",
          message: `${referral.toHospitalName} accepted your referral.`,
          status: "accepted",
          type: "referral-status-update",
          read: false,
          timestamp: serverTimestamp(),
        }
      );

      alert("Referral accepted.");
      navigate(`/dashboard/${toHospitalId}`, { replace: true });
    } catch (err) {
      alert("ERROR: " + err.message);
    }
    setProcessing(false);
  };

  const rejectReferral = async () => {
    setProcessing(true);
    try {
      const updateData = {
        status: "rejected",
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, "referrals", referralId), updateData);
      await updateMirror(fromHospitalId, updateData);
      await updateMirror(toHospitalId, updateData);

      await addDoc(
        collection(db, "hospitals", fromHospitalId, "notifications"),
        {
          referralId,
          title: "Referral Rejected",
          message: `${referral.toHospitalName} rejected your referral.`,
          status: "rejected",
          type: "referral-status-update",
          read: false,
          timestamp: serverTimestamp(),
        }
      );

      alert("Referral rejected.");
      navigate(`/dashboard/${toHospitalId}`, { replace: true });
    } catch (err) {
      alert("ERROR: " + err.message);
    }
    setProcessing(false);
  };

  const checkStatus = async () => {
    setChecking(true);
    try {
      const ref = doc(db, "referrals", referralId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setReferral((prev) => ({
          ...prev,
          status: data.status,
        }));
      }
    } catch (e) {
      console.error(e);
    }
    setChecking(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 rounded-lg shadow-md bg-white">
      <h2 className="text-2xl font-semibold">Referral Details</h2>

      <p>
        <strong>Referral ID:</strong>{" "}
        <span className="text-gray-700">{referralId}</span>
      </p>

      <p>
        <strong>Status:</strong>{" "}
        <span
          className={`${
            referral.status === "accepted"
              ? "text-green-600"
              : referral.status === "rejected"
              ? "text-red-600"
              : "text-blue-600"
          }`}
        >
          {referral.status}
        </span>
      </p>

      <p>
        <strong>From Hospital:</strong> {referral.fromHospitalName}
      </p>

      <p>
        <strong>To Hospital:</strong> {referral.toHospitalName}
      </p>

      {/* ==============================
          NEW SECTION: Specialist Needed
         ============================== */}
      <h3 className="text-lg font-semibold mt-4">Required Specialist Doctor</h3>
      <p className="text-blue-700 font-medium">
        {referral.requiredSpecialist || "Not specified"}
      </p>

      <h3 className="text-lg font-semibold mt-4">Resources Requested</h3>
      <div className="grid grid-cols-3 gap-4">
        <p>
          <strong>Beds:</strong> {referral.resourcesRequested?.bed ?? 0}
        </p>
        <p>
          <strong>ICU Beds:</strong> {referral.resourcesRequested?.icuBeds ?? 0}
        </p>
        <p>
          <strong>Ventilators:</strong>{" "}
          {referral.resourcesRequested?.ventilator ?? 0}
        </p>
        <p>
          <strong>Oxygen:</strong>{" "}
          {referral.resourcesRequested?.oxygenCylinders ?? 0}
        </p>
        <p>
          <strong>Ambulances:</strong>{" "}
          {referral.resourcesRequested?.ambulances ?? 0}
        </p>
      </div>

      {/* BUTTON ROW */}
      <div className="flex gap-4 mt-10">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
        >
          Back
        </button>

        {!isReceiver && (
          <button
            onClick={checkStatus}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            {checking ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Checking…
              </>
            ) : (
              "Check Status"
            )}
          </button>
        )}

        {isReceiver && referral.status === "pending" && (
          <>
            <button
              onClick={acceptReferral}
              disabled={processing}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
            >
              {processing ? "Processing..." : "Accept"}
            </button>

            <button
              onClick={rejectReferral}
              disabled={processing}
              className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
            >
              {processing ? "Processing..." : "Reject"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ReferralDetails;