import { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../api/authApi';
import { loginUser } from '../store/slices/authSlice';
import "../styles/login.css";

function Register() {
    const dispatch = useDispatch();
    const { isAuthenticated, role } = useSelector((state) => state.auth);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'teacher'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isAuthenticated && role) {
            if (role === 'teacher') {
                window.appNavigate?.("/dashboard");
            } else {
                window.appNavigate?.("/parent");
            }
        }
    }, [isAuthenticated, role]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await register(formData);
            // Auto-login after successful registration
            await dispatch(loginUser({ email: formData.email, password: formData.password }));
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            setLoading(false);
        }
    };

    return (
        <div className="login-page" aria-labelledby="register-heading">
            <div className="login-shell">
                <aside className="login-aside" aria-hidden="true">
                    <div className="login-gradient" />
                    <div className="login-hero-copy">
                        <span className="login-pill">upableED</span>
                        <h1>Join the community building smarter IEP journeys.</h1>
                        <p>
                            Collaborate effectively with purpose-built tools for special education.
                        </p>
                    </div>
                </aside>

                <main className="login-panel">
                    <header className="login-header">
                        <a href="/" className="login-brand" data-route>
                            <span aria-hidden="true">uE</span>
                            upableED
                        </a>
                        <a href="/login" className="login-link" data-route>
                            ← Back to sign in
                        </a>
                    </header>

                    <section className="login-card" aria-live="polite">
                        <div className="login-copy">
                            <h2 id="register-heading">Create Account</h2>
                            <p>Get started with upableED today.</p>
                        </div>

                        <form className="login-form" onSubmit={handleSubmit}>
                            {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <label className="login-label">
                                    First Name
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>
                                <label className="login-label">
                                    Last Name
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>
                            </div>

                            <label className="login-label">
                                Email address
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@school.org"
                                    required
                                />
                            </label>

                            <label className="login-label">
                                Password
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a password"
                                    required
                                />
                            </label>

                            <label className="login-label">
                                I am a...
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="teacher">Teacher</option>
                                    <option value="parent">Parent</option>
                                </select>
                            </label>

                            <button type="submit" className="login-submit" disabled={loading} style={{ marginTop: '1.5rem' }}>
                                {loading ? 'Creating account...' : 'Create account'}
                            </button>
                        </form>

                        <footer className="login-footer">
                            <p>Already have an account?</p>
                            <a href="/login" className="login-link" data-route>
                                Sign in
                            </a>
                        </footer>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default Register;
