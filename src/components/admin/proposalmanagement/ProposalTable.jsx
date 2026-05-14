import axios from "axios";
import toast from "react-hot-toast";
import {
  Eye,
  Trash2,
} from "lucide-react";

const STATUS_STYLES = {
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  DRAFT: "bg-yellow-100 text-yellow-700",
  REVISION_REQUIRED: "bg-orange-100 text-orange-700",
  UNDER_REVIEW: "bg-purple-100 text-purple-700",
};

export default function ProposalTable({ proposals }) {

  const handleDelete = async (projectId) => {

  

    const toastId = toast.loading("Deleting proposal...");

    try {

      const token = localStorage.getItem("token");

      const res = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/projects/id/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        res.data.message || "Proposal deleted successfully",
        {
          id: toastId,
        }
      );

      window.location.reload();

    } catch (err) {

      console.error(err);

      toast.error(
        err.response?.data?.message || "Failed to delete proposal",
        {
          id: toastId,
        }
      );

    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto">

      <table className="min-w-[900px] w-full text-sm">

        <thead>
          <tr className="bg-gray-50 text-gray-400 uppercase text-xs tracking-wide">

            <th className="px-6 py-4 text-left">
              Proposal ID
            </th>

            <th className="px-6 py-4 text-left">
              Proposal Title
            </th>

            <th className="px-6 py-4 text-left">
              Scientist Name
            </th>

            <th className="px-6 py-4 text-left">
              Status
            </th>

            <th className="px-6 py-4 text-left">
              Submitted Date
            </th>

            <th className="px-6 py-4 text-left">
              Actions
            </th>

          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">

          {proposals.length > 0 ? (
            proposals.map((p) => (

              <tr
                key={p.id}
                className="hover:bg-gray-50 transition"
              >

                <td className="px-6 py-5 font-semibold text-gray-700">
                  {p.uniqueCode || "N/A"}
                </td>

                <td className="px-6 py-5">

                  <p className="font-semibold text-gray-800">
                    {p.title}
                  </p>

                </td>

                <td className="px-6 py-5">

                  <p className="font-medium text-gray-800">
                    {p.submittedBy?.name || "N/A"}
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    {p.submittedBy?.email || "N/A"}
                  </p>

                </td>

                <td className="px-6 py-5">

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      STATUS_STYLES[p.status] ||
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {p.status?.replaceAll("_", " ")}
                  </span>

                </td>

                <td className="px-6 py-5 text-gray-500">
                  {p.createdAt
                    ? new Date(p.createdAt).toLocaleDateString()
                    : "N/A"}
                </td>

                <td className="px-6 py-5">

                  <div className="flex items-center gap-4">

                    <button className="text-blue-500 hover:text-blue-700">
                      <Eye size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                </td>

              </tr>

            ))
          ) : (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-10 text-center text-gray-400"
              >
                No proposals found
              </td>
            </tr>
          )}

        </tbody>

      </table>

    </div>
  );
}