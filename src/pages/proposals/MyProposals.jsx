import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, Filter, X, Eye } from "lucide-react";

import Sidebar from "../../components/common/Sidebar";

// Status Badge Component
function StatusBadge({ status }) {
  const statusConfig = {
    DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-700" },
    SUBMITTED: { label: "Submitted", color: "bg-purple-100 text-purple-700" },
    UNDER_REVIEW: { label: "Under Review", color: "bg-blue-100 text-blue-700" },
    APPROVED: { label: "Approved", color: "bg-green-100 text-green-700" },
    REJECTED: { label: "Rejected", color: "bg-red-100 text-red-700" },
    REVISION_REQUIRED: { label: "Revision Required", color: "bg-yellow-100 text-yellow-700" },
  };
  const config = statusConfig[status] || { label: status || "Draft", color: "bg-gray-100 text-gray-700" };
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
}

// Similarity Badge
function SimilarityBadge({ score }) {
  const scoreNum = score || 0;
  let color = "bg-green-100 text-green-700";
  let label = "Low";
  
  if (scoreNum >= 70) {
    color = "bg-red-100 text-red-700";
    label = "High";
  } else if (scoreNum >= 40) {
    color = "bg-yellow-100 text-yellow-700";
    label = "Medium";
  }
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
      {scoreNum}% ({label})
    </span>
  );
}

// Skeleton Loader
function TableRowSkeleton() {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      <td className="py-3 px-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
      <td className="py-3 px-4"><div className="h-4 w-48 bg-gray-200 rounded"></div></td>
      <td className="py-3 px-4"><div className="h-6 w-20 bg-gray-200 rounded-full"></div></td>
      <td className="py-3 px-4"><div className="h-6 w-16 bg-gray-200 rounded-full"></div></td>
      <td className="py-3 px-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
      <td className="py-3 px-4"><div className="h-8 w-16 bg-gray-200 rounded"></div></td>
    </tr>
  );
}

export default function MyProposals({ onLogout }) {
  const navigate = useNavigate();
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const LIMIT = 5;

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "DRAFT", label: "Draft" },
    { value: "SUBMITTED", label: "Submitted" },
    { value: "UNDER_REVIEW", label: "Under Review" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
    { value: "REVISION_REQUIRED", label: "Revision Required" },
  ];

  useEffect(() => {
    fetchProposals();
  }, [currentPage, search, statusFilter]);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const params = new URLSearchParams();
      params.append("page", currentPage);
      params.append("limit", LIMIT);
      
      if (search.trim()) {
        params.append("search", search.trim());
      }
      
      if (statusFilter) {
        params.append("status", statusFilter);
      }
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/scientist/my-proposals?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setProposals(response.data.proposals || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setTotalItems(response.data.pagination?.totalItems || 0);
      
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProposal = (projectId) => {
    navigate(`/scientist/project/${projectId}`);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (statusFilter) count++;
    if (search) count++;
    return count;
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  return (
    <div className="flex min-h-screen font-sans bg-gray-100">
      <Sidebar onLogout={onLogout} />

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm">
          {/* Header */}
          <div className="px-6 py-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">My Proposals</h1>
            <p className="text-gray-500 text-sm mt-1">View and manage your research proposals.</p>
          </div>

          {/* Search and Filters */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by title, unique code, discipline..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition-colors ${
                    showFilters || getActiveFilterCount() > 0
                      ? "bg-blue-50 border-blue-300 text-blue-600"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50 bg-white"
                  }`}
                >
                  <Filter size={16} />
                  Filters
                  {getActiveFilterCount() > 0 && (
                    <span className="px-1.5 py-0.5 bg-blue-500 text-white rounded-full text-xs">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>

                {(search || statusFilter) && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-red-500 hover:text-red-700"
                  >
                    <X size={14} />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <p className="text-sm text-gray-500">
                      Showing {proposals.length} of {totalItems} proposals
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Proposals Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Project Code</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title / Discipline</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Similarity</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
                ) : proposals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <FileText size={48} className="text-gray-300" />
                        <p className="text-gray-500">No proposals found</p>
                        {(search || statusFilter) && (
                          <button
                            onClick={clearFilters}
                            className="text-blue-500 text-sm hover:underline mt-2"
                          >
                            Clear filters to see all proposals
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  proposals.map((proposal) => (
                    <tr key={proposal.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleViewProposal(proposal.id)}>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {proposal.uniqueCode || proposal.id?.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-md">
                          <p className="text-sm font-medium text-gray-900 truncate" title={proposal.title}>
                            {proposal.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">{proposal.discipline?.replaceAll("_", " ") || "—"}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={proposal.status} />
                      </td>
                      <td className="px-6 py-4">
                        <SimilarityBadge score={proposal.similarityScore} />
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {proposal.createdAt
                          ? new Date(proposal.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProposal(proposal.id);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          <Eye size={14} />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              
              <div className="flex gap-1">
                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages || loading}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function FileText({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}