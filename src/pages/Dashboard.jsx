import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, createProject, updateProject, deleteProject, analyzeProject } from '../store/slices/projectSlice';
import { logout } from '../store/slices/authSlice';
import { persistor } from '../store/store';
import "../styles/dashboard.css";

const INITIAL_FORM = {
  studentName: "",
  studentAge: "",
  gradeLevel: "",


  presentLevels: "",
  currentPerformance: "",
  goals: "",
  accommodations: "",
  parentSurvey: "",
  notes: "",
  relatedServices: [],
  analysis: "",
};

const RELATED_SERVICE_OPTIONS = [
  "Speech-language therapy",
  "Occupational therapy",
  "Physical therapy",
  "Behavior intervention",
  "Counseling services",
  "Assistive technology",
  "Transportation support",
];

const GRADE_LEVELS = [
  "Pre-K",
  "Kindergarten",
  "1st grade",
  "2nd grade",
  "3rd grade",
  "4th grade",
  "5th grade",
  "6th grade",
  "7th grade",
  "8th grade",
  "9th grade",
  "10th grade",
  "11th grade",
  "12th grade",
  "Transition (18-22)",
];

const formatFileSize = (size) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const generateAnalysis = (project) => {
  const services = project.relatedServices?.length
    ? project.relatedServices.join(", ")
    : "No related services identified yet";

  return [
    `Student ${project.studentName || "name pending"} (${project.gradeLevel || "grade TBD"}, age ${project.studentAge || "N/A"
    }) currently shows: ${project.presentLevels || "present levels not documented yet"}.`,
    project.currentPerformance
      ? `Performance snapshot: ${project.currentPerformance}.`
      : "Performance snapshot pending educator input.",
    project.goals
      ? `Goals in focus: ${project.goals}.`
      : "Goals have not been documented for this learner yet.",
    project.accommodations
      ? `Recommended accommodations: ${project.accommodations}.`
      : "Accommodations not yet outlined.",
    `Related services in plan: ${services}.`,
    project.parentSurvey
      ? `Parent survey insights: ${project.parentSurvey}.`
      : "Parent survey feedback pending.",
  ].join(" ");
};

const emptyDocuments = [];

const AI_SUPPORT_FEATURES = [
  {
    title: "Smart Goal Builder",
    description:
      "Generate measurable, standards-aligned targets in seconds while keeping educator voice front and center.",
  },
  {
    title: "Present Levels Synthesizer",
    description:
      "Turn classroom evidence into clear narrative summaries that highlight strengths, needs, and next steps.",
  },
  {
    title: "Accommodation Recommender",
    description:
      "Map student profiles to proven supports and accommodations, ready to personalize for each learner.",
  },
];

function Dashboard() {
  const dispatch = useDispatch();
  const { items: projects, loading, error } = useSelector((state) => state.projects || { items: [] });
  const [activeTab, setActiveTab] = useState(null);
  const [formState, setFormState] = useState(INITIAL_FORM);
  const [documents, setDocuments] = useState(emptyDocuments);
  const [editingId, setEditingId] = useState(null);

  const isEditing = Boolean(editingId);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // Check role - can also be done via a ProtectedRoute component, keeping simple here for now
  useEffect(() => {
    // Rely on redux role if persisted, or check session logic if legacy
    // The authSlice is persisted, so we can check selector or assume login handled redirect.
    // However, if manual navigation happens:
    // const role = sessionStorage.getItem("brightMindsRole");
    // if (role !== "teacher") {
    //   window.location.replace("/login?role=teacher");
    // }
    // Since we removed manual session storage setter in authSlice, we should rely on state.
    // For now, let's trust the user is here after login.
  }, []);

  const resetForm = () => {
    setFormState(INITIAL_FORM);
    setDocuments(emptyDocuments);
    setEditingId(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceToggle = (service) => {
    setFormState((prev) => {
      const alreadySelected = prev.relatedServices.includes(service);
      const updated = alreadySelected
        ? prev.relatedServices.filter((item) => item !== service)
        : [...prev.relatedServices, service];
      return { ...prev, relatedServices: updated };
    });
  };

  const handleDocumentUpload = (event) => {
    const files = Array.from(event.target.files ?? []);
    const filtered = files
      .filter((file) => /\.(pdf|docx?)$/i.test(file.name))
      .map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      }));
    setDocuments(filtered);
  };

  const handleDocumentRemove = (fileName) => {
    setDocuments((prev) => prev.filter((doc) => doc.name !== fileName));
  };

  const hydrateProjectPayload = (payload) => {
    const trimmed = {
      ...payload,
      studentName: payload.studentName?.trim() || "",
      studentAge: Number(payload.studentAge) || 0,
      gradeLevel: payload.gradeLevel?.trim() || "",

      presentLevels: payload.presentLevels?.trim() || "",
      currentPerformance: payload.currentPerformance?.trim() || "",
      goals: payload.goals?.trim() || "",
      accommodations: payload.accommodations?.trim() || "",
      parentSurvey: payload.parentSurvey?.trim() || "",
      notes: payload.notes?.trim() || "",
    };

    // Use existing analysis from form (AI generated or edited) or fallback to client-side generation
    const analysis = payload.analysis || generateAnalysis(trimmed);

    // Backend likely handles ID and dates, but if we need to send full object:
    return {
      ...trimmed,
      documents, // Backend might not handle this yet
      analysis,
    };
  };

  const handleGenerateAnalysis = () => {
    // Navigate to /planning with current form state
    // We pass the full filtered state that the API needs (and UI needs)
    const stateForPlanning = {
      studentName: formState.studentName?.trim() || "",
      studentAge: Number(formState.studentAge) || 0,
      gradeLevel: formState.gradeLevel?.trim() || "",
      presentLevels: formState.presentLevels?.trim() || "",
      currentPerformance: formState.currentPerformance?.trim() || "",
      goals: formState.goals?.trim() || "",
      accommodations: formState.accommodations?.trim() || "",
      relatedServices: formState.relatedServices || [],
      // Also pass existing analysis if any, so we don't regenerate unnecessarily if coming back/editing
      analysis: formState.analysis || ""
    };

    // Use appNavigate with state
    if (window.appNavigate) {
      window.appNavigate("/planning", { usr: stateForPlanning });
    } else {
      window.history.pushState({ usr: stateForPlanning }, "", "/planning");
      window.dispatchEvent(new Event("popstate"));
    }
  };

  const [saveStatus, setSaveStatus] = useState("");

  const handleSaveProject = async (event) => {
    event.preventDefault();
    let payload = hydrateProjectPayload(formState);

    setSaveStatus("Generating analysis...");

    try {
      // 1. Generate Analysis First
      const aiPayload = {
        studentName: payload.studentName?.trim() || "",
        studentAge: Number(payload.studentAge) || 0,
        gradeLevel: payload.gradeLevel?.trim() || "",
        presentLevels: payload.presentLevels?.trim() || "",
        currentPerformance: payload.currentPerformance?.trim() || "",
        goals: payload.goals?.trim() || "",
        accommodations: payload.accommodations?.trim() || "",
        relatedServices: payload.relatedServices || []
      };

      // Try to generate analysis via API
      try {
        const analysisResult = await dispatch(analyzeProject(aiPayload));
        if (analyzeProject.fulfilled.match(analysisResult)) {
          payload.analysis = analysisResult.payload.analysis;
        }
      } catch (analysisErr) {
        console.warn("Analysis generation failed, proceeding with save without new analysis", analysisErr);
        // Fallback to existing or empty analysis
      }

      setSaveStatus("Saving project...");

      // 2. Save Project (Create or Update)
      let result;
      if (isEditing) {
        result = await dispatch(updateProject({ id: editingId, data: payload }));
      } else {
        result = await dispatch(createProject(payload));
      }

      if (createProject.fulfilled.match(result) || updateProject.fulfilled.match(result)) {
        setSaveStatus("Project Saved!");
        setTimeout(() => setSaveStatus(""), 2000);

        dispatch(fetchProjects());
        resetForm();
        setActiveTab("existing");
      } else {
        setSaveStatus("Error saving project");
      }

    } catch (err) {
      console.error("Save flow failed", err);
      setSaveStatus("Error saving project");
    } finally {
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  const handleEditProject = (project) => {
    setFormState({
      studentName: project.studentName,
      studentAge: project.studentAge,
      gradeLevel: project.gradeLevel,


      presentLevels: project.presentLevels,
      currentPerformance: project.currentPerformance,
      goals: project.goals,
      accommodations: project.accommodations,
      parentSurvey: project.parentSurvey,
      notes: project.notes,
      relatedServices: project.relatedServices || [],
      analysis: project.analysis || "", // Load existing analysis
    });
    setDocuments(project.documents ?? emptyDocuments);
    setEditingId(project.id);
    setActiveTab("new");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteProject = async (projectId) => {
    const confirmed = window.confirm("Are you sure you want to delete this project?");
    if (!confirmed) return;

    await dispatch(deleteProject(projectId));
    dispatch(fetchProjects());

    if (editingId === projectId) {
      resetForm();
    }
  };

  const handleViewPlan = (project) => {
    // Prepare state for planning view
    const stateForPlanning = {
      ...project,
      projectId: project.id, // Explicitly pass as projectId per requirement
      studentAge: Number(project.studentAge) || 0,
      // Ensure analysis is passed if present
      analysis: project.analysis || ""
    };

    if (window.appNavigate) {
      window.appNavigate("/planning", { usr: stateForPlanning });
    } else {
      window.history.pushState({ usr: stateForPlanning }, "", "/planning");
      window.dispatchEvent(new Event("popstate"));
    }
  };

  const handleCopyAnalysis = async (analysisText) => {
    try {
      await navigator.clipboard.writeText(analysisText);
      return true;
    } catch {
      return false;
    }
  };

  const draftAnalysis = useMemo(() => generateAnalysis({ ...formState, documents }), [formState, documents]);

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <a href="/" className="dashboard-brand" data-route>
          <span aria-hidden="true">BM</span>
          BrightMinds
        </a>
        <nav aria-label="Dashboard navigation">
          <a href="/" className="dashboard-link" data-route>
            Product site
          </a>
          <button onClick={async () => {
            dispatch(logout());
            await persistor.purge(); // Ensure storage is cleared
            window.location.href = '/login';
          }} className="dashboard-link" style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}>
            Switch account
          </button>
        </nav>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-hero">
          <div className="hero-content">
            <h1>Educator dashboard</h1>
            <p>Select how you want to work with BrightMinds today.</p>
            <div className="hero-buttons" role="tablist" aria-label="Dashboard workspace selection">
              <button
                type="button"
                className={activeTab === "new" ? "hero-button is-active" : "hero-button"}
                onClick={() => {
                  if (!isEditing) {
                    resetForm();
                  }
                  setActiveTab("new");
                }}
              >
                New project
              </button>
              <button
                type="button"
                className={activeTab === "existing" ? "hero-button is-active" : "hero-button"}
                onClick={() => setActiveTab("existing")}
              >
                Existing projects
              </button>
            </div>
          </div>
        </section>

        {activeTab === null && (
          <section className="workspace-placeholder" aria-label="Select a workspace">
            <h2>Choose a workspace to get started</h2>
            <p>
              Launch a new smart-assisted project or review your existing caseload. You can switch back at any time using the buttons above.
            </p>
          </section>
        )}

        {activeTab === "new" && (
          <section className="workspace-card" role="tabpanel" aria-label="New project workspace">
            <header className="workspace-header">
              <div>
                <h2>{isEditing ? "Update project" : "Start a new student project"}</h2>
              </div>
              <div className="workspace-actions">
                {isEditing && (
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={handleGenerateAnalysis}
                  >
                    ✨ Open Smart Planning
                  </button>
                )}
                <button type="button" className="ghost-button" onClick={resetForm}>
                  Clear form
                </button>
              </div>
            </header>

            <div className="ai-support">
              <h3>Intelligent planning highlights</h3>
              <div className="ai-feature-grid">
                {AI_SUPPORT_FEATURES.map((feature) => (
                  <article key={feature.title} className="ai-feature-card">
                    <h4>{feature.title}</h4>
                    <p>{feature.description}</p>
                  </article>
                ))}
              </div>
            </div>

            <form className="project-form" onSubmit={handleSaveProject}>
              <fieldset>
                <legend>Student profile</legend>
                <div className="form-grid">
                  <label>
                    Student name
                    <input
                      type="text"
                      name="studentName"
                      value={formState.studentName || ""}
                      onChange={handleInputChange}
                      placeholder="Learner name"
                      required
                    />
                  </label>
                  <label>
                    Age
                    <input
                      type="number"
                      name="studentAge"
                      value={formState.studentAge || ""}
                      onChange={handleInputChange}
                      min={3}
                      max={22}
                      placeholder="e.g., 11"
                      required
                    />
                  </label>
                  <label>
                    Grade level
                    <select name="gradeLevel" value={formState.gradeLevel || ""} onChange={handleInputChange} required>
                      <option value="">Select grade level</option>
                      {GRADE_LEVELS.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </label>


                </div>
              </fieldset>

              <fieldset>
                <legend>Instructional planning</legend>
                <label>
                  Present levels
                  <textarea
                    name="presentLevels"
                    value={formState.presentLevels || ""}
                    onChange={handleInputChange}
                    placeholder="Describe how the student is performing across academic, cognitive, and functional areas."
                    rows={4}
                    required
                  />
                </label>
                <label>
                  Current performance
                  <textarea
                    name="currentPerformance"
                    value={formState.currentPerformance || ""}
                    onChange={handleInputChange}
                    placeholder="Summarize recent data points, progress monitoring notes, and strengths."
                    rows={3}
                  />
                </label>
                <label>
                  Student goals
                  <textarea
                    name="goals"
                    value={formState.goals || ""}
                    onChange={handleInputChange}
                    placeholder="List short- and long-term goals along with mastery criteria."
                    rows={3}
                    required
                  />
                </label>
                <label>
                  Accommodations & supports
                  <textarea
                    name="accommodations"
                    value={formState.accommodations || ""}
                    onChange={handleInputChange}
                    placeholder="Document testing accommodations, classroom supports, and assistive technology."
                    rows={3}
                  />
                </label>
              </fieldset>

              <fieldset>
                <legend>Related services</legend>
                <div className="service-grid">
                  {RELATED_SERVICE_OPTIONS.map((service) => (
                    <label key={service} className="service-chip">
                      <input
                        type="checkbox"
                        checked={(formState.relatedServices || []).includes(service)}
                        onChange={() => handleServiceToggle(service)}
                      />
                      <span>{service}</span>
                    </label>
                  ))}
                </div>
                <label>
                  Additional notes
                  <textarea
                    name="notes"
                    value={formState.notes || ""}
                    onChange={handleInputChange}
                    placeholder="Record notes about service frequency, staffing, or scheduling considerations."
                    rows={2}
                  />
                </label>
              </fieldset>

              <fieldset>
                <legend>Family collaboration</legend>
                <label>
                  Parent survey insights
                  <textarea
                    name="parentSurvey"
                    value={formState.parentSurvey || ""}
                    onChange={handleInputChange}
                    placeholder="Summarize caregiver input or paste survey responses."
                    rows={3}
                  />
                </label>
              </fieldset>



              <fieldset>
                <legend>Supporting documents</legend>
                <div className="upload-row">
                  <input type="file" accept=".pdf,.doc,.docx" multiple onChange={handleDocumentUpload} />
                  <span>Upload Word or PDF files up to 10MB each.</span>
                </div>
                {documents.length > 0 && (
                  <ul className="document-list">
                    {documents.map((doc) => (
                      <li key={doc.name}>
                        <span>
                          {doc.name} · {formatFileSize(doc.size)}
                        </span>
                        <button type="button" onClick={() => handleDocumentRemove(doc.name)}>
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </fieldset>

              <div className="form-controls">
                {saveStatus && <span className="save-status" style={{ marginRight: '1rem', fontWeight: 'bold', color: '#6366f1' }}>{saveStatus}</span>}
                <button type="submit" className="primary-button" disabled={!!saveStatus}>
                  {isEditing ? "Save updates" : "Save project"}
                </button>
                {isEditing && (
                  <button type="button" className="ghost-button" onClick={resetForm}>
                    Cancel editing
                  </button>
                )}
              </div>
            </form>
          </section>
        )}

        {activeTab === "existing" && (
          <section className="workspace-card" role="tabpanel" aria-label="Existing projects">
            <header className="workspace-header">
              <div>
                <h2>Existing projects</h2>
                <p>Review previously created projects. Open a learner to continue editing or manage entries.</p>
              </div>
            </header>

            {projects.length === 0 ? (
              <div className="empty-state">
                <h3>No projects yet</h3>
                <p>
                  Start a new project to capture student eligibility, goals, and services. Your saved work appears here for quick edits and
                  family collaboration.
                </p>
                <button type="button" className="primary-button" onClick={() => setActiveTab("new")}>
                  Create your first project
                </button>
              </div>
            ) : (
              <div className="project-table-wrapper">
                <h3>Project list</h3>
                <p className="project-table-caption">Manage saved projects below.</p>
                <div className="project-table-scroll">
                  <table className="project-table">
                    <thead>
                      <tr>
                        <th scope="col">Student</th>
                        <th scope="col">Grade level</th>
                        <th scope="col">Age</th>

                        <th scope="col">Last updated</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project, index) => (
                        <tr key={project.id ? `summary-${project.id}` : `summary-index-${index}`}>
                          <td>{project.studentName || "Unnamed learner"}</td>
                          <td>{project.gradeLevel || "—"}</td>
                          <td>{project.studentAge || "—"}</td>

                          <td>{new Date(project.updatedAt).toLocaleDateString()}</td>
                          <td>
                            <div className="table-actions">
                              <button type="button" className="table-link" onClick={() => handleEditProject(project)}>
                                Edit
                              </button>
                              <button type="button" className="table-link" onClick={() => handleViewPlan(project)}>
                                View Plan
                              </button>
                              <button
                                type="button"
                                className="table-link table-link-danger"
                                onClick={() => handleDeleteProject(project.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default Dashboard;

