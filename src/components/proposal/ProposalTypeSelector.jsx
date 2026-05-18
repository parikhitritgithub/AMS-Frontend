import { FilePlus, FolderOpen } from "lucide-react";

export default function ProposalTypeSelector({
  onNew,
  onContinue,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">

      <h2 className="text-3xl font-bold text-gray-800 mb-3">
        Select Proposal Type
      </h2>

      <p className="text-gray-500 mb-10">
        Start a new proposal or continue previous work
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">

        {/* New Proposal */}
        <button
          onClick={onNew}
          className="group p-8 rounded-2xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition text-left"
        >
          <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center mb-5">
            <FilePlus className="text-white" size={28} />
          </div>

          <h3 className="text-2xl font-bold text-blue-700 mb-2">
            New Proposal
          </h3>

          <p className="text-gray-600">
            Start creating a fresh research proposal
          </p>
        </button>

        {/* Continue Proposal */}
        {/* Section Projects */}
        <div
          className="relative p-8 rounded-2xl border-2 border-gray-200 bg-gray-50 text-left opacity-80 cursor-not-allowed"
        >

          {/* Coming Soon Badge */}
          <div className="absolute top-4 right-4 px-3 py-1 text-xs font-bold bg-orange-100 text-orange-700 rounded-full">
            Coming Soon
          </div>

          <div className="w-14 h-14 rounded-xl bg-gray-500 flex items-center justify-center mb-5">
            <FolderOpen className="text-white" size={28} />
          </div>

          <h3 className="text-2xl font-bold text-gray-700 mb-2">
            Sanction Projects
          </h3>

          <p className="text-gray-600">
            Access and manage previously submitted section projects
          </p>

        </div>

      </div>
    </div>
  );
}