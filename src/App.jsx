import { useEffect, useRef, useState } from 'react'
import './App.css'
import { content } from './content'

function SectionHeading({ eyebrow, title, text }) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </div>
  )
}

function Reveal({ children, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            node.classList.add('is-visible')
            observer.unobserve(node)
          }
        })
      },
      { threshold: 0.18 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  )
}

function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

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
        <section id="story" className="hero-section">
          <Reveal className="hero-copy-wrap">
            <div className="hero-copy">
              <p className="eyebrow">{content.hero.kicker}</p>
              <h1>
                {content.hero.title}{' '}
                <span className="gold-highlight">{content.hero.highlight}</span>
              </h1>
              <p className="hero-tagline">{content.hero.subtitle}</p>
              <div className="hero-meta">
                <p className="hero-intro-name">{content.hero.intro}</p>
                <p className="hero-location">{content.hero.location}</p>
              </div>
              <div className="cta-row">
                <a className="btn btn-primary" href="#about">
                  {content.hero.primaryCta}
                </a>
                <a className="btn btn-secondary" href="#join">
                  {content.hero.secondaryCta}
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal className="hero-visual-wrap">
            <div className="hero-visual" aria-label="Ten to One Youth Club community outreach image">
              <div className="hero-photo-frame">
                <img
                  className="hero-photo"
                  src="/community-outreach.png"
                  alt="Ten to One Youth Club community outreach"
                />
                <div className="hero-photo-overlay" aria-hidden="true" />
                <img
                  src="/ten-to-one-logo.jpeg"
                  alt="Ten to One Youth Club logo"
                  className="hero-logo"
                />
              </div>
            </div>
          </Reveal>
        </section>

        <Reveal>
          <section id="about" className="content-section challenge-section">
            <SectionHeading
              eyebrow={content.challenge.eyebrow}
              title={content.challenge.title}
              text={content.challenge.text}
            />
            <div className="about-summary">
              <p>
                Ten to One Youth Club brings young people and community members together through service,
                empowerment and practical community action.
              </p>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section id="belief" className="content-section belief-section">
            <div className="belief-layout">
              <div className="belief-copy">
                <p className="eyebrow">{content.belief.eyebrow}</p>
                <h2>{content.belief.title}</h2>
              </div>
              <p className="belief-text">{content.belief.text}</p>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section id="impact" className="content-section impact-section">
            <div className="impact-header">
              <div>
                <p className="eyebrow">{content.photoStory.eyebrow}</p>
                <h2>{content.photoStory.title}</h2>
              </div>
              <p>{content.photoStory.text}</p>
            </div>

            <figure className="story-figure">
              <img src="/community-outreach.png" alt="Community outreach in action" />
              <figcaption>Community outreach in action</figcaption>
            </figure>
          </section>
        </Reveal>

        <Reveal>
          <section id="programs" className="content-section services-section">
            <SectionHeading eyebrow="Programs" title="Purpose becomes action." />

            <div className="service-grid">
              {content.whatWeDo.map((item) => (
                <article key={item.title} className="service-card">
                  <span className="service-number">{item.icon}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section id="leadership" className="content-section leadership-section">
            <SectionHeading eyebrow="Leadership" title="Different roles. One direction." />

            <div className="leader-grid">
              {content.leadership.map((person) => (
                <article key={person.name} className="leader-card">
                  <div className="leader-badge" aria-label={person.name}>
                    {person.name
                      .split(' ')
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <h3>{person.name}</h3>
                  <p>{person.role}</p>
                </article>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="content-section brand-moment-section">
            <div className="brand-moment-grid">
              <div className="brand-item gold">
                <span className="brand-label">TEN</span>
                <p>People. Ideas. Energy.</p>
              </div>
              <div className="brand-item teal">
                <span className="brand-label">TO</span>
                <p>Connection. Collaboration. Commitment.</p>
              </div>
              <div className="brand-item red">
                <span className="brand-label">ONE</span>
                <p>Purpose. Action. Community.</p>
              </div>
            </div>
            <p className="brand-closing">TOGETHER AS ONE</p>
          </section>
        </Reveal>

        <Reveal>
          <section id="join" className="content-section final-cta-section">
            <div className="final-cta">
              <p className="eyebrow">{content.finalCta.eyebrow}</p>
              <h2>{content.finalCta.title}</h2>
              <div className="cta-row cta-row-final">
                <a className="btn btn-primary" href="#contact">
                  {content.finalCta.primary}
                </a>
                <a className="btn btn-secondary" href="#contact">
                  {content.finalCta.secondary}
                </a>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section id="contact" className="content-section contact-section">
            <div className="contact-card">
              <p className="eyebrow">Contact</p>
              <h2>Connect with Ten to One Youth Club</h2>
              <p>{content.contact.location}</p>
            </div>
          </section>
        </Reveal>
      </main>

      <footer className="site-footer">
        <p>{content.contact.location}</p>
      </footer>
    </div>
  )
}

export default App
