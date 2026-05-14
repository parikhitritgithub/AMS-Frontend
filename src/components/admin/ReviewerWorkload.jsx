// ReviewerWorkload.jsx (Updated to handle dynamic data)
export default function ReviewerWorkload({ reviewers = [] }) {
  if (!reviewers || reviewers.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 text-sm font-semibold text-gray-700">
          Reviewer Workload
        </div>
        <div className="p-6 text-center text-gray-400">
          No reviewers available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 text-sm font-semibold text-gray-700">
        Reviewer Workload
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-400 uppercase tracking-wide">
              <th className="px-6 py-3 text-left font-medium text-xs">
                Reviewer
              </th>
              <th className="px-6 py-3 text-left font-medium text-xs">
                Assigned Projects
              </th>
              <th className="px-6 py-3 text-left font-medium text-xs">
                Pending Reviews
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {reviewers.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3 font-medium text-gray-800 text-sm">
                  {r.name}
                </td>
                <td className="px-6 py-3 text-gray-600 text-sm">
                  {r.assignedProjects}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      r.pendingReviews > 0
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {r.pendingReviews}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}