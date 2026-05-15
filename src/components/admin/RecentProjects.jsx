// RecentProjects.jsx - Modern Table View for Recent Projects
export default function RecentProjects({ projects = [] }) {
  if (!projects || projects.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Recent Proposals </h3>
        </div>
        <div className="p-8 text-center">
          <div className="text-gray-400 text-sm">No projects available</div>
        </div>
      </div>
    );
  }

  // Status color mapping
  const getStatusStyles = (status) => {
    const statusMap = {
      'APPROVED': 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
      'SUBMITTED': 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
      'UNDER REVIEW': 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
      'UNDER_REVIEW': 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
      'REVISION REQUIRED': 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
      'REVISION_REQUIRED': 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
      'REJECTED': 'bg-red-50 text-red-700 ring-1 ring-red-200',
      'DRAFT': 'bg-gray-50 text-gray-600 ring-1 ring-gray-200',
    };
    return statusMap[status] || statusMap[status?.toUpperCase()] || 'bg-gray-50 text-gray-600 ring-1 ring-gray-200';
  };

  const formatStatus = (status) => {
    return status?.replace(/_/g, ' ') || status;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
            Recent Projects
          </h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {projects.length} total
          </span>
        </div>
      </div>

      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Project Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Discipline
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {projects.slice(0, 5).map((project, index) => (
              <tr 
                key={index} 
                className="hover:bg-gray-50/50 transition-all duration-200 group cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {project.title}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">
                    {typeof project.author === 'object' ? project.author?.name : project.author}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">
                    {project.discipline?.replace(/_/g, ' ') || '—'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyles(project.status)}`}>
                    {formatStatus(project.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - Shows on small screens */}
      <div className="md:hidden divide-y divide-gray-100">
        {projects.slice(0, 5).map((project, index) => (
          <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-semibold text-gray-800 flex-1 pr-2">
                {project.title}
              </h4>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${getStatusStyles(project.status)}`}>
                {formatStatus(project.status)}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-gray-400">Author:</span>
                <span className="text-gray-600">
                  {typeof project.author === 'object' ? project.author?.name : project.author}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-400">Discipline:</span>
                <span className="text-gray-500">
                  {project.discipline?.replace(/_/g, ' ') || '—'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer with view all link */}
      {projects.length > 5 && (
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            View all {projects.length} projects
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}