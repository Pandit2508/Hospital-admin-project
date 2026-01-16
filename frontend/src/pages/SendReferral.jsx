import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const SendReferral = () => {
  const { hospitalId: receiverHospitalId } = useParams();
  const navigate = useNavigate();

  const [senderHospitalId, setSenderHospitalId] = useState(null);
  const [senderHospitalName, setSenderHospitalName] = useState(null);

  const [hospitalData, setHospitalData] = useState(null);
  const [hospitalResources, setHospitalResources] = useState(null);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [requiredSpecialist, setRequiredSpecialist] = useState("");

  const [resources, setResources] = useState({
    bed: 0,
    icuBeds: 0,
    ventilator: 0,
    oxygenCylinders: 0,
    ambulances: 0,
    bloodBank: bloodGroups.reduce((obj, g) => ({ ...obj, [g]: 0 }), {}),
  });

  // -------------------------------------------------------------
  // AUTH → Resolve logged-in hospital
  // -------------------------------------------------------------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return navigate("/login");

      try {
        const uSnap = await getDoc(doc(db, "users", user.uid));

        if (uSnap.exists() && uSnap.data().hospitalId) {
          const hid = uSnap.data().hospitalId;
          setSenderHospitalId(hid);

          const hSnap = await getDoc(doc(db, "hospitals", hid));
          setSenderHospitalName(hSnap.exists() ? hSnap.data().name : hid);
        }
      } catch (err) {
        console.error("Auth lookup failed:", err);
      }
    });

    return () => unsub();
  }, [navigate]);

  // -------------------------------------------------------------
  // Load receiver hospital + resources
  // -------------------------------------------------------------
  useEffect(() => {
    const loadHospital = async () => {
      if (!receiverHospitalId) return setLoading(false);

      try {
        const hSnap = await getDoc(doc(db, "hospitals", receiverHospitalId));
        if (hSnap.exists()) setHospitalData(hSnap.data());

        const resSnap = await getDoc(
          doc(db, "hospitals", receiverHospitalId, "resources", "resourceInfo")
        );

        if (resSnap.exists()) {
          const r = resSnap.data();

          setHospitalResources({
            bedsAvailable: (r.beds?.total || 0) - (r.beds?.occupied || 0),
            icuAvailable: (r.icuBeds?.total || 0) - (r.icuBeds?.occupied || 0),
            ventilatorsAvailable:
              (r.ventilators?.total || 0) - (r.ventilators?.occupied || 0),
            oxygenAvailable: r.oxygenCylinders?.available || 0,
            ambulancesAvailable:
              (r.ambulances?.total || 0) - (r.ambulances?.maintenance || 0),
            bloodBankAvailable: r.bloodBank || {},
          });
        }
      } catch (err) {
        console.error("Hospital load error:", err);
      }

      setLoading(false);
    };

    loadHospital();
  }, [receiverHospitalId]);

  const enforceLimit = (value, max) => {
    const n = Number(value);
    if (Number.isNaN(n) || n < 0) return 0;
    return n > max ? max : n;
  };

  const hasRequestedSomething = () => {
    const r = resources;
    if (r.bed || r.icuBeds || r.ventilator || r.oxygenCylinders || r.ambulances)
      return true;
    return bloodGroups.some((g) => r.bloodBank[g] > 0);
  };

  // -------------------------------------------------------------
  // SEND REFERRAL
  // -------------------------------------------------------------
  const sendReferral = async () => {
    if (!senderHospitalId) return alert("Please wait… loading profile");
    if (!receiverHospitalId) return alert("Invalid receiver hospital ID");
    if (senderHospitalId === receiverHospitalId)
      return alert("You cannot send a referral to your own hospital");
    if (!hospitalData) return alert("Receiver hospital not found");
    if (!hasRequestedSomething()) return alert("Select at least one resource");
    if (!requiredSpecialist.trim())
      return alert("Enter the required specialist doctor");

    setSending(true);

    try {
      const sharedRef = doc(collection(db, "referrals"));
      const referralId = sharedRef.id;

      const payload = {
        referralId,
        fromHospitalId: senderHospitalId,
        fromHospitalName: senderHospitalName,
        toHospitalId: receiverHospitalId,
        toHospitalName: hospitalData?.name || receiverHospitalId,
        requiredSpecialist,
        resourcesRequested: resources,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // MAIN REFERRAL
      await setDoc(sharedRef, payload);

      // MIRRORS
      await setDoc(
        doc(db, "hospitals", senderHospitalId, "referrals", referralId),
        { ...payload, direction: "outgoing", mirror: true }
      );

      await setDoc(
        doc(db, "hospitals", receiverHospitalId, "referrals", referralId),
        { ...payload, direction: "incoming", mirror: true }
      );

      // Receiver Notification
      await addDoc(
        collection(db, "hospitals", receiverHospitalId, "notifications"),
        {
          referralId,
          type: "referral-request",
          title: "New Referral Request",
          message: `Referral request from ${senderHospitalName}.`,
          read: false,
          timestamp: serverTimestamp(),
        }
      );

      // Sender Notification
      await addDoc(
        collection(db, "hospitals", senderHospitalId, "notifications"),
        {
          referralId,
          type: "referral-status-update",
          title: "Referral Sent",
          message:`You sent a referral to ${hospitalData?.name}.`,
          read: false,
          timestamp: serverTimestamp(),
        }
      );

      alert("Referral Sent Successfully!");

      navigate(`/dashboard/${senderHospitalId}/referrals/${referralId}`);
    } catch (err) {
      console.error("Referral error:", err);
      alert("Failed to send referral — " + err.message);
    }

    setSending(false);
  };

  // -------------------------------------------------------------
  // UI
  // -------------------------------------------------------------
  if (loading)
    return <p className="text-center text-gray-600 mt-10">Loading…</p>;

  if (!hospitalData)
    return (
      <p className="text-center text-red-600 mt-10">Hospital Not Found</p>
    );

  const resourceFields = [
    { key: "bed", label: "Beds", max: hospitalResources?.bedsAvailable || 0 },
    { key: "icuBeds", label: "ICU Beds", max: hospitalResources?.icuAvailable || 0 },
    {
      key: "ventilator",
      label: "Ventilators",
      max: hospitalResources?.ventilatorsAvailable || 0,
    },
    {
      key: "oxygenCylinders",
      label: "Oxygen Cylinders",
      max: hospitalResources?.oxygenAvailable || 0,
    },
    {
      key: "ambulances",
      label: "Ambulances",
      max: hospitalResources?.ambulancesAvailable || 0,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <h2 className="text-3xl font-bold">{hospitalData?.name}</h2>
      <p className="text-gray-600 text-lg mb-4">
        {hospitalData?.location || "Unknown location"}
      </p>

      {/* NEW SECTION — Specialist Doctor */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg border">
        <h3 className="text-xl font-semibold mb-3">
          Required Specialist Doctor
        </h3>

        <label className="block font-medium">Enter Specialist Needed</label>
        <input
          type="text"
          placeholder="e.g., Cardiologist, Neurologist, Orthopedic Surgeon"
          className="w-full p-2 border rounded-md mt-1"
          value={requiredSpecialist}
          onChange={(e) => setRequiredSpecialist(e.target.value)}
        />
      </div>

      <h3 className="text-xl font-semibold mb-3 mt-6">Resources Required</h3>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {resourceFields.map((f) => (
          <div key={f.key}>
            <label className="block font-medium">{f.label}</label>
            <input
              type="number"
              className="w-full border p-2 rounded mt-1"
              value={resources[f.key]}
              min="0"
              onChange={(e) =>
                setResources({
                  ...resources,
                  [f.key]: enforceLimit(e.target.value, f.max),
                })
              }
            />
            <p className="text-xs text-gray-600">Available: {f.max}</p>
          </div>
        ))}
      </div>

      <h3 className="text-xl font-semibold mb-3">Blood Bank Request</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {bloodGroups.map((g) => (
          <div key={g} className="p-3 border rounded-lg">
            <label className="block font-semibold">{g}</label>
            <input
              type="number"
              className="border p-2 rounded w-full mt-1"
              value={resources.bloodBank[g]}
              min="0"
              onChange={(e) =>
                setResources({
                  ...resources,
                  bloodBank: {
                    ...resources.bloodBank,
                    [g]: enforceLimit(
                      e.target.value,
                      hospitalResources?.bloodBankAvailable?.[g] || 0
                    ),
                  },
                })
              }
            />
            <p className="text-xs text-gray-600 mt-1">
              Available: {hospitalResources?.bloodBankAvailable?.[g] || 0}
            </p>
          </div>
        ))}
      </div>

      {/* BUTTON BAR */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
        >
          Back
        </button>

        <button
          onClick={sendReferral}
          disabled={sending}
          className={`${
            sending ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
          } text-white px-6 py-2 rounded-md`}
        >
          {sending ? "Sending..." : "Send Referral"}
        </button>
      </div>
    </div>
  );
};

export default SendReferral;