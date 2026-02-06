const featureCards = [
  {
    icon: "🧭",
    title: "Automated Goal Builder",
    description:
      "Draft measurable, standards-aligned IEP goals in seconds. Our co-pilot personalizes recommendations using student data, strengths, and present levels.",
  },
  {
    icon: "📊",
    title: "Progress Insight Streams",
    description:
      "Auto-sync classroom evidence, benchmark scores, and therapy notes into a unified dashboard that visualizes growth toward each objective.",
  },
  {
    icon: "🤝",
    title: "Family Collaboration Hub",
    description:
      "Give parents real-time visibility, translation-ready updates, and guided prompts so teams stay aligned between meetings.",
  },
  {
    icon: "🛡️",
    title: "Compliance Guardrails",
    description:
      "Never miss a deadline or required component. upableED monitors timelines, documentation, and meeting notes with FERPA-ready security.",
  },
];

const workflowStages = [
  {
    title: "Connect Data Sources",
    description:
      "Import SIS and assessment data, sync Google Workspace, and map caseloads in minutes with secure district SSO.",
  },
  {
    title: "Smart Co-Authoring",
    description:
      "Use the goal builder and accommodation library to iterate drafts faster while maintaining educator voice and compliance.",
  },
  {
    title: "Engage the Team",
    description:
      "Publish shareable plans, capture family feedback, and assign action steps so every stakeholder knows their next move.",
  },
  {
    title: "Track & Celebrate Progress",
    description:
      "Monitor daily progress, auto-generate meeting summaries, and celebrate milestones with visual reports for teachers and parents.",
  },
];

const solutionHighlights = [
  {
    title: "District Command Center",
    description:
      "Caseload analytics, deadline alerts, and audit-ready exports built for directors of special education.",
  },
  {
    title: "Teacher Co-Pilot",
    description:
      "Chrome extension streamlines progress notes, classroom accommodations, and quick evidence capture right where educators work.",
  },
  {
    title: "Family Experience Layer",
    description:
      "Secure family portal with insight-driven explainers that translate jargon into supportive action steps.",
  },
  {
    title: "Integrations & Security",
    description:
      "SOC 2 roadmap, FERPA compliant hosting, and native integrations with PowerSchool, Skyward, Classlink, and Microsoft 365.",
  },
];

const resourceCards = [
  {
    title: "Goal Starter Kit",
    description:
      "Download goal-writing prompts, compliance checklists, and prompt guides for multidisciplinary teams.",
    cta: "Download kit",
    href: "#",
    ariaLabel: "Download Goal Starter Kit",
  },
  {
    title: "IEP Meeting Playbook",
    description:
      "Facilitator agendas, consensus templates, and family communication scripts to keep meetings focused and inclusive.",
    cta: "Get the playbook",
    href: "#",
    ariaLabel: "Download the IEP Meeting Playbook",
  },
  {
    title: "Progress Monitoring Masterclass",
    description:
      "Join specialists and district leaders for live training on building evidence-backed narratives with upableED.",
    cta: "Save my seat",
    href: "#",
    ariaLabel: "Register for Progress Monitoring Masterclass",
  },
];

const testimonials = [
  {
    quote:
      "Drafting compliant goals used to take my team hours. With upableED, we co-write plans in one session and parents feel included.",
    name: "– Jessica N., Director of Special Education",
  },
  {
    quote:
      "The data-driven suggestions are grounded in data we already collect. It elevates our work without replacing our professional judgment.",
    name: "– Mateo R., Special Education Teacher",
  },
  {
    quote:
      "Families finally have clarity between meetings. Our community portal keeps everyone aligned on next steps and celebrations.",
    name: "– Devika S., School Psychologist",
  },
];

const organizationTypes = [
  { value: "", label: "Select organization type" },
  { value: "district", label: "Public school district" },
  { value: "charter", label: "Charter / independent school" },
  { value: "coop", label: "Regional service cooperative" },
  { value: "therapy", label: "Therapy or clinical practice" },
  { value: "other", label: "Other education partner" },
];

const primaryGoals = [
  { value: "", label: "Select a focus area" },
  { value: "goal-writing", label: "Accelerate goal writing" },
  { value: "progress-monitoring", label: "Strengthen progress monitoring" },
  { value: "family-engagement", label: "Improve family engagement" },
  { value: "compliance", label: "Reduce compliance risk" },
  { value: "ai-strategy", label: "Explore innovation strategy" },
];

function Home() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="page">
      <header>
        <div className="container nav">
          <a className="brand" href="#top">
            <span className="brand-pill">uE</span>
            upableED
          </a>
          <nav className="nav-links" aria-label="Primary navigation">
            <ul>
              <li>
                <a href="#product">Product</a>
              </li>
              <li>
                <a href="#solutions">Solutions</a>
              </li>
              <li>
                <a href="#resources">Resources</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
          </nav>
          <div className="nav-actions">
            <a className="cta-button" href="/login" data-route>
              Login
            </a>
            <a className="cta-button" href="#contact">
              Book a Demo
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero container" aria-labelledby="hero-title">
          <div className="hero-grid">
            <div>
              <span className="eyebrow">Insight-driven IEP success</span>
              <h1 id="hero-title">Guide every learner&apos;s IEP with intelligent collaboration.</h1>
              <p className="lead">
                upableED is the SaaS co-pilot that unites teachers and families to co-author
                compliant, student-centered IEPs—powered by trustworthy insights and real-time data.
              </p>
              <div className="highlight-card" role="presentation">
                <div className="icon-circle" aria-hidden="true">
                  ✦
                </div>
                <div>
                  <strong>4.5 hrs</strong>
                  <p>saved per educator every week on drafting, meetings, and progress updates.</p>
                </div>
              </div>
            </div>
            <div className="hero-media" aria-hidden="true">
              <img
                src="https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=960&q=80"
                alt="Educators collaborating with an inclusive technology platform"
              />
              <div className="hero-badge">
                <div className="pill">FERPA-ready workspace</div>
                <p className="hero-badge-copy">
                  Layered safeguards keep student data protected while technology accelerates the work.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="container" id="product" aria-labelledby="product-title">
          <div className="section-title">
            <span className="pill">Platform Features</span>
            <h2 id="product-title">One workspace for equitable, data-rich IEPs</h2>
            <p>
              Every upableED module is designed with special educators, therapists, and parents to
              accelerate impact without sacrificing compliance.
            </p>
          </div>
          <div className="grid features">
            {featureCards.map((card) => (
              <article className="card" key={card.title} tabIndex={0}>
                <span className="icon-circle" aria-hidden="true">
                  {card.icon}
                </span>
                <div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="container" aria-labelledby="journey-title">
          <div className="learning-path">
            <div className="section-title section-title-compact">
              <h2 id="journey-title">The upableED workflow</h2>
              <p>
                Launch the platform in days, unlock smart drafting, and keep teams focused on
                student outcomes instead of paperwork.
              </p>
            </div>
            <div className="timeline" role="list">
              {workflowStages.map((stage) => (
                <div className="timeline-item" role="listitem" key={stage.title}>
                  <div className="timeline-marker" aria-hidden="true" />
                  <div>
                    <h3>{stage.title}</h3>
                    <p>{stage.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container" id="solutions" aria-labelledby="solutions-title">
          <div className="section-title">
            <span className="pill">Purpose-built experiences</span>
            <h2 id="solutions-title">Tools for every member of the IEP team</h2>
            <p>
              From directors to classroom teachers to families, upableED keeps everyone informed,
              accountable, and confident.
            </p>
          </div>
          <div className="support-section">
            <div className="support-grid">
              {solutionHighlights.map((highlight) => (
                <div className="resource-card" key={highlight.title}>
                  <h3>{highlight.title}</h3>
                  <p>{highlight.description}</p>
                </div>
              ))}
            </div>
            <div className="card card-centered">
              <h3>Live onboarding & readiness workshops</h3>
              <p>
                We guide your teams through best practices, privacy safeguards, and change
                management to ensure sustainable adoption.
              </p>
              <a className="cta-button" href="#contact">
                Talk to our specialists
              </a>
            </div>
          </div>
        </section>

        <section className="container" id="resources" aria-labelledby="resources-title">
          <div className="section-title">
            <span className="pill">Guides & Insights</span>
            <h2 id="resources-title">Resources to accelerate your IEP transformation</h2>
            <p>
              Explore actionable toolkits, workshops, and expert conversations crafted for special
              education leaders, teachers, and families.
            </p>
          </div>
          <div className="grid features">
            {resourceCards.map((resource) => (
              <article className="card" key={resource.title} tabIndex={0}>
                <div>
                  <h3>{resource.title}</h3>
                  <p>{resource.description}</p>
                </div>
                <a className="cta-button" href={resource.href} aria-label={resource.ariaLabel}>
                  {resource.cta}
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="container" aria-labelledby="voices-title">
          <div className="section-title">
            <span className="pill">Voices of Impact</span>
            <h2 id="voices-title">Teams share their upableED wins</h2>
          </div>
          <div className="testimonials">
            <div className="testimonial-grid" role="list">
              {testimonials.map((testimonial) => (
                <article className="testimonial-card" role="listitem" key={testimonial.name}>
                  <p>{testimonial.quote}</p>
                  <strong>{testimonial.name}</strong>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="container" id="contact" aria-labelledby="contact-title">
          <div className="enrollment">
            <div className="enrollment-details">
              <h2 id="contact-title">Ready to explore upableED?</h2>
              <p>
                Share your details and our team will craft a personalized walkthrough, readiness
                roadmap, and ROI model tailored to your learners.
              </p>
              <ul>
                <li>District-specific success plan</li>
                <li>Security & compliance briefing</li>
                <li>Hands-on product sandbox</li>
              </ul>
            </div>
            <form aria-label="Contact upableED form">
              <div>
                <label htmlFor="full-name">Full Name</label>
                <input
                  id="full-name"
                  type="text"
                  name="full-name"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label htmlFor="work-email">Work Email</label>
                <input
                  id="work-email"
                  type="email"
                  name="work-email"
                  placeholder="you@district.org"
                  required
                />
              </div>
              <div>
                <label htmlFor="role">Role</label>
                <input id="role" type="text" name="role" placeholder="Director, teacher, therapist…" />
              </div>
              <div>
                <label htmlFor="organization-type">Organization Type</label>
                <select id="organization-type" name="organization-type" defaultValue="">
                  {organizationTypes.map((option) => (
                    <option value={option.value} key={option.label}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="primary-goal">Primary Goal with upableED</label>
                <select id="primary-goal" name="primary-goal" defaultValue="">
                  {primaryGoals.map((option) => (
                    <option value={option.value} key={option.label}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="message">Describe your IEP priorities</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Share goals, timelines, or current challenges"
                />
              </div>
              <button className="submit-button" type="submit">
                Book a discovery call
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="container" role="contentinfo">
        <div className="footer-grid">
          <div className="footer-column">
            <h4>upableED</h4>
            <p>
              128 Harmony Way, Suite 500
              <br />
              San Francisco, CA 94105
            </p>
            <p>
              Tel: (415) 555-0194
              <br />
              Email: hello@upableed.com
            </p>
          </div>
          <div className="footer-column">
            <h4>Explore</h4>
            <a href="#product">Product</a>
            <a href="#solutions">Solutions</a>
            <a href="#resources">Resources</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-column">
            <h4>Accessibility</h4>
            <a href="#">VPAT & accessibility roadmap</a>
            <a href="#">Data protection overview</a>
            <a href="#">Service status</a>
            <a href="#">Responsible innovation policy</a>
          </div>
          <div className="footer-column">
            <h4>Connect</h4>
            <a href="#">Request a demo</a>
            <a href="#">Partner ecosystem</a>
            <a href="#">Customer stories</a>
            <a href="#">Careers</a>
          </div>
        </div>
        <div className="footer-note">
          © {currentYear} upableED · Smart co-pilot for special education teams.
        </div>
      </footer>
    </div>
  );
}

export default Home;

