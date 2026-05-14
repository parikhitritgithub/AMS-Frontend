// components/admin/review/ReviewerTable.jsx
import { Search, UserPlus, Briefcase, CheckCircle, AlertCircle, Clock, X } from "lucide-react";

export default function ReviewerTable({
  reviewers,
  selectedProject,
  onAssign,
  assigningReviewerId,
  searchTerm,
  setSearchTerm,
  expertiseFilter,
  setExpertiseFilter,
  availabilityFilter,
  setAvailabilityFilter,
  allExpertise,
}) {
  const getStatusBadge = (workload) => {
    if (workload <= 2) return { text: "Available", color: "bg-green-100 text-green-700 border border-green-200" };
    if (workload <= 4) return { text: "Moderate", color: "bg-yellow-100 text-yellow-700 border border-yellow-200" };
    return { text: "Busy", color: "bg-orange-100 text-orange-700 border border-orange-200" };
  };

  return (
    <div className="lg:col-span-2 flex flex-col gap-4">
      {/* Header + Filters Card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Available Reviewers</h2>
            <p className="text-xs text-gray-500 mt-0.5">Select a reviewer to assign to the selected proposal</p>
          </div>
          {selectedProject && (
            <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-lg text-xs font-semibold max-w-[200px] truncate">
              {selectedProject.title}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search reviewers by name, email, or expertise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-3">
          <select
            value={expertiseFilter}
            onChange={(e) => setExpertiseFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Expertise</option>
            {allExpertise.map((exp) => (
              <option key={exp} value={exp}>{exp.replace(/_/g, " ")}</option>
            ))}
          </select>
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Availability</option>
            <option value="available">Available (0–2)</option>
            <option value="busy">Busy (3–4)</option>
            <option value="overloaded">Overloaded (5+)</option>
          </select>
        </div>
      </div>

      {/* No proposal selected */}
      {!selectedProject && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-10 text-center text-gray-400">
          <div className="w-14 h-14 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
            <Search size={22} className="text-gray-400" />
          </div>
          <p className="text-sm font-medium">No proposal selected</p>
          <p className="text-xs mt-1">Select a proposal from the left panel to assign reviewers</p>
        </div>
      )}

      {/* Reviewer Cards */}
      {selectedProject && (
        <>
          {reviewers.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-10 text-center text-gray-400">
              <p className="text-sm font-medium">No reviewers match your filters</p>
              <p className="text-xs mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {reviewers.map((reviewer) => {
                const status = getStatusBadge(reviewer.currentWorkload || 0);
                return (
                  <div
                    key={reviewer.id}
                    className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow"
                  >
                    {/* Top row: name + status + button */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-800 text-base">{reviewer.name}</p>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{reviewer.email}</p>
                      </div>
                      <button
                        onClick={() => onAssign(selectedProject.id, reviewer.id, reviewer.name)}
                        disabled={assigning}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shadow-sm flex-shrink-0"
                      >
                        <UserPlus size={15} />
                        {assigning ? "Assigning..." : "Assign Reviewer"}
                      </button>
                    </div>

                    {/* Expertise */}
                    {(reviewer.expertise || []).length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5 flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-purple-200 inline-block" />
                          Expertise
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {(reviewer.expertise || []).map((exp, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100 text-xs font-medium"
                            >
                              {exp.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stats row */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <Briefcase size={14} className="text-gray-400" />
                        Assigned Proposals: <strong>{reviewer.totalAssigned || 0}</strong>
                      </span>
                      {reviewer.completedReviews !== undefined && (
                        <span className="flex items-center gap-1.5">
                          <CheckCircle size={14} className="text-green-500" />
                          Completed: <strong className="text-green-600">{reviewer.completedReviews}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}