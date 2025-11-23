import { useEffect, useMemo, useState } from "react";
import "../styles/dashboard.css";

const INITIAL_FORM = {
  studentName: "",
  studentAge: "",
  gradeLevel: "",
  eligibilityStatus: "",
  eligibilityDate: "",
  presentLevels: "",
  currentPerformance: "",
  goals: "",
  accommodations: "",
  parentSurvey: "",
  notes: "",
  relatedServices: [],
};

const createProjectId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `project-${Date.now()}-${Math.random().toString(16).slice(2)}`;

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

const LOCAL_STORAGE_KEY = "brightMindsProjects";

const formatFileSize = (size) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const generateAnalysis = (project) => {
  const services = project.relatedServices.length
    ? project.relatedServices.join(", ")
    : "No related services identified yet";

  return [
    `Student ${project.studentName || "name pending"} (${project.gradeLevel || "grade TBD"}, age ${
      project.studentAge || "N/A"
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

const MOCK_PROJECT_TEMPLATES = [
  {
    studentName: "Avery Johnson",
    studentAge: "9",
    gradeLevel: "4th grade",
    eligibilityStatus: "Eligible",
    eligibilityDate: "2024-09-12",
    presentLevels:
      "Demonstrates strong decoding skills but requires support synthesizing informational texts and organizing written responses.",
    currentPerformance:
      "Latest benchmark shows 62nd percentile in reading fluency; executive functioning coaching underway with weekly check-ins.",
    goals:
      "By Q3, Avery will summarize grade-level informational texts using a structured organizer in 4/5 trials.",
    accommodations:
      "Graphic organizers, extended time (1.5x), quiet testing environment, chunked assignments delivered via LMS reminders.",
    parentSurvey:
      "Family reports success with visual schedules at home and requests continued collaboration on organization strategies.",
    notes: "Team prioritizing metacognitive strategies and self-monitoring checkpoints.",
    relatedServices: ["Speech-language therapy", "Occupational therapy"],
  },
  {
    studentName: "Maya Chen",
    studentAge: "12",
    gradeLevel: "7th grade",
    eligibilityStatus: "Pending evaluation",
    eligibilityDate: "2024-10-04",
    presentLevels:
      "Excels in project-based tasks; needs scaffolds for multi-step math problems and managing assignment timelines.",
    currentPerformance:
      "Quarterly math assessment at 48th percentile; executive functioning log shows missed assignments declining.",
    goals:
      "Within 12 weeks, Maya will complete multi-step math tasks with 80% accuracy using teacher-provided checklists.",
    accommodations:
      "Preview guides, step-by-step checklists, calculator access, and weekly agenda review with mentor teacher.",
    parentSurvey:
      "Parents request more frequent progress updates and are willing to practice checklists at home twice per week.",
    notes: "Further observation scheduled during collaborative math lab sessions.",
    relatedServices: ["Counseling services"],
  },
  {
    studentName: "Jordan Smith",
    studentAge: "16",
    gradeLevel: "10th grade",
    eligibilityStatus: "Eligible",
    eligibilityDate: "2024-08-22",
    presentLevels:
      "Shows high engagement in hands-on STEM labs; requires language scaffolds to access grade-level literature and compose essays.",
    currentPerformance:
      "Reading comprehension benchmark at 34th percentile; writing rubric indicates growth in idea generation but limited elaboration.",
    goals:
      "Over the next semester, Jordan will compose analytical paragraphs including evidence and commentary with 70% rubric mastery.",
    accommodations:
      "Sentence starters, audio versions of complex texts, collaborative note-taking tools, alternate response formats for essays.",
    parentSurvey:
      "Family highlights interest in 3D design internships and notes success when teachers provide models before assignments.",
    notes: "Transition planning meeting scheduled with community partner next month.",
    relatedServices: ["Assistive technology", "Occupational therapy"],
  },
];

const MOCK_PROJECTS = MOCK_PROJECT_TEMPLATES.map((template, index) => {
  const timestamp = new Date(Date.now() - (index + 1) * 86400000).toISOString();
  const enriched = {
    ...template,
    documents: [],
    analysis: generateAnalysis(template),
  };
  return {
    ...enriched,
    id: `mock-${index + 1}`,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
});

const AI_SUPPORT_FEATURES = [
  {
    title: "AI Goal Builder",
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
  const [activeTab, setActiveTab] = useState(null);
  const [formState, setFormState] = useState(INITIAL_FORM);
  const [documents, setDocuments] = useState(emptyDocuments);
  const [projects, setProjects] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!stored) return MOCK_PROJECTS;
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return MOCK_PROJECTS;
    } catch {
      return MOCK_PROJECTS;
    }
  });
  const [editingId, setEditingId] = useState(null);

  const isEditing = Boolean(editingId);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    const role = sessionStorage.getItem("brightMindsRole");
    if (role !== "teacher") {
      window.location.replace("/login?role=teacher");
    }
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
      studentName: payload.studentName.trim(),
      gradeLevel: payload.gradeLevel.trim(),
      eligibilityStatus: payload.eligibilityStatus.trim(),
      presentLevels: payload.presentLevels.trim(),
      currentPerformance: payload.currentPerformance.trim(),
      goals: payload.goals.trim(),
      accommodations: payload.accommodations.trim(),
      parentSurvey: payload.parentSurvey.trim(),
      notes: payload.notes.trim(),
    };

    const analysis = generateAnalysis(trimmed);

    return {
      ...trimmed,
      id: editingId ?? createProjectId(),
      createdAt: editingId
        ? projects.find((project) => project.id === editingId)?.createdAt
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documents,
      analysis,
    };
  };

  const handleSaveProject = (event) => {
    event.preventDefault();

    const payload = hydrateProjectPayload(formState);
    if (isEditing) {
      setProjects((prev) => prev.map((project) => (project.id === editingId ? payload : project)));
    } else {
      setProjects((prev) => [payload, ...prev]);
    }
    resetForm();
    setActiveTab("existing");
  };

  const handleEditProject = (project) => {
    setFormState({
      studentName: project.studentName,
      studentAge: project.studentAge,
      gradeLevel: project.gradeLevel,
      eligibilityStatus: project.eligibilityStatus,
      eligibilityDate: project.eligibilityDate,
      presentLevels: project.presentLevels,
      currentPerformance: project.currentPerformance,
      goals: project.goals,
      accommodations: project.accommodations,
      parentSurvey: project.parentSurvey,
      notes: project.notes,
      relatedServices: project.relatedServices,
    });
    setDocuments(project.documents ?? emptyDocuments);
    setEditingId(project.id);
    setActiveTab("new");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteProject = (projectId) => {
    const confirmed = window.confirm("Are you sure you want to delete this project?");
    if (!confirmed) return;
    setProjects((prev) => prev.filter((project) => project.id !== projectId));
    if (editingId === projectId) {
      resetForm();
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
          <a href="/login" className="dashboard-link" data-route>
            Switch account
          </a>
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
              Launch a new AI-assisted project or review your existing caseload. You can switch back at any time using the buttons above.
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
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() =>
                    handleCopyAnalysis(draftAnalysis).then((copied) =>
                      copied ? alert("Draft copied to clipboard.") : alert("Copy failed. Try again."),
                    )
                  }
                >
                  Copy draft analysis
                </button>
                <button type="button" className="ghost-button" onClick={resetForm}>
                  Clear form
                </button>
              </div>
            </header>

            <div className="ai-support">
              <h3>AI-assisted planning highlights</h3>
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
                      value={formState.studentName}
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
                      value={formState.studentAge}
                      onChange={handleInputChange}
                      min={3}
                      max={22}
                      placeholder="e.g., 11"
                      required
                    />
                  </label>
                  <label>
                    Grade level
                    <select name="gradeLevel" value={formState.gradeLevel} onChange={handleInputChange} required>
                      <option value="">Select grade level</option>
                      {GRADE_LEVELS.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Eligibility status
                    <select
                      name="eligibilityStatus"
                      value={formState.eligibilityStatus}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select status</option>
                      <option value="Eligible">Eligible</option>
                      <option value="Ineligible">Ineligible</option>
                      <option value="Pending evaluation">Pending evaluation</option>
                    </select>
                  </label>
                  <label>
                    Eligibility meeting date
                    <input type="date" name="eligibilityDate" value={formState.eligibilityDate} onChange={handleInputChange} />
                  </label>
                </div>
              </fieldset>

              <fieldset>
                <legend>Instructional planning</legend>
                <label>
                  Present levels
                  <textarea
                    name="presentLevels"
                    value={formState.presentLevels}
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
                    value={formState.currentPerformance}
                    onChange={handleInputChange}
                    placeholder="Summarize recent data points, progress monitoring notes, and strengths."
                    rows={3}
                  />
                </label>
                <label>
                  Student goals
                  <textarea
                    name="goals"
                    value={formState.goals}
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
                    value={formState.accommodations}
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
                        checked={formState.relatedServices.includes(service)}
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
                    value={formState.notes}
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
                    value={formState.parentSurvey}
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
                <button type="submit" className="primary-button">
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
                        <th scope="col">Eligibility</th>
                        <th scope="col">Last updated</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project) => (
                        <tr key={`summary-${project.id}`}>
                          <td>{project.studentName || "Unnamed learner"}</td>
                          <td>{project.gradeLevel || "—"}</td>
                          <td>{project.studentAge || "—"}</td>
                          <td>{project.eligibilityStatus || "—"}</td>
                          <td>{new Date(project.updatedAt).toLocaleDateString()}</td>
                          <td>
                            <div className="table-actions">
                              <button type="button" className="table-link" onClick={() => handleEditProject(project)}>
                                Open
                              </button>
                              <button
                                type="button"
                                className="table-link"
                                onClick={() =>
                                  handleCopyAnalysis(project.analysis).then((copied) =>
                                    copied ? alert("Project analysis copied.") : alert("Copy failed. Try again."),
                                  )
                                }
                              >
                                Copy
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

