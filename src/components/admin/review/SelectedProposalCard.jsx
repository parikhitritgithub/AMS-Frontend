// components/admin/review/SelectedProposalCard.jsx
import { Search, User, Calendar, BookOpen, Award, Users, Mail, CheckCircle, Clock, XCircle, X } from "lucide-react";

export default function SelectedProposalCard({
  proposalDetails,
  selectedProject,
  setSelectedProject,
  unassignedProjects,
  searchTerm,
  setSearchTerm,
}) {
  const getStatusInfo = (status) => {
    const statusMap = {
      PENDING: { color: "bg-yellow-100 text-yellow-700", icon: Clock, label: "Pending Review" },
      UNDER_REVIEW: { color: "bg-blue-100 text-blue-700", icon: Clock, label: "Under Review" },
      APPROVED: { color: "bg-green-100 text-green-700", icon: CheckCircle, label: "Approved" },
      REJECTED: { color: "bg-red-100 text-red-700", icon: XCircle, label: "Rejected" },
      REVISION_REQUIRED: { color: "bg-orange-100 text-orange-700", icon: Clock, label: "Revision Required" },
    };
    return statusMap[status] || { color: "bg-gray-100 text-gray-700", icon: Clock, label: status || "Unknown" };
  };

  const assignedReviewer = proposalDetails?.project?.assignedReviewer;
  const projectStatus = proposalDetails?.project?.status || selectedProject?.status;
  const statusInfo = getStatusInfo(projectStatus);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="flex flex-col gap-4 sticky top-6">

      {/* ── Card 1: Proposal Picker ── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Select Proposal</h2>
          <p className="text-xs text-gray-500 mt-0.5">Choose a proposal to assign reviewers</p>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search proposals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Proposal List */}
        <div className="max-h-[320px] overflow-y-auto divide-y divide-gray-100">
          {unassignedProjects.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No proposals found</p>
            </div>
          ) : (
            unassignedProjects.map((project) => {
              const isSelected = selectedProject?.id === project.id;
              return (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`w-full text-left p-4 transition-all hover:bg-gray-50 relative ${
                    isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : "border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">{project.title}</p>
                      <p className="text-xs font-mono text-gray-500">{project.uniqueCode}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <User size={11} />
                        By {project.submittedBy?.name || "Unknown"}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Card 2: Proposal Summary (only when selected) ── */}
      {selectedProject && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">
            <Award size={16} className="text-blue-500" />
            Proposal Summary
          </h3>

          <div className="space-y-3 text-sm">
            {/* Proposal ID */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Proposal ID</p>
              <p className="font-mono text-gray-800 text-sm">{selectedProject.uniqueCode}</p>
            </div>

            {/* Title */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Title</p>
              <p className="font-semibold text-gray-800">{selectedProject.title}</p>
            </div>

            {/* Scientist */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Scientist</p>
              <p className="text-gray-700">{selectedProject.submittedBy?.name}</p>
              {selectedProject.submittedBy?.email && (
                <p className="text-xs text-gray-400">{selectedProject.submittedBy.email}</p>
              )}
            </div>

            {/* Discipline */}
            {selectedProject.discipline && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Discipline</p>
                <span className="inline-block px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                  {selectedProject.discipline}
                </span>
              </div>
            )}

            {/* Description */}
            {selectedProject.introduction && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Description</p>
                <p className="text-xs text-gray-600 line-clamp-3">{selectedProject.introduction}</p>
              </div>
            )}

            {/* Assigned Reviewer */}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                  Assigned Reviewers ({assignedReviewer ? 1 : 0})
                </p>
              </div>

              {assignedReviewer ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{assignedReviewer.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Mail size={11} />
                        {assignedReviewer.email}
                      </p>
                    </div>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                      <StatusIcon size={11} />
                      {statusInfo.label}
                    </span>
                  </div>
                  {assignedReviewer.currentWorkload !== undefined && (
                    <div className="mt-2 pt-2 border-t border-green-200 flex gap-3 text-xs text-gray-600">
                      <span>Workload: <strong>{assignedReviewer.currentWorkload || 0}</strong></span>
                      <span>Completed: <strong>{assignedReviewer.completedReviews || 0}</strong></span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 font-medium italic">No reviewers assigned yet</p>
                </div>
              )}
            </div>

            {/* Recent Reviews */}
            {proposalDetails?.reviews?.length > 0 && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">Recent Reviews</p>
                <div className="space-y-2">
                  {proposalDetails.reviews.slice(0, 2).map((review, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-2 text-xs border border-gray-100">
                      <p className="text-gray-600 line-clamp-2">{review.comment || "No comment"}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-gray-400">By {review.reviewer?.name || "Unknown"}</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                          review.decision === "APPROVED" ? "bg-green-100 text-green-700" :
                          review.decision === "REJECTED" ? "bg-red-100 text-red-700" :
                          "bg-orange-100 text-orange-700"
                        }`}>
                          {review.decision}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}