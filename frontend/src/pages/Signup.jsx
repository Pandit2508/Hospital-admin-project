import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const Signup = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      // Create Firebase user only (NO hospital ID here)
      await createUserWithEmailAndPassword(auth, email, password);

      alert("Account created successfully!");

      // User must now register hospital details
      navigate("/HospitalRegistration");

    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center bg-cover bg-center font-[Poppins]"
      style={{
        backgroundImage:
          'url("https://www.shutterstock.com/shutterstock/videos/1098703147/thumb/1.jpg?ip=x480")',
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* Navbar */}
      <nav className="absolute top-0 left-0 w-full flex items-center justify-between p-6 text-white text-2xl font-semibold z-10">
        MediConnect
      </nav>

      {/* Signup Form */}
      <div className="relative z-10 bg-white/20 backdrop-blur-md text-black p-10 rounded-2xl shadow-2xl w-96">
        <div className="text-5xl text-center mb-6">⚕</div>

        <h2 className="text-2xl font-semibold text-center mb-6 text-white">
          Create Hospital Account
        </h2>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          {/* EMAIL */}
          <input
            type="email"
            placeholder="Official Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
            autoComplete="off"
          />

          {/* PASSWORD */}
          <input
            type="password"
            placeholder="Create Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
            autoComplete="new-password"
          />

          <button
            type="submit"
            disabled={loading}
            className={`mt-3 ${
              loading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
            } text-white py-3 rounded-md font-semibold transition-all`}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-white">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-blue-400 hover:underline"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
