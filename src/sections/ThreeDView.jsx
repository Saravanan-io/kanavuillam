import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ThreeDView.css';

export default function ThreeDView() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Section Content Fade-ins
    const contentAnim = gsap.fromTo('.tdv-content',
      { x: -60, opacity: 0 },
      { x: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } }
    );

    // Fade-in the video player
    const playerAnim = gsap.fromTo('.tdv-canvas-wrap',
      { x: 60, opacity: 0 },
      { x: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } }
    );

    // Play video only when in viewport to save resources/ensure smooth play
    const videoElement = videoRef.current;
    let observer;
    if (videoElement) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoElement.play().catch(() => {});
          } else {
            videoElement.pause();
          }
        });
      }, { threshold: 0.1 });
      observer.observe(videoElement);
    }

    return () => {
      contentAnim.scrollTrigger?.kill();
      playerAnim.scrollTrigger?.kill();
      if (observer && videoElement) {
        observer.unobserve(videoElement);
      }
    };
  }, []);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const progress = video.currentTime / video.duration;
    const fill = document.getElementById('build-fill');
    if (fill) fill.style.width = `${progress * 100}%`;
  };

  return (
    <div className="tdv-section" ref={sectionRef}>
      <div className="tdv-bg">
        <div className="tdv-gradient" />
        <div className="tdv-bg-glow" />
      </div>

      <div className="tdv-inner">
        {/* Title */}
        <div className="tdv-content">
          <p className="section-label">2D Plan to 3D Reality</p>
          <h2 className="section-title">Transform Your 2D<br/>Blueprint to 3D</h2>
          <p className="section-subtitle">
            Watch your flat 2D plans seamlessly transform into a fully realized 3D home model. Experience real-time depth, professional lighting, and realistic details before construction begins.
          </p>
        </div>

        {/* Video Wrapper */}
        <div className="tdv-canvas-wrap">
          <div className="tdv-canvas-frame" style={{ position: 'relative' }}>
            <video
              ref={videoRef}
              src="/threed_house_view.mp4"
              autoPlay
              loop
              muted
              playsInline
              onTimeUpdate={handleTimeUpdate}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                background: '#000'
              }}
            />
          </div>

          {/* Progress bar */}
          <div className="build-progress-container">
            <div className="build-progress-track">
              <div className="build-progress-fill" id="build-fill" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
