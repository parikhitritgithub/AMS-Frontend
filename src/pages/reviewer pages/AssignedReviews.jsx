import { useEffect, useState, useCallback } from "react";
import ReviewerSidebar from "./ReviewerSidebar";
import LoadingScreen from "../../components/common/Loadingscreen";
import { Search, Filter, X, ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ── Similarity badge (colour-coded) ───────────────────────────────────────
function SimilarityBadge({ value }) {
  const pct = value ?? 0;
  let bg = "bg-green-100 text-green-700";
  if (pct >= 70) bg = "bg-red-100 text-red-700";
  else if (pct >= 40) bg = "bg-yellow-100 text-yellow-700";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bg}`}>
      {pct}%
    </span>
  );
}

// ── Status badge for reviewer view ───────────────────────────────────────────
function StatusBadge({ status }) {
  const statusMap = {
    SUBMITTED: { label: "Awaiting Assignment", color: "bg-gray-100 text-gray-600", icon: Clock },
    UNDER_REVIEW: { label: "Pending Review", color: "bg-yellow-100 text-yellow-700", icon: RefreshCw },
    APPROVED: { label: "Approved", color: "bg-green-100 text-green-700", icon: CheckCircle },
    REJECTED: { label: "Rejected", color: "bg-red-100 text-red-700", icon: XCircle },
    REVISION_REQUIRED: { label: "Revision Required", color: "bg-orange-100 text-orange-700", icon: RefreshCw },
    DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-600", icon: Clock },
  };
  
  const config = statusMap[status] || { label: status?.replaceAll("_", " ") || "—", color: "bg-gray-100 text-gray-600", icon: Clock };
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${config.color}`}>
      <Icon size={10} />
      {config.label}
    </span>
  );
}

// ── Skeleton Loader Components ───────────────────────────────────────────
function TableRowSkeleton() {
  return (
    <tr className="border-b animate-pulse">
      <td className="py-3 pr-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
      <td className="py-3 pr-4"><div className="h-4 w-48 bg-gray-200 rounded"></div></td>
      <td className="py-3 pr-4">
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
        <div className="h-3 w-24 bg-gray-200 rounded mt-1"></div>
      </td>
      <td className="py-3 pr-4"><div className="h-6 w-24 bg-gray-200 rounded-full"></div></td>
      <td className="py-3 pr-4"><div className="h-6 w-16 bg-gray-200 rounded-full"></div></td>
      <td className="py-3 pr-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
      <td className="py-3"><div className="h-8 w-16 bg-gray-200 rounded-full"></div></td>
    </tr>
  );
}

// ── Status filter tabs for reviewer (only shows relevant statuses) ──────────
const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Pending Review", value: "UNDER_REVIEW" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Revision Required", value: "REVISION_REQUIRED" },
];

const TABLE_HEADERS = ["Project Code", "Title", "Scientist", "Status", "Similarity", "Submitted", "Action"];

export default function AssignedReviews({ onLogout }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("");   
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [disciplineFilter, setDisciplineFilter] = useState("");
  const [disciplines, setDisciplines] = useState([]);
  const navigate = useNavigate();

  // ── Fetch projects from API ───────────────────────────────────────────────
  const fetchProjects = useCallback(async (pageNum = 1, statusFilter = "", discipline = "") => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = { 
        page: pageNum, 
        limit: 10 
      };
      if (statusFilter) params.status = statusFilter;
      if (discipline) params.discipline = discipline;

      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/reviews/assigned-projects`,
        { params, headers: { Authorization: `Bearer ${token}` } }
      );

      const d = res.data;
      console.log("AssignedReviews API response:", d);

      setProjects(d.projects || []);
      setTotalPages(d.pagination?.totalPages || 1);
      setTotalItems(d.pagination?.totalItems || 0);
      setDisciplines(d.filterOptions?.disciplines || []);
    } catch (err) {
      console.error("AssignedReviews fetch error:", err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refetch whenever tab, page, or discipline changes
  useEffect(() => {
    fetchProjects(page, activeTab, disciplineFilter);
  }, [page, activeTab, disciplineFilter, fetchProjects]);

  // Reset to page 1 when switching filters
  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
    setPage(1);
  };

  const handleDisciplineChange = (discipline) => {
    setDisciplineFilter(discipline);
    setPage(1);
  };

  const clearFilters = () => {
    setActiveTab("");
    setDisciplineFilter("");
    setSearch("");
    setPage(1);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeTab) count++;
    if (disciplineFilter) count++;
    if (search) count++;
    return count;
  };

  // Client-side search filter
  const filtered = projects.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (p.title ?? "").toLowerCase().includes(q) ||
      (p.uniqueCode ?? "").toLowerCase().includes(q) ||
      (p.submittedBy?.name ?? "").toLowerCase().includes(q) ||
      (p.discipline ?? "").toLowerCase().includes(q)
    );
  });

  // Count pending reviews (UNDER_REVIEW status only)
  const pendingCount = projects.filter(p => p.status === "UNDER_REVIEW").length;
  const approvedCount = projects.filter(p => p.status === "APPROVED").length;
  const rejectedCount = projects.filter(p => p.status === "REJECTED").length;
  const revisionCount = projects.filter(p => p.status === "REVISION_REQUIRED").length;

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex min-h-screen font-sans bg-gray-100">
        <ReviewerSidebar onLogout={onLogout} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm p-8">
            <LoadingScreen />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen font-sans bg-gray-100">
      <ReviewerSidebar onLogout={onLogout} />

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-4">

          {/* ── Page Header ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm px-8 py-5">
            <h1 className="text-xl font-bold text-gray-800 mb-4">Assigned Reviews</h1>

           

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              {/* Search */}
              <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 gap-2 bg-gray-50 text-sm text-gray-500 w-full sm:max-w-sm">
                <Search size={15} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, code or scientist…"
                  className="bg-transparent outline-none text-sm w-full"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="hover:text-gray-700">
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                {/* Filter Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1 border rounded-lg px-3 py-2 text-sm transition-colors ${
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

                {(activeTab || disciplineFilter || search) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Status Filter - Only shows relevant statuses for reviewer */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Status
                    </label>
                    <select
                      value={activeTab}
                      onChange={(e) => handleTabChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">All Statuses</option>
                      <option value="UNDER_REVIEW">Pending Review</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="REVISION_REQUIRED">Revision Required</option>
                    </select>
                  </div>

                  {/* Discipline Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Discipline
                    </label>
                    <select
                      value={disciplineFilter}
                      onChange={(e) => handleDisciplineChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">All Disciplines</option>
                      {disciplines.map(dis => (
                        <option key={dis} value={dis}>
                          {dis?.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Table Card ──────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-700">
                Review Proposals
                {totalItems > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    ({totalItems} total)
                  </span>
                )}
              </h2>
              {loading && (
                <span className="text-xs text-gray-400 animate-pulse">Refreshing…</span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase border-b">
                    {TABLE_HEADERS.map((h) => (
                      <th key={h} className="text-left py-2 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRowSkeleton key={index} />
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-3xl">📋</span>
                          <span>No proposals found</span>
                          {(activeTab || disciplineFilter || search) && (
                            <button
                              onClick={clearFilters}
                              className="text-blue-500 text-xs hover:underline mt-1"
                            >
                              Clear all filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p) => (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="py-3 pr-4 text-gray-600 font-medium text-xs">
                          {p.uniqueCode || p.id?.slice(-6).toUpperCase() || "—"}
                        </td>
                        <td className="py-3 pr-4 text-gray-700 max-w-[250px]">
                          <div className="truncate" title={p.title}>
                            {p.title || "—"}
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-gray-600">
                          <div>
                            <p className="text-sm font-medium">{p.submittedBy?.name || "—"}</p>
                            <p className="text-xs text-gray-400">{p.submittedBy?.institution || ""}</p>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="py-3 pr-4">
                          <SimilarityBadge value={p.similarityScore ?? 0} />
                        </td>
                        <td className="py-3 pr-4 text-gray-500 text-xs">
                          {p.createdAt
                            ? new Date(p.createdAt).toLocaleDateString("en-IN", { 
                                day: "numeric", 
                                month: "short", 
                                year: "numeric" 
                              })
                            : "—"}
                        </td>
                        <td className="py-3">
  {p.status === "UNDER_REVIEW" ? (
    <button
      onClick={() => navigate(`/reviewer/project/${p.id}`)}
      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition"
    >
      Review
    </button>
  ) : p.status === "SUBMITTED" ? (
    <button
      disabled
      className="bg-gray-300 text-gray-500 text-xs font-semibold px-4 py-1.5 rounded-full cursor-not-allowed"
      title="Project not yet assigned for review"
    >
      Not Assigned
    </button>
  ) : (
    <button
      onClick={() => navigate(`/reviewer/project/${p.id}`)}
      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition"
    >
      View Details
    </button>
  )}
</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Enhanced Pagination with Skeleton Loading ────────────────── */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200">
                {/* Results info */}
                <div className="text-sm text-gray-500">
                  {loading ? (
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    `Showing ${((page - 1) * 10) + 1} to ${Math.min(page * 10, totalItems)} of ${totalItems} results`
                  )}
                </div>

                {/* Pagination controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1 || loading}
                    className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    First
                  </button>

                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1 || loading}
                    className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="flex gap-1">
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
                      ))
                    ) : (
                      getPageNumbers().map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`min-w-[36px] h-9 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            page === pageNum
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))
                    )}
                  </div>

                  <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages || loading}
                    className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>

                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages || loading}
                    className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Last
                  </button>
                </div>

                {/* Page size selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Rows per page:</span>
                  <select
                    value={10}
                    onChange={(e) => {
                      console.log("Page size changed to:", e.target.value);
                    }}
                    className="px-2 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            )}
            
            {/* Show results info even when only one page */}
            {totalPages === 1 && totalItems > 0 && !loading && (
              <div className="flex justify-center items-center mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Showing {totalItems} of {totalItems} results
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}