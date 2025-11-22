import { useMemo, useState } from "react";
import "../styles/login.css";

const roleConfigs = {
  teacher: {
    title: "Teacher workspace",
    description:
      "Plan instruction, capture evidence, and collaborate with your IEP team in minutes—not hours.",
    benefits: [
      "Draft goals with AI suggestions tuned to your students",
      "Log progress notes from any device with smart templates",
      "See upcoming meetings, deadlines, and assigned action steps",
    ],
  },
  parent: {
    title: "Family portal",
    description:
      "Stay informed, contribute feedback, and celebrate growth with clear, supportive updates.",
    benefits: [
      "Real-time translation of teacher updates and goals",
      "Calendar reminders for meetings and action items",
      "Guided prompts so you can advocate with confidence",
    ],
  },
};

const DEFAULT_ROLE = "teacher";

function Login() {
  const initialRole = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paramRole = searchParams.get("role");
    const isValidRole =
      paramRole && Object.prototype.hasOwnProperty.call(roleConfigs, paramRole);
    return isValidRole ? paramRole : DEFAULT_ROLE;
  }, []);

  const [activeRole, setActiveRole] = useState(initialRole);

  const { title, description, benefits } = roleConfigs[activeRole];

  const handleSubmit = (event) => {
    event.preventDefault();
    if (activeRole === "teacher") {
      sessionStorage.setItem("brightMindsRole", "teacher");
      window.location.href = "/dashboard";
      return;
    }

    sessionStorage.setItem("brightMindsRole", "parent");
    window.location.href = "/parent";
  };

  return (
    <div className="login-page" aria-labelledby="login-heading">
      <div className="login-shell">
        <aside className="login-aside" aria-hidden="true">
          <div className="login-gradient" />
          <div className="login-hero-copy">
            <span className="login-pill">BrightMinds</span>
            <h1>Where teachers and families build smarter IEP journeys.</h1>
            <p>
              Purpose-built AI and collaboration workflows that keep everyone aligned on student
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
            <a href="/" className="login-brand">
              <span aria-hidden="true">BM</span>
              BrightMinds
            </a>
            <a href="/" className="login-link">
              ← Back to product site
            </a>
          </header>

          <section className="login-card" aria-live="polite">
            <div className="login-toggle">
              <button
                type="button"
                onClick={() => setActiveRole("teacher")}
                className={activeRole === "teacher" ? "toggle-button is-active" : "toggle-button"}
              >
                Teacher sign in
              </button>
              <button
                type="button"
                onClick={() => setActiveRole("parent")}
                className={activeRole === "parent" ? "toggle-button is-active" : "toggle-button"}
              >
                Parent sign in
              </button>
            </div>

            <div className="login-copy">
              <h2 id="login-heading">{title}</h2>
              <p>{description}</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <label htmlFor="email" className="login-label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                name="email"
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

              <button type="submit" className="login-submit">
                Sign in
              </button>
            </form>

            <footer className="login-footer">
              <p>Need an account?</p>
              <a href="#contact" className="login-link">
                Request BrightMinds access
              </a>
            </footer>
          </section>

          <section className="login-benefits" aria-label={`${title} benefits`}>
            <h3>What you can do</h3>
            <ul>
              {benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Login;

