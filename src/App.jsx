import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// ── Immediately needed ──
import LandingPage from './sections/LandingPage';
import NavBar from './components/NavBar';
import Preloader from './components/Preloader';
import './App.css';

// ── Lazy-loaded (only when scrolled into view or after preloader) ──
const AmbientParticles = lazy(() => import('./components/AmbientParticles'));
const FeatureCards = lazy(() => import('./sections/FeatureCards'));
const ThreeDView = lazy(() => import('./sections/ThreeDView'));
const VastuReport = lazy(() => import('./sections/VastuReport'));
const CostEstimation = lazy(() => import('./sections/CostEstimation'));
const StructuralReport = lazy(() => import('./sections/StructuralReport'));
const Elevation = lazy(() => import('./sections/Elevation'));
const ReportsShowcase = lazy(() => import('./sections/ReportsShowcase'));

gsap.registerPlugin(ScrollTrigger);

const sections = [
  { id: 'landing', label: 'Home' },
  { id: 'features', label: 'Features' },
  { id: 'threed', label: '3D View' },
  { id: 'vastu', label: 'Vastu' },
  { id: 'cost', label: 'Cost' },
  { id: 'structural', label: 'Structural' },
  { id: 'elevation', label: 'Elevation' },
  { id: 'reports', label: 'Reports' },
];

// Minimal section skeleton shown while lazy chunk loads
function SectionSkeleton() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--cream-soft, #F8FAFF)',
    }}>
      <div style={{
        width: 40, height: 40,
        border: '3px solid rgba(99,102,241,0.2)',
        borderTopColor: '#6366F1',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  );
}

export default function App() {
  const appRef = useRef(null);
  const [ready, setReady] = useState(false);   // preloader done?
  const [showSections, setShowSections] = useState(false); // lazy sections visible?
  const [activeSection, setActiveSection] = useState('landing');

  // After preloader exits, unmount it and show lazy content
  const handlePreloaderDone = () => {
    setReady(true);
    // Force scroll to top instantly to ensure ScrollTrigger calculations start at 0
    window.scrollTo(0, 0);
    // Small delay so LandingPage GSAP timeline has DOM ready
    setTimeout(() => setShowSections(true), 100);
  };

  // 1. Lock scrolling during preload to prevent scroll offset math errors
  useEffect(() => {
    if (!ready) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.scrollTo(0, 0);
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [ready]);

  // 2. Progressive refresh: lazy-loaded chunks take time to load and change page height.
  // We refresh ScrollTrigger at multiple intervals after sections mount to align markers.
  useEffect(() => {
    if (!showSections) return;

    const refreshIntervals = [150, 400, 800, 1500, 2500, 4500, 7000, 10000];
    const timers = refreshIntervals.map(delay =>
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, delay)
    );

    const handleLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', handleLoad);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('load', handleLoad);
    };
  }, [showSections]);

  // 3. Highlight sidebar navigation dots based on section intersection
  useEffect(() => {
    if (!showSections) return;

    const observerOptions = {
      root: null,
      rootMargin: '-35% 0px -45% 0px', // detects when section covers mid viewport area
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [showSections]);

  useEffect(() => {
    if (!ready) return;
    ScrollTrigger.config({ limitCallbacks: true });

    let cleanups = [];
    const timerId = setTimeout(() => {
      document.querySelectorAll('.btn-gold, .btn-ghost').forEach(el => {
        const onMove = (e) => {
          const rect = el.getBoundingClientRect();
          const dx = e.clientX - (rect.left + rect.width / 2);
          const dy = e.clientY - (rect.top + rect.height / 2);
          gsap.to(el, { x: dx * 0.25, y: dy * 0.2, duration: 0.4, ease: 'power2.out' });
        };
        const onLeave = () => gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseleave', onLeave);
        cleanups.push(() => {
          el.removeEventListener('mousemove', onMove);
          el.removeEventListener('mouseleave', onLeave);
        });
      });
    }, 2500);

    return () => {
      clearTimeout(timerId);
      cleanups.forEach(fn => fn());
    };
  }, [ready]);

  return (
    <div ref={appRef} className="app">
      {/* Global spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Preloader — shown until ready */}
      {!ready && <Preloader onComplete={handlePreloaderDone} />}


      {/* Ambient particles — lazy, appears after preloader */}
      {showSections && (
        <Suspense fallback={null}>
          <AmbientParticles />
        </Suspense>
      )}

      <NavBar sections={sections} showSections={showSections} />



      <main>
        {/* LandingPage loaded eagerly — first paint must be instant */}
        <section id="landing"><LandingPage ready={ready} /></section>

        {/* All other sections lazy-loaded after preloader */}
        {showSections && (
          <>
            <section id="features">
              <Suspense fallback={<SectionSkeleton />}>
                <FeatureCards />
              </Suspense>
            </section>

            <section id="threed">
              <Suspense fallback={<SectionSkeleton />}>
                <ThreeDView />
              </Suspense>
            </section>

            <section id="vastu">
              <Suspense fallback={<SectionSkeleton />}>
                <VastuReport />
              </Suspense>
            </section>

            <section id="cost">
              <Suspense fallback={<SectionSkeleton />}>
                <CostEstimation />
              </Suspense>
            </section>

            <section id="structural">
              <Suspense fallback={<SectionSkeleton />}>
                <StructuralReport />
              </Suspense>
            </section>

            <section id="elevation">
              <Suspense fallback={<SectionSkeleton />}>
                <Elevation />
              </Suspense>
            </section>

            <section id="reports">
              <Suspense fallback={<SectionSkeleton />}>
                <ReportsShowcase />
              </Suspense>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
