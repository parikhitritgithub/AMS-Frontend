import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReviewerSidebar from "./ReviewerSidebar";
import LoadingScreen from "../../components/common/Loadingscreen";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, ArrowLeft, AlertTriangle, RefreshCw, Clock, Calendar, User, Mail, Building, Award, FileText, DollarSign, Users, TrendingUp } from "lucide-react";
import axios from "axios";

// ── Similarity score ring ──────────────────────────────────────────────────
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

export default function ReviewDetail({ onLogout }) {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [canSubmitReview, setCanSubmitReview] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [reviewHistory, setReviewHistory] = useState([]);
  const [timeStats, setTimeStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800">Review Proposal</h1>
                  <StatusBadge status={project.status} />
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

            {/* Left Column - Proposal Details (2/3 width) */}
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

              {/* Review Comments Section */}
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
                  disabled={!canSubmitReview || alreadyReviewed}
                  placeholder={canSubmitReview ? "Enter your review comments, suggestions, or concerns (minimum 10 characters)" : "This proposal cannot be reviewed at this stage"}
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50 disabled:text-gray-400"
                />

                {canSubmitReview && !alreadyReviewed && (
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

                {alreadyReviewed && (
                  <p className="mt-3 text-xs font-medium text-blue-600">
                    ✓ You have already reviewed this proposal. Your review has been recorded.
                  </p>
                )}
                
                {!canSubmitReview && !alreadyReviewed && (
                  <p className="mt-3 text-xs font-medium text-yellow-600">
                    ⚠ This proposal cannot be reviewed at its current stage: <strong>{project.status?.replaceAll("_", " ")}</strong>
                  </p>
                )}
              </InfoCard>

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

            {/* Right Column - Sidebar (1/3 width) */}
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
    </div>
  );
}

// ── Helper Component ───────────────────────────────────────────────────────
function Field({ label, value, className = "" }) {
  return (
    <div className={className}>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-800">{value || "—"}</p>
    </div>
  );
}

// Missing icon component
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