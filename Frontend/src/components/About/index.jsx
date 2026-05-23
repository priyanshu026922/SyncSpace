import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.css';

const About = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleGetStarted = () => {
    navigate('/register');
  };

  return (
    <div className={styles.aboutContainer}>
      {/* Navigation Header */}
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <div className={styles.logo}>
            <h2>SyncSpace</h2>
          </div>
          <div className={styles.navButtons}>
            <button className={styles.backButton} onClick={handleBackToHome}>
              ← Back to Home
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            About <span className={styles.highlight}>SyncSpace</span>
          </h1>
          <p className={styles.heroDescription}>
            Empowering creativity and collaboration through innovative digital canvas technology
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className={styles.missionSection}>
        <div className={styles.container}>
          <div className={styles.missionContent}>
            <div className={styles.missionText}>
              <h2>About the project:</h2>
              <p>
                People can collaborate freely and express their thoughts visually. 
                 This provides a  seamless digital canvas where teams, educators, and creative professionals can bring their ideas to life.
              </p>
              <p>
                This platform combines the intuitive feel of traditional whiteboarding with the power of modern technology, 
                enabling real-time collaboration regardless of geographical boundaries.
              </p>
            </div>
            <div className={styles.missionVisual}>
              <div className={styles.visualCard}>
                <div className={styles.cardIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h3>Collaborative</h3>
                <p>Work together in real-time with team members around the world</p>
              </div>
            </div>
          </div>
        </div>
      </section>

     
      {/* Values Section */}
      <section className={styles.valuesSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
           
          </div>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <h3>Innovation</h3>
              <p>We continuously push the boundaries of what's possible in digital collaboration, always seeking new ways to enhance creativity.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3>Collaboration</h3>
              <p>We believe the best ideas emerge when people work together, and we design every feature with collaboration in mind.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                  <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                  <path d="M13 12h3a2 2 0 0 1 2 2v1"/>
                  <path d="M11 12H8a2 2 0 0 0-2 2v1"/>
                </svg>
              </div>
              <h3>Simplicity</h3>
              <p>Complex problems require simple solutions. We strive to make powerful tools that are intuitive and easy to use.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h3>Security</h3>
              <p>Your ideas and data are precious. We implement robust security measures to protect your creative work and privacy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>Ready to Start Creating?</h2>
            <p>Join the community of creators, educators, and innovators</p>
            <button className={styles.ctaButton} onClick={handleGetStarted}>
              Get Started Today
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerSection}>
              <h3>SyncSpace</h3>
              <p>Empowering creativity through collaborative digital canvases.</p>
            </div>
            <div className={styles.footerSection}>
              <h4>Contact</h4>
              <ul>
                <li>priyanshuranjan7856@gmail.com</li>
                <li>Ranchi,Jharkhand</li>
              </ul>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>&copy; 2026 SyncSpace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;