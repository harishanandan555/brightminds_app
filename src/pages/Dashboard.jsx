
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, createProject, updateProject, deleteProject, analyzeProject } from '../store/slices/projectSlice';
import { logout } from '../store/slices/authSlice';
import { persistor } from '../store/store';
import { addProgressItem, updateProgressItem, deleteProgressItem, extractIep } from '../api/projectsApi';
import { submitFeedback } from '../api/feedbackApi';
import { listUsers, listAllFeedback } from '../api/adminApi';
import AdminUsersList from '../components/AdminUsersList';
import AdminFeedbackList from '../components/AdminFeedbackList';
import "../styles/dashboard.css";

const INITIAL_FORM = {
  projectName: "",
  studentAge: "",
  gradeLevel: "",


  presentLevels: "",
  currentPerformance: "",
  goals: "",
  accommodations: "",
  parentSurvey: "",
  notes: "",
  relatedServices: [],
  otherRelatedService: "",
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
  "Others",
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

// Helper to normalize grade level values from API to match dropdown options
const normalizeGradeLevel = (grade) => {
  if (!grade) return "";
  const normalized = grade.trim().toLowerCase();

  // Find matching grade level (case-insensitive)
  const match = GRADE_LEVELS.find(g => g.toLowerCase() === normalized);
  if (match) return match;

  // Try to match partial patterns like "6th" -> "6th grade"
  const gradeMatch = normalized.match(/^(\d+)(st|nd|rd|th)?/);
  if (gradeMatch) {
    const num = gradeMatch[1];
    const suffix = num === '1' ? 'st' : num === '2' ? 'nd' : num === '3' ? 'rd' : 'th';
    const fullGrade = `${num}${suffix} grade`;
    const found = GRADE_LEVELS.find(g => g.toLowerCase() === fullGrade.toLowerCase());
    if (found) return found;
  }

  // Check for special cases
  if (normalized.includes('pre-k') || normalized.includes('prek')) return "Pre-K";
  if (normalized.includes('kinder')) return "Kindergarten";
  if (normalized.includes('transition')) return "Transition (18-22)";

  return grade; // Return original if no match
};

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
    `Project ${project.projectName || "name pending"} (${project.gradeLevel || "grade TBD"}, age ${project.studentAge || "N/A"
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
      ? `Parents Inputs: ${project.parentSurvey}.`
      : "Parents Inputs pending.",
  ].join(" ");
};

const emptyDocuments = [];



function Dashboard() {
  const dispatch = useDispatch();
  const { items: projects, loading, error } = useSelector((state) => state.projects || { items: [] });
  const { user, role } = useSelector((state) => state.auth || {});
  const [activeTab, setActiveTab] = useState(null);
  const [formState, setFormState] = useState(INITIAL_FORM);
  const [documents, setDocuments] = useState(emptyDocuments);
  const [editingId, setEditingId] = useState(null);
  const [projectCreationType, setProjectCreationType] = useState(null); // 'upload' or 'manual'
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [showAddItemForProject, setShowAddItemForProject] = useState(null);
  const [iepLoading, setIepLoading] = useState(false);
  const [iepError, setIepError] = useState(null);
  const [iepSuccess, setIepSuccess] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    type: 'general',
    rating: 0,
    message: '',
    email: '',
    allowContact: false
  });
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [showMandatoryFeedback, setShowMandatoryFeedback] = useState(false);

  const isSuperadmin = (role || user?.role) === 'superadmin';

  useEffect(() => {
    // Check if user has at least 2 projects and hasn't submitted feedback yet
    if (projects.length >= 2) {
      const hasSubmitted = localStorage.getItem('hasSubmittedMandatoryFeedback');
      if (!hasSubmitted) {
        setShowMandatoryFeedback(true);
        setShowFeedbackModal(true);
      }
    }
  }, [projects]);

  useEffect(() => {
    console.log('[Dashboard] Debug Role Check:', {
      roleFromState: role,
      userRole: user?.role,
      computedIsSuperadmin: isSuperadmin,
      userObject: user
    });
  }, [role, user, isSuperadmin]);

  const isEditing = Boolean(editingId);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // Check role - can also be done via a ProtectedRoute component, keeping simple here for now
  useEffect(() => {
    // Rely on redux role if persisted, or check session logic if legacy
    // The authSlice is persisted, so we can check selector or assume login handled redirect.
    // For now, let's trust the user is here after login.
  }, []);

  const resetForm = () => {
    setFormState(INITIAL_FORM);
    setDocuments(emptyDocuments);
    setEditingId(null);
    setValidationErrors({});
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

  // Handle IEP document upload and extraction
  const handleIepUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!/\.(pdf|docx?)$/i.test(file.name)) {
      setIepError('Please upload a PDF or DOCX file.');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setIepError('File size must be less than 10MB.');
      return;
    }

    setIepLoading(true);
    setIepError(null);
    setIepSuccess(null);

    try {
      const result = await extractIep(file);
      console.log('=== IEP Extraction Result ===', result);

      if (result.success && result.projectData) {
        const data = result.projectData;

        // Helper function to convert nested objects/arrays to readable strings
        const formatPresentLevels = (levels) => {
          if (!levels || typeof levels === 'string') return levels || '';
          const parts = [];
          if (levels.academic) parts.push(`Academic: ${levels.academic} `);
          if (levels.functional) parts.push(`Functional: ${levels.functional} `);
          if (levels.behavioral) parts.push(`Behavioral: ${levels.behavioral} `);
          if (levels.socialEmotional) parts.push(`Social - Emotional: ${levels.socialEmotional} `);
          return parts.join('\n') || '';
        };

        const formatGoals = (goals) => {
          if (!goals) return '';
          if (typeof goals === 'string') return goals;
          if (Array.isArray(goals)) {
            return goals.map((g, i) => {
              if (typeof g === 'string') return g;
              const parts = [];
              if (g.area) parts.push(`[${g.area}]`);
              if (g.description) parts.push(g.description);
              if (g.target) parts.push(`Target: ${g.target} `);
              return parts.join(' ') || `Goal ${i + 1} `;
            }).join('\n');
          }
          return '';
        };

        const formatAccommodations = (accommodations) => {
          if (!accommodations) return '';
          if (typeof accommodations === 'string') return accommodations;
          if (Array.isArray(accommodations)) {
            return accommodations.map(a => {
              if (typeof a === 'string') return a;
              const parts = [];
              if (a.category) parts.push(`[${a.category}]`);
              if (a.description) parts.push(a.description);
              return parts.join(' ');
            }).filter(Boolean).join('\n');
          }
          return '';
        };

        const formatRelatedServices = (services) => {
          if (!services || !Array.isArray(services)) return [];
          // Map API services to our predefined options where possible
          return services.map(s => typeof s === 'string' ? s : s.name || s.type || '').filter(Boolean);
        };

        // Auto-fill the form with extracted data
        setFormState(prev => ({
          ...prev,
          projectName: data.studentName || data.projectName || prev.projectName,
          studentAge: data.studentAge || prev.studentAge,
          gradeLevel: normalizeGradeLevel(data.gradeLevel) || prev.gradeLevel,
          presentLevels: formatPresentLevels(data.presentLevels) || prev.presentLevels,
          currentPerformance: data.currentPerformance || prev.currentPerformance,
          goals: formatGoals(data.goals) || prev.goals,
          accommodations: formatAccommodations(data.accommodations) || prev.accommodations,
          notes: data.notes || prev.notes,
          relatedServices: formatRelatedServices(data.relatedServices).length > 0
            ? formatRelatedServices(data.relatedServices)
            : prev.relatedServices,
        }));

        // Store the uploaded document info
        setDocuments([{
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        }]);

        setIepSuccess(`Successfully extracted IEP for ${data.studentName || data.projectName || 'project'}.Review and edit the fields below.`);

        // Switch to manual mode to show the form with pre-filled data
        setProjectCreationType('manual');
      } else {
        setIepError('Could not extract data from the IEP. Please try again or enter information manually.');
      }
    } catch (err) {
      console.error('IEP extraction error:', err);
      setIepError(err.response?.data?.message || 'Failed to extract IEP. Please try again.');
    } finally {
      setIepLoading(false);
    }
  };

  const hydrateProjectPayload = (payload) => {
    let services = [...payload.relatedServices];
    if (services.includes("Others")) {
      services = services.filter(s => s !== "Others");
      if (payload.otherRelatedService?.trim()) {
        services.push(payload.otherRelatedService.trim());
      }
    }

    const trimmed = {
      ...payload,
      projectName: payload.projectName?.trim() || "",
      studentAge: Number(payload.studentAge) || 0,
      gradeLevel: payload.gradeLevel?.trim() || "",

      presentLevels: payload.presentLevels?.trim() || "",
      currentPerformance: payload.currentPerformance?.trim() || "",
      goals: payload.goals?.trim() || "",
      accommodations: payload.accommodations?.trim() || "",
      parentSurvey: payload.parentSurvey?.trim() || "",
      notes: payload.notes?.trim() || "",
      relatedServices: services,
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
      projectName: formState.projectName?.trim() || "",
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

  // Validation function
  const validateForm = () => {
    const errors = {};

    // Project name validation
    if (!formState.projectName?.trim()) {
      errors.projectName = 'Project name is required';
    } else if (formState.projectName.trim().length < 2) {
      errors.projectName = 'Project name must be at least 2 characters';
    }

    // Age validation
    const age = Number(formState.studentAge);
    if (!formState.studentAge) {
      errors.studentAge = 'Age is required';
    } else if (isNaN(age) || age < 3 || age > 22) {
      errors.studentAge = 'Age must be between 3 and 22';
    }

    // Grade level validation
    if (!formState.gradeLevel?.trim()) {
      errors.gradeLevel = 'Grade level is required';
    }

    // Present levels validation
    if (!formState.presentLevels?.trim()) {
      errors.presentLevels = 'Present levels are required';
    } else if (formState.presentLevels.trim().length < 10) {
      errors.presentLevels = 'Please provide more detail (at least 10 characters)';
    }

    // Goals validation
    if (!formState.goals?.trim()) {
      errors.goals = 'Student goals are required';
    } else if (formState.goals.trim().length < 10) {
      errors.goals = 'Please provide more detail (at least 10 characters)';
    }

    // Services validation
    if (formState.relatedServices.includes("Others") && !formState.otherRelatedService?.trim()) {
      errors.otherRelatedService = 'Please specify the other service';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProject = async (event) => {
    event.preventDefault();

    // Validate form before saving
    if (!validateForm()) {
      setSaveStatus('');
      return;
    }

    let payload = hydrateProjectPayload(formState);

    setSaveStatus("Generating analysis...");

    try {
      // 1. Generate Analysis First
      const aiPayload = {
        projectName: payload.projectName?.trim() || "",
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

        dispatch(fetchProjects());
        resetForm();

        // Navigate to planning/analysis screen for new projects
        if (!isEditing && payload.analysis) {
          const savedProject = result.payload;
          const stateForPlanning = {
            projectId: savedProject?._id || savedProject?.id,
            projectName: payload.projectName || "",
            studentAge: payload.studentAge || 0,
            gradeLevel: payload.gradeLevel || "",
            presentLevels: payload.presentLevels || "",
            currentPerformance: payload.currentPerformance || "",
            goals: payload.goals || "",
            accommodations: payload.accommodations || "",
            relatedServices: payload.relatedServices || [],
            analysis: payload.analysis || ""
          };

          setTimeout(() => {
            if (window.appNavigate) {
              window.appNavigate("/planning", { usr: stateForPlanning });
            } else {
              window.history.pushState({ usr: stateForPlanning }, "", "/planning");
              window.dispatchEvent(new Event("popstate"));
            }
          }, 500);
        } else {
          // For edits, stay on dashboard and show existing projects
          setActiveTab("existing");
          setTimeout(() => setSaveStatus(""), 2000);
        }
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
      projectName: project.projectName || project.studentName, // Support legacy studentName
      studentAge: project.studentAge,
      gradeLevel: normalizeGradeLevel(project.gradeLevel),


      presentLevels: project.presentLevels,
      currentPerformance: project.currentPerformance,
      goals: project.goals,
      accommodations: project.accommodations,
      parentSurvey: project.parentSurvey,
      notes: project.notes,
      relatedServices: project.relatedServices || [],
      analysis: project.analysis || "", // Load existing analysis
    });

    // Handle loading custom services into "Others"
    const standardServices = RELATED_SERVICE_OPTIONS.filter(s => s !== "Others");
    const projectServices = project.relatedServices || [];
    const customServices = projectServices.filter(s => !standardServices.includes(s));
    const hasCustom = customServices.length > 0;

    setFormState(prev => ({
      ...prev,
      relatedServices: projectServices.filter(s => standardServices.includes(s)).concat(hasCustom ? ["Others"] : []),
      otherRelatedService: hasCustom ? customServices.join(", ") : ""
    }));

    setDocuments(project.documents ?? emptyDocuments);
    setEditingId(project.id || project._id);
    setActiveTab("new");
    setProjectCreationType('manual'); // Set to manual mode when editing
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
    console.log('=== VIEW PLAN: Selected Project ===');
    console.log('Project ID:', project.id || project._id);
    console.log('Student Name:', project.studentName);
    console.log('Full Project Data:', JSON.stringify(project, null, 2));

    // Prepare state for planning view
    const stateForPlanning = {
      ...project,
      projectId: project.id, // Explicitly pass as projectId per requirement
      studentAge: Number(project.studentAge) || 0,
      // Ensure analysis is passed if present
      analysis: project.analysis || ""
    };

    console.log('=== VIEW PLAN: Data being sent to Planning page ===');
    console.log(JSON.stringify(stateForPlanning, null, 2));

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
          <span aria-hidden="true">uE</span>
          upableED
        </a>
        <nav aria-label="Dashboard navigation">
          <a href="/" className="dashboard-link" data-route>
            Product site
          </a>
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="dashboard-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
          >
            💬 Feedback
          </button>
          {isSuperadmin && (
            <>
              <button
                onClick={() => setActiveTab('users')}
                className={`dashboard-link ${activeTab === 'users' ? 'active' : ''}`}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  font: 'inherit',
                  fontWeight: activeTab === 'users' ? 'bold' : 'normal',
                  color: activeTab === 'users' ? 'var(--primary-color)' : 'inherit'
                }}
              >
                👥 Users
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`dashboard-link ${activeTab === 'feedback' ? 'active' : ''}`}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  font: 'inherit',
                  fontWeight: activeTab === 'feedback' ? 'bold' : 'normal',
                  color: activeTab === 'feedback' ? 'var(--primary-color)' : 'inherit'
                }}
              >
                📋 All Feedback
              </button>
            </>
          )}
          <span className="user-info">
            {user?.name || user?.email || 'User'}
          </span>
          <button onClick={async () => {
            dispatch(logout());
            await persistor.purge(); // Ensure storage is cleared
            window.location.href = '/login';
          }} className="dashboard-link logout-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}>
            Logout
          </button>
        </nav>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-hero">
          <div className="hero-content">
            <h1>Educator dashboard</h1>
            <p>Select how you want to work with upableED today.</p>
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
        {activeTab === 'users' && isSuperadmin && (
          <div style={{ padding: '0 2rem' }}>
            <AdminUsersList />
          </div>
        )}

        {activeTab === 'feedback' && isSuperadmin && (
          <div style={{ padding: '0 2rem' }}>
            <AdminFeedbackList />
          </div>
        )}

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

                <button type="button" className="ghost-button" onClick={resetForm}>
                  Clear form
                </button>
              </div>
            </header>

            {/* Project Creation Type Selection */}
            {!isEditing && !projectCreationType && (
              <div className="creation-type-selection">
                <h3>How would you like to start?</h3>
                <div className="creation-type-buttons">
                  <button
                    type="button"
                    className="creation-type-button upload-iep"
                    onClick={() => setProjectCreationType('upload')}
                  >
                    <span className="creation-icon">📄</span>
                    <span className="creation-title">Upload IEP</span>
                    <span className="creation-desc">Import an existing IEP document to auto-fill project details</span>
                  </button>
                  <button
                    type="button"
                    className="creation-type-button create-only"
                    onClick={() => setProjectCreationType('manual')}
                  >
                    <span className="creation-icon">✏️</span>
                    <span className="creation-title">Create Project Only</span>
                    <span className="creation-desc">Manually enter all project information from scratch</span>
                  </button>
                </div>
              </div>
            )}

            {/* Upload IEP Section */}
            {projectCreationType === 'upload' && !isEditing && (
              <div className="iep-upload-section">
                <div className="iep-upload-header">
                  <h3>Upload IEP Document</h3>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => setProjectCreationType(null)}
                  >
                    ← Back to options
                  </button>
                </div>
                {iepError && (
                  <div className="alert alert-error" style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', background: '#fee2e2', border: '1px solid #ef4444', color: '#991b1b' }}>
                    {iepError}
                  </div>
                )}
                {iepSuccess && (
                  <div className="alert alert-success" style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', background: '#d4edda', border: '1px solid #28a745', color: '#155724' }}>
                    {iepSuccess}
                  </div>
                )}
                <div className="iep-upload-area">
                  <div className="upload-dropzone">
                    {iepLoading ? (
                      <>
                        <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                        <p>Extracting IEP data...</p>
                        <span className="upload-hint">This may take a few seconds</span>
                      </>
                    ) : (
                      <>
                        <span className="upload-icon">📁</span>
                        <p>Drag and drop your IEP document here, or click to browse</p>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleIepUpload}
                          className="upload-input"
                          disabled={iepLoading}
                        />
                        <span className="upload-hint">Supports PDF, DOC, DOCX files up to 10MB</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="iep-upload-info">
                  <p><strong>Note:</strong> After uploading, you can review and edit the extracted information before saving.</p>
                </div>
              </div>
            )}

            {/* Manual Project Creation Form */}
            {(projectCreationType === 'manual' || isEditing) && (
              <>
                {!isEditing && (
                  <div className="creation-mode-header">
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => {
                        setProjectCreationType(null);
                        resetForm();
                      }}
                    >
                      ← Back to options
                    </button>
                  </div>
                )}

                <form className="project-form" onSubmit={handleSaveProject}>
                  <fieldset>
                    <legend>Project profile</legend>
                    <div className="form-grid">
                      <label className={validationErrors.projectName ? 'has-error' : ''}>
                        Project name
                        <input
                          type="text"
                          name="projectName"
                          value={formState.projectName || ""}
                          onChange={handleInputChange}
                          placeholder="Project name"
                          className={validationErrors.projectName ? 'input-error' : ''}
                        />
                        {validationErrors.projectName && (
                          <span className="field-error">{validationErrors.projectName}</span>
                        )}
                      </label>
                      <label className={validationErrors.studentAge ? 'has-error' : ''}>
                        Age
                        <input
                          type="number"
                          name="studentAge"
                          value={formState.studentAge || ""}
                          onChange={handleInputChange}
                          min={3}
                          max={22}
                          placeholder="e.g., 11"
                          className={validationErrors.studentAge ? 'input-error' : ''}
                        />
                        {validationErrors.studentAge && (
                          <span className="field-error">{validationErrors.studentAge}</span>
                        )}
                      </label>
                      <label className={validationErrors.gradeLevel ? 'has-error' : ''}>
                        Grade level
                        <select
                          name="gradeLevel"
                          value={formState.gradeLevel || ""}
                          onChange={handleInputChange}
                          className={validationErrors.gradeLevel ? 'input-error' : ''}
                        >
                          <option value="">Select grade level</option>
                          {GRADE_LEVELS.map((grade) => (
                            <option key={grade} value={grade}>
                              {grade}
                            </option>
                          ))}
                        </select>
                        {validationErrors.gradeLevel && (
                          <span className="field-error">{validationErrors.gradeLevel}</span>
                        )}
                      </label>


                    </div>
                  </fieldset>

                  <fieldset>
                    <legend>Instructional planning</legend>
                    <label className={validationErrors.presentLevels ? 'has-error' : ''}>
                      Present levels
                      <textarea
                        name="presentLevels"
                        value={formState.presentLevels || ""}
                        onChange={handleInputChange}
                        placeholder="Describe how the student is performing across academic, cognitive, and functional areas."
                        rows={4}
                        className={validationErrors.presentLevels ? 'input-error' : ''}
                      />
                      {validationErrors.presentLevels && (
                        <span className="field-error">{validationErrors.presentLevels}</span>
                      )}
                    </label>
                    <label className={validationErrors.goals ? 'has-error' : ''}>
                      Student goals
                      <textarea
                        name="goals"
                        value={formState.goals || ""}
                        onChange={handleInputChange}
                        placeholder="List short- and long-term goals along with mastery criteria."
                        rows={3}
                        className={validationErrors.goals ? 'input-error' : ''}
                      />
                      {validationErrors.goals && (
                        <span className="field-error">{validationErrors.goals}</span>
                      )}
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
                    {(formState.relatedServices || []).includes("Others") && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <input
                          type="text"
                          name="otherRelatedService"
                          value={formState.otherRelatedService || ""}
                          onChange={handleInputChange}
                          placeholder="Please specify other service..."
                          className={validationErrors.otherRelatedService ? 'input-error' : ''}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-default)' }}
                        />
                        {validationErrors.otherRelatedService && (
                          <span className="field-error">{validationErrors.otherRelatedService}</span>
                        )}
                      </div>
                    )}
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
                      Parents Inputs
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
                      <button type="button" className="ghost-button" onClick={() => {
                        resetForm();
                        setProjectCreationType(null);
                      }}>
                        Cancel editing
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}
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
                        <th scope="col">Project</th>
                        <th scope="col">Grade level</th>
                        <th scope="col">Age</th>
                        <th scope="col">Progress</th>
                        <th scope="col">Last updated</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project, index) => {
                        const projectKey = project.id || project._id || `project - ${index} `;
                        return (
                          <React.Fragment key={projectKey}>
                            <tr
                              onClick={() => setExpandedProjectId(expandedProjectId === projectKey ? null : projectKey)}
                              style={{ cursor: 'pointer' }}
                            >
                              <td>{project.projectName || project.studentName || "Unnamed project"}</td>
                              <td>{project.gradeLevel || "—"}</td>
                              <td>{project.studentAge || "—"}</td>
                              <td>
                                <div className="progress-cell">
                                  <span className={`progress - badge progress - ${(project.progress || 'pending').replace('_', '-')} `}>
                                    {project.progress === 'completed' && '✓ '}
                                    {(project.progress || 'pending').replace('_', ' ')}
                                  </span>
                                  {project.progressItems?.length > 0 && (
                                    <span className="progress-notes">
                                      {project.progressItems.filter(i => i.status === 'completed').length}/{project.progressItems.length} goals
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td>{new Date(project.updatedAt).toLocaleDateString()}</td>
                              <td>
                                <div className="table-actions">
                                  <button type="button" className="table-link" onClick={(e) => { e.stopPropagation(); handleEditProject(project); }}>
                                    Edit
                                  </button>
                                  <button type="button" className="table-link" onClick={(e) => { e.stopPropagation(); handleViewPlan(project); }}>
                                    View Plan
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {expandedProjectId === projectKey && (
                              <tr>
                                <td colSpan="6" style={{ padding: 0 }}>
                                  <div className="progress-items-section">
                                    <div className="progress-items-header">
                                      <h4>Progress Goals ({project.progressItems?.length || 0})</h4>
                                      <button className="add-item-btn" onClick={() => setShowAddItemForProject(projectKey)}>+ Add Goal</button>
                                    </div>

                                    <div className="progress-items-list">
                                      {project.progressItems?.map((item) => (
                                        <div key={item.id} className="progress-item">
                                          <input
                                            type="checkbox"
                                            className="progress-item-checkbox"
                                            checked={item.status === 'completed'}
                                            onChange={async () => {
                                              const newStatus = item.status === 'completed' ? 'pending' : 'completed';
                                              await updateProgressItem(project.id || project._id, item.id, { status: newStatus });
                                              dispatch(fetchProjects());
                                            }}
                                          />
                                          <div className="progress-item-content">
                                            <p className={`progress - item - title ${item.status === 'completed' ? 'completed' : ''} `}>
                                              {item.title}
                                            </p>
                                            <span className="progress-item-meta">
                                              {new Date(item.updatedAt).toLocaleDateString()}
                                            </span>
                                          </div>
                                          <span className={`progress - item - status status - ${item.status.replace('_', '-')} `}>
                                            {item.status.replace('_', ' ')}
                                          </span>
                                          <div className="progress-item-actions">
                                            <button
                                              className="progress-item-btn"
                                              onClick={async () => {
                                                await deleteProgressItem(project.id || project._id, item.id);
                                                dispatch(fetchProjects());
                                              }}
                                            >
                                              ✕
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                      {(!project.progressItems || project.progressItems.length === 0) && (
                                        <p style={{ color: '#57606a', fontSize: '0.8125rem' }}>No goals yet. Run analysis or add manually.</p>
                                      )}
                                    </div>

                                    {showAddItemForProject === projectKey && (
                                      <div className="add-item-form">
                                        <input
                                          type="text"
                                          placeholder="Enter new goal..."
                                          value={newItemTitle}
                                          onChange={(e) => setNewItemTitle(e.target.value)}
                                        />
                                        <button
                                          className="save-btn"
                                          onClick={async () => {
                                            if (newItemTitle.trim()) {
                                              await addProgressItem(project.id || project._id, { title: newItemTitle.trim() });
                                              setNewItemTitle('');
                                              setShowAddItemForProject(null);
                                              dispatch(fetchProjects());
                                            }
                                          }}
                                        >
                                          Save
                                        </button>
                                        <button className="cancel-btn" onClick={() => { setShowAddItemForProject(null); setNewItemTitle(''); }}>
                                          Cancel
                                        </button>
                                      </div>
                                    )}

                                    {project.progressHistory?.length > 0 && (
                                      <div className="progress-history">
                                        <h5>Recent Activity</h5>
                                        {project.progressHistory.slice(-5).reverse().map((entry, i) => (
                                          <div key={i} className="history-item">
                                            <span className="history-item-action">{entry.action}</span>
                                            <span>{entry.itemTitle}</span>
                                            <span className="history-item-time">{new Date(entry.timestamp).toLocaleDateString()}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="modal-overlay" onClick={() => setShowFeedbackModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{showMandatoryFeedback ? "We'd love your feedback!" : "Send Feedback"}</h2>
              <button
                className="close-button"
                onClick={() => setShowFeedbackModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              {showMandatoryFeedback && (
                <p style={{ marginBottom: '1rem', color: '#64748b' }}>
                  Congratulations on creating your second project! To help us improve upableED, please take a moment to share your thoughts.
                </p>
              )}

              {/* Feedback Type */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                  Feedback Type
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['general', 'bug', 'feature'].map(type => (
                    <button
                      key={type}
                      className={`type-button ${feedbackData.type === type ? 'active' : ''}`}
                      onClick={() => setFeedbackData(prev => ({ ...prev, type }))}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        border: `1px solid ${feedbackData.type === type ? 'var(--primary-color)' : 'var(--border-default)'}`,
                        background: feedbackData.type === type ? 'var(--primary-light)' : 'white',
                        color: feedbackData.type === type ? 'var(--primary-color)' : 'inherit',
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                  How would you rate your experience?
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setFeedbackData(prev => ({ ...prev, rating: star }))}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: star <= feedbackData.rating ? '#fbbf24' : '#e2e8f0',
                        transition: 'color 0.2s'
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                  Your Message
                </label>
                <textarea
                  value={feedbackData.message}
                  onChange={(e) => setFeedbackData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Tell us what you like or what we can improve..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '2px solid var(--border-default)',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={feedbackData.email}
                  onChange={(e) => setFeedbackData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@example.com"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '2px solid var(--border-default)',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Allow Contact */}
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={feedbackData.allowContact}
                    onChange={(e) => setFeedbackData(prev => ({ ...prev, allowContact: e.target.checked }))}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>You may contact me about this feedback</span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="ghost-button"
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedbackData({
                    type: 'general',
                    rating: 0,
                    message: '',
                    email: '',
                    allowContact: false
                  });
                }}
              >
                Cancel
              </button>
              <button
                className="primary-button"
                onClick={async () => {
                  if (!feedbackData.message.trim()) {
                    alert('Please enter your feedback');
                    return;
                  }
                  setFeedbackSubmitting(true);
                  try {
                    await submitFeedback({
                      type: feedbackData.type,
                      rating: feedbackData.rating,
                      message: feedbackData.message,
                      email: feedbackData.email || user?.email || null,
                      allowContact: feedbackData.allowContact
                    });

                    if (showMandatoryFeedback) {
                      localStorage.setItem('hasSubmittedMandatoryFeedback', 'true');
                      setShowMandatoryFeedback(false);
                    }

                    alert('Thank you for your feedback!');
                    setShowFeedbackModal(false);
                    setFeedbackData({
                      type: 'general',
                      rating: 0,
                      message: '',
                      email: '',
                      allowContact: false
                    });
                  } catch (err) {
                    alert('Failed to submit feedback. Please try again.');
                  } finally {
                    setFeedbackSubmitting(false);
                  }
                }}
                disabled={feedbackSubmitting}
              >
                {feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

