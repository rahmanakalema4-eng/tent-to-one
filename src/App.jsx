import { useEffect, useRef, useState } from 'react'
import './Story.css'
import { content } from './content'

function SectionHeading({ eyebrow, title, text }) {
  return (
    <div className="section-heading">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      {text ? <p className="section-intro">{text}</p> : null}
    </div>
  )
}

function HoneypotField() {
  return (
    <div className="honeypot-field" aria-hidden="true">
      <label>{content.forms.websiteLabel}<input type="text" name="website" tabIndex="-1" autoComplete="off" /></label>
    </div>
  )
}

function LeaderProfile({ person }) {
  const [expanded, setExpanded] = useState(false)
  const profileId = `leader-profile-${person.profileId}`

  return (
    <>
      <button
        type="button"
        className="profile-toggle"
        aria-expanded={expanded}
        aria-controls={profileId}
        onClick={() => setExpanded((open) => !open)}
      >
        {expanded ? content.accessibility.closeProfile : content.accessibility.readProfile}
      </button>
      <div id={profileId} className="leader-profile" hidden={!expanded}>
        {person.phone ? (
          <div className="leader-profile-contact">
            <span className="leader-profile-contact-label">{content.leadershipLabels.contact}</span>
            <a className="leader-phone" href={`tel:${person.phone}`}>{person.phone}</a>
          </div>
        ) : null}
        {person.profile.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <p><strong>{content.leadershipLabels.vision}:</strong> {person.profile.vision}</p>
        <p><strong>{content.leadershipLabels.verse}:</strong> {person.profile.verse}</p>
      </div>
    </>
  )
}

function ValueGraphic({ name }) {
  const graphics = {
    unity: (
      <>
        <path d="M32 18 18 42m14-24 14 24M18 42h28" />
        <circle cx="32" cy="15" r="6" />
        <circle cx="16" cy="45" r="6" />
        <circle cx="48" cy="45" r="6" />
        <circle className="value-graphic-accent" cx="32" cy="34" r="5" />
      </>
    ),
    compassion: (
      <>
        <path d="M32 49 13 31C1 19 18 5 29 18l3 4 3-4C46 5 63 19 51 31L32 49Z" />
        <path className="value-graphic-accent" d="M21 32c4-3 7-3 11 1 4-4 8-4 12-1" />
      </>
    ),
    integrity: (
      <>
        <path d="m32 7 20 8v15c0 13-8 22-20 28-12-6-20-15-20-28V15l20-8Z" />
        <path className="value-graphic-accent" d="m22 31 7 7 14-15" />
      </>
    ),
    empowerment: (
      <>
        <path d="M32 52V29m0 11c-1-10-8-15-18-15 1 10 7 16 18 16Zm0-9c1-11 8-17 19-17-1 11-7 18-19 18Z" />
        <path className="value-graphic-accent" d="M32 20V10m-5 5 5-5 5 5" />
      </>
    ),
    volunteerism: (
      <>
        <path d="M11 34 23 23c2-2 5-2 7 0l3 3h8c3 0 5 2 5 5v1h5l5 6-12 11H27L11 39Z" />
        <path className="value-graphic-accent" d="m22 35 8 5h12M16 30l-5 5m6 9-4 4" />
        <path d="M39 16c0-5 7-7 10-2 3-5 10-3 10 2 0 5-10 12-10 12S39 21 39 16Z" />
      </>
    ),
    inclusiveness: (
      <>
        <circle cx="32" cy="18" r="7" />
        <circle cx="14" cy="24" r="5" />
        <circle cx="50" cy="24" r="5" />
        <path d="M18 49c1-10 6-16 14-16s13 6 14 16M5 46c1-8 4-12 10-12 3 0 6 2 8 5m36 7c-1-8-4-12-10-12-3 0-6 2-8 5" />
        <path className="value-graphic-accent" d="M25 52h14" />
      </>
    ),
    accountability: (
      <>
        <path d="M21 13h-7v42h36V13h-7M24 8h16v11H24z" />
        <path d="M22 31h7m-7 10h7" />
        <path className="value-graphic-accent" d="m34 32 4 4 8-9m-12 14 4 4 8-9" />
      </>
    ),
    teamwork: (
      <>
        <circle cx="32" cy="16" r="6" />
        <circle cx="15" cy="25" r="5" />
        <circle cx="49" cy="25" r="5" />
        <path d="M21 49c1-9 4-15 11-15s10 6 11 15M5 47c1-8 4-12 10-12 4 0 7 2 9 6m35 6c-1-8-4-12-10-12-4 0-7 2-9 6" />
        <path className="value-graphic-accent" d="M26 53h12" />
      </>
    ),
    sustainability: (
      <>
        <path d="M32 53V31m0 10c-1-11-8-17-19-17 1 11 7 18 19 18Zm0-9c1-12 8-19 20-19-1 12-8 19-20 20Z" />
        <path className="value-graphic-accent" d="M32 53c-8 0-14-3-18-9m18 9c8 0 14-3 18-9" />
      </>
    ),
  }

  return (
    <span className="value-graphic" aria-hidden="true">
      <svg viewBox="0 0 64 64" focusable="false">
        {graphics[name]}
      </svg>
    </span>
  )
}

function Reveal({ children, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    if (!('IntersectionObserver' in window)) {
      node.classList.add('is-visible')
      return undefined
    }

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
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [joinStatus, setJoinStatus] = useState(null)
  const [contactStatus, setContactStatus] = useState(null)
  const [joinSubmitting, setJoinSubmitting] = useState(false)
  const [contactSubmitting, setContactSubmitting] = useState(false)
  const headerRef = useRef(null)
  const menuButtonRef = useRef(null)

  useEffect(() => {
    const updateHeader = () => setIsScrolled(window.scrollY > 24)
    updateHeader()
    window.addEventListener('scroll', updateHeader, { passive: true })

    const targets = content.nav
      .map((item) => document.querySelector(item.href))
      .filter(Boolean)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActiveSection(visible.target.id)
      },
      { rootMargin: '-92px 0px -65% 0px', threshold: [0, 0.2, 0.5] },
    )
    targets.forEach((target) => observer.observe(target))

    return () => {
      window.removeEventListener('scroll', updateHeader)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!mobileNavOpen) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setMobileNavOpen(false)
        requestAnimationFrame(() => menuButtonRef.current?.focus())
      }
    }
    const closeOnOutsideClick = (event) => {
      if (!headerRef.current?.contains(event.target)) {
        setMobileNavOpen(false)
        requestAnimationFrame(() => menuButtonRef.current?.focus())
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.removeEventListener('pointerdown', closeOnOutsideClick)
    }
  }, [mobileNavOpen])

  const submitInquiry = async (event, setStatus, setSubmitting) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = Object.fromEntries(formData.entries())
    payload.consent = formData.get('consent') === 'on'
    setStatus(null)
    setSubmitting(true)

    try {
      const isNetlify = import.meta.env.PROD
      const response = await fetch(isNetlify ? '/' : '/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': isNetlify ? 'application/x-www-form-urlencoded' : 'application/json',
        },
        body: isNetlify
          ? new URLSearchParams(formData).toString()
          : JSON.stringify(payload),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.message || content.forms.error)
      setStatus({ type: 'success', message: result.message || content.forms.success })
      form.reset()
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : content.forms.error })
    } finally {
      setSubmitting(false)
    }
  }

  const handleJoinSubmit = (event) => submitInquiry(event, setJoinStatus, setJoinSubmitting)
  const handleContactSubmit = (event) => {
    return submitInquiry(event, setContactStatus, setContactSubmitting)
  }

  const closeMobileNav = () => {
    setMobileNavOpen(false)
    requestAnimationFrame(() => menuButtonRef.current?.focus())
  }

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        {content.accessibility.skipLink}
      </a>

      <header
        ref={headerRef}
        className={`topbar${isScrolled ? ' is-scrolled' : ''}${mobileNavOpen ? ' menu-open' : ''}`}
      >
        <div className="brand-wrap">
          <img
            className="brand-mark"
            src="/ten-to-one-logo-transparent.png"
            alt={content.accessibility.logoAlt}
          />
          <div className="brand-copy">
            <span className="brand-name">{content.brand.name}</span>
            <span className="brand-tag">{content.brand.club}</span>
          </div>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          className="nav-toggle"
          aria-expanded={mobileNavOpen}
          aria-controls="primary-navigation"
          aria-label={content.accessibility.menuLabel}
          onClick={() => setMobileNavOpen((open) => !open)}
        >
          {content.accessibility.menuText}
        </button>

        <nav
          id="primary-navigation"
          className={`primary-nav ${mobileNavOpen ? 'is-open' : ''}`}
          aria-label={content.accessibility.navigationLabel}
        >
          <ul>
            {content.nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={activeSection === item.href.slice(1) ? 'is-active' : ''}
                  aria-current={activeSection === item.href.slice(1) ? 'location' : undefined}
                  onClick={() => mobileNavOpen && closeMobileNav()}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a className="header-cta" href="#join">
          {content.headerCta}
        </a>
      </header>

      <main id="main-content">
        <section id="home" className="hero-section">
          <Reveal className="hero-copy-wrap">
            <div className="hero-copy">
              <p className="eyebrow">{content.hero.kicker}</p>
              <h1 className="hero-title">
                <span>{content.hero.lineOne}</span>
                <span>{content.hero.lineTwo}</span>
                <span><span className="gold-highlight">{content.hero.highlight}</span>{content.hero.highlightEnd}</span>
              </h1>
              <p className="hero-tagline">{content.hero.subtitle}</p>
              <p className="hero-location">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 22s8-7.1 8-13a8 8 0 1 0-16 0c0 5.9 8 13 8 13Z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                <span>{content.hero.location}</span>
              </p>
              <div className="cta-row">
                <a className="btn btn-primary" href="#story">
                  {content.hero.primaryCta}
                  <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                    <path d="M3 10h13M11 4l6 6-6 6" />
                  </svg>
                </a>
                <a className="btn btn-secondary" href="#join">
                  {content.hero.secondaryCta}
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal className="hero-visual-wrap">
            <div className="hero-visual">
              <img
                src="/ten-to-one-logo-transparent.png"
                alt={content.accessibility.logoAlt}
                className="hero-logo"
              />
            </div>
          </Reveal>
          <svg className="hero-curves" viewBox="0 0 520 220" aria-hidden="true" focusable="false">
            <path className="curve-teal" d="M520 108c-69 17-120 49-162 89-8 8-16 16-24 23h186V108Z" />
            <path className="curve-red" d="M520 148c-34 9-65 27-94 54 27 12 58 17 94 18v-72Z" />
            <path className="curve-gold" d="M520 72c-74 18-127 53-172 96-18 17-34 34-51 52" />
          </svg>
        </section>

        <Reveal>
          <section id="story" className="content-section story-intro section-light">
            <SectionHeading title={content.story.title} text={content.story.tagline} />
            <div className="story-prose">
              {content.story.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <div className="story-highlight-grid">
              <article className="story-highlight">
                <h3>{content.story.visionLabel}</h3>
                <p>{content.story.vision}</p>
              </article>
              <article className="story-highlight">
                <h3>{content.story.missionLabel}</h3>
                <p>{content.story.mission}</p>
              </article>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section id="about" className="content-section about-section section-white">
            <SectionHeading title={content.sections.about} />
            <div className="main-aim">
              <h3>{content.about.mainAimLabel}</h3>
              <p>{content.about.mainAim}</p>
            </div>
            <div className="approach-heading">
              <h3>{content.about.approachLabel}</h3>
              <p>{content.approach.summary}</p>
            </div>
            <ol className="approach-flow">
              {content.approach.steps.map((step) => (
                <li className="approach-step" key={step.title}>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
          </section>
        </Reveal>

        <Reveal>
          <section id="programs" className="content-section programs-section section-light">
            <SectionHeading title={content.programs.title} />
            <div className="program-list">
              {content.programs.items.map((item) => (
                <article key={item.title} className="program-item"><h3>{item.title}</h3></article>
              ))}
            </div>
            <div className="objectives-block">
              <h3>{content.programs.objectivesTitle}</h3>
              <ol className="objective-list">
                {content.programs.objectives.map((objective) => (
                  <li key={objective.title}>
                    <h4>{objective.title}</h4>
                    <p>{objective.description}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section id="community-event" className="content-section photo-feature event-feature section-white">
            <div className="photo-feature-copy">
              <p className="eyebrow">{content.eventFeature.eyebrow}</p>
              <h2>{content.eventFeature.title}</h2>
              <p>{content.eventFeature.description}</p>
              <p className="event-location">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 22s8-7.1 8-13a8 8 0 1 0-16 0c0 5.9 8 13 8 13Z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                <span>{content.eventFeature.location}</span>
              </p>
            </div>
            <figure className="story-figure event-figure">
              <img
                src="/community-outreach.png"
                alt={content.accessibility.photoAlt}
                width="1672"
                height="941"
                loading="lazy"
              />
              <figcaption>{content.eventFeature.caption}</figcaption>
            </figure>
          </section>
        </Reveal>

        <Reveal>
          <section id="impact" className="content-section impact-section section-teal">
            <SectionHeading eyebrow={content.impact.eyebrow} title={content.sections.impact} text={content.impact.intro} />
            <ol className="timeline-flow">
              {content.impact.phases.map((phase) => (
                <li className="timeline-phase" key={phase.title}>
                  <h3>{phase.title}</h3>
                  {phase.intro ? <p>{phase.intro}</p> : null}
                  <ul>
                    {phase.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </li>
              ))}
            </ol>
          </section>
        </Reveal>

        <Reveal>
          <section id="values" className="content-section values-section section-white">
            <SectionHeading title={content.values.title} />
            <div className="value-grid">
              {content.values.items.map((item) => (
                <article className="value-item" key={item.title}>
                  <ValueGraphic name={item.graphic} />
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section id="vision" className="content-section long-vision-section section-light">
            <SectionHeading title={content.longTermVision.title} text={content.longTermVision.intro} />
            <div className="long-vision-layout">
              <div>
                <p>{content.longTermVision.lead}</p>
                <ul className="vision-list">
                  {content.longTermVision.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
              </div>
              <blockquote className="vision-quote"><p>{content.longTermVision.quote}</p></blockquote>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section id="leadership" className="content-section leadership-section section-white">
            <SectionHeading eyebrow={content.sections.leadership} title={content.sections.leadership} />

            <div className="leader-grid">
              {content.leadership.map((person) => (
                <article key={person.name} className="leader-card">
                  <h3>{person.name}</h3>
                  <p>{person.role}</p>
                  {person.phone && !person.profile ? <a className="leader-phone" href={`tel:${person.phone}`}>{person.phone}</a> : null}
                  {person.profile ? <LeaderProfile person={person} /> : null}
                </article>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section id="join" className="content-section join-section section-light">
            <SectionHeading eyebrow={content.sections.getInvolved} title={content.sections.getInvolved} text={content.forms.intro} />
            <div className="involvement-pathways">
              {content.involvement.pathways.map((pathway) => (
                <article key={pathway.title} className="involvement-pathway">
                  <h3>{pathway.title}</h3>
                  <p>{pathway.text}</p>
                </article>
              ))}
            </div>
            <form className="prototype-form" aria-label={content.sections.getInvolved} name="join-inquiry" data-netlify="true" data-netlify-honeypot="website" onSubmit={handleJoinSubmit}>
              <input type="hidden" name="form-name" value="join-inquiry" />
              <HoneypotField />
              <label>{content.forms.nameLabel}<input type="text" name="name" autoComplete="name" maxLength="100" placeholder={content.forms.namePlaceholder} required /></label>
              <label>{content.forms.emailLabel}<input type="email" name="email" autoComplete="email" maxLength="254" placeholder={content.forms.emailPlaceholder} required /></label>
              <label>{content.forms.phoneLabel}<input type="tel" name="phone" autoComplete="tel" maxLength="40" placeholder={content.forms.phonePlaceholder} /></label>
              <label>
                {content.forms.requestTypeLabel}
                <select name="type" defaultValue="" required>
                  <option value="" disabled>{content.forms.requestTypePlaceholder}</option>
                  {content.involvement.requestTypes.map((requestType) => (
                    <option key={requestType.value} value={requestType.value}>{requestType.label}</option>
                  ))}
                </select>
              </label>
              <label>
                {content.forms.interestLabel}
                <select name="interest" defaultValue="">
                  <option value="" disabled>{content.forms.interestPlaceholder}</option>
                  {content.involvement.interestOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label>{content.forms.messageLabel}<textarea name="message" rows="4" maxLength="3000" placeholder={content.forms.messagePlaceholder} required /></label>
              <label className="privacy-consent"><input type="checkbox" name="consent" required /><span>{content.forms.consentLabel}</span></label>
              <button type="submit" className="btn btn-primary" disabled={joinSubmitting}>{joinSubmitting ? content.forms.sendingLabel : content.forms.submitLabel}</button>
              {joinStatus ? <p className={`prototype-status is-${joinStatus.type}`} role={joinStatus.type === 'error' ? 'alert' : 'status'}>{joinStatus.message}</p> : null}
            </form>
          </section>
        </Reveal>

        <Reveal>
          <section id="resources" className="content-section resources-section section-white">
            <SectionHeading eyebrow="Resources" title={content.resources.title} text={content.resources.intro} />
          </section>
        </Reveal>

        <Reveal>
          <section id="contact" className="content-section contact-section section-teal">
            <div className="contact-copy">
              <SectionHeading eyebrow={content.sections.contact} title={content.contact.location} />
              <address className="contact-details">
                <p><span>{content.contact.contactPersonLabel}</span><strong>{content.contact.contactPerson}</strong></p>
                <p><span>{content.contact.phoneLabel}</span><a href={`tel:${content.contact.phone}`}>{content.contact.phone}</a></p>
                <p><span>{content.contact.emailLabel}</span><a href={`mailto:${content.contact.email}`}>{content.contact.email}</a></p>
              </address>
            </div>
            <form className="prototype-form contact-form" aria-label={content.sections.contact} name="contact-inquiry" data-netlify="true" data-netlify-honeypot="website" onSubmit={handleContactSubmit}>
              <input type="hidden" name="form-name" value="contact-inquiry" />
              <HoneypotField />
              <input type="hidden" name="type" value="general" />
              <label>{content.forms.contactNameLabel}<input type="text" name="name" autoComplete="name" maxLength="100" placeholder={content.forms.namePlaceholder} required /></label>
              <label>{content.forms.emailLabel}<input type="email" name="email" autoComplete="email" maxLength="254" placeholder={content.forms.emailPlaceholder} required /></label>
              <label>{content.forms.phoneLabel}<input type="tel" name="phone" autoComplete="tel" maxLength="40" placeholder={content.forms.phonePlaceholder} /></label>
              <label>{content.forms.messageLabel}<textarea name="message" rows="4" maxLength="3000" placeholder={content.forms.contactMessagePlaceholder} required /></label>
              <label className="privacy-consent"><input type="checkbox" name="consent" required /><span>{content.forms.consentLabel}</span></label>
              <button type="submit" className="btn btn-primary" disabled={contactSubmitting}>{contactSubmitting ? content.forms.sendingLabel : content.forms.contactSubmitLabel}</button>
              {contactStatus ? <p className={`prototype-status is-${contactStatus.type}`} role={contactStatus.type === 'error' ? 'alert' : 'status'}>{contactStatus.message}</p> : null}
            </form>
          </section>
        </Reveal>

        <section className="community-cta section-teal">
          <div className="community-cta-inner">
            <div>
              <h2>{content.communityCta.title}</h2>
              <p>{content.communityCta.text}</p>
              <ul className="community-promise-lines">
                {content.communityCta.lines.map((line) => <li key={line}>{line}</li>)}
              </ul>
            </div>
            <a className="btn btn-primary" href="#join">
              {content.communityCta.action}
              <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                <path d="M3 10h13M11 4l6 6-6 6" />
              </svg>
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <p className="footer-brand-name">{content.brand.footerName}</p>
            <p className="footer-location">{content.contact.location}</p>
          </div>
          <nav className="footer-nav" aria-label="Footer navigation">
            <ul>
              {content.nav.map((item) => (
                <li key={item.href}><a href={item.href}>{item.label}</a></li>
              ))}
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  )
}

export default App
