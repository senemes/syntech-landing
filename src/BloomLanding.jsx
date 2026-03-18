import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

/* ─── palette ─── */
const C = {
  bg: "#08080D",
  surface: "#0F0F16",
  card: "#141420",
  border: "rgba(255,255,255,0.06)",
  borderHover: "rgba(34,197,94,0.25)",
  accent: "#22C55E",
  accentSoft: "rgba(34,197,94,0.12)",
  accentGlow: "rgba(34,197,94,0.35)",
  lime: "#22C55E",
  white: "#EEEEF4",
  muted: "#7B7B92",
  faint: "#3C3C50",
};

/* ─── hooks ─── */
function useCountUp(end, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const ref = useRef(null);
  const start = useCallback(() => {
    if (started) return;
    setStarted(true);
    const t0 = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(eased * end);
      if (p < 1) requestAnimationFrame(tick);
      else setDone(true);
    };
    requestAnimationFrame(tick);
  }, [end, duration, started]);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) start(); }, { threshold: 0.3 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [start]);
  return { count, ref, done };
}

function useFadeIn(delay = 0) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.12 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return {
    ref,
    style: {
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(36px)",
      transition: `opacity 0.75s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.75s cubic-bezier(.22,1,.36,1) ${delay}ms`,
    },
  };
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return progress;
}

function useScrollRadius() {
  const [radius, setRadius] = useState(0);
  useEffect(() => {
    const update = () => setRadius(Math.min((window.scrollY / 200) * 32, 32));
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return radius;
}

/* ─── icons ─── */
const ArrowIcon = ({ color = C.bg, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function StarIcon({ delay = 0, triggered = false }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!triggered) return;
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [triggered, delay]);
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill={C.lime} style={{
      opacity: show ? 1 : 0,
      transform: show ? "scale(1)" : "scale(0.4)",
      transition: "opacity 0.3s cubic-bezier(.22,1,.36,1), transform 0.3s cubic-bezier(.22,1,.36,1)",
    }}>
      <path d="M7 0l1.76 4.82L14 5.27l-3.8 3.35L11.2 14 7 11.27 2.8 14l1-5.38L0 5.27l5.24-.45z"/>
    </svg>
  );
}

const LinkArrow = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
    <path d="M5 13L13 5M13 5H6M13 5v7" stroke={C.bg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const BloomLogo = () => (
  <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="3" fill={C.accent}/>
    <g opacity="0.7">{[0,45,90,135,180,225,270,315].map((a,i) => (
      <ellipse key={i} cx="14" cy="7" rx="2.2" ry="5" fill={C.accent} transform={`rotate(${a} 14 14)`}/>
    ))}</g>
  </svg>
);

/* ─── hamburger ─── */
function HamburgerBtn({ open, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`nav-hamburger${open ? " open" : ""}`}
      aria-label={open ? "Close menu" : "Open menu"}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <span className="ham-line ham-line-1"/>
      <span className="ham-line ham-line-2"/>
      <span className="ham-line ham-line-3"/>
    </button>
  );
}

const NAV_ITEMS = [["Home","home"],["Services","services"],["Figures","figures"],["Products","products"],["Partners","partners"],["Contact","contact"],["Provider","#"]];

function HamburgerMenu({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return createPortal(
    <>
      <div className={`ham-overlay${open ? " open" : ""}`} onClick={onClose}/>
      <nav className={`ham-drawer${open ? " open" : ""}`}>
        <div className="ham-drawer-header">
          <img src="/logo.avif" alt="SynTech Trust" style={{ height: 32, width: "auto" }}/>
          <HamburgerBtn open={true} onClick={onClose}/>
        </div>
        <div className="ham-nav-links">
          {NAV_ITEMS.map(([label, id]) => (
            <a
              key={id}
              href={id === "#" ? "#" : `#${id}`}
              className="ham-nav-link"
              onClick={onClose}
            >{label}</a>
          ))}
        </div>
      </nav>
    </>,
    document.body
  );
}

/* ─── background ─── */
function DarkBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden", background: C.bg }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.035 }}>
        <defs><pattern id="g" width="64" height="64" patternUnits="userSpaceOnUse">
          <path d="M 64 0 L 0 0 0 64" fill="none" stroke="white" strokeWidth="0.5"/>
        </pattern></defs>
        <rect width="100%" height="100%" fill="url(#g)"/>
      </svg>
      <div style={{
        position: "absolute", top: "15%", left: "20%", width: 500, height: 500,
        background: "radial-gradient(circle, rgba(34,197,94,0.06), transparent 65%)",
        borderRadius: "50%", filter: "blur(80px)",
        animation: "orbDrift 20s ease-in-out infinite alternate",
      }}/>
      <div style={{
        position: "absolute", top: "55%", right: "10%", width: 400, height: 400,
        background: "radial-gradient(circle, rgba(20,100,50,0.05), transparent 65%)",
        borderRadius: "50%", filter: "blur(80px)",
        animation: "orbDrift 25s ease-in-out infinite alternate-reverse",
      }}/>
      <div style={{
        position: "absolute", inset: 0,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.006) 2px, rgba(255,255,255,0.006) 4px)",
      }}/>
    </div>
  );
}

/* ─── card ─── */
function Card({ children, style = {}, id, className = "" }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      id={id}
      className={className}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "rgba(20,20,32,0.7)",
        backdropFilter: "blur(16px)",
        borderRadius: 20,
        border: `1px solid ${C.border}`,
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hov ? "0 16px 48px rgba(0,0,0,0.45)" : "0 0 0 rgba(0,0,0,0)",
        transition: "transform 250ms ease, box-shadow 250ms ease",
        ...style,
      }}>{children}</div>
  );
}

/* ─── button ─── */
function Btn({ children, variant = "accent", onClick, style: s = {}, pulse = false }) {
  const [hov, setHov] = useState(false);
  const isAcc = variant === "accent";
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        padding: "13px 26px", borderRadius: 8, cursor: "pointer",
        fontSize: 14, fontFamily: "'Outfit', sans-serif", fontWeight: 600,
        background: isAcc ? C.lime : "transparent",
        color: isAcc ? C.bg : C.white,
        border: isAcc ? "none" : `1px solid ${C.faint}`,
        boxShadow: hov && isAcc ? `0 0 28px rgba(34,197,94,0.35)` : "none",
        transform: hov ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.3s ease",
        letterSpacing: 0.3,
        animation: pulse ? "btnPulse 2.5s ease-in-out infinite" : "none",
        ...s,
      }}
    >
      <span style={{
        width: 26, height: 26, borderRadius: "50%",
        background: isAcc ? "rgba(0,0,0,0.15)" : C.accentSoft,
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: hov ? "rotate(90deg)" : "rotate(0deg)",
        transition: "transform 0.3s ease",
      }}>
        <ArrowIcon color={isAcc ? C.bg : C.accent} size={12}/>
      </span>
      {children}
    </button>
  );
}

/* ─── NAV ─── */
function Nav({ show, onMenuOpen }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav className="nav-bar" style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 40px",
      background: scrolled ? "rgba(8,8,13,0.85)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
      opacity: show ? 1 : 0,
      transform: show ? "translateY(0)" : "translateY(-30px)",
      transition: "opacity 500ms ease-out, transform 500ms ease-out, background 0.4s ease, border-color 0.4s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <img src="/logo.avif" alt="SynTech Trust" style={{ height: 36, width: "auto" }}/>
      </div>
      <div className="nav-tags" style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {["Bitcoin Mining", "ASIC Hardware"].map(tag => (
          <span key={tag} style={{
            padding: "5px 14px", borderRadius: 50, fontSize: 12,
            background: C.accentSoft, color: C.muted,
            border: `1px solid rgba(34,197,94,0.15)`,
            fontFamily: "'Outfit', sans-serif", fontWeight: 500,
          }}>{tag}</span>
        ))}
      </div>
      <HamburgerBtn open={false} onClick={onMenuOpen}/>
    </nav>
  );
}

/* ─── HERO ─── */
function HeroSection({ borderRadius, onMenuOpen }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 250),
      setTimeout(() => setPhase(3), 500),
      setTimeout(() => setPhase(4), 700),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const slide = (p, extra = {}) => ({
    display: "block",
    opacity: phase >= p ? 1 : 0,
    transform: phase >= p ? "translateY(0)" : "translateY(60px)",
    transition: "opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1)",
    ...extra,
  });

  return (
    <Card id="home" className="hero-card" style={{ overflow: "hidden", position: "relative", minHeight: 580, borderRadius, transition: "border-radius 0.3s ease" }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `
            radial-gradient(ellipse 600px 400px at 50% 70%, rgba(34,197,94,0.12), transparent),
            radial-gradient(ellipse 400px 300px at 30% 50%, rgba(20,120,60,0.08), transparent),
            radial-gradient(ellipse 300px 200px at 70% 30%, rgba(30,160,80,0.06), transparent)
          `,
          animation: "kenBurns 20s ease-in-out infinite alternate",
        }}/>
        <svg style={{ position: "absolute", bottom: 0, left: 0, right: 0, width: "100%", height: "55%" }} viewBox="0 0 1200 400" preserveAspectRatio="none">
          <defs>
            <linearGradient id="h1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.accent} stopOpacity="0.08"/>
              <stop offset="100%" stopColor={C.accent} stopOpacity="0.02"/>
            </linearGradient>
            <linearGradient id="h2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#16A34A" stopOpacity="0.1"/>
              <stop offset="100%" stopColor="#15803D" stopOpacity="0.03"/>
            </linearGradient>
          </defs>
          <path d="M0,220 Q150,140 300,190 Q500,100 700,170 Q900,80 1200,150 L1200,400 L0,400Z" fill="url(#h1)"/>
          <path d="M0,290 Q200,210 400,270 Q600,190 800,250 Q1000,170 1200,230 L1200,400 L0,400Z" fill="url(#h2)"/>
          <path d="M560,400 Q575,340 610,290 Q640,250 670,230" fill="none" stroke="rgba(34,197,94,0.15)" strokeWidth="4" strokeLinecap="round"/>
          <path d="M560,400 Q575,340 610,290 Q640,250 670,230" fill="none" stroke="rgba(34,197,94,0.4)" strokeWidth="1" strokeLinecap="round"/>
        </svg>
      </div>

      <div className="hero-nav" style={{
        position: "relative", zIndex: 2, display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "22px 36px",
      }}>
        <img src="/logo.avif" alt="SynTech Trust" style={{ height: 32, width: "auto" }}/>
        <div className="hero-nav-links" style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {[["Home","home"],["Services","services"],["Figures","figures"],["Products","products"],["Partners","partners"],["Contact","contact"]].map(([label, id]) => (
            <a key={id} href={`#${id}`} className="nav-link" style={{
              color: C.muted, textDecoration: "none", fontSize: 13,
              fontFamily: "'Outfit', sans-serif", fontWeight: 400, position: "relative",
            }}>
              {label}
            </a>
          ))}
          <a href="#" className="nav-link" style={{
            color: C.muted, fontSize: 13,
            fontFamily: "'Outfit', sans-serif", fontWeight: 400, position: "relative",
          }}>Provider</a>
        </div>
        <HamburgerBtn open={false} onClick={onMenuOpen}/>
      </div>

      <div className="hero-content" style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "50px 40px 100px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "5px 16px", borderRadius: 50, background: C.accentSoft,
          border: `1px solid rgba(34,197,94,0.2)`, marginBottom: 28,
          opacity: phase >= 1 ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, boxShadow: `0 0 8px ${C.accent}` }}/>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: C.accent, fontWeight: 500 }}>
            Bitcoin Mining Services
          </span>
        </div>

        <h1 className="hero-h1" style={{ fontFamily: "'Syne', sans-serif", fontSize: 68, fontWeight: 800, color: C.white, lineHeight: 1.06, margin: 0, letterSpacing: -3, overflow: "hidden" }}>
          <span style={slide(1)}>Your Trusted Path</span>
          <span style={slide(2, { color: C.accent, transitionDelay: "150ms" })}>to Mining</span>
        </h1>

        <p className="hero-p" style={{
          fontFamily: "'Outfit', sans-serif", fontSize: 17, color: C.muted,
          maxWidth: 480, margin: "26px auto 36px", lineHeight: 1.7,
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1)",
        }}>
          Fully managed Bitcoin mining — Smart. Stable. Profitable.
        </p>

        <div className="hero-cta-wrap" style={{
          opacity: phase >= 4 ? 1 : 0,
          transform: phase >= 4 ? "scale(1)" : "scale(0.85)",
          transition: "opacity 0.5s cubic-bezier(.22,1,.36,1), transform 0.5s cubic-bezier(.22,1,.36,1)",
        }}>
          <Btn>Start Now</Btn>
        </div>
      </div>
    </Card>
  );
}

/* ─── STAT CARD ─── */
function StatCard({ end, suffix, label, sub, index }) {
  const { count, ref, done } = useCountUp(end, 2200);
  const [visible, setVisible] = useState(false);
  const [underline, setUnderline] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVisible(true);
        setTimeout(() => setUnderline(true), 700);
      }
    }, { threshold: 0.3 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);

  const display = end % 1 !== 0 ? count.toFixed(1) : Math.round(count).toLocaleString();

  return (
    <div ref={ref} className="stat-card" style={{
      background: C.surface, borderRadius: 14, padding: "28px 20px",
      border: `1px solid ${C.border}`, position: "relative", overflow: "hidden",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(30px)",
      transition: `opacity 0.7s cubic-bezier(.22,1,.36,1) ${index * 120}ms, transform 0.7s cubic-bezier(.22,1,.36,1) ${index * 120}ms`,
    }}>
      <div style={{
        position: "absolute", top: 0, left: "20%", right: "20%", height: 2,
        background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`, borderRadius: 1,
      }}/>
      <div style={{ position: "relative", display: "inline-block" }}>
        <div className="stat-number" style={{ fontFamily: "'Syne', sans-serif", fontSize: 38, fontWeight: 800, color: C.white, lineHeight: 1, letterSpacing: -1, whiteSpace: "nowrap" }}>
          {display}{suffix}
        </div>
        <div style={{
          position: "absolute", bottom: -4, left: 0, height: 2,
          background: C.accent, borderRadius: 1,
          width: underline ? "100%" : "0%",
          transition: "width 0.6s cubic-bezier(.22,1,.36,1)",
        }}/>
      </div>
      <div className="stat-label" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: C.white, marginTop: 18 }}>{label}</div>
      <div className="stat-sub" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>{sub}</div>
    </div>
  );
}

/* ─── ABOUT ─── */
function AboutSection() {
  const fade = useFadeIn(0);
  return (
    <Card id="figures" className="section-card" style={{ padding: "56px 52px" }}>
      <div ref={fade.ref} className="section-header" style={{ ...fade.style, display: "flex", gap: 40, marginBottom: 56 }}>
        <div className="section-label" style={{ minWidth: 160 }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, color: C.accent, letterSpacing: 3, textTransform: "uppercase" }}>Figures</span>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: C.faint, marginTop: 4 }}>(01-08)</div>
        </div>
        <p className="section-title" style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, lineHeight: 1.3, color: C.white, margin: 0, fontWeight: 600, letterSpacing: -1 }}>
          What Makes Us Trusted
        </p>
      </div>
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 24 }}>
        <StatCard end={4} suffix="" label="Repair Sites" sub="Across U.S. with highly qualified repair technicians" index={0}/>
        <StatCard end={12000} suffix="+" label="Hashboard repairs" sub="Completed with verified performance recovery — helping your equipment run longer and stronger" index={1}/>
        <StatCard end={20} suffix="MW" label="Under supervision" sub="Operating under our continuous supervision — reducing downtime and maximizing ROI" index={2}/>
        <StatCard end={1500} suffix="+" label="Used miners sold" sub="Including operational and non-functional devices for parts and repairs" index={3}/>
      </div>
    </Card>
  );
}

/* ─── SERVICES ─── */
function ServicesSection() {
  const [expanded, setExpanded] = useState(0);
  const fade = useFadeIn(0);
  const tagsRef = useRef(null);
  const [tagsVisible, setTagsVisible] = useState(false);

  useEffect(() => {
    if (!tagsRef.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setTagsVisible(true); }, { threshold: 0.15 });
    obs.observe(tagsRef.current);
    return () => obs.disconnect();
  }, []);

  const tags = ["ASIC Repair", "Hashboard Diagnostics", "Operations Management", "Equipment Sourcing", "On-site Staffing", "Miner Optimization", "Used ASICs", "Parts & Components"];
  const services = [
    { title: "ASIC Repair & Diagnostics", desc: "Expert repair services for all major ASIC models, on-site and off-site. We restore hashboard performance with verified recovery rates." },
    { title: "Operations Team", desc: "Professional on-site staffing for mining facilities. Our experienced teams handle day-to-day operations, maintenance, and performance monitoring." },
    { title: "Used Equipment Sales", desc: "Reliable sourcing of used ASICs — working and non-working. We supply both operational miners and units for parts and repairs." },
  ];

  return (
    <div id="services" ref={fade.ref} style={{
      ...fade.style,
      background: `linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(20,120,60,0.05) 100%)`,
      backdropFilter: "blur(16px)",
      borderRadius: 20, border: `1px solid ${C.borderHover}`, padding: "52px",
    }} className="services-section">
      <div className="section-header" style={{ display: "flex", gap: 40, marginBottom: 40 }}>
        <div className="section-label" style={{ minWidth: 180 }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, color: C.accent, letterSpacing: 3, textTransform: "uppercase" }}>Services</span>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: C.faint, marginTop: 4 }}>(02-08)</div>
          <div style={{ marginTop: 20 }}>
            <Btn style={{ fontSize: 13, padding: "10px 20px" }}>Get Quote</Btn>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <h3 className="section-title" style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 700, color: C.white, margin: 0, lineHeight: 1.25, letterSpacing: -1 }}>
            We provide professional on-site teams, high-quality ASIC repairs, and trusted sourcing of used equipment — both functional and for parts.
          </h3>
          <div ref={tagsRef} style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 24 }}>
            {tags.map((t, i) => (
              <span key={i} style={{
                padding: "7px 16px", borderRadius: 50,
                border: `1px solid rgba(34,197,94,0.2)`,
                color: C.muted, fontFamily: "'Outfit', sans-serif", fontSize: 12,
                background: "rgba(34,197,94,0.05)",
                opacity: tagsVisible ? 1 : 0,
                transform: tagsVisible ? "translateX(0)" : "translateX(-14px)",
                transition: `opacity 0.4s ease ${i * 40}ms, transform 0.4s ease ${i * 40}ms`,
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div>
        {services.map((s, i) => {
          const isOpen = expanded === i;
          return (
            <div key={i}
              onClick={() => setExpanded(isOpen ? -1 : i)}
              className="service-row"
              style={{
                borderTop: `1px solid rgba(34,197,94,0.1)`,
                padding: "22px 16px", cursor: "pointer",
                display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                borderRadius: 8, margin: "0 -16px",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div className="service-inner" style={{ flex: 1, display: "flex", alignItems: "flex-start", gap: 40 }}>
                <h4 className="service-title" style={{
                  fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 600,
                  color: isOpen ? C.accent : C.white, margin: 0, minWidth: 200,
                  transition: "color 0.3s",
                }}>{s.title}</h4>
                <div style={{
                  maxHeight: isOpen ? "200px" : "0px",
                  overflow: "hidden",
                  transition: "max-height 0.4s cubic-bezier(0.22,1,0.36,1)",
                }}>
                  <p style={{
                    fontFamily: "'Outfit', sans-serif", fontSize: 14, color: C.muted,
                    margin: 0, lineHeight: 1.65, maxWidth: 500,
                  }}>{s.desc}</p>
                </div>
              </div>
              <div className="service-toggle" style={{
                width: 36, height: 36, borderRadius: 8,
                background: isOpen ? C.lime : "rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                transition: "all 0.3s ease",
              }}>
                <LinkArrow/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── TESTIMONIALS ─── */
function TestimonialSection() {
  const containerRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <Card id="partners" className="section-card" style={{ padding: "52px" }}>
      <div ref={containerRef}>
        <div className="section-header" style={{
          display: "flex", gap: 40, marginBottom: 48,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}>
          <div className="section-label" style={{ minWidth: 160 }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, color: C.accent, letterSpacing: 3, textTransform: "uppercase" }}>Partners</span>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: C.faint, marginTop: 4 }}>(03-08)</div>
          </div>
          <p className="section-title" style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 600, color: C.white, margin: 0, lineHeight: 1.25, letterSpacing: -1 }}>
            What our partners say
          </p>
        </div>

        <div className="testimonial-block" style={{
          background: `linear-gradient(135deg, rgba(34,197,94,0.07), rgba(34,197,94,0.02))`,
          border: `1px solid ${C.borderHover}`,
          borderRadius: 20, padding: "52px 60px",
          animation: visible ? "slideInRight 0.8s cubic-bezier(.22,1,.36,1) 200ms both" : "none",
        }}>
          <div style={{ fontSize: 64, lineHeight: 1, color: C.accent, fontFamily: "'Syne', sans-serif", marginBottom: 24, opacity: 0.6 }}>"</div>
          <p className="testimonial-text" style={{
            fontFamily: "'Syne', sans-serif", fontSize: 22, lineHeight: 1.6,
            color: C.white, margin: 0, fontWeight: 500, letterSpacing: -0.3, maxWidth: 820,
          }}>
            SynTech Trust has completely transformed how we manage our ASIC fleet. Their repair quality is unmatched — boards come back performing better than before, and the turnaround time is incredibly fast. A partner you can truly rely on.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 36 }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: `linear-gradient(135deg, hsl(140,50%,35%), hsl(150,40%,28%))`,
              border: `2px solid ${C.borderHover}`,
            }}/>
            <div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 15, color: C.white }}>Data Prana</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: C.muted, marginTop: 2 }}>Partner</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 3 }}>
              {[1,2,3,4,5].map(s => <StarIcon key={s} delay={s * 80} triggered={visible}/>)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ─── PRODUCTS ─── */
const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="8" cy="8" r="7.5" stroke={C.accent} strokeOpacity="0.35"/>
    <path d="M5 8l2 2 4-4" stroke={C.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PRODUCTS = [
  {
    name: "Polycarbonate Sheets",
    img: "/product1.avif",
    subtitle: "Perfectly suited for creating 'cold' and 'hot' aisles, providing visual monitoring of equipment while maintaining temperature control.",
    features: [
      { title: "Variety of Types", desc: "Available in multiwall (cellular) for thermal insulation and solid sheets for maximum transparency." },
      { title: "Custom Parameters", desc: "Selection of sizes, thickness, and colors (including tinted) to meet specific project requirements." },
      { title: "Safety & Protection", desc: "High impact resistance and UV radiation protection for structural durability." },
    ],
  },
  {
    name: "Rolling Doors",
    img: "/product2.avif",
    subtitle: "Ability to integrate with access control systems (ACS) and fire safety systems for automatic opening in case of alarm.",
    features: [
      { title: "Durable Construction", desc: "Manufactured from high-quality steel or aluminum for durability and security." },
      { title: "Custom Dimensions", desc: "Designed and manufactured to specific opening dimensions of your facility." },
      { title: "Environmental Protection", desc: "Built-in wind protection and seals to maintain the microclimate." },
    ],
  },
  {
    name: "Power Units",
    img: "/product3.avif",
    subtitle: "Additional accessories and vertical (Zero U) or horizontal (1U/2U) mounting options available to save rack space.",
    features: [
      { title: "Custom Configuration", desc: "Manufacturing PDUs of any size with required output socket combinations for your project." },
      { title: "UL Certified", desc: "Compliance with strict international safety standards for data center equipment." },
      { title: "Flexible Integration", desc: "Optimized for mounting in standard server racks and distribution boards." },
    ],
  },
  {
    name: "Exhaust Fans",
    img: "/product4.avif",
    subtitle: "Custom sizes available with optional shutters for backdraft protection in critical environments.",
    features: [
      { title: "Drive Versatility", desc: "Available in both Direct Drive and Belt Drive configurations to suit maintenance needs." },
      { title: "Power Flexibility", desc: "Supports 1-phase and 3-phase power supplies; customizable motor options." },
      { title: "Certified Durability", desc: "UL Certified, high-temperature resistant, and constructed with 430 Stainless Steel blades." },
    ],
  },
  {
    name: "Cooling Pads",
    img: "/product5.avif",
    subtitle: "High-efficiency solution for evaporative cooling system.",
    features: [
      { title: "Flexible Design", desc: "Available in stainless steel/aluminum frames or frameless options." },
      { title: "Wide Variety", desc: "Multiple sizes, thicknesses, and color options to suit any project." },
      { title: "Quality Materials", desc: "Various paper quality grades available for optimal moisture absorption." },
    ],
  },
  {
    name: "Air Filters",
    img: "/product6.avif",
    subtitle: "High-performance pre-filters designed to protect server equipment from dust and airborne particles.",
    features: [
      { title: "Versatile Filtration", desc: "Pre-filters of classes G1–G4 for effective coarse air filtration in various environments." },
      { title: "Flexible Form Factors", desc: "Available as filter cotton rolls, cut-to-size pads, or ready-made ceiling cassettes." },
      { title: "Robust Construction", desc: "High-temperature resistant options available; framed (with wire mesh) or frameless designs." },
    ],
  },
];

function ProductModal({ product, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.card,
          borderRadius: 24,
          border: `1px solid ${C.border}`,
          width: "100%", maxWidth: 420,
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex", flexDirection: "column",
          animation: "modalSlideUp 0.3s cubic-bezier(.22,1,.36,1)",
        }}
      >
        {/* Image */}
        <div style={{ width: "100%", aspectRatio: "4/3", overflow: "hidden", background: C.surface, flexShrink: 0 }}>
          <img src={product.img} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
        </div>

        {/* Content */}
        <div style={{ padding: "28px 28px 32px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 0 }}>
          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 0, right: 0,
              display: "none",
            }}
          />

          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 700, color: C.white, margin: "0 0 12px", letterSpacing: -0.5 }}>
            {product.name}
          </h2>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: C.muted, margin: "0 0 24px", lineHeight: 1.65 }}>
            {product.subtitle}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 28 }}>
            {product.features.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ marginTop: 2, flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <circle cx="11" cy="11" r="10.5" stroke={C.accent} strokeOpacity="0.4"/>
                    <path d="M7 11l3 3 5-5" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: C.white }}>{f.title}: </span>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: C.muted, lineHeight: 1.6 }}>{f.desc}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            style={{
              width: "100%", padding: "14px 0", borderRadius: 50, border: "none",
              background: C.white, color: C.bg,
              fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700,
              cursor: "pointer", letterSpacing: 0.5,
              transition: "background 0.2s ease",
            }}
            onMouseEnter={e => e.target.style.background = C.accent}
            onMouseLeave={e => e.target.style.background = C.white}
          >
            Quote
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ProductCard({ product, index, onOpen }) {
  const [hov, setHov] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      onClick={onOpen}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.card,
        borderRadius: 20,
        border: `1px solid ${hov ? C.borderHover : C.border}`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transform: hov ? "translateY(-6px)" : visible ? "translateY(0)" : "translateY(32px)",
        boxShadow: hov ? "0 20px 56px rgba(0,0,0,0.55)" : "none",
        opacity: visible ? 1 : 0,
        transition: `opacity 0.65s cubic-bezier(.22,1,.36,1) ${index * 80}ms, transform 0.65s cubic-bezier(.22,1,.36,1) ${index * 80}ms, border-color 0.25s ease, box-shadow 0.25s ease`,
      }}
    >
      {/* Image */}
      <div style={{ width: "100%", aspectRatio: "4/3", overflow: "hidden", background: C.surface }}>
        <img
          src={product.img}
          alt={product.name}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            transform: hov ? "scale(1.05)" : "scale(1)",
            transition: "transform 0.5s cubic-bezier(.22,1,.36,1)",
          }}
        />
      </div>

      {/* Body */}
      <div className="product-card-body" style={{ padding: "24px 24px 28px", display: "flex", flexDirection: "column", flex: 1 }}>
        <h3 className="product-card-name" style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: C.white, margin: "0 0 8px", letterSpacing: -0.3 }}>
          {product.name}
        </h3>

        <div className="card-details">
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: C.muted, margin: "0 0 20px", lineHeight: 1.6 }}>
            {product.subtitle}
          </p>

          {/* Features */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
            {product.features.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ marginTop: 1 }}><CheckIcon/></div>
                <div>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: C.white }}>{f.title}: </span>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: C.muted, lineHeight: 1.55 }}>{f.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ marginTop: 24 }} onClick={e => e.stopPropagation()}>
            <button
              onClick={onOpen}
              style={{
                width: "100%", padding: "11px 0", borderRadius: 50, border: "none",
                background: hov ? C.accent : C.white,
                color: C.bg,
                fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700,
                cursor: "pointer", letterSpacing: 0.5,
                transition: "background 0.25s ease, transform 0.2s ease",
                transform: hov ? "translateY(-1px)" : "translateY(0)",
              }}
            >
              Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsSection() {
  const fade = useFadeIn(0);
  const [activeProduct, setActiveProduct] = useState(null);

  return (
    <Card id="products" className="section-card" style={{ padding: "56px 52px" }}>
      {activeProduct && <ProductModal product={activeProduct} onClose={() => setActiveProduct(null)}/>}

      {/* Header */}
      <div ref={fade.ref} className="section-header" style={{ ...fade.style, display: "flex", gap: 40, marginBottom: 52 }}>
        <div className="section-label" style={{ minWidth: 160 }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, color: C.accent, letterSpacing: 3, textTransform: "uppercase" }}>Products</span>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: C.faint, marginTop: 4 }}>(04-08)</div>
        </div>
        <p className="section-title" style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, lineHeight: 1.3, color: C.white, margin: 0, fontWeight: 600, letterSpacing: -1 }}>
          Our Products
        </p>
      </div>

      <div className="products-grid">
        {PRODUCTS.map((p, i) => (
          <ProductCard key={i} product={p} index={i} onOpen={() => setActiveProduct(p)}/>
        ))}
      </div>
    </Card>
  );
}

/* ─── CTA ─── */
function CTASection() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [textReady, setTextReady] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVisible(true);
        setTimeout(() => setTextReady(true), 400);
      }
    }, { threshold: 0.15 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="cta-section" style={{
      borderRadius: 20, overflow: "hidden", position: "relative", minHeight: 460,
      border: `1px solid ${C.border}`,
      background: `linear-gradient(135deg, ${C.card} 0%, #0d1f14 50%, #0f1c12 100%)`,
      clipPath: visible ? "inset(0% 0 0% 0 round 20px)" : "inset(40% 0 40% 0 round 20px)",
      transition: "clip-path 0.8s cubic-bezier(0.22,1,0.36,1)",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: `
          radial-gradient(ellipse 500px 350px at 30% 60%, rgba(34,197,94,0.1), transparent),
          radial-gradient(ellipse 400px 300px at 70% 40%, rgba(20,120,60,0.06), transparent)
        `,
      }}/>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.03 }}>
        <defs><pattern id="cg" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
        </pattern></defs>
        <rect width="100%" height="100%" fill="url(#cg)"/>
      </svg>

      <div className="cta-content" style={{
        position: "relative", zIndex: 2,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "80px 40px", minHeight: 460,
        opacity: textReady ? 1 : 0,
        transform: textReady ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}>
        <h2 className="cta-h2" style={{ fontFamily: "'Syne', sans-serif", fontSize: 48, fontWeight: 800, color: C.white, lineHeight: 1.1, margin: 0, maxWidth: 620, letterSpacing: -2 }}>
          Built on trust. <span style={{ color: C.accent }}>Powered by performance.</span>
        </h2>
        <p className="cta-p" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, color: C.muted, maxWidth: 480, margin: "24px 0 0", lineHeight: 1.7 }}>
          Professional crypto-mining services you can rely on. ASIC repair, optimization, and miner support — all in one place.
        </p>
        <div style={{ marginTop: 36 }}>
          <Btn pulse>Get a quote now!</Btn>
        </div>
      </div>
    </div>
  );
}

/* ─── CONTACT + FOOTER ─── */
function ContactFooterSection() {
  const fade = useFadeIn(0);
  const [form, setForm] = useState({ first: "", last: "", email: "", message: "" });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const inputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: 8, fontSize: 13,
    fontFamily: "'Outfit', sans-serif", fontWeight: 400,
    background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`,
    color: C.white, outline: "none", transition: "border-color 0.2s",
  };

  const steps = [
    { n: "1", title: "Send inquiry", desc: "Describe your needs" },
    { n: "2", title: "Get a quote", desc: "We respond fast" },
    { n: "3", title: "Start operations", desc: "We handle the rest" },
  ];

  return (
    <div id="contact" ref={fade.ref} style={{ ...fade.style }}>
      {/* Contact card */}
      <div className="contact-grid" style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        borderRadius: 20, overflow: "hidden",
        border: `1px solid ${C.border}`, minHeight: 540,
      }}>
        {/* Left — green panel */}
        <div className="contact-left" style={{
          position: "relative", padding: "52px 48px",
          background: "linear-gradient(145deg, #0d2318 0%, #0a1f14 40%, #061510 100%)",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 500px 400px at 20% 30%, rgba(34,197,94,0.18), transparent)",
            pointerEvents: "none",
          }}/>
          <div style={{ position: "relative", zIndex: 1 }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, color: C.accent, letterSpacing: 3, textTransform: "uppercase" }}>Contact</span>
            <h2 className="contact-h2" style={{
              fontFamily: "'Syne', sans-serif", fontSize: 44, fontWeight: 800,
              color: C.white, lineHeight: 1.1, margin: "20px 0 16px", letterSpacing: -2,
            }}>
              Get in Touch<br/>with Us
            </h2>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: C.muted, lineHeight: 1.7, maxWidth: 280 }}>
              Reach out for ASIC repair quotes, operations staffing, or equipment sourcing. We respond within 24 hours.
            </p>
          </div>

          {/* Step cards */}
          <div className="steps-row" style={{ display: "flex", gap: 10, position: "relative", zIndex: 1, marginTop: 40 }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                flex: 1, borderRadius: 12, padding: "18px 16px",
                background: i === 0 ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.08)",
                border: `1px solid ${i === 0 ? "transparent" : "rgba(255,255,255,0.1)"}`,
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: i === 0 ? C.bg : "rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: i === 0 ? C.white : C.muted,
                  fontFamily: "'Outfit', sans-serif", marginBottom: 12,
                }}>{s.n}</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: i === 0 ? C.bg : C.white, lineHeight: 1.3 }}>{s.title}</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: i === 0 ? "#444" : C.muted, marginTop: 4 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — form panel */}
        <div className="contact-right" style={{
          background: C.surface, padding: "52px 48px",
          display: "flex", flexDirection: "column", justifyContent: "center",
        }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 700, color: C.white, margin: "0 0 6px", letterSpacing: -0.5 }}>
            Contact us
          </h3>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: C.muted, margin: "0 0 32px" }}>
            Fill in your details and we'll get back to you shortly.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="name-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: C.muted, marginBottom: 6, display: "block" }}>First name *</label>
                <input placeholder="eg. John" value={form.first} onChange={set("first")} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = C.accent}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}/>
              </div>
              <div>
                <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: C.muted, marginBottom: 6, display: "block" }}>Last name</label>
                <input placeholder="eg. Smith" value={form.last} onChange={set("last")} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = C.accent}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}/>
              </div>
            </div>
            <div>
              <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: C.muted, marginBottom: 6, display: "block" }}>Email *</label>
              <input placeholder="eg. john@company.com" value={form.email} onChange={set("email")} type="email" style={inputStyle}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}/>
            </div>
            <div>
              <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: C.muted, marginBottom: 6, display: "block" }}>Message</label>
              <textarea placeholder="Describe your needs..." value={form.message} onChange={set("message")} rows={4}
                style={{ ...inputStyle, resize: "none" }}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}/>
            </div>
            <button style={{
              width: "100%", padding: "13px", borderRadius: 8, border: "none",
              background: C.accent, color: C.bg,
              fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700,
              cursor: "pointer", letterSpacing: 0.3,
              transition: "opacity 0.2s, transform 0.2s",
            }}
            onMouseEnter={e => { e.target.style.opacity = "0.9"; e.target.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.target.style.opacity = "1"; e.target.style.transform = "translateY(0)"; }}
            >Submit</button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer-bar" style={{
        borderTop: `1px solid ${C.border}`, padding: "28px 0",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div className="footer-left" style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <img src="/logo.avif" alt="SynTech Trust" style={{ height: 28, width: "auto" }}/>
          <div className="footer-links" style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
            {[["Home","home"],["Services","services"],["Figures","figures"],["Products","products"],["Partners","partners"],["Contact","contact"]].map(([label, id]) => (
              <a key={id} href={`#${id}`} className="nav-link" style={{
                color: C.faint, textDecoration: "none", fontSize: 13,
                fontFamily: "'Outfit', sans-serif", position: "relative",
              }}>{label}</a>
            ))}
          </div>
        </div>
        <div className="footer-copy" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: C.faint }}>
          © 2024 SynTech Trust LLC. All rights reserved.
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN ─── */
export default function BloomLanding() {
  const [navShow, setNavShow] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollProgress = useScrollProgress();
  const borderRadius = useScrollRadius();
  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => { setTimeout(() => setNavShow(true), 0); }, []);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.white }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; overflow-x: hidden; }
        body { background: ${C.bg}; -webkit-font-smoothing: antialiased; overflow-x: hidden; max-width: 100%; }
        ::selection { background: ${C.accentSoft}; color: ${C.accent}; }
        a { text-decoration: none; }
        img { max-width: 100%; height: auto; }

        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes orbDrift {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(25px, -15px) scale(1.08); }
        }
        @keyframes kenBurns {
          0%   { transform: scale(1); }
          100% { transform: scale(1.07); }
        }
        @keyframes btnPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.04); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideUp { from { opacity: 0; transform: translateY(40px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }

        .nav-link { transition: color 0.2s; }
        .nav-link:hover { color: ${C.white} !important; }
        .nav-link::after {
          content: ''; position: absolute; bottom: -2px; left: 0;
          width: 0; height: 1px; background: ${C.white};
          transition: width 0.25s ease;
        }
        .nav-link:hover::after { width: 100%; }

        /* ── Hamburger button ── */
        .nav-hamburger {
          display: none;
          background: none; border: none; cursor: pointer;
          padding: 10px; min-width: 44px; min-height: 44px;
          align-items: center; justify-content: center;
          flex-direction: column; gap: 5px;
          -webkit-tap-highlight-color: transparent;
        }
        .ham-line {
          display: block; width: 22px; height: 2px;
          background: ${C.white}; border-radius: 2px;
          transform-origin: center;
          transition: transform 0.3s cubic-bezier(.22,1,.36,1), opacity 0.3s ease;
        }
        .nav-hamburger.open .ham-line-1 { transform: translateY(7px) rotate(45deg); }
        .nav-hamburger.open .ham-line-2 { opacity: 0; transform: scaleX(0); }
        .nav-hamburger.open .ham-line-3 { transform: translateY(-7px) rotate(-45deg); }

        /* ── Hamburger drawer ── */
        .ham-overlay {
          position: fixed; inset: 0; z-index: 500;
          background: rgba(0,0,0,0.65); backdrop-filter: blur(4px);
          opacity: 0; pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .ham-overlay.open { opacity: 1; pointer-events: all; }
        .ham-drawer {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(340px, 85vw);
          background: ${C.surface};
          border-left: 1px solid ${C.border};
          display: flex; flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.35s cubic-bezier(.22,1,.36,1);
          z-index: 501;
        }
        .ham-drawer.open { transform: translateX(0); }
        .ham-drawer-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 20px;
          border-bottom: 1px solid ${C.border};
          min-height: 64px;
        }
        .ham-nav-links {
          display: flex; flex-direction: column;
          padding: 20px 16px; gap: 4px; flex: 1;
        }
        .ham-nav-link {
          display: flex; align-items: center;
          min-height: 48px; padding: 0 16px;
          font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 500;
          color: ${C.muted}; text-decoration: none;
          border-radius: 10px;
          transition: color 0.2s ease, background 0.2s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .ham-nav-link:hover, .ham-nav-link:active { color: ${C.white}; background: rgba(255,255,255,0.05); }

        /* ── Products grid ── */
        .products-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }

        /* ── Section shared ── */
        .section-header { display: flex; gap: 40px; }
        .section-label { min-width: 160px; }
        .section-title { font-size: clamp(20px, 3.5vw, 32px) !important; }
        .hero-h1 { font-size: clamp(32px, 6vw, 68px) !important; }
        .hero-p { font-size: clamp(14px, 2vw, 17px) !important; }
        .cta-h2 { font-size: clamp(26px, 4.5vw, 48px) !important; }
        .cta-p  { font-size: clamp(14px, 2vw, 17px) !important; }
        .contact-h2 { font-size: clamp(26px, 4vw, 44px) !important; }
        .testimonial-text { font-size: clamp(15px, 2.2vw, 22px) !important; }
        .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 24px; }

        /* ══ BREAKPOINTS ══ */

        /* Laptop ≤1279 */
        @media (max-width: 1279px) {
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; gap: 16px !important; }
        }

        /* Tablet ≤1023 */
        @media (max-width: 1023px) {
          .nav-bar { padding: 0 20px !important; }
          .nav-tags { display: none !important; }
          .nav-hamburger { display: flex; }
          .hero-nav-links { display: none !important; }
          .hero-card { min-height: 480px !important; }
          .hero-content { padding: 36px 28px 72px !important; }
          .section-card { padding: 36px 28px !important; }
          .services-section { padding: 36px 28px !important; }
          .products-grid { grid-template-columns: repeat(2,1fr) !important; gap: 16px !important; }
          .testimonial-block { padding: 36px 28px !important; }
          .section-header { gap: 20px !important; }
        }

        /* Mobile ≤767px */
        @media (max-width: 767px) {
          /* Page */
          .page-wrapper { padding: 68px 14px 28px !important; gap: 12px !important; }

          /* Hero */
          .hero-card { min-height: unset !important; border-radius: 16px !important; }
          .hero-nav { padding: 14px 16px !important; }
          .hero-content { padding: 24px 18px 48px !important; text-align: center !important; }
          .hero-h1 { font-size: clamp(28px, 8vw, 42px) !important; letter-spacing: -1.5px !important; }
          .hero-p { font-size: 14px !important; max-width: 100% !important; }
          .hero-cta-wrap { display: flex; justify-content: center; width: 100%; }
          .hero-cta-wrap button { min-height: 48px; }

          /* Section cards */
          .section-card { padding: 24px 16px !important; border-radius: 16px !important; }
          .services-section { padding: 24px 16px !important; border-radius: 16px !important; }
          .section-header { flex-direction: column !important; gap: 4px !important; margin-bottom: 18px !important; }
          .section-label { min-width: unset !important; }
          .section-title { font-size: clamp(18px, 5.5vw, 24px) !important; line-height: 1.3 !important; }

          /* Stats */
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; gap: 8px !important; }
          .stat-card {
            padding: 18px 12px !important;
            display: flex !important; align-items: center !important; justify-content: center !important;
            text-align: center !important;
            min-height: 72px !important;
            overflow: visible !important;
          }
          .stat-card > div:first-child { display: none; }
          .stat-label, .stat-sub { display: none !important; }
          .stat-number {
            font-size: clamp(22px, 6vw, 30px) !important;
            white-space: nowrap !important;
            letter-spacing: -0.5px !important;
          }

          /* Services */
          .service-inner { flex-direction: column !important; gap: 8px !important; }
          .service-title { font-size: 16px !important; min-width: unset !important; }
          .service-row { padding: 16px 8px !important; margin: 0 -8px !important; }
          .service-toggle { min-width: 44px !important; min-height: 44px !important; }

          /* Products */
          .products-grid { grid-template-columns: repeat(2,1fr) !important; gap: 10px !important; }
          .card-details { display: none !important; }
          .product-card-body { padding: 12px 14px 16px !important; }
          .product-card-name { font-size: 14px !important; margin: 0 !important; }

          /* Testimonial */
          .testimonial-block { padding: 24px 16px !important; border-radius: 14px !important; }
          .testimonial-text { font-size: clamp(14px, 3.8vw, 17px) !important; line-height: 1.55 !important; }

          /* CTA */
          .cta-section { min-height: 300px !important; border-radius: 16px !important; }
          .cta-content { padding: 40px 18px !important; min-height: 300px !important; }
          .cta-h2 { font-size: clamp(22px, 6.5vw, 32px) !important; letter-spacing: -1px !important; max-width: 100% !important; }
          .cta-p { font-size: 14px !important; max-width: 100% !important; }

          /* Contact */
          .contact-grid { grid-template-columns: 1fr !important; min-height: unset !important; border-radius: 16px !important; }
          .contact-left { padding: 28px 18px !important; }
          .contact-right { padding: 24px 18px !important; }
          .contact-h2 { font-size: clamp(24px, 6.5vw, 32px) !important; }
          .steps-row { flex-wrap: wrap !important; gap: 8px !important; }
          .name-grid { grid-template-columns: 1fr !important; }

          /* Footer */
          .footer-bar { flex-direction: column !important; align-items: flex-start !important; gap: 14px !important; padding: 20px 0 !important; }
          .footer-left { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .footer-links { flex-wrap: wrap !important; gap: 8px 12px !important; }
          .footer-copy { font-size: 11px !important; }
        }

        /* Mobile S ≤479px */
        @media (max-width: 479px) {
          .page-wrapper { padding: 64px 10px 20px !important; gap: 10px !important; }
          .hero-h1 { font-size: clamp(24px, 8.5vw, 34px) !important; }
          .hero-content { padding: 20px 14px 40px !important; }
          .hero-cta-wrap button { width: 100% !important; justify-content: center !important; }
          .section-card { padding: 18px 14px !important; }
          .services-section { padding: 18px 14px !important; }
          .products-grid { grid-template-columns: repeat(2,1fr) !important; gap: 8px !important; }
          .product-card-body { padding: 10px 10px 12px !important; }
          .product-card-name { font-size: 13px !important; }
          .stats-grid { gap: 6px !important; }
          .stat-card { min-height: 64px !important; padding: 14px 8px !important; }
          .stat-number { font-size: clamp(18px, 5.5vw, 24px) !important; }
          .contact-left, .contact-right { padding: 20px 14px !important; }
          .testimonial-block { padding: 18px 14px !important; }
          .cta-content { padding: 32px 14px !important; }
          .cta-h2 { font-size: clamp(20px, 6vw, 28px) !important; }
          .footer-links { display: none !important; }
        }

        /* Really small ≤374px */
        @media (max-width: 374px) {
          .products-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr !important; }
          .stat-card { min-height: 56px !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* Scroll progress bar */}
      <div style={{
        position: "fixed", top: 0, left: 0, zIndex: 9999,
        height: 3, background: C.lime,
        width: `${scrollProgress * 100}%`,
        transition: "width 0.1s linear",
        boxShadow: `0 0 8px ${C.lime}`,
      }}/>

      <DarkBackground/>
      <Nav show={navShow} onMenuOpen={openMenu}/>
      <HamburgerMenu open={menuOpen} onClose={closeMenu}/>

      <div className="page-wrapper" style={{
        position: "relative", zIndex: 1,
        maxWidth: 1200, margin: "0 auto",
        padding: "84px 24px 40px",
        display: "flex", flexDirection: "column", gap: 20,
      }}>
        <HeroSection borderRadius={borderRadius} onMenuOpen={openMenu}/>
        <AboutSection/>
        <ServicesSection/>
        <TestimonialSection/>
        <ProductsSection/>
        <CTASection/>
        <ContactFooterSection/>
      </div>
    </div>
  );
}
