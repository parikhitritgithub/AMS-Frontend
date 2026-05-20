import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle, XCircle, Clock, Calendar, User, Mail, Building, FileText, DollarSign, Users, TrendingUp, RefreshCw, AlertTriangle, Eye } from "lucide-react";

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

export default function ProposalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/admin/projects/id/${id}`,
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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Header */}
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
              <button
                onClick={() => navigate("/admin/proposals")}
                className="flex items-center gap-1 text-blue-500 text-sm hover:underline"
              >
                <ArrowLeft size={14} /> Back to Proposals
              </button>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Scientist Information */}
              <InfoCard title="Principal Investigator" icon={User}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400">Name</p>
                    <p className="text-sm font-medium text-gray-800">{proposal.submittedBy?.name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm text-gray-600">{proposal.submittedBy?.email || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Institution</p>
                    <p className="text-sm text-gray-600">{proposal.submittedBy?.institution || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Department</p>
                    <p className="text-sm text-gray-600">{proposal.submittedBy?.department || "—"}</p>
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
                        {review.score && <p className="text-xs text-gray-500 mt-1">Score: {review.score}/10</p>}
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
                </div>

                {proposal.similarityMatches && proposal.similarityMatches.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Similar Projects Found</p>
                    <div className="space-y-2">
                      {proposal.similarityMatches.slice(0, 3).map((match, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-2">
                          <p className="text-xs font-medium text-gray-700 truncate">{match.projectId?.title || "Unknown"}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500">{match.projectId?.uniqueCode}</span>
                            <span className="text-xs font-semibold text-orange-500">{match.score}% match</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

              {/* Review Statistics */}
              {proposal.reviewCount > 0 && (
                <InfoCard title="Review Statistics" icon={Award}>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Total Reviews</span>
                      <span className="text-sm font-semibold">{proposal.reviewCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Approved</span>
                      <span className="text-sm text-green-600">
                        {proposal.reviews?.filter(r => r.decision === "APPROVED").length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Rejected</span>
                      <span className="text-sm text-red-600">
                        {proposal.reviews?.filter(r => r.decision === "REJECTED").length || 0}
                      </span>
                    </div>
                  </div>
                </InfoCard>
              )}

              {/* Assigned Reviewer */}
              {proposal.assignedReviewer && (
                <InfoCard title="Assigned Reviewer" icon={User}>
                  <p className="text-sm font-medium text-gray-800">{proposal.assignedReviewer.name}</p>
                  <p className="text-xs text-gray-500">{proposal.assignedReviewer.email}</p>
                  {proposal.assignedReviewer.institution && (
                    <p className="text-xs text-gray-400 mt-1">{proposal.assignedReviewer.institution}</p>
                  )}
                </InfoCard>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
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

function Award({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 18} height={size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="8" r="6"/>
      <path d="M5.5 18.5L8 15h8l2.5 3.5"/>
      <path d="M12 14v4"/>
      <path d="M8 22h8"/>
    </svg>
  );
}