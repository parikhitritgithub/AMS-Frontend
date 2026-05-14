
import { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

import AdminSidebar from "../../components/admin/AdminSidebar";
import SelectedProposalCard from "../../components/admin/review/SelectedProposalCard";
import ReviewerTable from "../../components/admin/review/ReviewerTable";
import LoadingScreen from "../../components/common/Loadingscreen";

export default function ReviewerAssignment({ onLogout, user }) {
  const [reviewers, setReviewers] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [proposalDetails, setProposalDetails] = useState(null);

  const [loading, setLoading] = useState(true);
  const [assigningReviewerId, setAssigningReviewerId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [projectSearchTerm, setProjectSearchTerm] = useState("");

  const [expertiseFilter, setExpertiseFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const allExpertise = [
    ...new Set(reviewers.flatMap((r) => r.expertise || [])),
  ];

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  // Fetch reviewers + all unassigned proposals
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // Fetch reviewers
        const reviewersRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/admin/reviewers`,
          { headers: getAuthHeaders() }
        );

        // ✅ Use the correct unassigned-proposals endpoint
        const projectsRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/admin/unassigned-proposals`,
          {
            headers: getAuthHeaders(),
            params: { page: 1, limit: 100 },
          }
        );

        setReviewers(reviewersRes.data.reviewers || []);
        // ✅ Response shape from unassigned-proposals uses "proposals" key
        setAllProjects(projectsRes.data.proposals || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // When a project is selected, use data already in the list
  // (no separate fetch needed — avoids the 403 on /api/reviews/project/:id)
  useEffect(() => {
    if (!selectedProject) {
      setProposalDetails(null);
      return;
    }

    // Enrich proposalDetails from the already-fetched project object
    setProposalDetails(selectedProject);
  }, [selectedProject]);

  // Assign reviewer
  const handleAssignReviewer = async (projectId, reviewerId, reviewerName) => {
    if (!selectedProject) {
      toast.error("Please select a proposal first");
      return;
    }

    setAssigningReviewerId(reviewerId);

    try {
      // ✅ Correct endpoint and body shape
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/projects/assign-reviewer/${projectId}`,
        { reviewerId },
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(`Proposal assigned to ${reviewerName} successfully!`);

      // Refresh reviewers list
      const reviewersRes = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/reviewers`,
        { headers: getAuthHeaders() }
      );
      setReviewers(reviewersRes.data.reviewers || []);

      // Remove the now-assigned project from the unassigned list
      setAllProjects((prev) =>
        prev.filter((project) => project.id !== projectId)
      );

      // Clear selected project and proposal details after assignment
      setSelectedProject(null);
      setProposalDetails(null);
    } catch (err) {
      console.error("Error assigning reviewer:", err);
      toast.error(err.response?.data?.message || "Failed to assign reviewer");
    } finally {
      setAssigningReviewerId(null);
    }
  };

  // Filter reviewers
  const filteredReviewers = reviewers.filter((reviewer) => {
    const matchesSearch =
      reviewer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reviewer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reviewer.expertise?.some((exp) =>
        exp.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesExpertise =
      expertiseFilter === "all" ||
      reviewer.expertise?.some((exp) => exp === expertiseFilter);

    let matchesAvailability = true;
    if (availabilityFilter === "available") {
      matchesAvailability = (reviewer.currentWorkload || 0) < 3;
    } else if (availabilityFilter === "busy") {
      matchesAvailability = (reviewer.currentWorkload || 0) >= 3;
    } else if (availabilityFilter === "overloaded") {
      matchesAvailability = (reviewer.currentWorkload || 0) >= 5;
    }

    return matchesSearch && matchesExpertise && matchesAvailability;
  });

  // Filter projects by search term
  const filteredProjects = allProjects.filter(
    (project) =>
      project.title?.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
      project.uniqueCode
        ?.toLowerCase()
        .includes(projectSearchTerm.toLowerCase()) ||
      project.submittedBy?.name
        ?.toLowerCase()
        .includes(projectSearchTerm.toLowerCase()) ||
      project.discipline
        ?.toLowerCase()
        .includes(projectSearchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      <AdminSidebar onLogout={onLogout} user={user} />

      <main className="flex-1 px-8 py-8 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <LoadingScreen />
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800">
                Reviewer Assignment
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Assign reviewers to research proposals and manage review
                assignments.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <SelectedProposalCard
                proposalDetails={proposalDetails}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
                unassignedProjects={filteredProjects}
                searchTerm={projectSearchTerm}
                setSearchTerm={setProjectSearchTerm}
              />

              <ReviewerTable
                reviewers={filteredReviewers}
                selectedProject={selectedProject}
                onAssign={handleAssignReviewer}
                assigningReviewerId={assigningReviewerId}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                expertiseFilter={expertiseFilter}
                setExpertiseFilter={setExpertiseFilter}
                availabilityFilter={availabilityFilter}
                setAvailabilityFilter={setAvailabilityFilter}
                allExpertise={allExpertise}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}