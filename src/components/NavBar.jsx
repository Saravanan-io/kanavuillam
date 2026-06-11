import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './NavBar.css';

export default function NavBar({ sections }) {
  const navRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('landing');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);

      // Detect active section
      const scrollY = window.scrollY + window.innerHeight * 0.4;
      sections.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const bot = top + el.offsetHeight;
          if (scrollY >= top && scrollY < bot) setActiveSection(id);
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Entrance animation
    gsap.fromTo(navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: 'power4.out', delay: 1.6 }
    );

    return () => window.removeEventListener('scroll', onScroll);
  }, [sections]);

  const navLinks = [
    { label: 'Home',      id: 'landing' },
    { label: 'Features',  id: 'features' },
    { label: 'About',     id: 'threed' },
    { label: 'Contact',   id: 'reports' },
  ];

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <nav className={`planx-nav ${scrolled ? 'scrolled' : ''}`} ref={navRef}>
      <div className="nav-inner">
        {/* Logo */}
        <div className="nav-logo" onClick={() => scrollTo('landing')}>
          <div className="nav-logo-icon">
            {/* House icon matching PlanX reference */}
            <svg viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
              <path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
              <polyline points="9 21 9 13 15 13 15 21" />
            </svg>
          </div>
          <span className="nav-logo-text">
            Plan<span className="logo-x">X</span>
          </span>
        </div>

        {/* Links */}
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {navLinks.map(({ label, id }) => (
            <button
              key={id}
              className={`nav-link ${activeSection === id ? 'active' : ''}`}
              onClick={() => scrollTo(id)}
              id={`nav-${id}`}
            >
              {label}
              <span className="nav-link-dot" />
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="nav-right">
          <button
            className="nav-cta btn-gold"
            id="nav-get-started"
            onClick={() => scrollTo('features')}
          >
            Get Started
          </button>
          {/* Mobile hamburger */}
          <button
            className={`nav-burger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            id="nav-burger-btn"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
}
