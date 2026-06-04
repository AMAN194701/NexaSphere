import { useEffect, useRef } from 'react';

const AUTO_SCROLL_THRESHOLD = 400;

export function useBackToTop() {
  useEffect(() => {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    const handleScroll = () => {
      btn.classList.toggle('visible', window.scrollY > AUTO_SCROLL_THRESHOLD);
    };

    const handleClick = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    btn.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      btn.removeEventListener('click', handleClick);
    };
  }, []);
}

export function useActiveTabObserver(page, mobile, navTabs, navHeights, setActiveTab) {
  // Stabilise navTabs reference so callers that pass an inline array literal
  // (e.g. useActiveTabObserver(page, mobile, ['Home', 'Events', ...], ...))
  // don't cause the scroll listener to re-register on every render.
  // We compare by serialised value rather than reference identity.
  const navTabsRef = useRef(navTabs);
  const navTabsKey = JSON.stringify(navTabs);

  useEffect(() => {
    navTabsRef.current = navTabs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navTabsKey]);

  useEffect(() => {
    if (page) return;

    const navHeight = mobile ? navHeights.MOBILE : navHeights.DESKTOP;

    const handleScroll = () => {
      const scrollY = window.scrollY + navHeight + 30;
      const tabs = navTabsRef.current;

      for (let i = tabs.length - 1; i >= 0; i--) {
        const section = document.getElementById(`section-${tabs[i].toLowerCase()}`);
        if (section && section.offsetTop <= scrollY) {
          setActiveTab(tabs[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
    // navTabsKey instead of navTabs so inline array literals don't cause
    // the listener to re-register on every render.
  }, [mobile, page, navTabsKey, navHeights, setActiveTab]);
}
