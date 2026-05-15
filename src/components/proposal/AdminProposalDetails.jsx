import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { 
  ArrowLeft, CheckCircle, XCircle, Clock, Calendar, User, 
  FileText, DollarSign, Users, TrendingUp, RefreshCw, 
  AlertTriangle, Eye, Trash2, UserPlus, Award, X, 
  Briefcase, Mail, Star, Search, ChevronLeft, ChevronRight
} from "lucide-react";

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

// Similarity Ring Component
function SimilarityRing({ score }) {
  const pct = Math.min(100, Math.round(score || 0));
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const dashLen = (pct / 100) * circ;
  const color = pct >= 70 ? "#ef4444" : pct >= 40 ? "#f97316" : "#22c55e";

  return (
    <div className="flex flex-col items-center">
      <svg width={90} height={90}>
        <circle cx={45} cy={45} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={8} />
        <circle
          cx={45} cy={45} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={`${dashLen} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 45 45)"
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
          fontSize="14" fontWeight="bold" fill={color}>
          {pct}%
        </text>
      </svg>
    </div>
  );
}

// Timeline Item Component
function TimelineItem({ label, date, icon: Icon, color = "text-gray-500" }) {
  if (!date) return null;
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-0.5 ${color}`}>
        <Icon size={14} />
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-700">{new Date(date).toLocaleDateString()}</p>
        <p className="text-xs text-gray-400">{new Date(date).toLocaleTimeString()}</p>
      </div>
    </div>
  );
}

// Info Card Component
function InfoCard({ title, icon: Icon, children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
        <Icon size={18} className="text-blue-500" />
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
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

// Confirm Assignment Modal
function ConfirmAssignmentModal({ reviewer, proposal, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Confirm Assignment</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to assign <span className="font-semibold">{reviewer?.name}</span> as the reviewer for:
          </p>
          <p className="font-semibold text-gray-800 bg-gray-50 p-3 rounded-lg">
            "{proposal.title}"
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-700 flex items-center gap-1">
              <AlertTriangle size={12} />
              This action will change the proposal status to "Under Review" and notify the reviewer.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <UserPlus size={16} />
                Confirm Assignment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Assign Reviewer Modal Component with Pagination
function AssignReviewerModal({ proposal, reviewers, reviewersTotalPages, reviewersCurrentPage, onPageChange, onSearch, onClose, onAssign }) {
  const [selectedReviewerId, setSelectedReviewerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchTerm !== searchTerm) {
        setSearchTerm(localSearchTerm);
        onSearch(localSearchTerm);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearchTerm, onSearch]);

  const selectedReviewer = reviewers.find(r => r.id === selectedReviewerId);

  const handleSelectReviewer = (reviewerId) => {
    setSelectedReviewerId(reviewerId);
  };

  const handleProceedToConfirm = () => {
    if (!selectedReviewerId) {
      toast.error("Please select a reviewer");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmAssignment = async () => {
    setLoading(true);
    const projectId = proposal._id || proposal.id;
    if (!projectId) {
      toast.error("Invalid project ID");
      setLoading(false);
      return;
    }
    await onAssign(projectId, selectedReviewerId);
    setLoading(false);
    setShowConfirmModal(false);
    onClose();
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 5;
    let startPage = Math.max(1, reviewersCurrentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(reviewersTotalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold">Assign Reviewer</h2>
              <p className="text-sm text-gray-500 mt-1">
                Select a reviewer for: <span className="font-semibold text-gray-700">{proposal.title}</span>
              </p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviewers by name, email, or expertise..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Reviewers List */}
          <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
            {reviewers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No reviewers found
              </div>
            ) : (
              reviewers.map((reviewer) => (
                <div
                  key={reviewer.id}
                  onClick={() => handleSelectReviewer(reviewer.id)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedReviewerId === reviewer.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800">{reviewer.name}</h3>
                        <span className="text-xs text-gray-400">{reviewer.email}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {reviewer.expertise?.map((exp, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {exp.replaceAll("_", " ")}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Briefcase size={12} />
                          Assigned: {reviewer.totalAssigned || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          Pending: {reviewer.currentWorkload || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle size={12} />
                          Completed: {reviewer.completedReviews || 0}
                        </span>
                      </div>
                    </div>
                    {selectedReviewerId === reviewer.id && (
                      <CheckCircle size={20} className="text-blue-500 shrink-0" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {reviewersTotalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4 mb-4">
              <button
                onClick={() => onPageChange(reviewersCurrentPage - 1)}
                disabled={reviewersCurrentPage === 1}
                className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft size={16} />
              </button>
              
              {getPageNumbers().map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
                    reviewersCurrentPage === pageNum
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              
              <button
                onClick={() => onPageChange(reviewersCurrentPage + 1)}
                disabled={reviewersCurrentPage === reviewersTotalPages}
                className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Selected Reviewer Summary */}
          {selectedReviewer && (
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-blue-800 mb-1">Selected Reviewer</p>
              <p className="text-sm text-blue-700">{selectedReviewer.name}</p>
              <p className="text-xs text-blue-600">{selectedReviewer.email}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleProceedToConfirm}
              disabled={!selectedReviewerId}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <UserPlus size={16} />
              Continue to Confirm
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Assignment Modal */}
      {showConfirmModal && selectedReviewer && (
        <ConfirmAssignmentModal
          reviewer={selectedReviewer}
          proposal={proposal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmAssignment}
        />
      )}
    </>
  );
}

// Helper Icons
function MessageSquare({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 18} height={size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

export default function AdminProposalDetails({ onLogout, user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [reviewers, setReviewers] = useState([]);
  
  // Reviewer pagination state
  const [reviewerPage, setReviewerPage] = useState(1);
  const [reviewerTotalPages, setReviewerTotalPages] = useState(1);
  const [reviewerSearch, setReviewerSearch] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        const res = await axios.get(
          `${API_BASE_URL}/api/admin/projects/id/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setProposal(res.data.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load proposal");
        toast.error("Failed to load proposal details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProposal();
  }, [id]);

  // Fetch reviewers with pagination and search
  const fetchReviewers = async (page = 1, search = "") => {
    try {
      const token = localStorage.getItem("token");
      
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", 3); // Show 5 reviewers per page
      params.append("sortBy", "currentWorkload");
      params.append("sortOrder", "asc");
      
      if (search) {
        params.append("search", search);
      }
      
      const res = await axios.get(
        `${API_BASE_URL}/api/admin/reviewers?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setReviewers(res.data.reviewers || []);
      setReviewerTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch reviewers:", err);
      toast.error("Failed to load reviewers");
    }
  };

  // Handle reviewer page change
  const handleReviewerPageChange = (newPage) => {
    setReviewerPage(newPage);
    fetchReviewers(newPage, reviewerSearch);
  };

  // Handle reviewer search
  const handleReviewerSearch = (searchTerm) => {
    setReviewerSearch(searchTerm);
    setReviewerPage(1);
    fetchReviewers(1, searchTerm);
  };

  const handleDeleteProposal = async () => {
    try {
      const token = localStorage.getItem("token");
      
      await axios.delete(
        `${API_BASE_URL}/api/admin/projects/id/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Proposal deleted successfully");
      navigate("/admin/proposals");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete proposal");
    }
  };

  const handleAssignReviewer = async (projectId, reviewerId) => {
    try {
      const token = localStorage.getItem("token");
      
      const res = await axios.put(
        `${API_BASE_URL}/api/projects/assign-reviewer/${projectId}`,
        { reviewerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Reviewer assigned successfully");
      setShowAssignModal(false);
      
      // Refresh proposal data
      const updatedRes = await axios.get(
        `${API_BASE_URL}/api/admin/projects/id/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProposal(updatedRes.data.data);
      
      return res;
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to assign reviewer");
      throw err;
    }
  };

  // Open assign modal and fetch reviewers
  const openAssignModal = () => {
    setShowAssignModal(true);
    setReviewerPage(1);
    setReviewerSearch("");
    fetchReviewers(1, "");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar onLogout={onLogout} user={user} />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar onLogout={onLogout} user={user} />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <p className="text-red-500 mb-4">{error || "Proposal not found"}</p>
              <button
                onClick={() => navigate("/admin/proposals")}
                className="text-blue-500 hover:underline"
              >
                Back to Proposals
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const isReviewerAssigned = proposal.assignedReviewerId !== null && proposal.assignedReviewerId !== undefined;
  const canAssignReviewer = proposal.status === "SUBMITTED" && !isReviewerAssigned;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar onLogout={onLogout} user={user} />

      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Header with Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-gray-900">Proposal Details</h1>
                  <StatusBadge status={proposal.status} />
                </div>
                <p className="text-sm text-gray-500">
                  <span className="font-mono">Project Code: {proposal.uniqueCode || id?.slice(-8).toUpperCase()}</span>
                  <span className="mx-2">•</span>
                  <span>Version {proposal.version || 1}</span>
                </p>
              </div>
              <div className="flex gap-2">
                {canAssignReviewer && (
                  <button
                    onClick={openAssignModal}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <UserPlus size={16} />
                    Assign Reviewer
                  </button>
                )}
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
                <button
                  onClick={() => navigate("/admin/proposals")}
                  className="flex items-center gap-1 px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <ArrowLeft size={14} />
                  Back
                </button>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Scientist Information */}
              <InfoCard title="Submitted By (Principal Scientist)" icon={User}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400">Name</p>
                    <p className="text-sm font-medium text-gray-800">{proposal.ownerId?.name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm text-gray-600">{proposal.ownerId?.email || "—"}</p>
                  </div>
                </div>
              </InfoCard>

              {/* Project Details */}
              <InfoCard title="Project Information" icon={FileText}>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400">Title</p>
                    <p className="text-sm font-medium text-gray-800">{proposal.title || "—"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-400">Discipline</p>
                      <p className="text-sm text-gray-600">{proposal.discipline?.replaceAll("_", " ") || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Station/College</p>
                      <p className="text-sm text-gray-600">{proposal.stationOrCollege || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Year</p>
                      <p className="text-sm text-gray-600">{proposal.year || "—"}</p>
                    </div>
                  </div>

                  {proposal.introduction && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Introduction & Rationale</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{proposal.introduction}</p>
                    </div>
                  )}

                  {proposal.actionPlan && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Action Plan</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{proposal.actionPlan}</p>
                    </div>
                  )}

                  {proposal.expectedOutcome && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Expected Outcome</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{proposal.expectedOutcome}</p>
                    </div>
                  )}

                  {proposal.objectives?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Objectives</p>
                      <ul className="list-disc list-inside space-y-1">
                        {proposal.objectives.map((obj, idx) => (
                          <li key={idx} className="text-sm text-gray-600">{obj}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </InfoCard>

              {/* Budget Details */}
              {proposal.budget && (
                <InfoCard title="Budget Breakdown" icon={DollarSign}>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-gray-400">Non Recurring</p>
                      <p className="text-sm font-medium text-gray-800">₹ {(proposal.budget.nonRecurring || 0).toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Recurring Contingency</p>
                      <p className="text-sm text-gray-600">₹ {(proposal.budget.recurringContingency || 0).toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Travelling Allowances</p>
                      <p className="text-sm text-gray-600">₹ {(proposal.budget.travellingAllowances || 0).toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Operational Expenses</p>
                      <p className="text-sm text-gray-600">₹ {(proposal.budget.operationalExpenses || 0).toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Manpower</p>
                      <p className="text-sm text-gray-600">₹ {(proposal.budget.manpower || 0).toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Grand Total</p>
                      <p className="text-sm font-bold text-blue-600">₹ {(proposal.budget.grandTotal || 0).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                </InfoCard>
              )}

              {/* Scientists Involved */}
              {proposal.scientistInvolve?.length > 0 && (
                <InfoCard title="Scientists Involved" icon={Users}>
                  <div className="space-y-2">
                    {proposal.scientistInvolve.map((scientist, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3">
                        <p className="font-medium text-gray-800">{scientist.scientistName}</p>
                        <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                          <span className="text-gray-600">Non Recurring: ₹ {scientist.nonRecurring?.toLocaleString() || 0}</span>
                          <span className="text-gray-600">Recurring: ₹ {scientist.recurringContingency?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </InfoCard>
              )}

              {/* Review Feedback */}
              {proposal.reviews && proposal.reviews.length > 0 && (
                <InfoCard title="Review Feedback" icon={MessageSquare}>
                  <div className="space-y-3">
                    {proposal.reviews.map((review, idx) => (
                      <div key={idx} className="border-l-4 border-blue-200 pl-3 py-2">
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            review.decision === "APPROVED" ? "bg-green-100 text-green-700" :
                            review.decision === "REJECTED" ? "bg-red-100 text-red-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {review.decision?.replaceAll("_", " ")}
                          </span>
                          <span className="text-xs text-gray-400">{new Date(review.reviewedAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                        <p className="text-xs text-gray-400 mt-1">Reviewed by: {review.reviewedBy?.name}</p>
                      </div>
                    ))}
                  </div>
                </InfoCard>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-4">
              
              {/* Similarity Analysis */}
              <InfoCard title="Similarity Analysis" icon={TrendingUp}>
                <div className="text-center">
                  <SimilarityRing score={proposal.similarityScore} />
                  {proposal.similarityScore >= 70 && (
                    <div className="mt-3 flex items-center justify-center gap-1 bg-red-50 text-red-700 text-xs font-semibold px-3 py-2 rounded-full">
                      <AlertTriangle size={12} /> High Similarity Detected
                    </div>
                  )}
                  {proposal.similarityScore >= 40 && proposal.similarityScore < 70 && (
                    <div className="mt-3 flex items-center justify-center gap-1 bg-yellow-50 text-yellow-700 text-xs font-semibold px-3 py-2 rounded-full">
                      <AlertTriangle size={12} /> Moderate Similarity Detected
                    </div>
                  )}
                  {proposal.similarityScore < 40 && proposal.similarityScore > 0 && (
                    <div className="mt-3 flex items-center justify-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-3 py-2 rounded-full">
                      ✓ Low Similarity
                    </div>
                  )}
                </div>
              </InfoCard>

              {/* Timeline */}
              <InfoCard title="Project Timeline" icon={Calendar}>
                <div className="space-y-2">
                  <TimelineItem label="Created" date={proposal.createdAt} icon={Calendar} />
                  <TimelineItem label="Submitted" date={proposal.submittedAt} icon={Clock} />
                  <TimelineItem label="Assigned to Reviewer" date={proposal.assignedAt} icon={User} />
                  <TimelineItem label="Under Review" date={proposal.underReviewAt} icon={Eye} />
                  <TimelineItem label="Revision Requested" date={proposal.revisionRequestedAt} icon={RefreshCw} color="text-yellow-500" />
                  <TimelineItem label="Approved" date={proposal.approvedAt} icon={CheckCircle} color="text-green-500" />
                  <TimelineItem label="Rejected" date={proposal.rejectedAt} icon={XCircle} color="text-red-500" />
                </div>
              </InfoCard>

              {/* Assigned Reviewer */}
              <InfoCard title="Assigned Reviewer" icon={User}>
                {isReviewerAssigned ? (
                  <div>
                    <p className="text-sm font-medium text-gray-800">{proposal.assignedReviewerId?.name || "—"}</p>
                    <p className="text-xs text-gray-500">{proposal.assignedReviewerId?.email || "—"}</p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-2">No reviewer assigned yet</p>
                    {canAssignReviewer && (
                      <button
                        onClick={openAssignModal}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        Assign a reviewer
                      </button>
                    )}
                  </div>
                )}
              </InfoCard>

              {/* Final Comment */}
              {proposal.finalComment && (
                <InfoCard title="Final Decision Comment" icon={MessageSquare}>
                  <p className="text-sm text-gray-600 italic">"{proposal.finalComment}"</p>
                </InfoCard>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showDeleteModal && (
        <DeleteModal
          proposal={proposal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteProposal}
        />
      )}

      {showAssignModal && (
        <AssignReviewerModal
          proposal={proposal}
          reviewers={reviewers}
          reviewersTotalPages={reviewerTotalPages}
          reviewersCurrentPage={reviewerPage}
          onPageChange={handleReviewerPageChange}
          onSearch={handleReviewerSearch}
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssignReviewer}
        />
      )}
    </div>
  );
}