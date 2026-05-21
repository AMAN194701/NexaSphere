import { useState, useEffect, useRef, useCallback } from 'react';
import './styles/themes.css';
import './styles/globals.css';
import './styles/animations.css';
import './styles/chatbot.css';
import './styles/components.css';
import './styles/portfolio.css';
import './styles/aurora.css';
import './styles/motion.css';

import SearchBar            from './components/SearchBar';
import ParticleBackground   from './shared/ParticleBackground';
import GeometricGridBackground from './shared/GeometricGridBackground';
import ScrollProgress       from './shared/ScrollProgress';
import Navbar               from './shared/Navbar';
import HeroSection          from './pages/home/HeroSection';
import ActivitiesSection    from './pages/activities/ActivitiesSection';
import EventsSection        from './pages/events/EventsSection';
import AboutSection         from './pages/about/AboutSection';
import TeamSection          from './pages/team/TeamSection';
import Footer               from './shared/Footer';
import ActivityDetailPage   from './pages/activities/ActivityDetailPage';
import EventDetailPage      from './pages/events/EventDetailPage';
import CinematicOpening     from './shared/CinematicOpening';
import Chatbot              from './shared/Chatbot';
import {
  AmbientOrbs, SectionDivider, PageFlash, BannerOrbs,
  useNsReveal, useHeroParallax,
  useNavScrollTint, useGlobalMouseParallax, useMagneticCards,
} from './shared/MotionLayer';
import ActivitiesPage    from './pages/activities/ActivitiesPage';
import EventsPage        from './pages/events/EventsPage';
import AboutPage         from './pages/about/AboutPage';
import TeamPage          from './pages/team/TeamPage';
import ContactPage       from './pages/contact/ContactPage';
import RecruitmentPage   from './pages/recruitment/RecruitmentPage';
import MembershipPage    from './pages/membership/MembershipPage';
import AdminPage         from './pages/admin/AdminPage';
import RoadmapsPage      from './pages/roadmaps/RoadmapsPage';
import ProjectsPage      from './pages/projects/ProjectsPage';
import PortfolioBuilder  from './components/portfolio/PortfolioBuilder';
import PublicPortfolio   from './pages/portfolio/PublicPortfolio';
import { activityPages } from './data/activities/index';
import { events as fallbackEvents } from './data/eventsData';
import nexasphereLogo    from './assets/images/logos/nexasphere-logo.png';
import Terminal          from './components/developer/Terminal';
import { useDeveloperMode } from './hooks/useDeveloperMode';
import { BookmarkProvider } from './context/BookmarkContext';
import BookmarksDrawer   from './components/bookmarks/BookmarksDrawer';

/* ── Constants ── */
const MNH  = 88;
const DNH  = 64;
const TABS = ['Home','Activities','Events','Projects','Roadmaps','Portfolio','About','Team','Contact'];
const SECTION_TABS = ['Activities','Events','Projects','Roadmaps','Portfolio','About','Team','Contact'];
const VALID_PAGE_TYPES = ['section','activity','event','apply','join','portfolio','admin'];

/* ─────────────────────────────────────────
   Wipe — page transition overlay
───────────────────────────────────────── */
function Wipe({ on, ph }) {
  if (!on) return null;
  const anim = ph === 'out' ? 'wipeDown' : 'wipeUp';
  return (
    <>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 8000,
        background: 'var(--bg)',
        animation: `${anim} ${ph === 'out' ? '.27s' : '.30s'} cubic-bezier(.77,0,.18,1) forwards`,
        pointerEvents: 'all',
      }}/>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 8001,
        background: 'linear-gradient(90deg,#CC1111,#880000,#EE2222)',
        opacity: 0.09,
        animation: `${anim} ${ph === 'out' ? '.20s .04s' : '.24s .04s'} cubic-bezier(.77,0,.18,1) forwards`,
        pointerEvents: 'none',
      }}/>
      {ph === 'out' && <div className="wipe-shimmer" aria-hidden="true"/>}
      {ph === 'in'  && <PageFlash/>}
      {ph === 'out' && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          zIndex: 8002, pointerEvents: 'none',
          opacity: 0, animation: 'splashIn .16s .1s ease forwards',
        }}>
          <img
            src={nexasphereLogo}
            alt=""
            style={{
              height: '46px',
              mixBlendMode: 'screen',
              filter: 'drop-shadow(0 0 12px var(--c1))',
              opacity: 0.6,
            }}
          />
        </div>
      )}
    </>
  );
}

/* ─────────────────────────────────────────
   PageIn — enter animation wrapper
───────────────────────────────────────── */
function PageIn({ children, k }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, [k]);

  return (
    <div style={{
      opacity:   ready ? 1 : 0,
      transform: ready ? 'none' : 'translateY(16px) scale(.99)',
      transition: 'opacity .42s cubic-bezier(.22,1,.36,1), transform .42s cubic-bezier(.22,1,.36,1)',
      willChange: 'opacity, transform',
    }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────
   Cursor — anti-gravity orb
───────────────────────────────────────── */
function Cursor() {
  const orbRef   = useRef(null);
  const trailRef = useRef(null);
  const glowRef  = useRef(null);
  const stateRef = useRef({
    mx: 0, my: 0,
    ox: 0, oy: 0,
    floatY: 0, floatPhase: 0,
    hovering: false,
    clicking: false,
    visible: true,
    raf: null,
  });

  useEffect(() => {
    if (window.matchMedia('(hover:none)').matches) return;
    document.body.style.cursor = 'none';

    const s = stateRef.current;

    const onMove  = e => { s.mx = e.clientX; s.my = e.clientY; };
    const onDown  = ()  => { s.clicking = true; };
    const onUp    = ()  => { s.clicking = false; };
    const onOver  = e  => {
      s.hovering = !!e.target.closest('button,a,[role="button"],[tabindex]');
    };
    const onLeave = () => {
      s.visible = false;
      [orbRef, trailRef, glowRef].forEach(r => {
        if (r.current) r.current.style.opacity = '0';
      });
    };
    const onEnter = () => {
      s.visible = true;
    };

    /* single tick — no duplicate */
    const tick = () => {
      s.ox += (s.mx - s.ox) * 1.0;
      s.oy += (s.my - s.oy) * 1.0;
      s.floatPhase += 0.022;
      s.floatY =
        Math.sin(s.floatPhase)       * 2 +
        Math.sin(s.floatPhase * 1.7) * 1 +
        Math.sin(s.floatPhase * 0.5) * 1;

      const fy      = s.oy + s.floatY;
      const scale   = s.clicking ? 0.7 : s.hovering ? 1.55 : 1;
      const opacity = s.visible ? (s.hovering ? 0.95 : 0.82) : 0;

      if (orbRef.current) {
        orbRef.current.style.left      = `${s.ox}px`;
        orbRef.current.style.top       = `${fy}px`;
        orbRef.current.style.transform = `translate(-50%,-50%) scale(${scale})`;
        orbRef.current.style.opacity   = opacity;
      }
      if (trailRef.current) {
        trailRef.current.style.left    = `${s.ox}px`;
        trailRef.current.style.top     = `${s.oy + s.floatY * 0.4}px`;
        trailRef.current.style.opacity = s.visible ? (s.hovering ? 0 : 0.35) : 0;
      }
      if (glowRef.current) {
        glowRef.current.style.left    = `${s.mx}px`;
        glowRef.current.style.top     = `${s.my}px`;
        glowRef.current.style.opacity = s.visible ? 1 : 0;
      }

      s.raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove,  { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup',   onUp);
    window.addEventListener('mouseover', onOver,  { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.documentElement.addEventListener('mouseenter', onEnter);
    s.raf = requestAnimationFrame(tick);

    return () => {
      document.body.style.cursor = '';
      cancelAnimationFrame(s.raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup',   onUp);
      window.removeEventListener('mouseover', onOver);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.documentElement.removeEventListener('mouseenter', onEnter);
    };
  }, []);

  return (
    <>
      {/* Ambient glow */}
      <div ref={glowRef} style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 10000,
        width: '320px', height: '320px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(204,17,17,.055) 0%, rgba(136,0,0,.03) 40%, transparent 70%)',
        transform: 'translate(-50%,-50%)',
        transition: 'opacity .3s',
      }}/>
      {/* Trail */}
      <div ref={trailRef} style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 10002,
        width: '28px', height: '28px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(204,17,17,0.7) 0%, transparent 70%)',
        transform: 'translate(-50%,-50%)',
        filter: 'blur(6px)',
        transition: 'opacity .25s',
      }}/>
      {/* Orb */}
      <div ref={orbRef} style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 100000,
        width: '18px', height: '18px', borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, #fff 0%, #CC1111 40%, #880000 100%)',
        boxShadow: '0 0 10px rgba(204,17,17,.9), 0 0 24px rgba(204,17,17,.5), 0 0 50px rgba(136,0,0,.3)',
        transition: 'transform .08s cubic-bezier(.34,1.56,.64,1), opacity .2s',
      }}>
        <div style={{
          position: 'absolute', top: '20%', left: '22%',
          width: '5px', height: '5px', borderRadius: '50%',
          background: 'rgba(255,255,255,.9)',
          filter: 'blur(1px)',
        }}/>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────
   NotFoundPage
───────────────────────────────────────── */
function NotFoundPage({ onGoHome }) {
  return (
    <div style={{
      minHeight: '80vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '40px 24px',
    }}>
      <div style={{
        fontFamily: "'Orbitron',monospace",
        fontSize: 'clamp(5rem,18vw,10rem)',
        fontWeight: 900,
        background: 'linear-gradient(135deg,#CC1111 0%,#EE2222 50%,#FF4444 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text', lineHeight: 1, marginBottom: '16px',
      }}>404</div>
      <h2 style={{
        fontFamily: "'Orbitron',monospace",
        fontSize: 'clamp(1rem,3vw,1.5rem)',
        fontWeight: 700, color: 'var(--t1)', marginBottom: '12px',
      }}>Page Not Found</h2>
      <p style={{
        color: 'var(--t2)', fontSize: '1rem',
        maxWidth: '380px', lineHeight: 1.7, marginBottom: '32px',
      }}>
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <button className="btn btn-primary" onClick={onGoHome} style={{ cursor: 'pointer' }}>
        ← Go Home
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   App — root component
───────────────────────────────────────── */
export default function App() {
  const [cinDone,      setCinDone]      = useState(false);
  const [activeTab,    setActiveTab]    = useState('Home');
  const [mobile,       setMobile]       = useState(window.innerWidth <= 768);
  const [wipeOn,       setWipeOn]       = useState(false);
  const [wipePh,       setWipePh]       = useState('out');
  const [page,         setPage]         = useState(null);
  const [eventsData,   setEventsData]   = useState(fallbackEvents);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [bookmarksOpen,setBookmarksOpen]= useState(false);

  /* ── Theme: persisted to localStorage ── */
  const [theme, setTheme] = useState(
    () => localStorage.getItem('ns-theme') || 'dark'
  );
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ns-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }, []);

  /* ── Developer mode ── */
  const { isOpen: isTerminalOpen, closeTerminal } = useDeveloperMode();

  /* ── Portfolio deep-link ── */
  useEffect(() => {
    const match = window.location.pathname.match(/^\/p\/([a-zA-Z0-9_-]+)/);
    if (match) setPage({ type: 'portfolio', username: match[1] });
  }, []);

  /* ── Fetch events ── */
  useEffect(() => {
    let alive = true;
    const base = (import.meta?.env?.VITE_API_BASE || '').replace(/\/+$/, '');
    const url  = base ? `${base}/api/content/events` : '/api/content/events';
    fetch(url)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (alive && Array.isArray(data?.events) && data.events.length > 0)
          setEventsData(data.events);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  /* ── Back-to-top button ── */
  useEffect(() => {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    const onScroll = () => btn.classList.toggle('visible', window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Active tab by scroll ── */
  useEffect(() => {
    if (page) return;
    const nh = mobile ? MNH : DNH;
    const onScroll = () => {
      const sy = window.scrollY + nh + 30;
      for (let i = TABS.length - 1; i >= 0; i--) {
        const el = document.getElementById(`section-${TABS[i].toLowerCase()}`);
        if (el && el.offsetTop <= sy) { setActiveTab(TABS[i]); break; }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [mobile, page]);

  /* ── Responsive ── */
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth <= 768);
    window.addEventListener('resize', fn, { passive: true });
    return () => window.removeEventListener('resize', fn);
  }, []);

  /* ── Ctrl+K search shortcut ── */
  useEffect(() => {
    const fn = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(s => !s);
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  /* ── Scroll/intersection animations ── */
  useEffect(() => {
    if (!cinDone) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting || e.target.classList.contains('fired')) return;
        e.target.classList.add('fired');
        e.target.addEventListener('animationend', () => {
          e.target.style.opacity   = '1';
          e.target.style.transform = 'none';
        }, { once: true });
        obs.unobserve(e.target);
      });
    }, { threshold: 0.09, rootMargin: '0px 0px -36px 0px' });

    document.querySelectorAll(
      '.pop-in,.pop-left,.pop-right,.pop-scale,.pop-flip,.pop-word,.pop-num'
    ).forEach(el => obs.observe(el));

    const onMove = e => {
      /* magnetic buttons */
      document.querySelectorAll('.mag-btn').forEach(btn => {
        const rect = btn.getBoundingClientRect();
        const dx   = e.clientX - (rect.left + rect.width  / 2);
        const dy   = e.clientY - (rect.top  + rect.height / 2);
        const d    = Math.sqrt(dx * dx + dy * dy);
        btn.style.transform = d < 88
          ? `translate(${dx * (88 - d) / 88 * 0.32}px,${dy * (88 - d) / 88 * 0.32}px)`
          : '';
      });

      /* tilt cards */
      document.querySelectorAll('.activity-card').forEach(card => {
        const rect    = card.getBoundingClientRect();
        const cx      = rect.left + rect.width  / 2;
        const cy      = rect.top  + rect.height / 2;
        const dx      = e.clientX - cx;
        const dy      = e.clientY - cy;
        const dist    = Math.sqrt(dx * dx + dy * dy);
        const maxDist = Math.max(rect.width, rect.height) * 0.9;
        const intensity = dist < maxDist ? (1 - dist / maxDist) * 6 : 0;
        card.style.setProperty('--rx',  intensity ? (dx / rect.width  * intensity).toFixed(2) : '0');
        card.style.setProperty('--ry', intensity ? (-dy / rect.height * intensity).toFixed(2) : '0');
      });
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => { obs.disconnect(); window.removeEventListener('mousemove', onMove); };
  }, [cinDone, page]);

  useNsReveal([cinDone, page]);
  useHeroParallax();
  useNavScrollTint();
  useGlobalMouseParallax();
  useMagneticCards();

  /* ── Navigation helper ── */
  const nav = useCallback(fn => {
    setWipeOn(true);
    setWipePh('out');
    setTimeout(() => {
      fn();
      window.scrollTo({ top: 0 });
      requestAnimationFrame(() => {
        setWipePh('in');
        setTimeout(() => setWipeOn(false), 340);
      });
    }, 275);
  }, []);

  /* ── Tab handler ── */
  const onTab = useCallback(tab => {
    if (SECTION_TABS.includes(tab)) {
      nav(() => { setPage({ type: 'section', section: tab }); setActiveTab(tab); });
      return;
    }
    nav(() => {
      setPage(null);
      setActiveTab(tab);
      setTimeout(() => {
        const el = document.getElementById(`section-${tab.toLowerCase()}`);
        if (!el) return;
        window.scrollTo({ top: el.offsetTop - (mobile ? MNH : DNH), behavior: 'smooth' });
      }, 50);
    });
  }, [nav, mobile]);

  /* ── Navigation callbacks ── */
  const onNavigate = useCallback((type, title) => {
    if (type === 'activity') nav(() => setPage({ type: 'activity', activityKey: title }));
  }, [nav]);

  const onEvent = useCallback(ev => {
    nav(() => setPage(p => ({ ...p, type: 'event', event: ev })));
  }, [nav]);

  const onKSSClick = useCallback(ev => {
    nav(() => setPage({ type: 'event', activityKey: 'Insight Session', event: ev }));
  }, [nav]);

  const onBackAct = useCallback(() => {
    nav(() => setPage(p => ({ type: 'activity', activityKey: p.activityKey })));
  }, [nav]);

  const onBackMain = useCallback(() => {
    nav(() => {
      setPage(null);
      setTimeout(() => {
        const el = document.getElementById('section-activities');
        if (!el) return;
        window.scrollTo({ top: el.offsetTop - (mobile ? MNH : DNH), behavior: 'smooth' });
      }, 50);
    });
  }, [nav, mobile]);

  const onBackHome = useCallback(() => {
    window.history.pushState({}, '', '/');
    nav(() => { setPage(null); setActiveTab('Home'); window.scrollTo({ top: 0 }); });
  }, [nav]);

  const openApply = useCallback(() => nav(() => setPage({ type: 'apply' })), [nav]);
  const openJoin  = useCallback(() => nav(() => setPage({ type: 'join'  })), [nav]);

  /* ── Derived ── */
  const nh  = mobile ? MNH : DNH;
  const cur = page?.activityKey ? activityPages[page.activityKey] : null;

  return (
    <BookmarkProvider>
      <Chatbot/>

      {!cinDone && (
        <CinematicOpening theme={theme} onDone={() => setCinDone(true)}/>
      )}

      {cinDone && <ScrollProgress/>}
      <Cursor/>
      <Wipe on={wipeOn} ph={wipePh}/>

      {cinDone && <AmbientOrbs theme={theme}/>}
      {cinDone && <GeometricGridBackground theme={theme}/>}
      {cinDone && <ParticleBackground theme={theme}/>}

      {cinDone && (
        <Navbar
          activeTab={activeTab}
          onTabChange={onTab}
          onToggleTheme={toggleTheme}
          theme={theme}
          onApply={openApply}
          onJoin={openJoin}
          onToggleBookmarks={() => setBookmarksOpen(prev => !prev)}
        />
      )}

      <main style={{ paddingTop: nh, position: 'relative', zIndex: 1 }}>
        {page ? (
          <PageIn k={page.type + (page.section || page.activityKey || '')}>

            {/* ── Section pages ── */}
            {page.section === 'Activities' && <ActivitiesPage onNavigate={onNavigate} onBack={onBackHome}/>}
            {page.section === 'Events'     && <EventsPage onBack={onBackHome} onEventClick={onKSSClick} events={eventsData}/>}
            {page.section === 'Projects'   && <ProjectsPage onBack={onBackHome}/>}
            {page.section === 'Roadmaps'   && <RoadmapsPage onBack={onBackHome}/>}
            {page.section === 'Portfolio'  && <PortfolioBuilder/>}
            {page.section === 'About'      && <AboutPage onBack={onBackHome}/>}
            {page.section === 'Team'       && <TeamPage onBack={onBackHome} onApply={openApply}/>}
            {page.section === 'Contact'    && <ContactPage onBack={onBackHome}/>}

            {/* ── Detail / action pages ── */}
            {page.type === 'activity' && cur && (
              <ActivityDetailPage activity={cur} onBack={onBackMain} onSelectEvent={onEvent}/>
            )}
            {page.type === 'apply' && <RecruitmentPage onBack={onBackHome}/>}
            {page.type === 'join'  && <MembershipPage  onBack={onBackHome}/>}
            {page.type === 'admin' && <AdminPage        onBack={onBackHome}/>}
            {page.type === 'event' && page.event && (
              <EventDetailPage
                event={page.event}
                onBack={page.activityKey ? onBackAct : onBackMain}
              />
            )}
            {page.type === 'portfolio' && (
              <PublicPortfolio username={page.username} onBack={onBackHome}/>
            )}

            {/* ── 404 fallback ── */}
            {page.type && !VALID_PAGE_TYPES.includes(page.type) && (
              <NotFoundPage onGoHome={onBackHome}/>
            )}

          </PageIn>
        ) : (
          cinDone && (
            <PageIn k="main">
              <HeroSection onTabChange={onTab} onApply={openApply} onJoin={openJoin} theme={theme}/>
              <SectionDivider/>
              <ActivitiesSection onNavigate={onNavigate}/>
              <SectionDivider/>
              <EventsSection onEventClick={onKSSClick} events={eventsData}/>
              <SectionDivider/>
              <AboutSection/>
              <SectionDivider/>
              <TeamSection onApply={openApply}/>
              <Footer
                onAdmin={() => nav(() => setPage({ type: 'admin' }))}
                onProjects={() => onTab('Projects')}
                onRoadmaps={() => onTab('Roadmaps')}
              />
            </PageIn>
          )
        )}
      </main>

      {cinDone && <button id="back-to-top" aria-label="Back to top">↑</button>}

      {/* ── Floating search button ── */}
      {cinDone && (
        <button
          onClick={() => setSearchOpen(true)}
          aria-label="Open search"
          title="Search (Ctrl+K)"
          style={{
            position: 'fixed', bottom: '80px', left: '24px', zIndex: 8500,
            width: '46px', height: '46px', borderRadius: '50%',
            background: 'linear-gradient(135deg,#CC1111,#880000)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(204,17,17,0.5)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.12)';
            e.currentTarget.style.boxShadow = '0 6px 28px rgba(204,17,17,0.75)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(204,17,17,0.5)';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
      )}

      {/* ── Search overlay ── */}
      <SearchBar
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        activities={activityPages}
        events={eventsData}
        onNavigate={onNavigate}
        onEventClick={onKSSClick}
      />

      {/* ── Developer terminal ── */}
      <Terminal
        isOpen={isTerminalOpen}
        onClose={closeTerminal}
        theme={theme}
        setTheme={setTheme}
        onNavigate={onTab}
      />

      {/* ── Bookmarks drawer ── */}
      <BookmarksDrawer
        isOpen={bookmarksOpen}
        onClose={() => setBookmarksOpen(false)}
        onNavigate={type => {
          if (type === 'Event')    onTab('Events');
          else if (type === 'Activity') onTab('Activities');
          else if (type === 'Roadmap')  onTab('Roadmaps');
        }}
      />
    </BookmarkProvider>
  );
}