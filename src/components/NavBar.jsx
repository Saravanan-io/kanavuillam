import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './NavBar.css';

export default function NavBar({ showSections }) {
  const navRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let lastScrolled = false;
    const onScroll = () => {
      const isScrolled = window.scrollY > 60;
      if (isScrolled !== lastScrolled) {
        lastScrolled = isScrolled;
        setScrolled(isScrolled);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Entrance animation
    gsap.fromTo(navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: 'power4.out', delay: 1.6 }
    );

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [showSections]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
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
            Kanavu<span className="logo-x">illam</span>
          </span>
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
        </div>
      </div>
    </nav>
  );
}
