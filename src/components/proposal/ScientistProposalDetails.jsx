import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { 
  ArrowLeft, Edit, Save, X, CheckCircle, XCircle, Clock, Calendar, User, 
  FileText, DollarSign, Users, TrendingUp, RefreshCw, AlertTriangle, Eye, Send
} from "lucide-react";

import Sidebar from "../../components/common/Sidebar";

// Status Badge Component
function StatusBadge({ status }) {
  const statusConfig = {
    DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-700", icon: FileText },
    SUBMITTED: { label: "Submitted", color: "bg-purple-100 text-purple-700", icon: Clock },
    UNDER_REVIEW: { label: "Under Review", color: "bg-blue-100 text-blue-700", icon: RefreshCw },
    APPROVED: { label: "Approved", color: "bg-green-100 text-green-700", icon: CheckCircle },
    REJECTED: { label: "Rejected", color: "bg-red-100 text-red-700", icon: XCircle },
    REVISION_REQUIRED: { label: "Revision Required", color: "bg-yellow-100 text-yellow-700", icon: RefreshCw },
  };
  
  const config = statusConfig[status] || statusConfig.DRAFT;
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}

// Similarity Ring Component - Updated to handle draft state
function SimilarityRing({ score, isDraft }) {
  // If draft, show "Not Available" instead of 0%
  if (isDraft) {
    return (
      <div className="flex flex-col items-center">
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-2">Similarity Score</div>
          <div className="text-2xl font-bold text-gray-400">N/A</div>
          <p className="text-xs text-gray-400 mt-2">Submit to generate similarity score</p>
        </div>
      </div>
    );
  }

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

// Helper Components
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

export default function ScientistProposalDetails({ onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProposal, setEditedProposal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        const response = await axios.get(
          `${API_BASE_URL}/api/scientist/project/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setProposal(response.data);
        setEditedProposal(response.data);
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

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProposal({ ...proposal });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedProposal({ ...proposal });
  };

  // Save changes only (for DRAFT projects - keeps as DRAFT)
  const handleSaveOnly = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.patch(
        `${API_BASE_URL}/api/projects/update/${id}`,
        editedProposal,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("Changes saved successfully!");
      
      // Update state with the saved data
      const updatedProposal = { ...proposal, ...response.data.project };
      setProposal(updatedProposal);
      setEditedProposal(updatedProposal);
      setIsEditing(false);
      
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error.response?.data?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Save and Submit for DRAFT projects
  const handleSaveAndSubmit = async () => {
    // Validate required fields
    if (!editedProposal.title || !editedProposal.introduction || !editedProposal.actionPlan || !editedProposal.expectedOutcome) {
      toast.error("Please fill all required fields before submitting");
      return;
    }
    
    if (!editedProposal.objectives || editedProposal.objectives.length === 0) {
      toast.error("At least one objective is required");
      return;
    }
    
    if (!editedProposal.stationOrCollege) {
      toast.error("Station/College is required");
      return;
    }
    
    if (!editedProposal.discipline) {
      toast.error("Discipline is required");
      return;
    }
    
    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      
      // First, save the updated changes
      await axios.patch(
        `${API_BASE_URL}/api/projects/update/${id}`,
        editedProposal,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Then, submit the draft (this endpoint runs similarity check)
      const response = await axios.post(
        `${API_BASE_URL}/api/projects/draft/${id}/submit`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(response.data.message || "Proposal submitted successfully!");
      setIsEditing(false);
      
      // Refresh proposal data
      const updatedProposal = await axios.get(
        `${API_BASE_URL}/api/scientist/project/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProposal(updatedProposal.data);
      setEditedProposal(updatedProposal.data);
      
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error.response?.data?.message || "Failed to submit proposal");
    } finally {
      setSubmitting(false);
    }
  };

  // Resubmit for REVISION_REQUIRED projects
  const handleResubmit = async () => {
    // Validate required fields
    if (!editedProposal.title || !editedProposal.introduction || !editedProposal.actionPlan || !editedProposal.expectedOutcome) {
      toast.error("Please fill all required fields before resubmitting");
      return;
    }
    
    if (!editedProposal.objectives || editedProposal.objectives.length === 0) {
      toast.error("At least one objective is required");
      return;
    }
    
    if (!editedProposal.stationOrCollege) {
      toast.error("Station/College is required");
      return;
    }
    
    if (!editedProposal.discipline) {
      toast.error("Discipline is required");
      return;
    }
    
    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      
      // First, save the updated changes
      await axios.patch(
        `${API_BASE_URL}/api/projects/update/${id}`,
        editedProposal,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Then, resubmit for review (for REVISION_REQUIRED projects)
      const response = await axios.patch(
        `${API_BASE_URL}/api/projects/resubmit/${id}`,
        { keepSameReviewer: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(response.data.message || "Proposal resubmitted successfully!");
      setIsEditing(false);
      
      // Refresh proposal data
      const updatedProposal = await axios.get(
        `${API_BASE_URL}/api/scientist/project/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProposal(updatedProposal.data);
      setEditedProposal(updatedProposal.data);
      
    } catch (error) {
      console.error("Resubmit error:", error);
      toast.error(error.response?.data?.message || "Failed to resubmit proposal");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedProposal(prev => ({ ...prev, [field]: value }));
  };

  const handleObjectiveChange = (index, value) => {
    const newObjectives = [...(editedProposal.objectives || [])];
    newObjectives[index] = value;
    setEditedProposal(prev => ({ ...prev, objectives: newObjectives }));
  };

  const addObjective = () => {
    setEditedProposal(prev => ({
      ...prev,
      objectives: [...(prev.objectives || []), ""]
    }));
  };

  const removeObjective = (index) => {
    const newObjectives = [...(editedProposal.objectives || [])];
    newObjectives.splice(index, 1);
    setEditedProposal(prev => ({ ...prev, objectives: newObjectives }));
  };

  const handleBudgetChange = (field, value) => {
    setEditedProposal(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        [field]: parseFloat(value) || 0
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen font-sans bg-gray-100">
        <Sidebar onLogout={onLogout} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-8">
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
      <div className="flex min-h-screen font-sans bg-gray-100">
        <Sidebar onLogout={onLogout} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <p className="text-red-500 mb-4">{error || "Proposal not found"}</p>
              <button
                onClick={() => navigate("/myproposals")}
                className="text-blue-500 hover:underline"
              >
                ← Back to My Proposals
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const shouldShowReviewer = ["UNDER_REVIEW", "APPROVED", "REJECTED", "REVISION_REQUIRED"].includes(proposal.status);
  const canEdit = proposal.status === "REVISION_REQUIRED" || proposal.status === "DRAFT";
  const isDraft = proposal.status === "DRAFT";
  const isRevisionRequired = proposal.status === "REVISION_REQUIRED";

  return (
    <div className="flex min-h-screen font-sans bg-gray-100">
      <Sidebar onLogout={onLogout} />

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
                  <span className="mx-2">•</span>
                  <span>{proposal.proposalType || "NEW"}</span>
                </p>
              </div>
              <div className="flex gap-2">
                {canEdit && !isEditing && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Edit size={16} />
                    Edit Proposal
                  </button>
                )}
                <button
                  onClick={() => navigate("/myproposals")}
                  className="flex items-center gap-1 text-blue-500 text-sm hover:underline"
                >
                  <ArrowLeft size={14} /> Back to list
                </button>
              </div>
            </div>
          </div>

          {/* Main Content - 2 Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Scientist Information */}
              <InfoCard title="Submitted By (Principal Scientist)" icon={User}>
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
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Project Title *</label>
                      <input
                        type="text"
                        value={editedProposal.title || ""}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Discipline *</label>
                      <select
                        value={editedProposal.discipline || ""}
                        onChange={(e) => handleInputChange("discipline", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="">Select Discipline</option>
                        <option value="COMPUTER_SCIENCE">Computer Science</option>
                        <option value="AGRICULTURE">Agriculture</option>
                        <option value="BIOTECHNOLOGY">Biotechnology</option>
                        <option value="MECHANICAL">Mechanical</option>
                        <option value="CIVIL">Civil</option>
                        <option value="Soil Science">Soil Science</option>
                        <option value="Crop Science">Crop Science</option>
                        <option value="Forestry">Forestry</option>
                        <option value="Food Technology">Food Technology</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Station/College *</label>
                      <input
                        type="text"
                        value={editedProposal.stationOrCollege || ""}
                        onChange={(e) => handleInputChange("stationOrCollege", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Year *</label>
                      <input
                        type="number"
                        value={editedProposal.year || new Date().getFullYear()}
                        onChange={(e) => handleInputChange("year", parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Introduction & Rationale *</label>
                      <textarea
                        value={editedProposal.introduction || ""}
                        onChange={(e) => handleInputChange("introduction", e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Action Plan *</label>
                      <textarea
                        value={editedProposal.actionPlan || ""}
                        onChange={(e) => handleInputChange("actionPlan", e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Expected Outcome *</label>
                      <textarea
                        value={editedProposal.expectedOutcome || ""}
                        onChange={(e) => handleInputChange("expectedOutcome", e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Objectives *</label>
                      {(editedProposal.objectives || []).map((obj, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={obj}
                            onChange={(e) => handleObjectiveChange(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                          <button onClick={() => removeObjective(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      <button onClick={addObjective} className="text-blue-500 text-sm hover:underline mt-2">
                        + Add Objective
                      </button>
                    </div>
                  </div>
                ) : (
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
                )}
              </InfoCard>

              {/* Budget Details */}
              {proposal.budget && (
                <InfoCard title="Budget Breakdown" icon={DollarSign}>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500">Non Recurring</label>
                          <input type="number" value={editedProposal.budget?.nonRecurring || 0} onChange={(e) => handleBudgetChange("nonRecurring", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Recurring Contingency</label>
                          <input type="number" value={editedProposal.budget?.recurringContingency || 0} onChange={(e) => handleBudgetChange("recurringContingency", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Travelling Allowances</label>
                          <input type="number" value={editedProposal.budget?.travellingAllowances || 0} onChange={(e) => handleBudgetChange("travellingAllowances", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Operational Expenses</label>
                          <input type="number" value={editedProposal.budget?.operationalExpenses || 0} onChange={(e) => handleBudgetChange("operationalExpenses", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Manpower</label>
                          <input type="number" value={editedProposal.budget?.manpower || 0} onChange={(e) => handleBudgetChange("manpower", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                      </div>
                    </div>
                  ) : (
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
                  )}
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
                        {review.score && <p className="text-xs text-gray-500 mt-1">Score: {review.score}/10</p>}
                        <p className="text-xs text-gray-400 mt-1">Reviewed by: {review.reviewedBy?.name}</p>
                      </div>
                    ))}
                  </div>
                </InfoCard>
              )}

              {/* Edit Actions */}
              {isEditing && (
                <div className="flex gap-3">
                  <button 
                    onClick={handleSaveOnly} 
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                  >
                    {saving ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                  
                  {/* Show different submit button based on status */}
                  {isDraft ? (
                    <button 
                      onClick={handleSaveAndSubmit} 
                      disabled={submitting}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Save & Submit
                        </>
                      )}
                    </button>
                  ) : isRevisionRequired ? (
                    <button 
                      onClick={handleResubmit} 
                      disabled={submitting}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          Resubmitting...
                        </>
                      ) : (
                        <>
                          <RefreshCw size={16} />
                          Save & Resubmit
                        </>
                      )}
                    </button>
                  ) : null}
                  
                  <button 
                    onClick={handleCancelEdit} 
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Status Messages */}
              {isRevisionRequired && !isEditing && (
                <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-5">
                  <h3 className="font-semibold text-yellow-800 text-base mb-2 flex items-center gap-2">
                    <RefreshCw size={18} /> Revision Required
                  </h3>
                  <p className="text-yellow-700 text-sm mb-4">The reviewer has requested changes to your proposal. Please review their comments and make necessary revisions.</p>
                  <button onClick={handleEdit} className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                    <Edit size={16} /> Edit and Resubmit
                  </button>
                </div>
              )}

              {isDraft && !isEditing && (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                  <h3 className="font-semibold text-gray-800 text-base mb-2 flex items-center gap-2">
                    <FileText size={18} /> Draft Mode
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">This proposal is in draft mode. You can edit and submit it when ready.</p>
                  <button onClick={handleEdit} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    <Edit size={16} /> Edit Draft
                  </button>
                </div>
              )}

              {proposal.status === "UNDER_REVIEW" && (
                <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
                  <h3 className="font-semibold text-blue-800 text-base mb-2">Under Review</h3>
                  <p className="text-blue-700 text-sm">Your proposal is currently being reviewed by the assigned reviewer. You will be notified once the review is complete.</p>
                </div>
              )}

              {proposal.status === "SUBMITTED" && (
                <div className="bg-purple-50 rounded-xl border border-purple-200 p-5">
                  <h3 className="font-semibold text-purple-800 text-base mb-2">Awaiting Reviewer Assignment</h3>
                  <p className="text-purple-700 text-sm">Your proposal has been submitted and is waiting for an admin to assign a reviewer.</p>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar - Simplified for Scientist */}
            <div className="space-y-4">
              
              {/* Similarity Analysis - Only score, no detailed matches */}
              <InfoCard title="Similarity Analysis" icon={TrendingUp}>
                <div className="text-center">
                  <SimilarityRing score={proposal.similarityScore} isDraft={isDraft} />
                  {!isDraft && proposal.similarityScore >= 70 && (
                    <div className="mt-3 flex items-center justify-center gap-1 bg-red-50 text-red-700 text-xs font-semibold px-3 py-2 rounded-full">
                      <AlertTriangle size={12} /> High Similarity Detected
                    </div>
                  )}
                  {!isDraft && proposal.similarityScore >= 40 && proposal.similarityScore < 70 && (
                    <div className="mt-3 flex items-center justify-center gap-1 bg-yellow-50 text-yellow-700 text-xs font-semibold px-3 py-2 rounded-full">
                      <AlertTriangle size={12} /> Moderate Similarity Detected
                    </div>
                  )}
                  {!isDraft && proposal.similarityScore < 40 && proposal.similarityScore > 0 && (
                    <div className="mt-3 flex items-center justify-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-3 py-2 rounded-full">
                      ✓ Low Similarity
                    </div>
                  )}
                  {isDraft && (
                    <div className="mt-3 flex items-center justify-center gap-1 bg-gray-50 text-gray-500 text-xs font-semibold px-3 py-2 rounded-full">
                      ⏳ Submit to generate score
                    </div>
                  )}
                </div>
                {/* Removed the detailed similarity matches list - scientists only see the score */}
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

              {/* Review Statistics - Only show if exists */}
              {proposal.reviewStats && proposal.reviewStats.totalReviews > 0 && (
                <InfoCard title="Review Statistics" icon={Award}>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Total Reviews</span>
                      <span className="text-sm font-semibold">{proposal.reviewStats.totalReviews}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Approved</span>
                      <span className="text-sm text-green-600">{proposal.reviewStats.approvedCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Rejected</span>
                      <span className="text-sm text-red-600">{proposal.reviewStats.rejectedCount}</span>
                    </div>
                    {proposal.reviewStats.averageScore && (
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-xs font-semibold">Average Score</span>
                        <span className="text-sm font-bold text-blue-600">{proposal.reviewStats.averageScore}/10</span>
                      </div>
                    )}
                  </div>
                </InfoCard>
              )}

              {/* Time Statistics - Only show if exists */}
              {proposal.timeStats && (proposal.timeStats.submissionToAssignment || proposal.timeStats.totalTime) && (
                <InfoCard title="Time Statistics" icon={Clock}>
                  <div className="space-y-2">
                    {proposal.timeStats.submissionToAssignment && (
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Submission to Assignment</span>
                        <span className="text-sm font-semibold">{proposal.timeStats.submissionToAssignment} days</span>
                      </div>
                    )}
                    {proposal.timeStats.totalTime && (
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-xs font-semibold">Total Processing</span>
                        <span className="text-sm font-bold text-blue-600">{proposal.timeStats.totalTime} days</span>
                      </div>
                    )}
                  </div>
                </InfoCard>
              )}

              {/* Assigned Reviewer - Only show after review starts */}
              {shouldShowReviewer && proposal.assignedReviewer && (
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