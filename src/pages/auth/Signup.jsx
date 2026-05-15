import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Layers,
  Users,
  Shield,
} from "lucide-react";

import logo from "../../assets/AMSlogo.png";
import toast from "react-hot-toast";

const DISCIPLINE_OPTIONS = [
  { value: "COMPUTER_SCIENCE", label: "Computer Science" },
  { value: "AGRICULTURE", label: "Agriculture" },
  { value: "BIOTECHNOLOGY", label: "Biotechnology" },
  { value: "MECHANICAL", label: "Mechanical" },
  { value: "CIVIL", label: "Civil" },
  { value: "Soil Science", label: "Soil Science" },
  { value: "Crop Science", label: "Crop Science" },
  { value: "Forestry", label: "Forestry" },
  { value: "Food Technology", label: "Food Technology" },
];

export default function Signup({ onSignup }) {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    institution: "",
    department: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSignup = async () => {
    const {
      name,
      email,
      password,
      confirmPassword,
      institution,
      department,
    } = formData;

    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !institution ||
      !department
    ) {
      toast.error("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/public-register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
            institution,
            department,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      toast.success("Account created successfully");

      localStorage.removeItem("loggedIn");
      localStorage.removeItem("reviewerLoggedIn");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login");

    } catch (error) {
      console.error("Signup Error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSignup();
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
            Create your account
          </h2>

          {/* Name */}
          <label className="text-sm text-gray-500">
            Full Name
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter your full name"
            className="w-full mt-1 mb-4 p-2 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400"
          />

          {/* Email */}
          <label className="text-sm text-gray-500">
            Email
          </label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter your Email"
            className="w-full mt-1 mb-4 p-2 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400"
          />

          {/* Institution */}
          <label className="text-sm text-gray-500">
            Institution
          </label>

          <input
            type="text"
            name="institution"
            value={formData.institution}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter institution"
            className="w-full mt-1 mb-4 p-2 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400"
          />

          {/* Department */}
          <label className="text-sm text-gray-500">
            Department
          </label>

          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full mt-1 mb-4 p-2 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            <option value="" disabled hidden>
              Select Department
            </option>

            {DISCIPLINE_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Password */}
          <label className="text-sm text-gray-500">
            Password
          </label>

          <div className="relative mt-1 mb-4">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter password"
              className="w-full p-2 border rounded pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-400"
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <label className="text-sm text-gray-500">
            Confirm Password
          </label>

          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Confirm your password"
            className="w-full mt-1 mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400"
          />

          {/* Button */}
          <button
            onClick={handleSignup}
            disabled={loading}
            className={`w-full py-2 rounded text-white font-semibold transition ${loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>

          <p className="text-center text-sm text-gray-400 mt-4">
            Already Have An Account?{" "}

            <Link
              to="/login"
              className="text-blue-500 cursor-pointer hover:underline"
            >
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}