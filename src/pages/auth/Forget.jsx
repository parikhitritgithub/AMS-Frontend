import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Layers,
  Users,
  Shield,
} from "lucide-react";

import logo from "../../assets/AMSlogo.png";
import toast from "react-hot-toast";

export default function Forget() {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleResetPassword = async () => {
    const { currentPassword, newPassword } = formData;

    if (!currentPassword || !newPassword) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login first");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Reset failed");
      }

      toast.success("Password updated successfully");

      setFormData({
        currentPassword: "",
        newPassword: "",
      });

    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* Left Panel */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#021B34] to-[#0B2E4F] text-white items-center justify-center p-6">

        <div className="w-full max-w-lg">

          <img
            src={logo}
            alt="AMS Logo"
            className="w-40 mx-auto mb-10 bg-white px-4 py-2 rounded-full"
          />

          <h1 className="text-3xl font-serif text-center mb-2">
            Anusandhan Management System
          </h1>

          <p className="text-gray-300 text-center mb-16">
            Research Management System
          </p>

          <div className="space-y-10 text-lg text-gray-200">
            {[
              { icon: Layers, label: "Smart Research Workflow" },
              { icon: Users, label: "Collaborative Review" },
              { icon: Shield, label: "Similarity Detection" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-4"
              >
                <Icon size={28} />
                <p>{label}</p>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-[#F5F7FA] p-4 min-h-screen">

        <div className="w-full max-w-sm bg-white shadow-2xl rounded-2xl p-6 sm:p-8">

          <h2 className="text-center text-gray-600 mb-6 text-lg font-semibold">
            Reset Password
          </h2>

          {/* Current Password */}
          <label className="text-sm text-gray-500">
            Current Password
          </label>

          <div className="relative mt-1 mb-4">

            <input
              type={showPassword ? "text" : "password"}
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter current password"
              className="w-full p-2 border rounded pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              className="absolute right-3 top-2.5 text-gray-400"
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>

          </div>

          {/* New Password */}
          <label className="text-sm text-gray-500">
            New Password
          </label>

          <input
            type={showPassword ? "text" : "password"}
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="Enter new password"
            className="w-full mt-1 mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400"
          />

          {/* Button */}
          <button
            onClick={handleResetPassword}
            disabled={loading}
            className={`w-full py-2 rounded text-white font-semibold transition ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>

          <p className="text-center text-sm text-gray-400 mt-4">

            <Link
              to="/login"
              className="text-blue-500 hover:underline"
            >
              Back to Login
            </Link>

          </p>

        </div>
      </div>
    </div>
  );
}