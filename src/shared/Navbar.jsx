import { useState, useEffect } from 'react';
import nexasphereAppLogo from '../assets/images/logos/nexasphere-app-logo.png';
import { NAV_TABS, MOBILE_BREAKPOINT, SCROLL_THRESHOLD } from '../data/config';

function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      className="ns-theme-toggle"
      onClick={onToggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
    >
      {theme === 'dark' ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

export default function Navbar({ activeTab, onTabChange, onToggleTheme, theme }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);
  const goHome = () => onTabChange('Home');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    const handleResize = () => setMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (mobile) {
    return (
      <nav className="ns-navbar-mobile">
        <div className="ns-mobile-top">
          <button
            type="button"
            onClick={goHome}
            aria-label="Go to Home"
            className="ns-mobile-brand"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 10, font: 'inherit', color: 'inherit' }}
          >
            <img src={nexasphereAppLogo} alt="NexaSphere" className="ns-mobile-logo-ns" />
            <span>
              NexaSphere
            </span>
          </button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
        <div className="ns-mobile-tabs">
          {NAV_TABS.map(tab => (
            <button
              key={tab}
              className={`ns-mobile-tab${activeTab === tab ? ' active' : ''}${tab === 'Contact' ? ' contact-tab' : ''}`}
              onClick={() => onTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav className={`ns-navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="container">
        <button
          type="button"
          className="ns-nav-logos"
          onClick={goHome}
          aria-label="Go to Home"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit', color: 'inherit' }}
        >
          <img src={nexasphereAppLogo} alt="NexaSphere" className="ns-nav-logo-ns" />
          <div className="ns-nav-divider" />
          <span className="ns-nav-brand">NexaSphere</span>
        </button>

        <div className="ns-nav-right">
          <ul className="ns-nav-tabs">
            {NAV_TABS.map(tab => (
              <li key={tab}>
                <button
                  className={`ns-nav-tab${activeTab === tab ? ' active' : ''}${tab === 'Contact' ? ' contact-nav-tab' : ''}`}
                  onClick={() => onTabChange(tab)}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </nav>
  );
}

