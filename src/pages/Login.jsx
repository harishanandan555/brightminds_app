import { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/slices/authSlice';
import "../styles/login.css";

function Login() {
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated, role } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated && role) {
      if (role === 'teacher') {
        window.appNavigate?.("/dashboard");
      } else {
        window.appNavigate?.("/parent");
      }
    }
  }, [isAuthenticated, role]);

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="login-page" aria-labelledby="login-heading">
      <div className="login-shell">
        <aside className="login-aside" aria-hidden="true">
          <div className="login-gradient" />
          <div className="login-hero-copy">
            <span className="login-pill">upableED</span>
            <h1>Where teachers and families build smarter IEP journeys.</h1>
            <p>
              Purpose-built intelligence and collaboration workflows that keep everyone aligned on student
              outcomes, security-first by design.
            </p>
            <ul>
              <li>FERPA-ready data protections</li>
              <li>District single sign-on</li>
              <li>Guided compliance guardrails</li>
            </ul>
          </div>
        </aside>

        <main className="login-panel">
          <header className="login-header">
            <a href="/" className="login-brand" data-route>
              <span aria-hidden="true">uE</span>
              upableED
            </a>
            <a href="/" className="login-link" data-route>
              ← Back to product site
            </a>
          </header>

          <section className="login-card" aria-live="polite">
            <div className="login-copy">
              <h2 id="login-heading">Sign In</h2>
              <p>Welcome back! Please enter your details.</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

              <label htmlFor="email" className="login-label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.org"
                autoComplete="email"
                required
              />

              <label htmlFor="password" className="login-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <div className="login-actions">
                <label className="remember-me">
                  <input type="checkbox" name="remember" />
                  <span>Keep me signed in on this device</span>
                </label>
                <a href="#reset-password" className="login-link">
                  Forgot password?
                </a>
              </div>

              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <footer className="login-footer">
              <p>Need an account?</p>
              <a href="/register" className="login-link" data-route>
                Request upableED access
              </a>
            </footer>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Login;
