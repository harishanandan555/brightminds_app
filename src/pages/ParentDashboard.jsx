import { useEffect, useMemo, useState } from "react";
import "../styles/parent.css";

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

const LOCAL_STORAGE_KEY = "brightMindsParentProjects";

const createRecordId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `parent-${Date.now()}-${Math.random().toString(16).slice(2)}`;

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
      : "Performance snapshot pending caregiver input.",
    project.goals ? `Goals in focus: ${project.goals}.` : "Goals have not been documented yet.",
    project.accommodations
      ? `Supports and accommodations noted: ${project.accommodations}.`
      : "Supports and accommodations not yet outlined.",
    `Related services in plan: ${services}.`,
    project.parentSurvey
      ? `Family perspective: ${project.parentSurvey}.`
      : "Family survey feedback pending.",
  ].join(" ");
};

const emptyDocuments = [];

const MOCK_PARENT_TEMPLATES = [
  {
    studentName: "Noah Williams",
    studentAge: "10",
    gradeLevel: "5th grade",
    eligibilityStatus: "Eligible",
    eligibilityDate: "2024-07-18",
    presentLevels:
      "Noah loves science experiments and coding clubs; needs structure for multi-step writing assignments and homework planning.",
    currentPerformance:
      "Teacher reports show 70% task completion with visual checklists; family observes smoother evenings when routines are previewed.",
    goals:
      "Increase independence with nightly homework checklist and demonstrate grade-level writing structure with graphic organizers.",
    accommodations:
      "Visual schedules, teacher check-ins at homework send-off, keyboard for longer writing tasks, chunked assignments.",
    parentSurvey:
      "Family would like weekly summaries and is eager to try shared digital planners with reminders.",
    notes: "Exploring community STEM clubs for extended engagement.",
    relatedServices: ["Occupational therapy"],
  },
  {
    studentName: "Lila Martinez",
    studentAge: "7",
    gradeLevel: "2nd grade",
    eligibilityStatus: "Pending evaluation",
    eligibilityDate: "2024-08-30",
    presentLevels:
      "Thrives in art and music; currently working on speech articulation and reading fluency with school supports.",
    currentPerformance:
      "Speech therapist notes progress on target sounds; reading progress monitoring at 45th percentile with phonics games.",
    goals:
      "Practice weekly read-aloud sessions and reinforce articulation exercises at home with the shared tracking sheet.",
    accommodations:
      "Small-group reading support, visual phonics cards, speech practice apps recommended by therapist.",
    parentSurvey:
      "Parents request more ideas for articulation play during routines and want to share their observations weekly.",
    notes: "Family appreciates reminders before meetings and progress updates in Spanish.",
    relatedServices: ["Speech-language therapy"],
  },
];

const MOCK_PARENT_RECORDS = MOCK_PARENT_TEMPLATES.map((template, index) => {
  const timestamp = new Date(Date.now() - (index + 1) * 86400000).toISOString();
  const analysis = generateAnalysis(template);
  return {
    ...template,
    id: `mock-parent-${index + 1}`,
    createdAt: timestamp,
    updatedAt: timestamp,
    documents: [],
    analysis,
  };
});

function ParentDashboard() {
  const [records, setRecords] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!stored) return MOCK_PARENT_RECORDS;
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return MOCK_PARENT_RECORDS;
    } catch {
      return MOCK_PARENT_RECORDS;
    }
  });
  const [formState, setFormState] = useState(INITIAL_FORM);
  const [documents, setDocuments] = useState(emptyDocuments);
  const [editingId, setEditingId] = useState(null);

  const isEditing = Boolean(editingId);

  useEffect(() => {
    const role = sessionStorage.getItem("brightMindsRole");
    if (role !== "parent") {
      window.location.replace("/login?role=parent");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  }, [records]);

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

  const analysisPreview = useMemo(() => generateAnalysis(formState), [formState]);

  const resetForm = () => {
    setFormState(INITIAL_FORM);
    setDocuments(emptyDocuments);
    setEditingId(null);
  };

  const hydratePayload = (payload) => {
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
      id: editingId ?? createRecordId(),
      createdAt: editingId
        ? records.find((record) => record.id === editingId)?.createdAt
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documents,
      analysis,
    };
  };

  const handleSave = (event) => {
    event.preventDefault();
    const payload = hydratePayload(formState);
    if (isEditing) {
      setRecords((prev) => prev.map((record) => (record.id === editingId ? payload : record)));
    } else {
      setRecords((prev) => [payload, ...prev]);
    }
    resetForm();
  };

  const handleCopyAnalysis = async (analysis) => {
    try {
      await navigator.clipboard.writeText(analysis);
      alert("Summary copied.");
    } catch {
      alert("Copy failed. Try again.");
    }
  };

  const handleEditRecord = (record) => {
    setFormState({
      studentName: record.studentName,
      studentAge: record.studentAge,
      gradeLevel: record.gradeLevel,
      eligibilityStatus: record.eligibilityStatus,
      eligibilityDate: record.eligibilityDate,
      presentLevels: record.presentLevels,
      currentPerformance: record.currentPerformance,
      goals: record.goals,
      accommodations: record.accommodations,
      parentSurvey: record.parentSurvey,
      notes: record.notes,
      relatedServices: record.relatedServices,
    });
    setDocuments(record.documents ?? emptyDocuments);
    setEditingId(record.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteRecord = (recordId) => {
    const confirmed = window.confirm("Are you sure you want to delete this entry?");
    if (!confirmed) return;
    setRecords((prev) => prev.filter((record) => record.id !== recordId));
    if (editingId === recordId) {
      resetForm();
    }
  };

  return (
    <div className="parent-page">
      <header className="parent-header">
        <a href="/" className="parent-brand">
          <span aria-hidden="true">BM</span>
          BrightMinds
        </a>
        <nav aria-label="Parent navigation">
          <a href="/" className="parent-link">
            Product site
          </a>
          <a href="/login" className="parent-link">
            Switch account
          </a>
        </nav>
      </header>

      <main className="parent-main">
        <section className="parent-hero">
          <h1>My Child</h1>
          <p>
            Share how your child is doing, what goals matter most, and which supports make a difference. BrightMinds keeps
            everyone aligned between meetings.
          </p>
          <div className="parent-actions">
            <button type="button" className="parent-secondary" onClick={() => handleCopyAnalysis(analysisPreview)}>
              Copy summary
            </button>
            <button type="button" className="parent-secondary" onClick={resetForm}>
              Clear form
            </button>
          </div>
        </section>

        <section className="parent-card">
          <form className="parent-form" onSubmit={handleSave}>
            <fieldset>
              <legend>Student profile</legend>
              <div className="form-grid">
                <label>
                  Child&apos;s name
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
              <legend>Current picture</legend>
              <label>
                Present levels
                <textarea
                  name="presentLevels"
                  value={formState.presentLevels}
                  onChange={handleInputChange}
                  placeholder="Describe strengths, interests, and areas where support helps most."
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
                  placeholder="Share recent experiences, progress at home, or community activities."
                  rows={3}
                />
              </label>
              <label>
                Family goals
                <textarea
                  name="goals"
                  value={formState.goals}
                  onChange={handleInputChange}
                  placeholder="List the goals you hope to see this year."
                  rows={3}
                  required
                />
              </label>
              <label>
                Supports & accommodations
                <textarea
                  name="accommodations"
                  value={formState.accommodations}
                  onChange={handleInputChange}
                  placeholder="Document tools, routines, or accommodations that help."
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
                  placeholder="Mention frequency, scheduling preferences, or transportation needs."
                  rows={2}
                />
              </label>
            </fieldset>

            <fieldset>
              <legend>Family voice</legend>
              <label>
                Parent survey insights
                <textarea
                  name="parentSurvey"
                  value={formState.parentSurvey}
                  onChange={handleInputChange}
                  placeholder="Capture survey responses or questions you want to discuss."
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
                {isEditing ? "Save changes" : "Save my child\'s details"}
              </button>
            </div>
          </form>
        </section>

        <section className="parent-analysis">
          <h3>Preview summary</h3>
          <p>{analysisPreview}</p>
        </section>

        <section className="parent-list">
          <div className="parent-list-header">
            <h2>Saved child profiles</h2>
            <p>Review earlier entries, copy summaries, or update details when things change.</p>
          </div>

          {records.length === 0 ? (
            <div className="parent-empty">
              <h3>No entries yet</h3>
              <p>Share your child\'s story above to begin building a history the team can reference.</p>
            </div>
          ) : (
            <div className="parent-table-wrapper">
              <div className="parent-table-scroll">
                <table className="parent-table">
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
                    {records.map((record) => (
                      <tr key={`parent-record-${record.id}`}>
                        <td>{record.studentName || "Unnamed learner"}</td>
                        <td>{record.gradeLevel || "—"}</td>
                        <td>{record.studentAge || "—"}</td>
                        <td>{record.eligibilityStatus || "—"}</td>
                        <td>{new Date(record.updatedAt).toLocaleDateString()}</td>
                        <td>
                          <div className="parent-table-actions">
                            <button type="button" className="table-link" onClick={() => handleEditRecord(record)}>
                              Open
                            </button>
                            <button
                              type="button"
                              className="table-link"
                              onClick={() => handleCopyAnalysis(record.analysis)}
                            >
                              Copy
                            </button>
                            <button
                              type="button"
                              className="table-link table-link-danger"
                              onClick={() => handleDeleteRecord(record.id)}
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
      </main>
    </div>
  );
}

export default ParentDashboard;
