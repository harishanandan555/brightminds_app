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

        setLoading(true);
        setError(null);

        try {
            // Construct payload strictly for analysis endpoint
            const aiPayload = {
                studentName: data.studentName?.trim() || "",
                studentAge: Number(data.studentAge) || 0,
                gradeLevel: data.gradeLevel?.trim() || "",
                presentLevels: data.presentLevels?.trim() || "",
                currentPerformance: data.currentPerformance?.trim() || "",
                goals: data.goals?.trim() || "",
                accommodations: data.accommodations?.trim() || "",
                relatedServices: data.relatedServices || [],
                projectId: data.projectId || "" // Add projectId to payload
            };

            const result = await dispatch(analyzeProject(aiPayload));
            if (analyzeProject.fulfilled.match(result)) {
                console.log('[Planning] Analysis Result:', result.payload.analysis);
                setAnalysis(result.payload.analysis);
            } else {
                setError("Failed to generate analysis. Please try again.");
            }
        } catch (err) {
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
                                {console.log('[Planning] Rendering analysis State:', analysis ? analysis.substring(0, 20) + '...' : 'EMPTY')}
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
                                {analysis && <div style={{ marginTop: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
                                    <h4>Debug View:</h4>
                                    <pre style={{ whiteSpace: 'pre-wrap' }}>{analysis}</pre>
                                </div>}

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
