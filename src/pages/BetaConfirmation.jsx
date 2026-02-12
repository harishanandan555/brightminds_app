import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { markBetaConfirmationSeen } from "../store/slices/betaSlice";
import "../styles/beta.css";

function BetaConfirmation() {
    const dispatch = useDispatch();
    const { hasSeenConfirmation, hasAccepted } = useSelector((state) => state.beta);

    useEffect(() => {
        // If already seen confirmation, redirect to appropriate dashboard
        if (hasSeenConfirmation) {
            window.appNavigate?.("/dashboard");
            return;
        }

        // If hasn't accepted, shouldn't be here
        if (!hasAccepted) {
            window.appNavigate?.("/beta-agreement");
            return;
        }

        // Mark confirmation as seen
        dispatch(markBetaConfirmationSeen());
    }, [dispatch, hasSeenConfirmation, hasAccepted]);

    const handleContinue = () => {
        window.appNavigate?.("/dashboard");
    };

    // Don't render if already seen (will redirect)
    if (hasSeenConfirmation) return null;

    return (
        <div className="beta-page">
            <div className="beta-confirmation-container">
                <div className="beta-confirmation-card">
                    {/* Animated success checkmark */}
                    <div className="beta-success-circle">
                        <svg
                            className="beta-checkmark"
                            viewBox="0 0 52 52"
                            aria-hidden="true"
                        >
                            <circle
                                className="beta-checkmark-circle"
                                cx="26"
                                cy="26"
                                r="25"
                                fill="none"
                            />
                            <path
                                className="beta-checkmark-check"
                                fill="none"
                                d="M14.1 27.2l7.1 7.2 16.7-16.8"
                            />
                        </svg>
                    </div>

                    <div className="beta-confirmation-content">
                        <span className="beta-pill beta-pill-success">Beta Program</span>
                        <h1>Welcome to the Beta Program!</h1>
                        <p className="beta-confirmation-subtitle">
                            Thank you for joining us. Your participation will help shape the
                            future of special education technology.
                        </p>

                        <div className="beta-confirmation-features">
                            <div className="beta-conf-feature">
                                <span className="beta-conf-feature-icon">🔬</span>
                                <div>
                                    <strong>Early Access</strong>
                                    <p>Explore pre-release features before anyone else</p>
                                </div>
                            </div>
                            <div className="beta-conf-feature">
                                <span className="beta-conf-feature-icon">💬</span>
                                <div>
                                    <strong>Direct Feedback Channel</strong>
                                    <p>Your voice directly influences product development</p>
                                </div>
                            </div>
                            <div className="beta-conf-feature">
                                <span className="beta-conf-feature-icon">🎁</span>
                                <div>
                                    <strong>Lifetime Access</strong>
                                    <p>Free lifetime access upon beta completion</p>
                                </div>
                            </div>
                        </div>

                        <button
                            className="beta-btn beta-btn-continue"
                            onClick={handleContinue}
                        >
                            Continue to Dashboard
                            <span className="beta-btn-arrow">→</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BetaConfirmation;
