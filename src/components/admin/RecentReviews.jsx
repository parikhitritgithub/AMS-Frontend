// RecentReviews.jsx (Updated to handle dynamic data)
export default function RecentReviews({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 text-sm font-semibold text-gray-700">
          Recent Reviews
        </div>
        <div className="p-6 text-center text-gray-400">
          No reviews available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 text-sm font-semibold text-gray-700">
        Recent Reviews
      </div>
      <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
        {reviews.slice(0, 5).map((r, i) => (
          <div key={i} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm font-medium text-gray-800 leading-snug flex-1">
                {r.title}
              </p>
              <span
                className={`shrink-0 px-2 py-1 rounded-full text-xs font-bold ${r.decisionColor}`}
              >
                {r.decision}
              </span>
            </div>
            <p className="text-xs text-gray-500 italic mb-2 line-clamp-2">
              {r.comment || "No comment provided"}
            </p>
            <p className="text-xs text-gray-400">
              Reviewer:{" "}
              <span className="font-medium text-gray-600">{r.reviewer}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}