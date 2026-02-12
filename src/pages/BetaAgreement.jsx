import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { acceptBetaTerms, declineBetaTerms, fetchBetaStatus } from "../store/slices/betaSlice";
import { logout } from "../store/slices/authSlice";
import "../styles/beta.css";

function BetaAgreement() {
    const dispatch = useDispatch();
    const { loading, hasAccepted, hasDeclined, hasSeenConfirmation, statusChecked } = useSelector((state) => state.beta);
    const { role } = useSelector((state) => state.auth);
    const [actionType, setActionType] = useState(null);
    const [error, setError] = useState(null);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [previouslyDeclined, setPreviouslyDeclined] = useState(false);

    // Fetch beta status on mount to ensure we have the latest data
    useEffect(() => {
        setCheckingStatus(true);
        dispatch(fetchBetaStatus())
            .unwrap()
            .then((betaData) => {
                console.log('[BetaAgreement] Status check result:', betaData);

                // If already accepted, redirect appropriately
                if (betaData?.hasAccepted) {
                    if (betaData?.hasSeenConfirmation) {
                        // Fully completed, go to dashboard
                        if (role === 'teacher' || role === 'superadmin') {
                            window.appNavigate?.("/dashboard");
                        } else {
                            window.appNavigate?.("/parent");
                        }
                    } else {
                        // Accepted but needs to see confirmation
                        window.appNavigate?.("/beta-confirmation");
                    }
                    return;
                }

                // Track if user has previously declined
                if (betaData?.hasDeclined) {
                    setPreviouslyDeclined(true);
                }
            })
            .catch((err) => {
                console.error('[BetaAgreement] Failed to check status:', err);
            })
            .finally(() => {
                setCheckingStatus(false);
            });
    }, [dispatch, role]);

    const handleAgree = async () => {
        setActionType("agree");
        setError(null);
        try {
            await dispatch(acceptBetaTerms()).unwrap();

            // Mark confirmation as seen implicitly since we skip the page
            // (Optional, if we want to ensure data consistency, but typically dashboard access is enough)
            // dispatch(markBetaConfirmationSeen()); 

            // Navigate directly to dashboard
            if (role === 'teacher' || role === 'superadmin') {
                window.appNavigate?.("/dashboard");
            } else {
                window.appNavigate?.("/parent");
            }
        } catch (err) {
            console.error("[Beta] Accept failed:", err);
            // If already accepted (409 conflict), proceed to dashboard
            if (err?.includes?.("already responded") || err?.includes?.("already accepted")) {
                if (role === 'teacher' || role === 'superadmin') {
                    window.appNavigate?.("/dashboard");
                } else {
                    window.appNavigate?.("/parent");
                }
                return;
            }
            setError(err || "Failed to accept beta terms. Please try again.");
            setActionType(null);
        }
    };

    const handleDecline = async () => {
        setActionType("decline");
        setError(null);
        try {
            await dispatch(declineBetaTerms()).unwrap();
            // Do NOT logout. The UI will re-render and show the "Declined" view because hasDeclined will be true.
            setActionType(null); // Reset action type to allow render of declined view
        } catch (err) {
            console.error("[Beta] Decline failed:", err);
            // If already declined
            if (err?.includes?.("already responded")) {
                setActionType(null); // Ensure UI updates
                return;
            }
            setError(err || "Failed to decline terms. Please try again.");
            setActionType(null);
        }
    };

    // Show loading while checking status
    if (checkingStatus) {
        return (
            <div className="beta-page">
                <div className="beta-confirmation-container">
                    <div className="beta-confirmation-card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <div className="beta-spinner" style={{ width: '40px', height: '40px', margin: '0 auto 1rem' }}></div>
                        <p>Checking your beta status...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Don't render if already accepted (will redirect via useEffect)
    if (hasAccepted) {
        return null;
    }

    // [MODIFIED] If declined, we still show the form to allow them to accept now.
    // We can show a small note depending on requirement, but user said:
    // "it should not go to user declined untill the user accepts"
    // This implies we default to the agreement page loop.

    // We used to have a block here for 'previouslyDeclined' -> Removed to allow re-agreement.

    return (
        <div className="beta-page">
            <div className="beta-shell">
                {/* Left decorative panel */}
                <aside className="beta-aside" aria-hidden="true">
                    <div className="beta-gradient" />
                    <div className="beta-hero-copy">
                        <span className="beta-pill">upableED</span>
                        <h1>Join Our Beta Program</h1>
                        <p>
                            Be among the first to experience and shape the future of
                            special education technology.
                        </p>
                        <div className="beta-hero-features">
                            <div className="beta-hero-feature">
                                <span className="beta-hero-icon">🚀</span>
                                <span>Early Access</span>
                            </div>
                            <div className="beta-hero-feature">
                                <span className="beta-hero-icon">💡</span>
                                <span>Shape the Product</span>
                            </div>
                            <div className="beta-hero-feature">
                                <span className="beta-hero-icon">🎁</span>
                                <span>Lifetime Access</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main content panel */}
                <main className="beta-panel">
                    <header className="beta-header">
                        <a href="/" className="beta-brand" data-route>
                            <span aria-hidden="true">uE</span>
                            upableED
                        </a>
                    </header>

                    <section className="beta-card">
                        <div className="beta-card-badge">
                            <span className="beta-badge-icon">🎉</span>
                            <span>You've Been Selected!</span>
                        </div>

                        <div className="beta-copy">
                            <h2>Beta Program Participation Confirmation</h2>
                            <p className="beta-subtitle">
                                Congratulations! You have been selected to participate as a
                                Beta User for UpablEd's educational software platform.
                            </p>
                            <p className="beta-description">
                                As a Beta User, you will receive early access to pre-release
                                features and functionality. In return, you agree to actively
                                evaluate the software and provide timely, constructive
                                feedback—including identifying defects, usability issues, and
                                improvement opportunities—through our designated feedback
                                channel.
                            </p>
                        </div>

                        <div className="beta-terms">
                            <h3 className="beta-terms-title">Key Terms of Participation</h3>
                            <ul className="beta-terms-list">
                                <li>
                                    <span className="beta-term-icon">📝</span>
                                    <div>
                                        <strong>Feedback Commitment</strong>
                                        <p>
                                            You agree to provide prompt, detailed, and actionable
                                            feedback to support product refinement.
                                        </p>
                                    </div>
                                </li>
                                <li>
                                    <span className="beta-term-icon">🔒</span>
                                    <div>
                                        <strong>Confidentiality</strong>
                                        <p>
                                            You will not disclose any information related to the beta
                                            product, features, or testing process to third parties.
                                        </p>
                                    </div>
                                </li>
                                <li>
                                    <span className="beta-term-icon">📊</span>
                                    <div>
                                        <strong>Data Collection</strong>
                                        <p>
                                            You consent to the collection of technical and usage data
                                            for performance analysis and product improvement.
                                        </p>
                                    </div>
                                </li>
                                <li>
                                    <span className="beta-term-icon">📄</span>
                                    <div>
                                        <strong>Feedback Ownership</strong>
                                        <p>
                                            All feedback submitted becomes the property of UpablEd,
                                            with the right to use, modify, and commercialize as
                                            needed.
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="beta-highlight">
                            <span className="beta-highlight-icon">🎁</span>
                            <p>
                                In appreciation of your participation, UpablEd will provide{" "}
                                <strong>lifetime access</strong> to the platform at no cost
                                upon completion of the beta program.
                            </p>
                        </div>

                        <p className="beta-agreement-note">
                            By selecting <strong>"I Agree,"</strong> you confirm your
                            acceptance of these terms and your commitment to support the
                            improvement of the platform.
                        </p>

                        <p className="beta-appreciation">
                            We appreciate your partnership in helping shape the future of
                            UpablEd.
                        </p>

                        {error && (
                            <div className="beta-error">
                                <span className="beta-error-icon">⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="beta-actions">
                            <button
                                className="beta-btn beta-btn-agree"
                                onClick={handleAgree}
                                disabled={loading}
                            >
                                {loading && actionType === "agree" ? (
                                    <span className="beta-btn-loading">
                                        <span className="beta-spinner" />
                                        Processing…
                                    </span>
                                ) : (
                                    <>
                                        <span className="beta-btn-icon">✓</span>
                                        I Agree
                                    </>
                                )}
                            </button>
                            <button
                                className="beta-btn beta-btn-decline"
                                onClick={handleDecline}
                                disabled={loading}
                            >
                                {loading && actionType === "decline" ? (
                                    <span className="beta-btn-loading">
                                        <span className="beta-spinner" />
                                        Processing…
                                    </span>
                                ) : (
                                    <>
                                        <span className="beta-btn-icon">✕</span>
                                        I Do Not Agree
                                    </>
                                )}
                            </button>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default BetaAgreement;
