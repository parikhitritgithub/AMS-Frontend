// AdminDashboard.jsx (Main File)
import { useEffect, useState } from "react";
import axios from "axios";

import {
  FolderOpen,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  Users,
  FlaskConical,
  TrendingUp,
  FileText,
  Activity,
} from "lucide-react";

import StatCard from "../../components/common/StatCard";
import LoadingScreen from "../../components/common/Loadingscreen";

import AdminSidebar from "../../components/admin/AdminSidebar";
import DashboardHeader from "../../components/admin/DashboardHeader";
import DashboardCharts from "../../components/admin/DashboardCharts";
import RecentProjects from "../../components/admin/RecentProjects";
import RecentReviews from "../../components/admin/RecentReviews";
import ReviewerWorkload from "../../components/admin/ReviewerWorkload";

export default function AdminDashboard({ onLogout, user }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API Calling
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/dashboard/admin`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setDashboardData(res.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch admin dashboard:", err);
        setError(err.response?.data?.message || err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Transform project data for RecentProjects component
  const getStatusColor = (status) => {
    const statusMap = {
      "APPROVED": "bg-green-100 text-green-700",
      "SUBMITTED": "bg-yellow-100 text-yellow-700",
      "UNDER_REVIEW": "bg-blue-100 text-blue-700",
      "REVISION_REQUIRED": "bg-orange-100 text-orange-700",
      "REJECTED": "bg-red-100 text-red-700",
      "DRAFT": "bg-gray-100 text-gray-700",
    };
    return statusMap[status] || "bg-gray-100 text-gray-700";
  };

  const formatStatus = (status) => {
    return status?.replace(/_/g, " ") || status;
  };

  const transformedProjects = (dashboardData?.recentProjects || []).map(project => ({
    title: project.title,
    author: project.submittedBy || "Unknown",
    discipline: project.discipline,
    status: formatStatus(project.status),
    statusColor: getStatusColor(project.status),
  }));

  // Transform review data for RecentReviews component
  const getDecisionColor = (decision) => {
    const decisionMap = {
      "APPROVED": "bg-green-100 text-green-700",
      "REJECTED": "bg-red-100 text-red-700",
      "REVISION_REQUIRED": "bg-orange-100 text-orange-700",
    };
    return decisionMap[decision] || "bg-gray-100 text-gray-700";
  };

  const transformedReviews = (dashboardData?.recentReviews || []).map(review => ({
    title: review.proposalTitle,
    decision: review.decision,
    decisionColor: getDecisionColor(review.decision),
    comment: review.comment,
    reviewer: review.reviewedBy,
  }));

  // Transform reviewer workload data
  const transformedReviewers = (dashboardData?.reviewerWorkload || []).map(reviewer => ({
    name: reviewer.name,
    assignedProjects: reviewer.assignedProjects,
    pendingReviews: reviewer.pendingReviews,
  }));

  const STATS = [
    {
      label: "Projects",
      value: dashboardData?.statistics?.projects?.total || 0,
      icon: FolderOpen,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Submitted",
      value: dashboardData?.statistics?.projects?.submitted || 0,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      label: "Approved",
      value: dashboardData?.statistics?.projects?.approved || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Rejected",
      value: dashboardData?.statistics?.projects?.rejected || 0,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      label: "Reviewers",
      value: dashboardData?.statistics?.users?.reviewers || 0,
      icon: UserCheck,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
  ];

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar onLogout={onLogout} user={user} />
        <main className="flex-1 flex items-center justify-center">
          <LoadingScreen />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar onLogout={onLogout} user={user} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-xl font-semibold mb-2">Error</div>
            <div className="text-gray-600">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar onLogout={onLogout} user={user} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-8 py-8">
        {/* Header */}
        <DashboardHeader />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          {STATS.map((s) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              icon={s.icon}
              color={s.color}
              bg={s.bg}
            />
          ))}
        </div>

        {/* Platform Overview Banner */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Platform Overview
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Total Users */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="p-3 bg-violet-100 rounded-xl">
                <Users className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.statistics?.users?.total || 0}
                </p>
                <p className="text-sm text-gray-500 font-medium">Total Users</p>
              </div>
            </div>

            {/* Scientists */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FlaskConical className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.statistics?.users?.scientists || 0}
                </p>
                <p className="text-sm text-gray-500 font-medium">Scientists</p>
              </div>
            </div>

            {/* Admins */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="p-3 bg-amber-100 rounded-xl">
                <UserCheck className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.statistics?.users?.admins || 0}
                </p>
                <p className="text-sm text-gray-500 font-medium">Admins</p>
              </div>
            </div>

            {/* Review Stats */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData?.statistics?.reviews?.total || 0}
                  </p>
                  <span className="text-sm font-semibold text-emerald-600">
                    {dashboardData?.statistics?.reviews?.approvalRate || 0}%
                  </span>
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  Reviews <span className="text-emerald-600">• Approval Rate</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts - Pass the actual chart data */}
        <DashboardCharts chartsData={dashboardData?.charts} />

        {/* Projects + Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RecentProjects projects={transformedProjects} />
          <RecentReviews reviews={transformedReviews} />
        </div>

        {/* Reviewer Workload */}
        <ReviewerWorkload reviewers={transformedReviewers} />
      </main>
    </div>
  );
}