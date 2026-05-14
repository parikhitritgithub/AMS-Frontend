import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Layers, Users, Shield } from "lucide-react";
import logo from "../../assets/AMSlogo.png";
import toast from "react-hot-toast";


export default function Login({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await response.json();
      console.log("LOGIN RESPONSE =", data);
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store auth data
      const token =
        data.token ||
        data.accessToken;

      console.log("SAVING TOKEN =", token);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Login successful");
      onLogin(data, data.user?.role);

    } catch (error) {
      console.error("Login Error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
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
              <div key={label} className="flex items-center gap-4">
                <Icon size={28} /><p>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-[#F5F7FA] p-4 min-h-screen">
        <div className="w-full max-w-sm bg-white shadow-2xl rounded-2xl p-6 sm:p-8">
          <h2 className="text-center text-gray-600 mb-6 text-lg font-semibold">
            Login to your account
          </h2>

          <label className="text-sm text-gray-500">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your Email"
            className="w-full mt-1 mb-4 p-2 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400"
          />

          <div className="flex justify-between text-sm text-gray-500">
            <label>Password</label>
            <Link
              to="/forget-password"
              className="text-blue-500 cursor-pointer hover:underline"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative mt-1 mb-4">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your password"
              className="w-full p-2 border rounded pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-2 rounded text-white font-semibold transition ${loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading ? "Logging in…" : "Login now"}
          </button>

          <p className="text-center text-sm text-gray-400 mt-4">
            Don't Have An Account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-blue-500 cursor-pointer"
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}