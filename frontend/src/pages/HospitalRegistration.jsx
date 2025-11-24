import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function HospitalRegistration() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    registrationNumber: "",
    type: "",
    location: "",
    contact: "",
    email: "",
    website: "",
  });

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        // If already linked → redirect
        if (userSnap.exists() && userSnap.data().hospitalId) {
          const hid = userSnap.data().hospitalId;
          localStorage.setItem("hospitalID", hid);
          navigate(`/dashboard/${hid}`);
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsub();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!currentUser) {
        alert("You must be logged in.");
        return;
      }

      const hospitalId = formData.registrationNumber.trim();

      if (!hospitalId) {
        alert("Hospital Registration Number is required.");
        return;
      }

      const hospitalRef = doc(db, "hospitals", hospitalId);
      const hospitalSnap = await getDoc(hospitalRef);

      // If hospital doesn't exist → create it
      if (!hospitalSnap.exists()) {
        await setDoc(hospitalRef, {
          name: formData.name,
          type: formData.type,
          location: formData.location,
          contact: formData.contact,
          email: formData.email,
          website: formData.website,
          createdAt: Date.now(),
        });

        // Default resources
        await setDoc(
          doc(db, "hospitals", hospitalId, "resources", "resourceInfo"),
          {
            beds: { total: 0, occupied: 0 },
            icuBeds: { total: 0, occupied: 0 },
            ventilators: { total: 0, occupied: 0 },
            oxygenCylinders: { available: 0 },
            ambulances: { total: 0, active: 0, maintenance: 0 },
            bloodBank: {
              "O+": 0,
              "O-": 0,
              "A+": 0,
              "A-": 0,
              "B+": 0,
              "B-": 0,
              "AB+": 0,
              "AB-": 0,
            },
          }
        );

        alert("Hospital Registered Successfully!");
      } else {
        alert("Hospital already exists. Linking your account...");
      }

      // Map user → hospital
      await setDoc(
        doc(db, "users", currentUser.uid),
        { hospitalId },
        { merge: true }
      );

      // Also save in localStorage
      localStorage.setItem("hospitalID", hospitalId);

      navigate(`/dashboard/${hospitalId}`);

    } catch (error) {
      console.error(error);
      alert("Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-sans">
      {/* Left UI */}
    <div className="md:w-1/3 w-full bg-gradient-to-br from-blue-700 to-blue-500 flex flex-col justify-center items-center text-white p-10 rounded-r-3xl shadow-lg">
      
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">
          <span className="text-blue-200">Medi</span>
          <span className="text-blue-400">Connect</span>
        </h1>

        <p className="text-blue-100 text-lg">
          Secure, verified, and compliant onboarding for your hospital.
        </p>
      </div>

    </div>


      {/* Right Form */}
      <div className="md:w-2/3 w-full bg-white flex items-center justify-center p-10 md:p-20">
        <div className="w-full max-w-lg space-y-8">
          <h2 className="text-3xl font-bold text-center text-blue-700">
            Hospital Registration
          </h2>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <FormInput label="Hospital Name" name="name" value={formData.name} onChange={handleChange} required />

            <FormInput
              label="Hospital Registration Number (Used as Hospital ID)"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              required
            />

            <div>
              <label className="block text-sm font-semibold">Hospital Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="mt-1 w-full border p-3 rounded-lg bg-white"
              >
                <option value="">Select Type</option>
                <option>Private</option>
                <option>Government</option>
                <option>Multi-specialty</option>
                <option>Clinic</option>
              </select>
            </div>

            <FormInput label="Location" name="location" value={formData.location} onChange={handleChange} required />

            <div className="flex gap-4">
              <FormInput label="Contact" name="contact" value={formData.contact} onChange={handleChange} required />
              <FormInput label="Email" name="email" value={formData.email} onChange={handleChange} required />
            </div>

            <FormInput label="Website" name="website" value={formData.website} onChange={handleChange} placeholder="https://" />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg"
            >
              {loading ? "Submitting..." : "Submit Registration"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function FormInput({ label, ...rest }) {
  return (
    <div>
      <label className="block text-sm font-semibold">{label}</label>
      <input {...rest} className="mt-1 w-full border p-3 rounded-lg" />
    </div>
  );
}
