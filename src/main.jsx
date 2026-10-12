import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import ConversationPage from './pages/ConversationPage';
import AdminInboxPage from './pages/AdminInboxPage';
import { ArrowRight, Code2, Smartphone, Palette, Cloud, Settings, Zap, Menu, X, ExternalLink, Github, Linkedin, Twitter, Play, ShoppingBag, Dumbbell, Star, Sparkles } from 'lucide-react';
import './styles.css';
import Builder from './Builder';

const projects = [
  {
    name: 'Cachi Shop',
    type: 'E-commerce · Web Development',
    description: 'A modern storefront experience for discovering and shopping phone cases.',
    url: 'https://cachi-shop.vercel.app/',
    tag: 'E-COMMERCE',
    visual: 'shop',
    icon: ShoppingBag,
    action: 'Visit store'
  },
  {
    name: 'GymUp',
    type: 'SaaS · Web Application',
    description: 'A focused gym management dashboard for memberships, renewals, staff, and earnings.',
    url: 'https://www.gymup.fit/',
    tag: 'SAAS PLATFORM',
    visual: 'gym',
    icon: Dumbbell,
    action: 'Explore GymUp'
  },
  {
    name: 'Taqyeem',
    type: 'Mobile App · Business Discovery',
    description: 'A Tunisia-focused platform to discover businesses and share ratings and reviews.',
    url: 'https://www.taqyeem.tn/',
    appUrl: 'https://play.google.com/store/apps/details?id=com.dorria.Taqyeem',
    tag: 'MOBILE + WEB',
    visual: 'taqyeem',
    icon: Star,
    action: 'Visit platform',
    secondary: 'Get Android app'
  },
  {
    name: 'Zorble',
    type: 'Web Project · Digital Experience',
    description: 'A live web project built to bring a distinctive digital idea to life.',
    url: 'https://zorble.vercel.app/',
    tag: 'WEB EXPERIENCE',
    visual: 'zorble',
    icon: Sparkles,
    action: 'Explore Zorble'
  }
];

const services = [
  { icon: Code2, title: 'Web Development', text: 'Responsive, fast, and SEO-friendly websites designed to turn visitors into customers.' },
  { icon: Smartphone, title: 'Mobile App Development', text: 'Purpose-built mobile experiences for iOS and Android, made to scale.' },
  { icon: Palette, title: 'UI/UX Design', text: 'Clear, modern interfaces that make every interaction feel effortless.' },
  { icon: Cloud, title: 'Cloud Solutions', text: 'Reliable infrastructure and integrations that keep your product moving.' },
  { icon: Settings, title: 'Maintenance & Support', text: 'Updates, improvements, and ongoing support to keep your product healthy.' },
  { icon: Zap, title: 'Custom Software', text: 'Practical software shaped around your workflow, goals, and business needs.' }
];

const steps = [
  ['01', 'Discover', 'We learn about your goals and understand the problem worth solving.'],
  ['02', 'Design', 'We shape the experience with clear flows and purposeful visuals.'],
  ['03', 'Develop', 'We build your product with clean, scalable, reliable code.'],
  ['04', 'Launch', 'We deploy, test, and support your product as it grows.']
];

function Logo({ footer = false }) {
  const navigate = useNavigate();
  const [clickCount, setClickCount] = React.useState(0);
  const resetTimer = React.useRef(null);

  function handleLogoClick(event) {
    event.preventDefault();
    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (resetTimer.current) clearTimeout(resetTimer.current);

    if (nextCount >= 5) {
      setClickCount(0);
      navigate('/dev-inbox');
      return;
    }

    resetTimer.current = setTimeout(() => setClickCount(0), 1800);
  }

  React.useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  return <a
    className={`brand ${footer ? 'brand-footer' : ''}`}
    href="/"
    onClick={handleLogoClick}
    aria-label="Vyntrix home"
  >
    <span className="brand-mark"><span /></span><span>VYNTRIX</span>
  </a>;
}

function ProjectVisual({ project }) {
  return <div className={`project-visual visual-${project.visual}`}>
    {project.visual === 'shop' && <div className="mock-store">
      <div className="mock-top"><span className="mock-dot" /><span className="mock-word">cachi</span><span className="mock-line" /></div>
      <div className="store-title">Find your<br/><b>next favorite case.</b></div>
      <div className="case-row"><span className="case case-one" /><span className="case case-two" /><span className="case case-three" /></div>
      <div className="mock-pill">SHOP COLLECTION <ArrowRight size={10}/></div>
    </div>}
    {project.visual === 'gym' && <div className="mock-dashboard">
      <div className="dash-side"><span className="dash-logo">G.</span><i/><i/><i/><i/></div>
      <div className="dash-main"><small>OVERVIEW / THIS MONTH</small><b>Gym dashboard</b><div className="dash-stats"><span><small>Members</small><strong>248</strong></span><span><small>Revenue</small><strong>8.4k</strong></span></div><div className="chart"><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></div>
    </div>}
    {project.visual === 'taqyeem' && <div className="phone-mock">
      <div className="phone-notch" /><div className="phone-brand"><span>✦</span> taqyeem</div><div className="phone-heading">Find places<br/>worth knowing.</div><div className="phone-search">⌕ &nbsp; Search businesses</div><div className="place-card"><span className="place-img" /><span><b>Local favorite</b><small>★★★★★ &nbsp; 4.8</small></span></div><div className="place-card"><span className="place-img second" /><span><b>Top rated nearby</b><small>★★★★☆ &nbsp; 4.6</small></span></div></div>}
    {project.visual === 'zorble' && <div className="zorble-art"><div className="zorble-orbit orbit-a"/><div className="zorble-orbit orbit-b"/><div className="zorble-core">z<span>.</span></div><small>IDEAS IN MOTION</small></div>}
    <span className="visual-label">{project.tag}</span>
  </div>;
}
function ProjectThumb({ project }) {
  const wrapRef = React.useRef(null);
  const [scale, setScale] = React.useState(0.3);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / 1280);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="project-thumb" ref={wrapRef}>
      <ProjectVisual project={project} />
      <iframe
        src={project.url}
        title={`${project.name} homepage preview`}
        loading="lazy"
        tabIndex={-1}
        aria-hidden="true"
        className={loaded ? 'loaded' : ''}
        style={{ transform: `scale(${scale})` }}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

function ProjectCard({ project, index }) {
  const Icon = project.icon;
  return <article className={`project-card project-${project.visual}`}>
    <a className="project-image-link" href={project.url} target="_blank" rel="noreferrer" aria-label={`Open ${project.name}`}>
      <ProjectThumb project={project}/>
      <span className="project-open"><ExternalLink size={16}/></span>
    </a>
    <div className="project-meta"><span>{String(index + 1).padStart(2, '0')} / SELECTED WORK</span><Icon size={16}/></div>
    <div className="project-title-row"><h3>{project.name}</h3><a href={project.url} target="_blank" rel="noreferrer" aria-label={`Visit ${project.name}`}><ArrowRight size={19}/></a></div>
    <p className="project-type">{project.type}</p>
    <p className="project-description">{project.description}</p>
    <div className="project-links"><a href={project.url} target="_blank" rel="noreferrer">{project.action} <ArrowRight size={14}/></a>{project.appUrl && <a href={project.appUrl} target="_blank" rel="noreferrer">Android app <ExternalLink size={13}/></a>}</div>
  </article>;
}

function HomePage() {
  const [menuOpen, setMenuOpen] = React.useState(false);
const [builderOpen, setBuilderOpen] = React.useState(false);
const closeMenu = () => setMenuOpen(false);

if (builderOpen) {
  return <Builder onBack={() => setBuilderOpen(false)} />;
}
  return <div className="site-shell">
    <header className="header">
      <div className="container nav-wrap">
        <Logo />
        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X/> : <Menu/>}</button>
        <nav className={menuOpen ? 'nav nav-open' : 'nav'}>
          <a href="#home" onClick={closeMenu}>Home</a>
<a href="#services" onClick={closeMenu}>Services</a>
<a href="#work" onClick={closeMenu}>Portfolio</a>
<a href="#about" onClick={closeMenu}>About</a>
<a href="#contact" onClick={closeMenu}>Contact</a>
<button
  type="button"
  className="nav-builder-link"
  onClick={() => {
    setBuilderOpen(true);
    closeMenu();
  }}
>
  <Sparkles size={14} /> AI Builder
</button>
        </nav>
        <a className="button button-outline nav-cta" href="/conversation">Let’s Talk <ArrowRight size={16}/></a>
      </div>
    </header>

    <main>
      <section className="hero" id="home">
        <div className="hero-glow glow-one"/><div className="hero-glow glow-two"/>
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line"/> IDEAS <span>→</span> WEBSITES <span>→</span> APPS <span>→</span> REAL SOLUTIONS</div>
            <h1>We Build<br/>Digital Experiences<br/><span>That Matter.</span></h1>
            <p className="hero-description">Vyntrix is a modern web and mobile app development studio. We turn your ideas into fast, secure, and beautiful digital products.</p>
            <div className="hero-actions"><a className="button button-primary" href="/conversation">Start Your Project <ArrowRight size={17}/></a><a className="text-link" href="#work">Explore Our Work <ArrowRight size={16}/></a></div>
            <div className="hero-proof"><div className="avatar-stack"><span>V</span><span>C</span><span>G</span></div><div><strong>Built with care. Made to matter.</strong><small>From first idea to final launch.</small></div></div>
          </div>
          <div className="hero-art" aria-label="Abstract Vyntrix digital product illustration">
            <div className="art-grid"/>
            <div className="floating-chip chip-top"><span className="chip-dot"/> PRODUCT DESIGN <ArrowRight size={13}/></div>
            <div className="hero-orb"><div className="orb-ring ring-one"/><div className="orb-ring ring-two"/><div className="orb-core">V</div></div>
            <div className="glass-panel panel-back"><span className="panel-label">DIGITAL / 001</span><div className="panel-bars"><i/><i/><i/><i/><i/></div><span className="panel-caption">Ideas become impact.</span></div>
            <div className="glass-panel panel-front"><div className="panel-window"><span/><span/><span/></div><small>VYNTRIX STUDIO</small><h3>Build something<br/><em>extraordinary.</em></h3><div className="panel-progress"><i/></div><div className="panel-bottom"><span>DESIGN</span><span>DEVELOP</span><span>DEPLOY</span></div></div>
            <div className="floating-chip chip-bottom"><Code2 size={15}/> Clean code, bold ideas <span className="chip-live">●</span></div>
            <div className="art-spark spark-one">✳</div><div className="art-spark spark-two">✦</div>
          </div>
        </div>
        <div className="container hero-bottom"><span>INDEPENDENT DIGITAL STUDIO</span><div/><span>WEB · MOBILE · PRODUCT</span><div/><span>BUILT FOR WHAT’S NEXT</span></div>
      </section>

      <section className="services section" id="services">
        <div className="container services-layout">
          <div className="section-intro"><span className="kicker">OUR SERVICES / 01</span><h2>Everything You Need<br/>for Your <span>Digital Growth.</span></h2><p>From modern websites to powerful mobile apps, we deliver thoughtful digital solutions built around your business goals.</p><a className="button button-outline" href="/conversation">Let’s Build Together <ArrowRight size={15}/></a></div>
          <div className="service-grid">{services.map((service, i) => { const Icon = service.icon; return <article className="service-card" key={service.title}><div className="service-card-top"><span className="service-icon"><Icon size={23}/></span><span className="service-number">0{i+1}</span></div><h3>{service.title}</h3><p>{service.text}</p><span className="service-arrow"><ArrowRight size={16}/></span></article>; })}</div>
        </div>
      </section>

      <section className="about section" id="about">
        <div className="container about-grid">
          <div className="about-emblem"><div className="emblem-halo"/><div className="emblem-v">V</div><span className="emblem-caption">THINK / MAKE / MOVE</span></div>
          <div className="about-copy"><span className="kicker">ABOUT VYNTRIX / 02</span><h2>More Than Code.<br/><span>We Build Partnerships.</span></h2><p>We believe the best digital products start with listening. Vyntrix combines thoughtful design, solid engineering, and a practical mindset to turn ambitious ideas into useful experiences.</p><p className="about-small">No unnecessary complexity. No one-size-fits-all solutions. Just purposeful work, built together.</p><a className="text-link" href="#contact">Get to know us <ArrowRight size={16}/></a></div>
          <div className="stats"><div><strong>04<span>+</span></strong><small>Live projects</small></div><div><strong>06</strong><small>Core services</small></div><div><strong>100<span>%</span></strong><small>Commitment</small></div></div>
        </div>
      </section>

      <section className="process section">
        <div className="container process-layout"><div className="section-intro"><span className="kicker">OUR PROCESS / 03</span><h2>From Idea to <span>Impact.</span></h2><p>A clear, collaborative process that keeps your project moving from the first conversation to launch day.</p></div><div className="process-steps">{steps.map(([num, title, text]) => <article className="process-step" key={num}><span className="step-number">{num}</span><div className="step-line"/><h3>{title}</h3><p>{text}</p></article>)}</div></div>
      </section>

      <section className="work section" id="work">
        <div className="container">
          <div className="work-heading"><div><span className="kicker">FEATURED WORK / 04</span><h2>Our Latest <span>Projects.</span></h2><p>A selection of digital products and experiences we’ve brought to life.</p></div><a className="button button-outline" href="/conversation">Have a project in mind? <ArrowRight size={15}/></a></div>
          <div className="project-grid">{projects.map((project, index) => <ProjectCard project={project} index={index} key={project.name}/>)}</div>
        </div>
      </section>

      <section className="contact section" id="contact"><div className="container contact-panel"><div className="contact-glow"/><div><span className="kicker">HAVE AN IDEA? / 05</span><h2>Let’s make something<br/><span>meaningful.</span></h2><p>Tell us what you’re imagining. We’ll help you turn it into a plan—and a product.</p></div><a className="button button-primary" href="/conversation">Start a Conversation <ArrowRight size={17}/></a></div></section>
    </main>

    <footer className="footer" id="footer"><div className="container"><div className="footer-main"><div className="footer-brand"><Logo footer/><p>Your vision. Our code.</p><span>Independent by nature. Digital by design.</span></div><div className="footer-links"><div><small>EXPLORE</small><a href="#services">Services</a><a href="#work">Portfolio</a><a href="#about">About</a></div><div><small>LET’S CONNECT</small><a href="/conversation">Start a project</a><a href="mailto:hello@vyntrix.dev">Email us</a><a href="https://github.com/" target="_blank" rel="noreferrer">GitHub <ExternalLink size={12}/></a></div></div><div className="footer-social"><a href="https://www.linkedin.com/" aria-label="LinkedIn" target="_blank" rel="noreferrer"><Linkedin size={17}/></a><a href="https://github.com/" aria-label="GitHub" target="_blank" rel="noreferrer"><Github size={17}/></a><a href="https://twitter.com/" aria-label="Twitter" target="_blank" rel="noreferrer"><Twitter size={17}/></a></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Vyntrix Studio. All rights reserved.</span><span>WEB DEVELOPMENT <i/> MOBILE APPS <i/> DIGITAL SOLUTIONS</span><a href="#home">BACK TO TOP ↑</a></div></div></footer>
  </div>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/conversation" element={<ConversationPage />} />
        <Route path="/dev-inbox" element={<AdminInboxPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
