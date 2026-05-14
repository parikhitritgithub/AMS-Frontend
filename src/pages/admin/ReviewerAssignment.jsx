import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { 
  Search, UserPlus, Briefcase, CheckCircle, XCircle, Clock, 
  X, Award, Users, Filter, ChevronLeft, ChevronRight,
  AlertTriangle, FileText, User
} from "lucide-react";

import AdminSidebar from "../../components/admin/AdminSidebar";

// Status Badge Component
function StatusBadge({ status }) {
  const statusConfig = {
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

// Workload Badge
function WorkloadBadge({ workload }) {
  const w = workload || 0;
  if (w <= 2) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Available</span>;
  if (w <= 4) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Moderate</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Busy</span>;
}

// Skeleton Components
function ProposalCardSkeleton() {
  return (
    <div className="w-full p-4 border-b border-gray-100 animate-pulse">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="flex gap-2 mt-2">
            <div className="h-5 bg-gray-200 rounded w-20"></div>
            <div className="h-5 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div>
        </div>
        <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );
}

function ReviewerCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
      <div className="flex justify-between items-start gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            <div className="h-5 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-40 mt-1"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="mb-3">
        <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
        <div className="flex gap-1">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-6 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
      <div className="flex gap-4 pt-2 border-t border-gray-100">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  );
}

// Confirmation Modal
function ConfirmAssignModal({ project, reviewer, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Confirm Assignment</h2>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-yellow-700 mb-2">
              <AlertTriangle size={18} />
              <span className="font-semibold">Warning</span>
            </div>
            <p className="text-sm text-yellow-700">
              This action will assign the reviewer and change the proposal status to "Under Review".
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Proposal</p>
            <p className="font-semibold text-gray-800">{project?.title}</p>
            <p className="text-xs text-gray-400">{project?.uniqueCode}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Reviewer</p>
            <p className="font-semibold text-gray-800">{reviewer?.name}</p>
            <p className="text-xs text-gray-400">{reviewer?.email}</p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Confirm Assignment
          </button>
        </div>
      </div>
    </div>
  );
}

// Proposal Card Component
function ProposalCard({ proposal, isSelected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(proposal)}
      className={`w-full text-left p-4 transition-all hover:bg-gray-50 border-b border-gray-100 ${
        isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : "border-l-4 border-l-transparent"
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">{proposal.title}</p>
          <p className="text-xs font-mono text-gray-500">{proposal.uniqueCode}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-400">{proposal.discipline?.replaceAll("_", " ") || "—"}</span>
            <SimilarityBadge score={proposal.similarityScore} />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            <User size={10} className="inline mr-1" />
            {proposal.submittedBy?.name || "Unknown"}
          </p>
        </div>
        {isSelected && <CheckCircle size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />}
      </div>
    </button>
  );
}

// Reviewer Card Component
function ReviewerCard({ reviewer, onAssign, isAssigning }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-gray-800">{reviewer.name}</p>
            <WorkloadBadge workload={reviewer.currentWorkload || 0} />
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{reviewer.email}</p>
        </div>
        <button
          onClick={() => onAssign(reviewer)}
          disabled={isAssigning}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
        >
          {isAssigning ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Assigning...
            </>
          ) : (
            <>
              <UserPlus size={14} />
              Assign
            </>
          )}
        </button>
      </div>

      {reviewer.expertise && reviewer.expertise.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-400 mb-1.5">Expertise</p>
          <div className="flex flex-wrap gap-1">
            {reviewer.expertise.map((exp, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs">
                {exp.replaceAll("_", " ")}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
        <span className="flex items-center gap-1">
          <Briefcase size={12} /> Assigned: {reviewer.totalAssigned || 0}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} /> Pending: {reviewer.currentWorkload || 0}
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle size={12} /> Completed: {reviewer.completedReviews || 0}
        </span>
      </div>
    </div>
  );
}

// Pagination Component
function Pagination({ currentPage, totalPages, onPageChange, isLoading }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-4 pt-4 border-t border-gray-200">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      {getPageNumbers().map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          disabled={isLoading}
          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
            currentPage === p ? "bg-blue-600 text-white" : "border hover:bg-gray-50"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// Main Component
export default function ReviewerAssignment({ onLogout, user }) {
  const [proposals, setProposals] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [assigningId, setAssigningId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [reviewersLoading, setReviewersLoading] = useState(false);

  // Filters
  const [proposalSearch, setProposalSearch] = useState("");
  const [reviewerSearch, setReviewerSearch] = useState("");
  const [expertiseFilter, setExpertiseFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  // Pagination
  const [proposalPage, setProposalPage] = useState(1);
  const [proposalTotalPages, setProposalTotalPages] = useState(1);
  const [reviewerPage, setReviewerPage] = useState(1);
  const [reviewerTotalPages, setReviewerTotalPages] = useState(1);
  const [allReviewers, setAllReviewers] = useState([]);

  const PROPOSALS_PER_PAGE = 5;
  const REVIEWERS_PER_PAGE = 5;

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`
  });

  // Fetch unassigned proposals with backend pagination
  const fetchProposals = useCallback(async (page = 1, search = "") => {
    try {
      setProposalsLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/admin/unassigned-proposals?page=${page}&limit=${PROPOSALS_PER_PAGE}&search=${search}`,
        { headers: getAuthHeaders() }
      );
      setProposals(res.data.proposals || []);
      setProposalTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Error fetching proposals:", err);
      toast.error("Failed to load proposals");
    } finally {
      setProposalsLoading(false);
    }
  }, []);

  // Fetch all reviewers (without pagination for filtering)
  const fetchAllReviewers = useCallback(async () => {
    try {
      setReviewersLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/admin/reviewers?page=1&limit=100&sortBy=currentWorkload&sortOrder=asc`,
        { headers: getAuthHeaders() }
      );
      setAllReviewers(res.data.reviewers || []);
      return res.data.reviewers || [];
    } catch (err) {
      console.error("Error fetching reviewers:", err);
      toast.error("Failed to load reviewers");
      return [];
    } finally {
      setReviewersLoading(false);
    }
  }, []);

  // Apply filters and client-side pagination to reviewers
  const applyFilters = useCallback(() => {
    let filtered = [...allReviewers];
    
    // Search filter
    if (reviewerSearch) {
      const searchLower = reviewerSearch.toLowerCase();
      filtered = filtered.filter(r => 
        r.name?.toLowerCase().includes(searchLower) ||
        r.email?.toLowerCase().includes(searchLower) ||
        r.expertise?.some(e => e.toLowerCase().includes(searchLower))
      );
    }
    
    // Expertise filter
    if (expertiseFilter !== "all") {
      filtered = filtered.filter(r => r.expertise?.includes(expertiseFilter));
    }
    
    // Availability filter
    if (availabilityFilter === "available") {
      filtered = filtered.filter(r => (r.currentWorkload || 0) < 3);
    } else if (availabilityFilter === "busy") {
      filtered = filtered.filter(r => (r.currentWorkload || 0) >= 3 && (r.currentWorkload || 0) < 5);
    } else if (availabilityFilter === "overloaded") {
      filtered = filtered.filter(r => (r.currentWorkload || 0) >= 5);
    }
    
    // Client-side pagination
    const totalFiltered = filtered.length;
    const start = (reviewerPage - 1) * REVIEWERS_PER_PAGE;
    const paginated = filtered.slice(start, start + REVIEWERS_PER_PAGE);
    
    setReviewers(paginated);
    setReviewerTotalPages(Math.ceil(totalFiltered / REVIEWERS_PER_PAGE) || 1);
  }, [allReviewers, reviewerSearch, expertiseFilter, availabilityFilter, reviewerPage]);

  // Initial load
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchProposals(1, ""), fetchAllReviewers()]);
      setLoading(false);
    };
    load();
  }, []);

  // Apply filters when dependencies change
  useEffect(() => {
    if (!loading) {
      applyFilters();
    }
  }, [reviewerSearch, expertiseFilter, availabilityFilter, reviewerPage, allReviewers, loading]);

  // Handle proposal search
  const handleProposalSearch = (search) => {
    setProposalSearch(search);
    setProposalPage(1);
    fetchProposals(1, search);
  };

  // Handle proposal page change
  const handleProposalPageChange = (page) => {
    setProposalPage(page);
    fetchProposals(page, proposalSearch);
  };

  // Handle reviewer page change
  const handleReviewerPageChange = (page) => {
    setReviewerPage(page);
  };

  // Handle assign click
  const handleAssignClick = (reviewer) => {
    if (!selectedProposal) {
      toast.error("Please select a proposal first");
      return;
    }
    setSelectedReviewer(reviewer);
    setShowConfirmModal(true);
  };

  // Confirm assignment
  const handleConfirmAssign = async () => {
    if (!selectedProposal || !selectedReviewer) return;
    
    setAssigningId(selectedReviewer.id);
    try {
      await axios.put(
        `${API_BASE_URL}/api/projects/assign-reviewer/${selectedProposal.id}`,
        { reviewerId: selectedReviewer.id },
        { headers: getAuthHeaders() }
      );
      
      toast.success(`Assigned to ${selectedReviewer.name} successfully!`);
      setShowConfirmModal(false);
      setSelectedProposal(null);
      setSelectedReviewer(null);
      
      // Refresh both lists
      await Promise.all([
        fetchProposals(proposalPage, proposalSearch),
        fetchAllReviewers()
      ]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Assignment failed");
    } finally {
      setAssigningId(null);
    }
  };

  const allExpertise = [...new Set(allReviewers.flatMap(r => r.expertise || []))];

  // Show loading skeletons
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar onLogout={onLogout} user={user} />
        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <div className="h-8 bg-gray-200 rounded w-64 animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-200 bg-gray-50">
                  <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-64 mt-1 animate-pulse"></div>
                </div>
                {[1, 2, 3, 4, 5].map(i => <ProposalCardSkeleton key={i} />)}
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-200 bg-gray-50">
                  <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-64 mt-1 animate-pulse"></div>
                </div>
                {[1, 2, 3, 4, 5].map(i => <ReviewerCardSkeleton key={i} />)}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      <AdminSidebar onLogout={onLogout} user={user} />

      <main className="flex-1 px-4 md:px-8 py-6 md:py-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Reviewer Assignment</h1>
            <p className="text-sm text-gray-500 mt-1">Assign reviewers to research proposals</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            
            {/* LEFT: Unassigned Proposals */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-800">Unassigned Proposals</h2>
                <p className="text-xs text-gray-500">Select a proposal to assign a reviewer</p>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by title, code, or scientist..."
                    value={proposalSearch}
                    onChange={(e) => handleProposalSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* List */}
              <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {proposalsLoading ? (
                  [...Array(5)].map((_, i) => <ProposalCardSkeleton key={i} />)
                ) : proposals.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">No unassigned proposals</p>
                  </div>
                ) : (
                  proposals.map(p => (
                    <ProposalCard
                      key={p.id}
                      proposal={p}
                      isSelected={selectedProposal?.id === p.id}
                      onSelect={setSelectedProposal}
                    />
                  ))
                )}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={proposalPage}
                totalPages={proposalTotalPages}
                onPageChange={handleProposalPageChange}
                isLoading={proposalsLoading}
              />
            </div>

            {/* RIGHT: Available Reviewers */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-800">Available Reviewers</h2>
                <p className="text-xs text-gray-500">Select a reviewer to assign</p>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or expertise..."
                    value={reviewerSearch}
                    onChange={(e) => setReviewerSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={expertiseFilter}
                    onChange={(e) => setExpertiseFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Expertise</option>
                    {allExpertise.map(exp => (
                      <option key={exp} value={exp}>{exp.replaceAll("_", " ")}</option>
                    ))}
                  </select>
                  <select
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Availability</option>
                    <option value="available">Available (0-2)</option>
                    <option value="busy">Busy (3-4)</option>
                    <option value="overloaded">Overloaded (5+)</option>
                  </select>
                </div>
              </div>

              {/* Selected Proposal Badge */}
              {selectedProposal && (
                <div className="m-4 p-3 bg-blue-50 rounded-lg border border-blue-200 animate-fade-in">
                  <p className="text-xs font-medium text-blue-800 truncate">
                    Assigning to: {selectedProposal.title}
                  </p>
                </div>
              )}

              {/* No Proposal Selected */}
              {!selectedProposal && (
                <div className="m-4 p-8 text-center text-gray-400 bg-gray-50 rounded-lg">
                  <UserPlus className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">No proposal selected</p>
                  <p className="text-xs mt-1">Select a proposal from the left panel first</p>
                </div>
              )}

              {/* Reviewers List */}
              {selectedProposal && (
                <>
                  <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto p-4 space-y-3">
                    {reviewersLoading ? (
                      [...Array(5)].map((_, i) => <ReviewerCardSkeleton key={i} />)
                    ) : reviewers.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <p className="text-sm">No reviewers match your filters</p>
                      </div>
                    ) : (
                      reviewers.map(r => (
                        <ReviewerCard
                          key={r.id}
                          reviewer={r}
                          onAssign={handleAssignClick}
                          isAssigning={assigningId === r.id}
                        />
                      ))
                    )}
                  </div>

                  <Pagination
                    currentPage={reviewerPage}
                    totalPages={reviewerTotalPages}
                    onPageChange={handleReviewerPageChange}
                    isLoading={reviewersLoading}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedReviewer && (
        <ConfirmAssignModal
          project={selectedProposal}
          reviewer={selectedReviewer}
          onConfirm={handleConfirmAssign}
          onCancel={() => {
            setShowConfirmModal(false);
            setSelectedReviewer(null);
          }}
        />
      )}
    </div>
  );
}