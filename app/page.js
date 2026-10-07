'use client';

import { useState } from 'react';

const services = [
  {
    title: 'Home Shifting',
    text: 'Safe household relocation with trained staff, box packing, and careful loading and unloading support.',
    icon: '/images/category-home.svg',
  },
  {
    title: 'Office Relocation',
    text: 'Efficient business moves with planned scheduling, document safety, and minimal downtime.',
    icon: '/images/category-office.svg',
  },
  {
    title: 'Packing & Unpacking',
    text: 'Professional packing materials and organised handling for fragile goods, electronics, and valuables.',
    icon: '/images/category-packing.svg',
  },
  {
    title: 'Transport & Loading',
    text: 'Reliable goods transport with sturdy loading solutions for city moves and intercity shifting.',
    icon: '/images/category-transport.svg',
  },
];

const highlights = [
  'Trusted by families and businesses',
  'Transparent pricing and no hidden fees',
  'On-time pickup and unloading support',
  'Dedicated customer assistance',
];

const faqs = [
  {
    q: 'Do you provide home shifting?',
    a: 'Yes. We manage complete home shifting support including packing, loading, transportation, and unloading.',
  },
  {
    q: 'Do you provide office shifting?',
    a: 'Yes. We help businesses move office furniture, equipment, files, and essential assets with careful coordination.',
  },
  {
    q: 'Do you handle local and outstation moving?',
    a: 'Yes. We serve local moves and outstation shifting with a planning approach suited to your route and timeline.',
  },
  {
    q: 'Can I book by WhatsApp?',
    a: 'Yes. You can share your moving requirements via WhatsApp or fill in the quick enquiry form on the page.',
  },
  {
    q: 'Can I just call?',
    a: 'Yes. Customers can directly call Mukesh Gupta at +91 7738684221 for quick assistance and pricing guidance.',
  },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    pickupCity: '',
    dropCity: '',
    movingDate: '',
    requirement: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const message = [
      'Namaste, mujhe shifting ka quote chahiye.',
      'Name: ' + form.name,
      'Mobile: ' + form.mobile,
      'Pickup city: ' + form.pickupCity,
      'Drop city: ' + form.dropCity,
      'Moving date: ' + (form.movingDate || 'Not decided'),
      'Moving type: ' + (form.requirement || 'Not selected'),
    ].join('\\n');
    const whatsappUrl = 'https://wa.me/917738684221?text=' + encodeURIComponent(message);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <header className="site-header">
        <div className="container nav-wrap">
          <div className="brand-block">
            <div className="brand-mark">OS</div>
            <div>
              <p className="brand-name">Om Sai</p>
              <span className="brand-sub">Packers &amp; Movers</span>
            </div>
          </div>

          <nav id="main-navigation" className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="Main navigation">
            <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
            <a href="#why-us" onClick={() => setMenuOpen(false)}>Why us</a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
            <a href="#booking" onClick={() => setMenuOpen(false)}>Book now</a>
          </nav>

          <button className="menu-toggle" type="button" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen((open) => !open)}><span></span><span></span><span></span></button>
          <div className="nav-actions">
            <a className="ghost-link" href="tel:+917738684221">Call Now</a>
            <a className="primary-link" href="#booking">Get Quote</a>
          </div>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Trusted moving experts in India</span>
              <h1>Safe, fast, and stress-free shifting for your home or office.</h1>
              <p>
                From local household moves to business relocations, we handle packing,
                loading, transport, and unloading with care and punctuality.
              </p>

              <div className="hero-actions">
                <a href="#booking" className="btn btn-primary">Request a quote</a>
                <a href="tel:+917738684221" className="btn btn-secondary">Call: +91 7738684221</a>
              </div>

              <div className="trust-row" aria-label="Business highlights">
                <div>
                  <strong>500+</strong>
                  <span>Successful moves</span>
                </div>
                <div>
                  <strong>24/7</strong>
                  <span>Support</span>
                </div>
                <div>
                  <strong>100%</strong>
                  <span>Careful handling</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="image-card">
                <img
                  src="/images/om-sai-bolero-real.jpg"
                  alt="Mahindra Bolero goods carrier used by Om Sai Packers & Movers"
                />
                <div className="floating-badge">
                  <span>On-time relocation</span>
                  <strong>Trusted vehicle fleet</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="stat-strip">
          <div className="container stat-grid">
            <div>
              <strong>10+ Years</strong>
              <span>Service experience</span>
            </div>
            <div>
              <strong>Local &amp; Outstation</strong>
              <span>All move categories</span>
            </div>
            <div>
              <strong>Packaging Care</strong>
              <span>Fragile item protection</span>
            </div>
            <div>
              <strong>Quick Response</strong>
              <span>Fast support and scheduling</span>
            </div>
          </div>
        </section>

        <section className="section-padding" id="services">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow eyebrow-dark">Our services</span>
              <h2>Complete moving solutions built around your timeline.</h2>
            </div>

            <div className="service-grid">
              {services.map((service) => (
                <article key={service.title} className="service-card">
                  <div className="icon-wrap">
                    <img src={service.icon} alt={service.title} />
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding section-soft" id="about">
          <div className="container two-col">
            <div>
              <span className="eyebrow eyebrow-dark">Why customers choose us</span>
              <h2>Professional movers who value your peace of mind.</h2>
              <p className="lead-text">
                Om Sai Packers &amp; Movers is built around reliability, careful handling,
                and transparent service for families, renters, and businesses.
              </p>
              <ul className="feature-list">
                {highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="info-panel">
              <div className="panel-badge">Available in major service areas</div>
              <h3>Local &amp; intercity moving support</h3>
              <p>
                We help with home shifting, office relocation, and smooth logistics planning as per your moving dates.
              </p>
              <div className="mini-stats">
                <div>
                  <strong>24/7</strong>
                  <span>Enquiry support</span>
                </div>
                <div>
                  <strong>Quick</strong>
                  <span>Booking response</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding" id="why-us">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow eyebrow-dark">Our process</span>
              <h2>Simple, transparent, and easy to book.</h2>
            </div>

            <div className="steps-grid">
              <div className="step-card">
                <span>01</span>
                <h3>Share your move</h3>
                <p>Tell us your pickup, drop city, and preferred date.</p>
              </div>
              <div className="step-card">
                <span>02</span>
                <h3>Get guidance</h3>
                <p>We recommend the right vehicle and moving approach.</p>
              </div>
              <div className="step-card">
                <span>03</span>
                <h3>Schedule pickup</h3>
                <p>Confirm the move and prepare packing support in advance.</p>
              </div>
              <div className="step-card">
                <span>04</span>
                <h3>Enjoy peace of mind</h3>
                <p>Our crew handles the transition with attendance and care.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding booking-section" id="booking">
          <div className="container booking-grid">
            <div className="booking-copy">
              <span className="eyebrow eyebrow-dark">Book a move</span>
              <h2>Request your moving quote in under a minute.</h2>
              <p>
                Fill in your move details and our team will get back to you with the right support and pricing guidance.
              </p>
              <div className="contact-card">
                <span>Direct contact</span>
                <a href="tel:+917738684221">+91 7738684221</a>
                <a href="https://wa.me/917738684221" target="_blank" rel="noreferrer">WhatsApp us</a>
              </div>
            </div>

            <form className="quote-form" onSubmit={handleSubmit}>
              <div className="field-row">
                <label>
                  Full name
                  <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your name" required />
                </label>
                <label>
                  Mobile number
                  <input type="tel" name="mobile" value={form.mobile} onChange={handleChange} placeholder="10-digit mobile" required />
                </label>
              </div>

              <div className="field-row">
                <label>
                  Pickup city
                  <input type="text" name="pickupCity" value={form.pickupCity} onChange={handleChange} placeholder="From city" required />
                </label>
                <label>
                  Drop city
                  <input type="text" name="dropCity" value={form.dropCity} onChange={handleChange} placeholder="To city" required />
                </label>
              </div>

              <div className="field-row">
                <label>
                  Moving date
                  <input type="date" name="movingDate" value={form.movingDate} onChange={handleChange} />
                </label>
                <label>
                  Moving type
                  <select name="requirement" value={form.requirement} onChange={handleChange}>
                    <option value="">Select option</option>
                    <option value="home-shifting">Home shifting</option>
                    <option value="office-shifting">Office shifting</option>
                    <option value="local-moving">Local moving</option>
                    <option value="outstation-moving">Outstation moving</option>
                  </select>
                </label>
              </div>

              <button type="submit" className="btn btn-primary form-btn">Get free quote</button>
            </form>
          </div>
        </section>

        <section className="section-padding faq-section" id="faq">
          <div className="container">
            <div className="section-heading center-heading">
              <span className="eyebrow eyebrow-dark">Frequently asked questions</span>
              <h2>Everything you need to know before moving.</h2>
            </div>

            <div className="faq-list">
              {faqs.map((item, index) => (
                <div key={item.q} className={`faq-item ${openFaq === index ? 'open' : ''}`}>
                  <button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>
                    <span>{item.q}</span>
                    <span className="faq-icon">{openFaq === index ? '−' : '+'}</span>
                  </button>
                  {openFaq === index && <p>{item.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <div className="brand-block footer-brand">
              <div className="brand-mark">OS</div>
              <div>
                <p className="brand-name">Om Sai</p>
                <span className="brand-sub">Packers &amp; Movers</span>
              </div>
            </div>
            <p>Premium shifting support for homes, offices, and local or outstation moves.</p>
          </div>

          <div>
            <h3>Quick links</h3>
            <ul>
              <li><a href="#services">Services</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#booking">Book now</a></li>
            </ul>
          </div>

          <div>
            <h3>Contact</h3>
            <ul>
              <li><a href="tel:+917738684221">+91 7738684221</a></li>
              <li><a href="https://wa.me/917738684221" target="_blank" rel="noreferrer">WhatsApp</a></li>
            </ul>
          </div>
        </div>
      </footer>

      <div className="mobile-cta-bar">
        <a href="tel:+917738684221">Call</a>
        <a href="https://wa.me/917738684221" target="_blank" rel="noreferrer">WhatsApp</a>
        <a href="#booking">Book</a>
      </div>
    </>
  );
}
