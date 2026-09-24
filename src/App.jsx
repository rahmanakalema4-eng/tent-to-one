import { useState } from 'react'
import './App.css'
import { content } from './content'

function Button({ variant = 'primary', children, href, type = 'button' }) {
  if (href) {
    return (
      <a className={`btn btn-${variant}`} href={href}>
        {children}
      </a>
    )
  }

  return (
    <button className={`btn btn-${variant}`} type={type}>
      {children}
    </button>
  )
}

function SectionHeading({ eyebrow, title, text }) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </div>
  )
}

function ProgramCard({ title, description, cta, href, icon }) {
  return (
    <article className="program-card">
      <div className="program-icon" aria-hidden="true">{icon}</div>
      <div className="program-copy">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <a className="program-link" href={href}>
        {cta}
      </a>
    </article>
  )
}

function LeaderCard({ name, role, initials }) {
  return (
    <article className="leader-card">
      <div className="leader-badge" aria-label={name}>
        {initials}
      </div>
      <h3>{name}</h3>
      <p>{role}</p>
    </article>
  )
}

function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [prototypeMessage, setPrototypeMessage] = useState('')

  const handlePrototypeSubmit = (event) => {
    event.preventDefault()
    setPrototypeMessage('This is a prototype. Your message was not sent or saved.')
  }

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className="topbar">
        <div className="brand-wrap">
          <img
            className="brand-mark"
            src="/ten-to-one-logo.jpeg"
            alt="Ten to One Youth Club logo"
          />
          <div className="brand-copy">
            <span className="brand-name">TEN TO ONE</span>
            <span className="brand-tag">YOUTH CLUB</span>
          </div>
        </div>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={mobileNavOpen}
          aria-controls="primary-navigation"
          aria-label="Toggle navigation menu"
          onClick={() => setMobileNavOpen((open) => !open)}
        >
          Menu
        </button>

        <nav
          id="primary-navigation"
          className={`primary-nav ${mobileNavOpen ? 'is-open' : ''}`}
          aria-label="Main navigation"
        >
          <ul>
            {content.nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={() => setMobileNavOpen(false)}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="main-content">
        <section id="home" className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">{content.hero.eyebrow}</p>
            <h1>{content.hero.title}</h1>
            <p className="hero-tagline">{content.hero.tagline}</p>
            <p className="mission-statement">{content.hero.mission}</p>
            <div className="cta-row">
              <a className="btn btn-primary" href="#programs">
                {content.hero.primaryCta}
              </a>
              <a className="btn btn-secondary" href="#get-involved">
                {content.hero.secondaryCta}
              </a>
            </div>
          </div>

          <div className="hero-visual">
            <div className="logo-panel">
              <img
                src="/ten-to-one-logo.jpeg"
                alt="Ten to One Youth Club logo"
                className="hero-logo"
              />
            </div>
          </div>
        </section>

        <section id="about" className="content-section">
          <SectionHeading
            eyebrow="About"
            title="A youth-led community organization built for local action"
            text="We work with young people and neighborhood groups to strengthen community participation and practical support."
          />

          <div className="two-column-layout">
            <div className="text-block">
              <p>{content.about.intro}</p>
            </div>
            <div className="text-block accent-block">
              <p>
                <strong>Mission:</strong> {content.about.mission}
              </p>
            </div>
          </div>

          <div className="feature-grid">
            <div className="feature-box">
              <h3>Community focus</h3>
              <p>{content.about.focus}</p>
            </div>
            <div className="feature-box">
              <h3>Youth empowerment</h3>
              <p>{content.about.empowerment}</p>
            </div>
            <div className="feature-box">
              <h3>Commitment to action</h3>
              <p>{content.about.unemployment}</p>
            </div>
          </div>
        </section>

        <section id="programs" className="content-section">
          <SectionHeading
            eyebrow="Programs & Activities"
            title="Practical actions that support young people and community groups"
          />

          <div className="program-grid">
            {content.programs.map((program) => (
              <ProgramCard key={program.title} {...program} />
            ))}
          </div>
        </section>

        <section id="community-impact" className="content-section impact-section">
          <SectionHeading
            eyebrow="Community Impact"
            title="We work to serve young people and community groups"
          />

          <ul className="impact-list">
            {content.impact.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section id="leadership" className="content-section">
          <SectionHeading
            eyebrow="Leadership"
            title="Guiding the work with local insight and community focus"
          />

          <div className="leader-grid">
            {content.leadership.map((person) => (
              <LeaderCard key={person.name} {...person} />
            ))}
          </div>
        </section>

        <section id="get-involved" className="content-section involve-section">
          <SectionHeading
            eyebrow="Get Involved"
            title="Take part in community action, outreach and youth empowerment"
          />

          <div className="involve-grid">
            <div className="action-panel">
              <ul className="action-list">
                {content.involvement.map((action) => (
                  <li key={action.title}>
                    <a href={action.href}>
                      <span>{action.title}</span>
                      <small>{action.text}</small>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <form className="prototype-form" onSubmit={handlePrototypeSubmit}>
              <p className="prototype-note">Prototype form</p>
              <label>
                Your name
                <input type="text" name="name" placeholder="Your name" />
              </label>
              <label>
                Interest
                <input type="text" name="interest" placeholder="Volunteer, partner, support..." />
              </label>
              <label>
                Message
                <textarea name="message" rows="4" placeholder="Tell us how you would like to get involved." />
              </label>
              <button type="submit" className="btn btn-primary">
                Submit prototype
              </button>
              {prototypeMessage ? (
                <p className="prototype-status" role="status">
                  {prototypeMessage}
                </p>
              ) : null}
            </form>
          </div>
        </section>

        <section id="contact" className="content-section contact-section">
          <SectionHeading
            eyebrow="Contact"
            title="Connect with Ten to One Youth Club"
          />

          <div className="contact-layout">
            <div className="contact-card">
              <p className="contact-label">Location</p>
              <p className="contact-value">{content.contact.location}</p>
            </div>

            <form className="prototype-form compact" onSubmit={handlePrototypeSubmit}>
              <p className="prototype-note">Prototype form</p>
              <label>
                Name
                <input type="text" name="contact-name" placeholder="Your name" />
              </label>
              <label>
                Message
                <textarea name="contact-message" rows="4" placeholder="How can we help?" />
              </label>
              <button type="submit" className="btn btn-primary">
                Send message
              </button>
              {prototypeMessage ? (
                <p className="prototype-status" role="status">
                  {prototypeMessage}
                </p>
              ) : null}
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>Kasangati Town Council, Wakiso District, Uganda</p>
      </footer>
    </div>
  )
}

export default App
