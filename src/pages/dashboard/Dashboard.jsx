import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import StatCard from "../../components/common/StatCard";
import SimilarityBadge from "../../components/proposal/SimilarityBadge";
import { Search, Filter, List, LayoutGrid, FileStack, Clock, CheckCircle, XCircle, X, Eye, Menu } from "lucide-react";
import LoadingScreen from "../../components/common/Loadingscreen";
import axios from "axios";

const TABLE_HEADERS = ["Project ID", "Title", "Status", "Similarity", "Submitted", "Discipline"];

// Status options for filter
const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "REVISION_REQUIRED", label: "Revision Required" },
];

export default function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // BACKEND 
  const [stats, setStats] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering and view
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/dashboard/scientist`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;
        setStats(data.statistics);
        setProposals(data.recentProposals);
        console.log(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Navigate to proposal details page
  const handleViewProposal = (projectId) => {
    navigate(`/scientist/project/${projectId}`);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
  };

  // Get filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (statusFilter !== "ALL") count++;
    if (search.trim()) count++;
    return count;
  };

  const filtered = proposals.filter((p) => {
    const term = search.toLowerCase();

    const matchesSearch =
      p.title?.toLowerCase().includes(term) ||
      p.uniqueCode?.toString().toLowerCase().includes(term) ||
      p.status?.toLowerCase().includes(term) ||
      p.discipline?.toLowerCase().includes(term);

    const matchesFilter =
      statusFilter === "ALL" || p.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen font-sans bg-gray-100">
        <Sidebar onLogout={onLogout} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm p-4 md:p-8">
            <LoadingScreen />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen font-sans bg-gray-100">
      <Sidebar onLogout={onLogout} />

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm p-4 md:p-8">
          {/* Header - Responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Dashboard</h1>
            
            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 border rounded-lg text-gray-500"
              >
                <Menu size={20} />
              </button>
            </div>

            {/* Desktop Controls */}
            <div className="hidden sm:flex items-center gap-2 flex-wrap">
              {/* Search Bar */}
              <div className="flex items-center border rounded-lg px-3 py-1.5 gap-2 bg-gray-50 text-sm text-gray-500 w-64">
                <Search size={14} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search proposals..."
                  className="bg-transparent outline-none text-sm w-full"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="hover:text-gray-700">
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Filter Button with Badge */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1 border rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  showFilters || getActiveFilterCount() > 0
                    ? "bg-blue-50 border-blue-300 text-blue-600"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Filter size={14} />
                Filter
                {getActiveFilterCount() > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white rounded-full text-xs">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 hover:bg-gray-100 transition-colors ${
                    viewMode === "list" ? "bg-gray-200" : ""
                  }`}
                  title="List View"
                >
                  <List size={16} className="text-gray-500" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 hover:bg-gray-100 transition-colors ${
                    viewMode === "grid" ? "bg-gray-200" : ""
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid size={16} className="text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Controls - Visible only on mobile */}
          {mobileMenuOpen && (
            <div className="sm:hidden mb-4 space-y-3">
              {/* Search Bar */}
              <div className="flex items-center border rounded-lg px-3 py-2 gap-2 bg-gray-50 text-sm text-gray-500 w-full">
                <Search size={14} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search proposals..."
                  className="bg-transparent outline-none text-sm flex-1"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="hover:text-gray-700">
                    <X size={12} />
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex-1 flex items-center justify-center gap-1 border rounded-lg px-3 py-2 text-sm transition-colors ${
                    showFilters || getActiveFilterCount() > 0
                      ? "bg-blue-50 border-blue-300 text-blue-600"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <Filter size={14} />
                  Filter
                  {getActiveFilterCount() > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white rounded-full text-xs">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>

                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 hover:bg-gray-100 transition-colors ${
                      viewMode === "list" ? "bg-gray-200" : ""
                    }`}
                  >
                    <List size={16} className="text-gray-500" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 hover:bg-gray-100 transition-colors ${
                      viewMode === "grid" ? "bg-gray-200" : ""
                    }`}
                  >
                    <LayoutGrid size={16} className="text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filter Panel - Responsive */}
          {showFilters && (
            <div className="mb-6 p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-xs text-blue-500 hover:text-blue-600"
                >
                  Clear all filters
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {STATUS_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Stat Cards - Responsive Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-6 md:mb-8">
            <StatCard
              label="Total Proposals"
              value={stats?.total || 0}
              icon={FileStack}
              color="text-blue-500"
              bg="bg-blue-50"
            />
            <StatCard
              label="Submitted"
              value={stats?.submitted || 0}
              icon={Clock}
              color="text-indigo-500"
              bg="bg-indigo-50"
            />
            <StatCard
              label="Under Review"
              value={stats?.underReview || 0}
              icon={Clock}
              color="text-yellow-500"
              bg="bg-yellow-50"
            />
            <StatCard
              label="Approved"
              value={stats?.approved || 0}
              icon={CheckCircle}
              color="text-green-500"
              bg="bg-green-50"
            />
            <StatCard
              label="Rejected"
              value={stats?.rejected || 0}
              icon={XCircle}
              color="text-red-500"
              bg="bg-red-50"
            />
            <StatCard
              label="Revision Required"
              value={stats?.revisionRequired || 0}
              icon={Clock}
              color="text-orange-500"
              bg="bg-orange-50"
            />
          </div>

          {/* Proposals Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2 className="text-base font-semibold text-gray-700">
              Recent Proposals
              {filtered.length !== proposals.length && (
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({filtered.length} of {proposals.length})
                </span>
              )}
            </h2>
          </div>

          {/* No Results */}
          {filtered.length === 0 ? (
            <div className="text-center py-8 md:py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-2">No proposals found</p>
              {(search || statusFilter !== "ALL") && (
                <button
                  onClick={clearFilters}
                  className="text-blue-500 text-sm hover:underline"
                >
                  Clear filters to see all proposals
                </button>
              )}
            </div>
          ) : viewMode === "list" ? (
            /* List View - Responsive Table */
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="min-w-[600px] md:min-w-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 uppercase border-b">
                      {TABLE_HEADERS.map((h) => (
                        <th key={h} className="text-left py-2 pr-3 md:pr-4 font-medium">
                          {h}
                        </th>
                      ))}
                      <th className="text-left py-2 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr 
                        key={p.id} 
                        className="border-b last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleViewProposal(p.id)}
                      >
                        <td className="py-3 pr-3 md:pr-4 text-gray-600 font-medium text-xs md:text-sm">
                          {p.uniqueCode || "N/A"}
                        </td>
                        <td className="py-3 pr-3 md:pr-4 text-gray-700 text-xs md:text-sm">
                          {p.title.length > 40 ? `${p.title.substring(0, 40)}...` : p.title}
                        </td>
                        <td className="py-3 pr-3 md:pr-4">
                          <span className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            p.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : p.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : p.status === "REVISION_REQUIRED"
                              ? "bg-orange-100 text-orange-800"
                              : p.status === "UNDER_REVIEW"
                              ? "bg-blue-100 text-blue-800"
                              : p.status === "SUBMITTED"
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {p.status?.replaceAll("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 pr-3 md:pr-4">
                          <SimilarityBadge value={p.similarityScore || 0} />
                        </td>
                        <td className="py-3 pr-3 md:pr-4 text-gray-500 text-xs md:text-sm whitespace-nowrap">
                          {p.submittedDate ? new Date(p.submittedDate).toLocaleDateString("en-IN") : "N/A"}
                        </td>
                        <td className="py-3 pr-3 md:pr-4 text-gray-500 text-xs md:text-sm">
                          {p.discipline?.replaceAll("_", " ")?.substring(0, 15) || "Not specified"}
                        </td>
                        <td className="py-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewProposal(p.id);
                            }}
                            className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Grid View - Responsive Cards */
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {filtered.map((p) => (
                <div 
                  key={p.id} 
                  className="border rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewProposal(p.id)}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-xs font-mono text-gray-500 truncate flex-1">
                      {p.uniqueCode}
                    </span>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                        p.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : p.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : p.status === "REVISION_REQUIRED"
                          ? "bg-orange-100 text-orange-800"
                          : p.status === "UNDER_REVIEW"
                          ? "bg-blue-100 text-blue-800"
                          : p.status === "SUBMITTED"
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {p.status?.replaceAll("_", " ")?.substring(0, 12)}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-800 mb-2 line-clamp-2 text-sm md:text-base">
                    {p.title}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mt-3">
                    <span className="text-xs text-gray-500 truncate">
                      {p.discipline?.replaceAll("_", " ") || "Not specified"}
                    </span>
                    <SimilarityBadge value={p.similarityScore || 0} />
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-400">
                      {p.submittedDate ? new Date(p.submittedDate).toLocaleDateString("en-IN") : "N/A"}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProposal(p.id);
                      }}
                      className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                      title="View Details"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}