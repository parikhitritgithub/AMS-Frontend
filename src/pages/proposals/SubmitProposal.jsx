import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Stepper from "../../components/common/Stepper";
import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";
import Step4 from "./steps/Step4";
import Step5 from "./steps/Step5";
import PrintableProposal from "../../components/proposal/PrintableProposal";
import ProposalTypeSelector from "../../components/proposal/ProposalTypeSelector";
import useProposalForm from "../../hooks/useProposalForm";
import { generateProposalPDF } from "../../utils/generateProposalPDF";
import toast from "react-hot-toast";

const STEPS = [
  { number: 1, label: "Basic Info" },
  { number: 2, label: "Details" },
  { number: 3, label: "Objective" },
  { number: 4, label: "Budget" },
  { number: 5, label: "Review" },
];

export default function SubmitProposal({ onLogout }) {
  const printRef = useRef();
  const [proposalMode, setProposalMode] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentStep > 0) {
      localStorage.setItem("proposalStep", currentStep);
    }
  }, [currentStep]);

  const {
    form,
    update,
    addObjective,
    addScientist,
    removeScientist,
    resetForm,
  } = useProposalForm();
  const [pdfForm, setPdfForm] = useState(form);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Helper function to prepare payload
  const preparePayload = () => ({
    title: form.title,
    proposalType: form.proposalType,
    stationOrCollege: form.stationOrCollege,
    discipline: form.discipline,
    year: parseInt(form.year) || new Date().getFullYear(),
    introduction: form.introduction,
    actionPlan: form.actionPlan,
    expectedOutcome: form.expectedOutcome,
    objectives: form.objectives,
    budget: {
      nonRecurring: Number(form.nonRecurring) || 0,
      recurringContingency: Number(form.recurringContingency) || 0,
      travellingAllowances: Number(form.travellingAllowances) || 0,
      operationalExpenses: Number(form.operationalExpenses) || 0,
      manpower: Number(form.manpower) || 0,
    },
    scientistInvolve: form.scientistInvolve.map((s) => ({
      scientistName: s.scientistName,
      nonRecurring: Number(s.nonRecurring) || 0,
      recurringContingency: Number(s.recurringContingency) || 0,
    })),
  });

  // Validate required fields before submission
  const validateRequiredFields = () => {
    if (!form.title || !form.stationOrCollege || !form.discipline || !form.year) {
      toast.error("Please fill all basic information fields");
      setCurrentStep(1);
      return false;
    }
    if (!form.introduction || !form.actionPlan || !form.expectedOutcome) {
      toast.error("Please fill all proposal details fields");
      setCurrentStep(2);
      return false;
    }
    if (!form.objectives || form.objectives.length === 0) {
      toast.error("Please add at least one objective");
      setCurrentStep(3);
      return false;
    }
    return true;
  };

  // Save as Draft (No similarity check)
  const handleSaveAsDraft = async () => {
    if (!validateRequiredFields()) {
      return;
    }

    try {
      setSavingDraft(true);
      const token = localStorage.getItem("token");

      const payload = preparePayload();

      const response = await fetch(
        `${API_BASE_URL}/api/projects/draft`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save draft");
      }

      toast.success("Proposal saved as draft successfully!");
      
      // Redirect to the draft proposal details page
      setTimeout(() => {
        navigate(`/scientist/project/${data.project.id}`);
      }, 1500);
      
      // Clear saved step from localStorage
      localStorage.removeItem("proposalStep");
      
    } catch (error) {
      console.error("Save draft error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setSavingDraft(false);
    }
  };

  // Save and Submit (With similarity check)
  const handleSubmit = async () => {
    if (!validateRequiredFields()) {
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      const payload = preparePayload();

      const response = await fetch(
        `${API_BASE_URL}/api/projects/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log("Submit response:", data);

      if (!response.ok) {
        // Handle case where similarity server fails and saves as draft
        if (response.status === 207) {
          toast.success(data.message || "Project saved as draft. You can submit later.");
          setTimeout(() => {
            navigate(`/scientist/project/${data.project.id}`);
          }, 1500);
          return;
        }
        throw new Error(data.message || "Failed to submit proposal");
      }

      // Generate PDF for submitted proposal
      const updatedForm = {
        ...form,
        uniqueCode: data.project.uniqueCode,
        similarityScore: data.project.similarityScore,
      };
      setPdfForm(updatedForm);

      await new Promise((resolve) => setTimeout(resolve, 100));
      await generateProposalPDF(printRef, updatedForm);

      toast.success("Proposal submitted successfully!");
      
      // Redirect to the submitted proposal details page
      setTimeout(() => {
        navigate(`/scientist/project/${data.project.id}`);
      }, 1500);
      
      // Clear saved step from localStorage
      localStorage.removeItem("proposalStep");
      
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans bg-gray-100">
      <Sidebar onLogout={onLogout} />

      {/* Hidden printable area (captured by html2canvas) */}
      <div
        ref={printRef}
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          width: "794px",
          background: "#fff",
          padding: "48px 52px",
        }}
      >
        <PrintableProposal form={pdfForm} />
      </div>

      {/* Visible UI */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Submit Research Proposal
          </h1>
          <p className="text-gray-500 mb-8 text-sm">
            Complete all steps to submit your proposal for review
          </p>

          {currentStep === 0 ? (
            <ProposalTypeSelector
              onNew={() => {
                setProposalMode("new");
                update("proposalType")("NEW");
                setCurrentStep(1);
              }}
              onContinue={() => {
                setProposalMode("existing");
                update("proposalType")("ONGOING");
                const savedStep = Number(localStorage.getItem("proposalStep")) || 1;
                setCurrentStep(savedStep);
              }}
            />
          ) : (
            <>
              <Stepper
                steps={STEPS}
                currentStep={currentStep}
                onStepClick={setCurrentStep}
              />

              {currentStep === 1 && (
                <Step1 form={form} update={update} />
              )}

              {currentStep === 2 && (
                <Step2 form={form} update={update} />
              )}

              {currentStep === 3 && (
                <Step3
                  form={form}
                  update={update}
                  addObjective={addObjective}
                />
              )}

              {currentStep === 4 && (
                <Step4 form={form} update={update} />
              )}

              {currentStep === 5 && (
                <Step5
                  form={form}
                  update={update}
                  addScientist={addScientist}
                  removeScientist={removeScientist}
                />
              )}
            </>
          )}

          {/* Navigation Buttons */}
          {currentStep !== 0 && (
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                className="px-8 py-2 rounded-lg border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition"
              >
                Previous
              </button>

              <div className="flex gap-3">
                {/* Save as Draft Button - Always visible on step 5 */}
                {currentStep === 5 && (
                  <button
                    onClick={handleSaveAsDraft}
                    disabled={savingDraft}
                    className={`px-8 py-2 rounded-lg border-2 border-gray-400 text-gray-600 font-semibold transition ${
                      savingDraft
                        ? "bg-gray-200 cursor-not-allowed"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {savingDraft ? "Saving..." : "Save as Draft"}
                  </button>
                )}

                {/* Submit Button or Next Button */}
                {currentStep === 5 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className={`px-8 py-2 rounded-lg text-white font-semibold transition ${
                      submitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {submitting ? "Submitting..." : "Submit Proposal"}
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentStep((s) => Math.min(5, s + 1))}
                    className="px-8 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                  >
                    Save & Next
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}