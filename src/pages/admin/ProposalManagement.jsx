import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Search, Filter, X, ChevronLeft, ChevronRight, Eye, Trash2, FileText } from "lucide-react";

import AdminSidebar from "../../components/admin/AdminSidebar";

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
  const config = statusConfig[status] || { label: status, color: "bg-gray-100 text-gray-700" };
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
}

// Similarity Badge Component
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

// Delete Confirmation Modal
function DeleteModal({ proposal, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(proposal.id);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Delete Proposal</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <span className="font-semibold">{proposal.title}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Proposal Row Component
function ProposalRow({ proposal, onView, onDelete }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td className="py-3 px-4">
          <span className="font-mono text-sm font-medium text-gray-900">
            {proposal.uniqueCode || proposal.id?.slice(-8).toUpperCase()}
          </span>
        </td>
        <td className="py-3 px-4">
          <div className="max-w-md">
            <p className="text-sm font-medium text-gray-800 truncate" title={proposal.title}>
              {proposal.title}
            </p>
            <p className="text-xs text-gray-400">{proposal.discipline?.replaceAll("_", " ") || "—"}</p>
          </div>
        </td>
        <td className="py-3 px-4">
          <StatusBadge status={proposal.status} />
        </td>
        <td className="py-3 px-4">
          <SimilarityBadge score={proposal.similarityScore} />
        </td>
        <td className="py-3 px-4 text-gray-500 text-xs">
          {proposal.submittedAt
            ? new Date(proposal.submittedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : proposal.createdAt
            ? new Date(proposal.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onView(proposal.id)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Proposal"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </td>
       </tr>
      {showDeleteModal && (
        <DeleteModal
          proposal={proposal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={onDelete}
        />
      )}
    </>
  );
}

// Main Component
export default function ProposalManagement({ onLogout, user }) {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDiscipline, setFilterDiscipline] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filter options
  const [disciplines, setDisciplines] = useState([]);

  const LIMIT = 5;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch proposals
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const params = new URLSearchParams();
        params.append("page", currentPage);
        params.append("limit", LIMIT);
        
        if (searchTerm) params.append("search", searchTerm);
        if (filterStatus) params.append("status", filterStatus);
        if (filterDiscipline) params.append("discipline", filterDiscipline);

        const res = await axios.get(
          `${API_BASE_URL}/api/admin/projects?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setProposals(res.data.data || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalItems(res.data.pagination?.totalItems || 0);
        
        // Set filter options from response
        if (res.data.filters?.disciplines) {
          setDisciplines(res.data.filters.disciplines);
        }
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Failed to load proposals");
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [currentPage, searchTerm, filterStatus, filterDiscipline]);

  const handleViewProposal = (proposalId) => {
    navigate(`/admin/proposals/${proposalId}`);
  };

  const handleDeleteProposal = async (proposalId) => {
    try {
      const token = localStorage.getItem("token");
      
      await axios.delete(
        `${API_BASE_URL}/api/admin/projects/id/${proposalId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Proposal deleted successfully");
      setProposals(proposals.filter(p => p.id !== proposalId));
      setTotalItems(prev => prev - 1);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete proposal");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("");
    setFilterDiscipline("");
    setCurrentPage(1);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filterStatus) count++;
    if (filterDiscipline) count++;
    if (searchTerm) count++;
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

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "DRAFT", label: "Draft" },
    { value: "SUBMITTED", label: "Submitted" },
    { value: "UNDER_REVIEW", label: "Under Review" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
    { value: "REVISION_REQUIRED", label: "Revision Required" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar onLogout={onLogout} user={user} />

      <main className="flex-1 px-4 md:px-8 py-6 md:py-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Proposal Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and track all research proposals in the system.</p>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by title, unique code, discipline..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition-colors ${
                    showFilters || getActiveFilterCount() > 0
                      ? "bg-blue-50 border-blue-300 text-blue-600"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
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

                {(searchTerm || filterStatus || filterDiscipline) && (
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

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => {
                        setFilterStatus(e.target.value);
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
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Discipline</label>
                    <select
                      value={filterDiscipline}
                      onChange={(e) => {
                        setFilterDiscipline(e.target.value);
                        setCurrentPage(1);
                      }}
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

          {/* Proposals Table */}
                 {/* Proposals Table */}
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Project Code</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title / Discipline</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Similarity</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
                  ) : proposals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <FileText size={48} className="text-gray-300" />
                          <p className="text-gray-500">No proposals found</p>
                          {(searchTerm || filterStatus || filterDiscipline) && (
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
                      <ProposalRow
                        key={proposal.id}
                        proposal={proposal}
                        onView={handleViewProposal}
                        onDelete={handleDeleteProposal}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination - Centered */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={16} />
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
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}