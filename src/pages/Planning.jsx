import { useEffect, useState } from "react";
import { useDispatch } from 'react-redux';
import { analyzeProject, updateProject } from '../store/slices/projectSlice';
import "../styles/dashboard.css"; // Reuse dashboard styles or create new one

const Planning = () => {
    const dispatch = useDispatch();
    const [projectData, setProjectData] = useState(null);
    const [analysis, setAnalysis] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Hydrate from history state
        const state = window.history.state;
        if (state && state.usr) {
            setProjectData(state.usr);
            if (state.usr.analysis) {
                setAnalysis(state.usr.analysis);
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
                const analysisData = result.payload.analysis;
                console.log('=== PLANNING: Analysis Data ===');
                console.log(analysisData);

                // Format the analysis object into readable text
                let formattedAnalysis = "";
                if (typeof analysisData === "string") {
                    formattedAnalysis = analysisData;
                } else if (typeof analysisData === "object" && analysisData !== null) {
                    // Convert structured object to readable format
                    formattedAnalysis = `### Student Analysis Summary\n\n`;
                    formattedAnalysis += `**Summary:** ${analysisData.summary || 'N/A'}\n\n`;

                    if (analysisData.instructionalFocus?.length > 0) {
                        formattedAnalysis += `**Instructional Focus:**\n`;
                        analysisData.instructionalFocus.forEach(item => {
                            formattedAnalysis += `- ${item.area}: ${item.details}\n`;
                        });
                        formattedAnalysis += `\n`;
                    }

                    if (analysisData.strategies) {
                        formattedAnalysis += `**Strategies:**\n`;
                        if (analysisData.strategies.academic?.length > 0) {
                            formattedAnalysis += `- Academic: ${analysisData.strategies.academic.join('; ')}\n`;
                        }
                        if (analysisData.strategies.cognitive?.length > 0) {
                            formattedAnalysis += `- Cognitive: ${analysisData.strategies.cognitive.join('; ')}\n`;
                        }
                        if (analysisData.strategies.behavioral?.length > 0) {
                            formattedAnalysis += `- Behavioral: ${analysisData.strategies.behavioral.join('; ')}\n`;
                        }
                        formattedAnalysis += `\n`;
                    }

                    if (analysisData.shortTermGoals?.length > 0) {
                        formattedAnalysis += `**Short-Term Goals:**\n`;
                        analysisData.shortTermGoals.forEach(goal => {
                            formattedAnalysis += `- ${goal}\n`;
                        });
                        formattedAnalysis += `\n`;
                    }

                    if (analysisData.longTermGoals?.length > 0) {
                        formattedAnalysis += `**Long-Term Goals:**\n`;
                        analysisData.longTermGoals.forEach(goal => {
                            formattedAnalysis += `- ${goal}\n`;
                        });
                        formattedAnalysis += `\n`;
                    }

                    if (analysisData.accommodations?.length > 0) {
                        formattedAnalysis += `**Accommodations:** ${analysisData.accommodations.join(', ')}\n\n`;
                    }

                    if (analysisData.services?.length > 0) {
                        formattedAnalysis += `**Services:** ${analysisData.services.join(', ')}\n\n`;
                    }

                    if (analysisData.progressMonitoring) {
                        formattedAnalysis += `**Progress Monitoring:** ${analysisData.progressMonitoring}\n\n`;
                    }

                    if (analysisData.familyCollaboration) {
                        formattedAnalysis += `**Family Collaboration:** ${analysisData.familyCollaboration}\n`;
                    }
                }

                setAnalysis(formattedAnalysis);
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

    if (!projectData && !loading) {
        return (
            <div className="dashboard-page">
                <header className="dashboard-header">
                    <a href="/" className="dashboard-brand">BrightMinds</a>
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
                    <span aria-hidden="true">BM</span>
                    BrightMinds
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
                                {loading ? "Regenerating..." : "Regenerate"}
                            </button>
                            <button className="primary-button" onClick={handleSave} disabled={!analysis}>
                                Save Analysis
                            </button>
                        </div>
                    </header>

                    {error && (
                        <div className="alert alert-error">
                            {error}
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
                                        color: '#333', // Force visible text color
                                        backgroundColor: '#fff' // Force visible background
                                    }}
                                />

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
