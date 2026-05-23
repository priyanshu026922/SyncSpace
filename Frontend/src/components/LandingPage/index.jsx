import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import boardContext from '../../store/board-context';
import styles from './index.module.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isUserLoggedIn } = useContext(boardContext);

  const token = localStorage.getItem("token");
  const isLoggedIn = isUserLoggedIn || !!token;

  const handleGetStarted = () => {
    if (isLoggedIn) navigate('/dashboard');
    else navigate('/register');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleAbout = () => {
    navigate('/about');
  };

 

  const handleHelp = () => {
    navigate('/help');
  };

  return (
    <div className={styles.landingContainer}>
      {/* Navigation Header */}
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <div className={styles.logo}>
            <h2>SyncSpace</h2>
          </div>
          <div className={styles.navButtons}>
            <button className={styles.aboutBtn} onClick={handleAbout}>
              About
            </button>
            <button className={styles.aboutBtn} onClick={handleHelp}>
              Help
            </button>
            {!isUserLoggedIn ? (
              <>
                <button className={styles.loginBtn} onClick={handleLogin}>
                  Login
                </button>
                <button className={styles.registerBtn} onClick={handleRegister}>
                  Sign Up
                </button>
              </>
            ) : (
              <button className={styles.dashboardBtn} onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroVisual}>
          <div className={styles.mockupContainer}>
            <div className={styles.mockupScreen}>
              <div className={styles.mockupToolbar}>
                <div className={styles.toolItem}></div>
                <div className={styles.toolItem}></div>
                <div className={styles.toolItem}></div>
                <div className={styles.toolItem}></div>
              </div>
              <div className={styles.mockupCanvas}>
                <svg className={styles.mockupDrawing} viewBox="0 0 300 200">
                  <path d="M50 100 Q 150 50 250 100" stroke="#4F46E5" strokeWidth="3" fill="none" />
                  <circle cx="80" cy="80" r="20" stroke="#10B981" strokeWidth="2" fill="none" />
                  <rect x="180" y="120" width="60" height="40" stroke="#F59E0B" strokeWidth="2" fill="none" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>
            Collaborate on Ideas with
            <span className={styles.highlight}> Digital Whiteboard</span>
          </h1>
          <p className={styles.heroDescription}>
            Create, share, and collaborate on visual ideas in real-time. 
          </p>
          <div className={styles.heroButtons}>
            <button className={styles.ctaButton} onClick={handleGetStarted}>
              Create New Canvas
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Powerful Features for Creative Collaboration</h2>
            <p>Everything you need to bring your ideas to life</p>
          </div>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3>Real-time Collaboration</h3>
              <p>Work together with your team in real-time. See changes instantly as others draw and edit.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>
              <h3>Rich Drawing Tools</h3>
              <p>Express your ideas with brushes, shapes, text, arrows, and more. Customize colors and sizes.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </div>
              <h3>Multiple Canvases</h3>
              <p>Organize your work across multiple canvases. Create, manage, and switch between projects easily.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                </svg>
              </div>
              <h3>Export & Share</h3>
              <p>Download your creations as images or share canvases with team members via email.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                  <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                  <path d="M13 12h3a2 2 0 0 1 2 2v1"/>
                  <path d="M11 12H8a2 2 0 0 0-2 2v1"/>
                </svg>
              </div>
              <h3>Secure & Private</h3>
              <p>Your data is secure with user authentication and private canvas sharing controls.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>Ready to Start Creating?</h2>
            <p>Bring your ideas to life with real-time collaboration.</p>
            <button className={styles.ctaButton} onClick={handleGetStarted}>
              Create New Canvas
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
              <p>The ultimate digital collaboration platform for creative minds.</p>
            </div>
          
          </div>
          <div className={styles.footerBottom}>
            <p>&copy; 2025 SyncSpace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;