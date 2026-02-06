import { useEffect, useState } from "react";
import { useDispatch } from 'react-redux';
import { analyzeProject, updateProject } from '../store/slices/projectSlice';
import { addProgressItem } from '../api/projectsApi';
import "../styles/dashboard.css"; // Reuse dashboard styles or create new one

const Planning = () => {
    const dispatch = useDispatch();
    const [projectData, setProjectData] = useState(null);
    const [analysis, setAnalysis] = useState("");
    const [analysisData, setAnalysisData] = useState(null); // Structured analysis object
    const [editMode, setEditMode] = useState(false); // Toggle between formatted view and edit mode
    const [loading, setLoading] = useState(false);
    const [addingGoals, setAddingGoals] = useState(false); // Adding goals to progress
    const [successMessage, setSuccessMessage] = useState(null); // Persistent success message
    const [error, setError] = useState(null);

    useEffect(() => {
        // Hydrate from history state
        const state = window.history.state;
        if (state && state.usr) {
            setProjectData(state.usr);
            if (state.usr.analysis) {
                const rawAnalysis = state.usr.analysis;

                // Handle analysis as object or string
                if (typeof rawAnalysis === "object" && rawAnalysis !== null) {
                    // It's a structured object - set analysisData and format to string
                    setAnalysisData(rawAnalysis);

                    // Format the analysis object into readable text
                    let formattedAnalysis = `### Student Analysis Summary\n\n`;
                    formattedAnalysis += `**Summary:** ${rawAnalysis.summary || 'N/A'}\n\n`;

                    if (rawAnalysis.instructionalFocus?.length > 0) {
                        formattedAnalysis += `**Instructional Focus:**\n`;
                        rawAnalysis.instructionalFocus.forEach(item => {
                            formattedAnalysis += `- ${item.area}: ${item.details}\n`;
                        });
                        formattedAnalysis += `\n`;
                    }

                    if (rawAnalysis.strategies) {
                        formattedAnalysis += `**Strategies:**\n`;
                        if (rawAnalysis.strategies.academic?.length > 0) {
                            formattedAnalysis += `- Academic: ${rawAnalysis.strategies.academic.join('; ')}\n`;
                        }
                        if (rawAnalysis.strategies.cognitive?.length > 0) {
                            formattedAnalysis += `- Cognitive: ${rawAnalysis.strategies.cognitive.join('; ')}\n`;
                        }
                        if (rawAnalysis.strategies.behavioral?.length > 0) {
                            formattedAnalysis += `- Behavioral: ${rawAnalysis.strategies.behavioral.join('; ')}\n`;
                        }
                        formattedAnalysis += `\n`;
                    }

                    if (rawAnalysis.shortTermGoals?.length > 0) {
                        formattedAnalysis += `**Short-Term Goals:**\n`;
                        rawAnalysis.shortTermGoals.forEach(goal => {
                            formattedAnalysis += `- ${goal}\n`;
                        });
                        formattedAnalysis += `\n`;
                    }

                    if (rawAnalysis.longTermGoals?.length > 0) {
                        formattedAnalysis += `**Long-Term Goals:**\n`;
                        rawAnalysis.longTermGoals.forEach(goal => {
                            formattedAnalysis += `- ${goal}\n`;
                        });
                        formattedAnalysis += `\n`;
                    }

                    if (rawAnalysis.accommodations?.length > 0) {
                        formattedAnalysis += `**Accommodations:** ${rawAnalysis.accommodations.join(', ')}\n\n`;
                    }

                    if (rawAnalysis.services?.length > 0) {
                        formattedAnalysis += `**Services:** ${rawAnalysis.services.join(', ')}\n\n`;
                    }

                    if (rawAnalysis.progressMonitoring) {
                        formattedAnalysis += `**Progress Monitoring:** ${rawAnalysis.progressMonitoring}\n\n`;
                    }

                    if (rawAnalysis.familyCollaboration) {
                        formattedAnalysis += `**Family Collaboration:** ${rawAnalysis.familyCollaboration}\n`;
                    }

                    setAnalysis(formattedAnalysis);
                } else {
                    // It's already a string
                    setAnalysis(rawAnalysis);
                }
            } else {
                // Trigger analysis if not present
                generateAnalysis(state.usr);
            }
        }
    }, []);

    const generateAnalysis = async (data) => {
        // Only run if we have enough data
        if (!data || !data.studentName) return;

        console.log('=== PLANNING: Received Data for Analysis ===');
        console.log(JSON.stringify(data, null, 2));

        setLoading(true);
        setError(null);

        try {
            // Helper to safely convert value to string (handles arrays, objects, strings)
            const toSafeString = (val) => {
                if (val === null || val === undefined) return "";
                if (typeof val === "string") return val.trim();
                if (Array.isArray(val)) return val.join(", ");
                if (typeof val === "object") return JSON.stringify(val);
                return String(val);
            };

            // Construct payload strictly for analysis endpoint
            // NOTE: Do NOT send projectId - the remote server tries to look it up and fails
            const aiPayload = {
                studentName: toSafeString(data.studentName),
                studentAge: Number(data.studentAge) || 0,
                gradeLevel: toSafeString(data.gradeLevel),
                presentLevels: toSafeString(data.presentLevels),
                currentPerformance: toSafeString(data.currentPerformance),
                goals: toSafeString(data.goals),
                accommodations: toSafeString(data.accommodations),
                relatedServices: Array.isArray(data.relatedServices) ? data.relatedServices : []
            };

            console.log('=== PLANNING: Sending to Analysis API ===');
            console.log(JSON.stringify(aiPayload, null, 2));

            const result = await dispatch(analyzeProject(aiPayload));

            console.log('=== PLANNING: Analysis API Response ===');
            console.log('Fulfilled:', analyzeProject.fulfilled.match(result));
            console.log('Full Result:', JSON.stringify(result, null, 2));

            if (analyzeProject.fulfilled.match(result)) {
                const rawAnalysisData = result.payload.analysis;
                console.log('=== PLANNING: Analysis Data ===');
                console.log(rawAnalysisData);

                // Format the analysis object into readable text
                let formattedAnalysis = "";
                if (typeof rawAnalysisData === "string") {
                    formattedAnalysis = rawAnalysisData;
                } else if (typeof rawAnalysisData === "object" && rawAnalysisData !== null) {
                    // Convert structured object to readable format
                    formattedAnalysis = `### Student Analysis Summary\n\n`;
                    formattedAnalysis += `**Summary:** ${rawAnalysisData.summary || 'N/A'}\n\n`;

                    if (rawAnalysisData.instructionalFocus?.length > 0) {
                        formattedAnalysis += `**Instructional Focus:**\n`;
                        rawAnalysisData.instructionalFocus.forEach(item => {
                            formattedAnalysis += `- ${item.area}: ${item.details}\n`;
                        });
                        formattedAnalysis += `\n`;
                    }

                    if (rawAnalysisData.strategies) {
                        formattedAnalysis += `**Strategies:**\n`;
                        if (rawAnalysisData.strategies.academic?.length > 0) {
                            formattedAnalysis += `- Academic: ${rawAnalysisData.strategies.academic.join('; ')}\n`;
                        }
                        if (rawAnalysisData.strategies.cognitive?.length > 0) {
                            formattedAnalysis += `- Cognitive: ${rawAnalysisData.strategies.cognitive.join('; ')}\n`;
                        }
                        if (rawAnalysisData.strategies.behavioral?.length > 0) {
                            formattedAnalysis += `- Behavioral: ${rawAnalysisData.strategies.behavioral.join('; ')}\n`;
                        }
                        formattedAnalysis += `\n`;
                    }

                    if (rawAnalysisData.shortTermGoals?.length > 0) {
                        formattedAnalysis += `**Short-Term Goals:**\n`;
                        rawAnalysisData.shortTermGoals.forEach(goal => {
                            formattedAnalysis += `- ${goal}\n`;
                        });
                        formattedAnalysis += `\n`;
                    }

                    if (rawAnalysisData.longTermGoals?.length > 0) {
                        formattedAnalysis += `**Long-Term Goals:**\n`;
                        rawAnalysisData.longTermGoals.forEach(goal => {
                            formattedAnalysis += `- ${goal}\n`;
                        });
                        formattedAnalysis += `\n`;
                    }

                    if (rawAnalysisData.accommodations?.length > 0) {
                        formattedAnalysis += `**Accommodations:** ${rawAnalysisData.accommodations.join(', ')}\n\n`;
                    }

                    if (rawAnalysisData.services?.length > 0) {
                        formattedAnalysis += `**Services:** ${rawAnalysisData.services.join(', ')}\n\n`;
                    }

                    if (rawAnalysisData.progressMonitoring) {
                        formattedAnalysis += `**Progress Monitoring:** ${rawAnalysisData.progressMonitoring}\n\n`;
                    }

                    if (rawAnalysisData.familyCollaboration) {
                        formattedAnalysis += `**Family Collaboration:** ${rawAnalysisData.familyCollaboration}\n`;
                    }
                }

                // Store both the formatted text and the structured object
                setAnalysis(formattedAnalysis);
                // Store the raw data for structured display
                if (typeof rawAnalysisData === "object" && rawAnalysisData !== null) {
                    setAnalysisData(rawAnalysisData);
                }
            } else {
                console.error('=== PLANNING: Analysis Failed ===');
                console.error(result);
                setError("Failed to generate analysis. Please try again.");
            }
        } catch (err) {
            console.error('=== PLANNING: Unexpected Error ===');
            console.error(err);
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        window.history.back();
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(analysis);
            alert("Analysis copied to clipboard!");
        } catch {
            alert("Failed to copy.");
        }
    };

    const handleSave = async () => {
        console.log('[Planning] handleSave called. projectData:', projectData);

        // Fallback: try to find ID in projectData (could be id or projectId or _id)
        const idToUse = projectData?.projectId || projectData?.id || projectData?._id;

        if (!idToUse) {
            console.error('[Planning] Cannot save: No project ID found in projectData', projectData);
            alert("Cannot save: No project ID found.");
            return;
        }

        try {
            // Update the project with the generated analysis
            await dispatch(updateProject({
                id: idToUse,
                data: { analysis: analysis }
            }));
            alert("Analysis saved to project!");
        } catch (err) {
            alert("Failed to save analysis.");
        }
    };

    // Add all goals from analysis to project progress
    const handleAddGoalsToProgress = async () => {
        const idToUse = projectData?.projectId || projectData?.id || projectData?._id;

        console.log('=== ADD GOALS TO PROGRESS ===');
        console.log('Project ID to use:', idToUse);
        console.log('Project Data:', projectData);
        console.log('Analysis Data:', analysisData);

        if (!idToUse) {
            alert("Cannot add goals: No project ID found.");
            return;
        }

        if (!analysisData) {
            console.log('No analysisData available - state is null or undefined');
            alert("No analysis data available. Please generate analysis first.");
            return;
        }

        // Collect all goals from analysisData with proper payload format
        const allGoals = [];

        console.log('Short-Term Goals:', analysisData.shortTermGoals);
        console.log('Long-Term Goals:', analysisData.longTermGoals);
        console.log('Instructional Focus:', analysisData.instructionalFocus);

        if (analysisData.shortTermGoals?.length > 0) {
            analysisData.shortTermGoals.forEach(goal => {
                allGoals.push({
                    title: `[Short-Term] ${goal}`,
                    status: 'pending',
                    notes: 'Auto-generated from AI analysis - Short-term goal'
                });
            });
        }

        if (analysisData.longTermGoals?.length > 0) {
            analysisData.longTermGoals.forEach(goal => {
                allGoals.push({
                    title: `[Long-Term] ${goal}`,
                    status: 'pending',
                    notes: 'Auto-generated from AI analysis - Long-term goal'
                });
            });
        }

        // Also add instructional focus items as goals
        if (analysisData.instructionalFocus?.length > 0) {
            analysisData.instructionalFocus.forEach(item => {
                allGoals.push({
                    title: `[Focus] ${item.area}: ${item.details}`,
                    status: 'pending',
                    notes: 'Auto-generated from AI analysis - Instructional focus area'
                });
            });
        }

        console.log('=== ALL GOALS TO BE ADDED ===');
        console.log('Total Goals Count:', allGoals.length);
        console.log('Goals Array:', JSON.stringify(allGoals, null, 2));

        if (allGoals.length === 0) {
            alert("No goals found in analysis to add.");
            return;
        }

        setAddingGoals(true);

        // Prepare the payload with all goals as an array
        const payload = {
            items: allGoals.map(goal => ({
                title: goal.title,
                status: goal.status,
                notes: goal.notes
            }))
        };

        console.log('\n=== SENDING BATCH REQUEST ===');
        console.log('Endpoint:', `POST /projects/${idToUse}/progress-item`);
        console.log('Payload:', JSON.stringify(payload, null, 2));

        try {
            const response = await addProgressItem(idToUse, payload);
            console.log('\n=== API RESPONSE ===');
            console.log('Response:', JSON.stringify(response, null, 2));

            setSuccessMessage(`✅ Successfully added ${allGoals.length} goals to project progress!`);
            setError(null);
        } catch (err) {
            console.error('Error adding goals to progress:', err);
            console.error('Error details:', err.response?.data || err.message);
            setError('Failed to add goals to progress. Check console for details.');
            setSuccessMessage(null);
        } finally {
            setAddingGoals(false);
        }
    };

    if (!projectData && !loading) {
        return (
            <div className="dashboard-page">
                <header className="dashboard-header">
                    <a href="/" className="dashboard-brand">upableED</a>
                </header>
                <main className="dashboard-main">
                    <div className="workspace-placeholder">
                        <h2>No Project Data Found</h2>
                        <button className="primary-button" onClick={() => window.location.href = '/dashboard'}>Return to Dashboard</button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-page planning-page">
            <header className="dashboard-header">
                <a href="/dashboard" className="dashboard-brand">
                    <span aria-hidden="true">uE</span>
                    upableED
                </a>
                <nav>
                    <button className="ghost-button" onClick={handleBack}>Back to Editor</button>
                </nav>
            </header>

            <main className="dashboard-main">
                <section className="dashboard-hero">
                    <div className="hero-content">
                        <h1>Planning Assistant</h1>
                        <p>Generating insights for <strong>{projectData?.studentName}</strong></p>
                    </div>
                </section>

                <section className="workspace-card">
                    <header className="workspace-header">
                        <div>
                            <h2>Comprehensive Analysis</h2>
                            <p>Review the generated narrative based on the student profile.</p>
                        </div>
                        <div className="workspace-actions">
                            <button className="ghost-button" onClick={() => generateAnalysis(projectData)} disabled={loading}>
                                {loading ? "Regenerating..." : "🔄 Regenerate"}
                            </button>
                            <button
                                className="ghost-button"
                                onClick={handleAddGoalsToProgress}
                                disabled={!analysisData || addingGoals}
                                title="Add all goals from analysis to project progress tracking"
                            >
                                {addingGoals ? "Adding..." : "📋 Add Goals to Progress"}
                            </button>
                            <button className="primary-button" onClick={handleSave} disabled={!analysis}>
                                💾 Save Analysis
                            </button>
                        </div>
                    </header>

                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="alert alert-success" style={{
                            background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                            border: '1px solid #28a745',
                            color: '#155724',
                            padding: '1rem 1.25rem',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontWeight: '500'
                        }}>
                            <span>{successMessage}</span>
                            <button
                                onClick={() => setSuccessMessage(null)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#155724',
                                    fontSize: '1.25rem',
                                    cursor: 'pointer',
                                    padding: '0 0.5rem'
                                }}
                            >
                                ×
                            </button>
                        </div>
                    )}

                    <div className="planning-content">
                        {loading && !analysis ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Analyzing student data...</p>
                            </div>
                        ) : (
                            <div className="analysis-result">
                                {/* Mode Toggle */}
                                <div className="analysis-mode-toggle">
                                    <button
                                        className={`mode-btn ${!editMode ? 'active' : ''}`}
                                        onClick={() => setEditMode(false)}
                                    >
                                        📊 Formatted View
                                    </button>
                                    <button
                                        className={`mode-btn ${editMode ? 'active' : ''}`}
                                        onClick={() => setEditMode(true)}
                                    >
                                        ✏️ Edit Text
                                    </button>
                                </div>

                                {editMode ? (
                                    <textarea
                                        className="analysis-textarea"
                                        value={analysis}
                                        onChange={(e) => setAnalysis(e.target.value)}
                                        rows={20}
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            lineHeight: '1.6',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            color: '#333',
                                            backgroundColor: '#fff'
                                        }}
                                    />
                                ) : (
                                    <div className="analysis-display">
                                        {/* Summary Section */}
                                        {analysisData?.summary && (
                                            <div className="analysis-section summary">
                                                <div className="analysis-section-header">
                                                    <span className="analysis-section-icon">📋</span>
                                                    <h3 className="analysis-section-title">Summary</h3>
                                                </div>
                                                <div className="analysis-content">
                                                    <p>{analysisData.summary}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Instructional Focus Section */}
                                        {analysisData?.instructionalFocus?.length > 0 && (
                                            <div className="analysis-section focus">
                                                <div className="analysis-section-header">
                                                    <span className="analysis-section-icon">🎯</span>
                                                    <h3 className="analysis-section-title">Instructional Focus Areas</h3>
                                                </div>
                                                <ul className="analysis-bullet-list">
                                                    {analysisData.instructionalFocus.map((item, idx) => (
                                                        <li key={idx} className="analysis-bullet-item">
                                                            <span className="bullet-icon">{idx + 1}</span>
                                                            <span className="bullet-text">
                                                                <strong>{item.area}:</strong> {item.details}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Strategies Section */}
                                        {analysisData?.strategies && (
                                            <div className="analysis-section strategies">
                                                <div className="analysis-section-header">
                                                    <span className="analysis-section-icon">💡</span>
                                                    <h3 className="analysis-section-title">Recommended Strategies</h3>
                                                </div>
                                                <div className="analysis-content">
                                                    {analysisData.strategies.academic?.length > 0 && (
                                                        <div className="strategy-category">
                                                            <span className="strategy-label academic">📚 Academic</span>
                                                            <ul className="analysis-bullet-list">
                                                                {analysisData.strategies.academic.map((item, idx) => (
                                                                    <li key={idx} className="analysis-bullet-item">
                                                                        <span className="bullet-icon">✓</span>
                                                                        <span className="bullet-text">{item}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {analysisData.strategies.cognitive?.length > 0 && (
                                                        <div className="strategy-category">
                                                            <span className="strategy-label cognitive">🧠 Cognitive</span>
                                                            <ul className="analysis-bullet-list">
                                                                {analysisData.strategies.cognitive.map((item, idx) => (
                                                                    <li key={idx} className="analysis-bullet-item">
                                                                        <span className="bullet-icon">✓</span>
                                                                        <span className="bullet-text">{item}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {analysisData.strategies.behavioral?.length > 0 && (
                                                        <div className="strategy-category">
                                                            <span className="strategy-label behavioral">🤝 Behavioral</span>
                                                            <ul className="analysis-bullet-list">
                                                                {analysisData.strategies.behavioral.map((item, idx) => (
                                                                    <li key={idx} className="analysis-bullet-item">
                                                                        <span className="bullet-icon">✓</span>
                                                                        <span className="bullet-text">{item}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Short-Term Goals Section */}
                                        {analysisData?.shortTermGoals?.length > 0 && (
                                            <div className="analysis-section goals">
                                                <div className="analysis-section-header">
                                                    <span className="analysis-section-icon">🎯</span>
                                                    <h3 className="analysis-section-title">Short-Term Goals</h3>
                                                </div>
                                                <ul className="analysis-bullet-list">
                                                    {analysisData.shortTermGoals.map((goal, idx) => (
                                                        <li key={idx} className="analysis-bullet-item">
                                                            <span className="bullet-icon">{idx + 1}</span>
                                                            <span className="bullet-text">{goal}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Long-Term Goals Section */}
                                        {analysisData?.longTermGoals?.length > 0 && (
                                            <div className="analysis-section goals">
                                                <div className="analysis-section-header">
                                                    <span className="analysis-section-icon">🚀</span>
                                                    <h3 className="analysis-section-title">Long-Term Goals</h3>
                                                </div>
                                                <ul className="analysis-bullet-list">
                                                    {analysisData.longTermGoals.map((goal, idx) => (
                                                        <li key={idx} className="analysis-bullet-item">
                                                            <span className="bullet-icon">{idx + 1}</span>
                                                            <span className="bullet-text">{goal}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Accommodations Section */}
                                        {analysisData?.accommodations?.length > 0 && (
                                            <div className="analysis-section accommodations">
                                                <div className="analysis-section-header">
                                                    <span className="analysis-section-icon">🛠️</span>
                                                    <h3 className="analysis-section-title">Accommodations</h3>
                                                </div>
                                                <div className="analysis-tags">
                                                    {analysisData.accommodations.map((item, idx) => (
                                                        <span key={idx} className="analysis-tag">
                                                            <span className="analysis-tag-icon">✓</span>
                                                            {item}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Services Section */}
                                        {analysisData?.services?.length > 0 && (
                                            <div className="analysis-section services">
                                                <div className="analysis-section-header">
                                                    <span className="analysis-section-icon">🏥</span>
                                                    <h3 className="analysis-section-title">Related Services</h3>
                                                </div>
                                                <div className="analysis-tags">
                                                    {analysisData.services.map((service, idx) => (
                                                        <span key={idx} className="analysis-tag">
                                                            <span className="analysis-tag-icon">📌</span>
                                                            {service}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Progress Monitoring Section */}
                                        {analysisData?.progressMonitoring && (
                                            <div className="analysis-section monitoring">
                                                <div className="analysis-section-header">
                                                    <span className="analysis-section-icon">📈</span>
                                                    <h3 className="analysis-section-title">Progress Monitoring</h3>
                                                </div>
                                                <div className="analysis-content">
                                                    <p>{analysisData.progressMonitoring}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Family Collaboration Section */}
                                        {analysisData?.familyCollaboration && (
                                            <div className="analysis-section family">
                                                <div className="analysis-section-header">
                                                    <span className="analysis-section-icon">👨‍👩‍👧</span>
                                                    <h3 className="analysis-section-title">Family Collaboration</h3>
                                                </div>
                                                <div className="analysis-content">
                                                    <p>{analysisData.familyCollaboration}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Fallback for string-only analysis */}
                                        {!analysisData && analysis && (
                                            <div className="analysis-section summary">
                                                <div className="analysis-section-header">
                                                    <span className="analysis-section-icon">📋</span>
                                                    <h3 className="analysis-section-title">Analysis</h3>
                                                </div>
                                                <div className="analysis-content">
                                                    <p style={{ whiteSpace: 'pre-wrap' }}>{analysis}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Hidden Project Details Section as requested */}
                                {projectData && (
                                    <div style={{ display: 'none' }} data-testid="hidden-project-details">
                                        <input type="hidden" name="projectId" value={projectData.projectId || projectData.id || ''} />
                                        <input type="hidden" name="studentName" value={projectData.studentName || ''} />
                                        <pre>{JSON.stringify(projectData, null, 2)}</pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Planning;
