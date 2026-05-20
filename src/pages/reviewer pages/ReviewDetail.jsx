import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReviewerSidebar from "./ReviewerSidebar";
import LoadingScreen from "../../components/common/Loadingscreen";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, ArrowLeft, AlertTriangle, RefreshCw, Clock, Calendar, User, FileText, DollarSign, Users, TrendingUp, Maximize2, ExternalLink, Search, X } from "lucide-react";
import axios from "axios";

// ── Similarity score ring ──────────────────────────────────────────────────
function SimilarityRing({ score }) {
  const pct = Math.min(100, score || 0);
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

// ── Status Badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const statusMap = {
    DRAFT: "bg-gray-100 text-gray-600",
    SUBMITTED: "bg-purple-100 text-purple-700",
    UNDER_REVIEW: "bg-blue-100 text-blue-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    REVISION_REQUIRED: "bg-yellow-100 text-yellow-700",
  };
  const displayStatus = status?.replaceAll("_", " ") || "—";
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusMap[status] ?? "bg-gray-100 text-gray-600"}`}>
      {displayStatus}
    </span>
  );
}

// ── Info Card Component ────────────────────────────────────────────────────
function InfoCard({ title, icon: Icon, children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
        <Icon size={18} className="text-blue-500" />
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ── Timeline Item Component ────────────────────────────────────────────────
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

// ── Similarity Modal Component (Read-only with view in new tab) ──────────────────
function SimilarityModal({ matches, onClose, currentProjectTitle }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [sortOrder, setSortOrder] = useState("desc");

  const filteredMatches = matches.filter(match => 
    match.projectId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.matchedTextPreview?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedMatches = [...filteredMatches].sort((a, b) => {
    let aVal, bVal;
    if (sortBy === "score") {
      aVal = a.score || 0;
      bVal = b.score || 0;
    } else if (sortBy === "title") {
      aVal = (a.projectId?.title || a.matchedTextPreview || "").toLowerCase();
      bVal = (b.projectId?.title || b.matchedTextPreview || "").toLowerCase();
    }
    if (sortOrder === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const getScoreBackground = (score) => {
    if (score >= 70) return "bg-red-100 text-red-700";
    if (score >= 40) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  const openInNewTab = (projectId) => {
    if (projectId) {
      window.open(`/reviewer/project/${projectId}`, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Similarity Analysis Details</h2>
            <p className="text-sm text-gray-500 mt-1">
              Comparing with: <span className="font-semibold">{currentProjectTitle}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative col-span-2">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="score">Sort by Score</option>
                <option value="title">Sort by Title</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
          <div className="flex justify-between items-center text-sm">
            <span className="text-blue-700">
              <strong>{filteredMatches.length}</strong> similar projects found
              {searchTerm && ` (filtered from ${matches.length})`}
            </span>
            <span className="text-blue-600">
              Highest match: <strong>{Math.max(...matches.map(m => m.score || 0))}%</strong>
            </span>
          </div>
        </div>

        {/* Matches List - Clickable to open in new tab */}
        <div className="flex-1 overflow-y-auto p-6">
          {sortedMatches.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Search size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No similar projects found</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedMatches.map((match, idx) => (
                <div
                  key={idx}
                  className={`border border-gray-200 rounded-xl p-4 transition-all bg-white ${
                    match.projectId?._id ? 'cursor-pointer hover:shadow-md hover:border-blue-300' : ''
                  }`}
                  onClick={() => match.projectId?._id && openInNewTab(match.projectId._id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800 text-base">
                          {match.projectId?.title || match.matchedTextPreview || "Unknown Project"}
                        </h3>
                        {match.projectId?._id && (
                          <ExternalLink size={14} className="text-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1">
                        {match.projectId?.uniqueCode && (
                          <span className="font-mono">Code: {match.projectId.uniqueCode}</span>
                        )}
                        {match.projectId?.discipline && (
                          <span>Discipline: {match.projectId.discipline.replaceAll("_", " ")}</span>
                        )}
                        {match.projectId?.status && (
                          <span>Status: {match.projectId.status?.replaceAll("_", " ")}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className={`inline-flex flex-col items-center px-4 py-2 rounded-xl ${getScoreBackground(match.score)}`}>
                        <span className="text-2xl font-bold">{match.score}%</span>
                        <span className="text-xs opacity-75">match</span>
                      </div>
                    </div>
                  </div>
                  {match.projectId?._id && (
                    <div className="mt-3 pt-2 text-right">
                      <span className="text-xs text-blue-500 hover:text-blue-700">
                        Click to view in new tab →
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReviewDetail({ onLogout }) {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [canSubmitReview, setCanSubmitReview] = useState(false);
  const [isAssignedToMe, setIsAssignedToMe] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [reviewHistory, setReviewHistory] = useState([]);
  const [timeStats, setTimeStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSimilarityModal, setShowSimilarityModal] = useState(false);

  // ── Fetch project details ────────────────────────────────────────────────
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/reviews/project/${projectId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const data = res.data;
        setProject(data.project);
        setAlreadyReviewed(data.alreadyReviewed);
        setCanSubmitReview(data.canSubmitReview);
        setIsAssignedToMe(data.project.isAssignedToCurrentReviewer || data.statusInfo?.isAssignedToMe || false);
        setReviewHistory(data.reviewHistory || []);
        setTimeStats(data.project.timeStats || {});
        
        if (data.review) {
          setExistingReview(data.review);
          setComment(data.review.comment || "");
        }
      } catch (err) {
        console.error("ReviewDetail fetch error:", err);
        toast.error("Failed to load project details");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  // ── Submit review ────────────────────────────────────────────────────────
  const handleReview = async (decision) => {
    if (!comment.trim()) {
      toast.error("Please add review comments before submitting");
      return;
    }
    
    if (comment.trim().length < 10) {
      toast.error("Comment must be at least 10 characters");
      return;
    }
    
    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/reviews/project/${projectId}/review`,
        { decision, comment: comment.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Review submitted:", res.data);
      toast.success(`Proposal ${decision === "APPROVED" ? "approved" : decision === "REJECTED" ? "rejected" : "revision requested"} successfully`);
      setTimeout(() => navigate("/reviewer/assigned"), 1500);
    } catch (err) {
      console.error("Review submit error:", err);
      const msg = err.response?.data?.message ?? "Failed to submit review";
      
      if (msg.includes("Cannot review project with status")) {
        toast.error("This proposal cannot be reviewed at this stage.");
      } else if (msg.includes("already reviewed")) {
        toast.error("You have already reviewed this proposal.");
      } else if (msg.includes("at least 10 characters")) {
        toast.error("Comment must be at least 10 characters");
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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

  if (!project) {
    return (
      <div className="flex min-h-screen font-sans bg-gray-100">
        <ReviewerSidebar onLogout={onLogout} />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-lg font-semibold mb-2">Project not found</p>
            <button
              onClick={() => navigate("/reviewer/assigned")}
              className="text-blue-600 hover:underline text-sm"
            >
              ← Back to list
            </button>
          </div>
        </main>
      </div>
    );
  }

  const similarity = project.similarityScore ?? 0;
  const similarityMatches = project.similarityMatches || [];

  return (
    <div className="flex min-h-screen font-sans bg-gray-100">
      <ReviewerSidebar onLogout={onLogout} />

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-4">

          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm px-6 md:px-8 py-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800">Proposal Details</h1>
                  <StatusBadge status={project.status} />
                  {!isAssignedToMe && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                      View Only
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  <span className="font-mono">Project Code: {project.uniqueCode || project.id?.slice(-8).toUpperCase()}</span>
                  <span className="mx-2">•</span>
                  <span>Version {project.version || 1}</span>
                </p>
              </div>
              <button
                onClick={() => navigate("/reviewer/assigned")}
                className="flex items-center gap-1 text-blue-500 text-sm hover:underline"
              >
                <ArrowLeft size={14} /> Back to list
              </button>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column - Proposal Details */}
            <div className="lg:col-span-2 space-y-6">

              {/* Scientist Info Card */}
              <InfoCard title="Scientist Information" icon={User}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Name</p>
                    <p className="text-sm font-medium text-gray-800">{project.submittedBy?.name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm text-gray-600">{project.submittedBy?.email || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Institution</p>
                    <p className="text-sm text-gray-600">{project.submittedBy?.institution || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Department</p>
                    <p className="text-sm text-gray-600">{project.submittedBy?.department || "—"}</p>
                  </div>
                </div>
              </InfoCard>

              {/* Proposal Details Card */}
              <InfoCard title="Proposal Details" icon={FileText}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Project Title" value={project.title} />
                    <Field label="Discipline" value={project.discipline?.replaceAll("_", " ")} />
                    <Field label="Station/College" value={project.stationOrCollege} />
                    <Field label="Year" value={project.year} />
                  </div>

                  {project.introduction && (
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">Introduction & Rationale</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{project.introduction}</p>
                    </div>
                  )}

                  {project.actionPlan && (
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">Action Plan</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{project.actionPlan}</p>
                    </div>
                  )}

                  {project.expectedOutcome && (
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">Expected Outcome</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{project.expectedOutcome}</p>
                    </div>
                  )}

                  {project.objectives?.length > 0 && (
                    <div>
                      <p className="font-semibold text-gray-700 mb-2">Objectives</p>
                      <ul className="list-disc list-inside space-y-1">
                        {project.objectives.map((obj, idx) => (
                          <li key={idx} className="text-sm text-gray-600">{obj}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {project.budget && (
                    <div>
                      <p className="font-semibold text-gray-700 mb-2">Budget Details</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <Field label="Non Recurring" value={`₹ ${(project.budget.nonRecurring || 0).toLocaleString("en-IN")}`} />
                          <Field label="Recurring Contingency" value={`₹ ${(project.budget.recurringContingency || 0).toLocaleString("en-IN")}`} />
                          <Field label="Travelling Allowances" value={`₹ ${(project.budget.travellingAllowances || 0).toLocaleString("en-IN")}`} />
                          <Field label="Operational Expenses" value={`₹ ${(project.budget.operationalExpenses || 0).toLocaleString("en-IN")}`} />
                          <Field label="Manpower" value={`₹ ${(project.budget.manpower || 0).toLocaleString("en-IN")}`} />
                          <Field label="Grand Total" value={`₹ ${(project.budget.grandTotal || 0).toLocaleString("en-IN")}`} className="font-bold text-blue-600" />
                        </div>
                      </div>
                    </div>
                  )}

                  {project.scientistInvolve?.length > 0 && (
                    <div>
                      <p className="font-semibold text-gray-700 mb-2">Scientists Involved</p>
                      <div className="space-y-2">
                        {project.scientistInvolve.map((scientist, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-3">
                            <p className="font-medium text-gray-800">{scientist.scientistName}</p>
                            <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                              <span className="text-gray-600">Non Recurring: ₹ {scientist.nonRecurring?.toLocaleString() || 0}</span>
                              <span className="text-gray-600">Recurring: ₹ {scientist.recurringContingency?.toLocaleString() || 0}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </InfoCard>

              {/* Review Comments Section - Only show if assigned */}
             {/* Review Comments Section - Only show if assigned */}
{isAssignedToMe && (
  <InfoCard title="Review Comments" icon={MessageSquare}>
    {alreadyReviewed && existingReview && (
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm font-medium text-blue-800 mb-1">Previous Review</p>
        <p className="text-sm text-blue-700">Decision: <strong>{existingReview.decision?.replaceAll("_", " ")}</strong></p>
        <p className="text-sm text-blue-700 mt-1">{existingReview.comment}</p>
        <p className="text-xs text-blue-500 mt-1">Reviewed on: {new Date(existingReview.reviewedAt).toLocaleString()}</p>
      </div>
    )}
    
    <textarea
      value={comment}
      onChange={(e) => setComment(e.target.value)}
      rows={6}
      disabled={!canSubmitReview}
      placeholder={canSubmitReview ? "Enter your review comments, suggestions, or concerns (minimum 10 characters)" : "This proposal cannot be reviewed at this stage"}
      className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50 disabled:text-gray-400"
    />

    {/* FIXED: Show buttons when canSubmitReview is true, regardless of alreadyReviewed */}
    {canSubmitReview && (
      <div className="flex flex-wrap gap-3 mt-4">
        <button
          onClick={() => handleReview("APPROVED")}
          disabled={submitting}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
        >
          <CheckCircle size={16} /> Approve
        </button>
        <button
          onClick={() => handleReview("REJECTED")}
          disabled={submitting}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
        >
          <XCircle size={16} /> Reject
        </button>
        <button
          onClick={() => handleReview("REVISION_REQUIRED")}
          disabled={submitting}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
        >
          <RefreshCw size={16} /> Request Revision
        </button>
      </div>
    )}

    {/* Show message when review is submitted (success state) */}
    {!canSubmitReview && alreadyReviewed && (
      <p className="mt-3 text-xs font-medium text-green-600">
        ✓ Review submitted successfully! Thank you for your feedback.
      </p>
    )}
    
    {/* Show message when cannot review */}
    {!canSubmitReview && !alreadyReviewed && (
      <p className="mt-3 text-xs font-medium text-yellow-600">
        ⚠ This proposal cannot be reviewed at its current stage: <strong>{project.status?.replaceAll("_", " ")}</strong>
      </p>
    )}
  </InfoCard>
)}

              {/* View Only Message */}
              {!isAssignedToMe && (
                <InfoCard title="Information" icon={InfoIcon}>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">
                      You are viewing this proposal for reference only.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      This proposal is not assigned to you for review.
                    </p>
                  </div>
                </InfoCard>
              )}

              {/* Review History */}
              {reviewHistory.length > 0 && (
                <InfoCard title="Review History" icon={History}>
                  <div className="space-y-3">
                    {reviewHistory.map((review, idx) => (
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
            <div className="space-y-6">

              {/* Similarity Analysis Card */}
              <InfoCard title="Similarity Analysis" icon={TrendingUp}>
                <div className="text-center">
                  <SimilarityRing score={similarity} />
                  {similarity >= 70 && (
                    <div className="mt-3 flex items-center justify-center gap-1 bg-red-50 text-red-700 text-xs font-semibold px-3 py-2 rounded-full">
                      <AlertTriangle size={12} /> High Similarity Detected
                    </div>
                  )}
                  {similarity >= 40 && similarity < 70 && (
                    <div className="mt-3 flex items-center justify-center gap-1 bg-yellow-50 text-yellow-700 text-xs font-semibold px-3 py-2 rounded-full">
                      <AlertTriangle size={12} /> Moderate Similarity Detected
                    </div>
                  )}
                  {similarity < 40 && similarity > 0 && (
                    <div className="mt-3 flex items-center justify-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-3 py-2 rounded-full">
                      ✓ Low Similarity
                    </div>
                  )}
                </div>

                {/* Similar Projects Preview */}
                {similarityMatches.length > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-semibold text-gray-500">
                        Similar Projects Found ({similarityMatches.length})
                      </p>
                      <button
                        onClick={() => setShowSimilarityModal(true)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Maximize2 size={12} />
                        View All Details
                      </button>
                    </div>
                    <div className="space-y-2">
                      {similarityMatches.slice(0, 3).map((match, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-2">
                          <div className="flex justify-between items-center">
                            <p className="text-xs font-medium text-gray-700 truncate flex-1">
                              {match.projectId?.title || match.matchedTextPreview || "Unknown Project"}
                            </p>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ml-2 ${
                              match.score >= 70 ? "bg-red-100 text-red-700" :
                              match.score >= 40 ? "bg-yellow-100 text-yellow-700" :
                              "bg-green-100 text-green-700"
                            }`}>
                              {match.score}%
                            </span>
                          </div>
                        </div>
                      ))}
                      {similarityMatches.length > 3 && (
                        <button
                          onClick={() => setShowSimilarityModal(true)}
                          className="w-full text-center text-xs text-blue-500 hover:text-blue-700 py-1"
                        >
                          + {similarityMatches.length - 3} more similar projects
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </InfoCard>

              {/* Timeline Card */}
              <InfoCard title="Project Timeline" icon={Calendar}>
                <div className="space-y-3">
                  <TimelineItem label="Created" date={project.createdAt} icon={Calendar} />
                  <TimelineItem label="Submitted" date={project.submittedAt} icon={Clock} />
                  <TimelineItem label="Assigned to Reviewer" date={project.assignedAt} icon={User} />
                  <TimelineItem label="Under Review" date={project.underReviewAt} icon={RefreshCw} />
                  <TimelineItem label="Revision Requested" date={project.revisionRequestedAt} icon={RefreshCw} color="text-yellow-500" />
                  <TimelineItem label="Approved" date={project.approvedAt} icon={CheckCircle} color="text-green-500" />
                  <TimelineItem label="Rejected" date={project.rejectedAt} icon={XCircle} color="text-red-500" />
                </div>
              </InfoCard>

              {/* Time Statistics Card */}
              {Object.keys(timeStats).length > 0 && (
                <InfoCard title="Time Statistics" icon={Clock}>
                  <div className="space-y-2">
                    {timeStats.submissionToAssignment && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Submission to Assignment</span>
                        <span className="text-sm font-semibold text-gray-700">{timeStats.submissionToAssignment} days</span>
                      </div>
                    )}
                    {timeStats.assignmentToReview && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Assignment to Review Start</span>
                        <span className="text-sm font-semibold text-gray-700">{timeStats.assignmentToReview} days</span>
                      </div>
                    )}
                    {timeStats.reviewToDecision && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Review to Decision</span>
                        <span className="text-sm font-semibold text-gray-700">{timeStats.reviewToDecision} days</span>
                      </div>
                    )}
                    {timeStats.totalTime && (
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="text-xs font-semibold text-gray-600">Total Time</span>
                        <span className="text-sm font-bold text-blue-600">{timeStats.totalTime} days</span>
                      </div>
                    )}
                  </div>
                </InfoCard>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Similarity Modal */}
      {showSimilarityModal && similarityMatches.length > 0 && (
        <SimilarityModal
          matches={similarityMatches}
          onClose={() => setShowSimilarityModal(false)}
          currentProjectTitle={project.title}
        />
      )}
    </div>
  );
}

// ── Helper Components ───────────────────────────────────────────────────────
function Field({ label, value, className = "" }) {
  return (
    <div className={className}>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-800">{value || "—"}</p>
    </div>
  );
}

function MessageSquare({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 18} height={size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

function History({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 18} height={size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
      <path d="M12 7v5l4 2"/>
    </svg>
  );
}

function InfoIcon({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 18} height={size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  );
}