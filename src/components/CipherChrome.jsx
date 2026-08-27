import { useState, useEffect } from "react";

export const C = {
  bg: "#020803", card: "#081208", card2: "#0F1F12", border: "#1A3A22",
  text: "#E8F5EC", sub: "#7FBF97", mute: "#4A7259", accent: "#39D97A", accentDark: "#0F3D22",
  danger: "#FF4757", warn: "#FFB020", safe: "#4ADE80",
};
export const fontMono = { fontFamily: "'Share Tech Mono', 'IBM Plex Mono', monospace" };

export function CipherFonts() {
  return <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@600;700&display=swap" />;
}

// Structured data so search engines understand this is a free web app, not
// just a page of text — can surface richer results ("Free" badge, etc).
export function CipherStructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "CipherForge",
    "applicationCategory": "SecurityApplication",
    "operatingSystem": "Any (runs in browser)",
    "url": "https://getcipherforge.com",
    "description": "Free browser-only security tools: a password generator with crack-time analysis, a classic cipher playground, a QR/TOTP 2FA generator, a passphrase memory trainer, and a defense game.",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  };
  return <script type="application/ld+json">{JSON.stringify(data)}</script>;
}

// Shared CSS for the frame + shared keyframes. Include once per page via <CipherFrameStyles />.
export function CipherFrameStyles() {
  return (
    <style>{"\
      .cf-frame { width: 390px; border-radius: 12px; box-sizing: border-box; position: relative; overflow: hidden; }\
      @media (min-width: 700px) {\
        .cf-frame { zoom: 1.25; }\
      }\
      @media (min-width: 1100px) {\
        .cf-frame { zoom: 1.45; }\
      }\
      @media (max-width: 480px) {\
        .cf-backdrop { padding: 0 !important; }\
        .cf-frame { width: 100%; border-radius: 0; min-height: 100dvh; }\
        .cf-corner-bracket { display: none; }\
      }\
      .cf-frame {\
        border: 1px solid rgba(57,217,122,0.15) !important;\
        box-shadow: 0 0 120px 40px rgba(57,217,122,0.05), 0 0 40px rgba(57,217,122,0.05), inset 0 0 70px rgba(0,0,0,0.5) !important;\
      }\
      @keyframes cfNodePulse { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; } }\
      @keyframes cfFloat { 0% { transform: translateY(0); opacity: 0; } 10% { opacity: 0.7; } 90% { opacity: 0.4; } 100% { transform: translateY(-520px); opacity: 0; } }\
      @keyframes cfBlink { 50% { opacity: 0; } }\
      @keyframes cfBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }\
      @media (prefers-reduced-motion: reduce) {\
        .cf-frame, .cf-frame * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }\
      }\
      .cf-frame a:focus-visible, .cf-frame button:focus-visible, .cf-frame input:focus-visible, .cf-frame select:focus-visible {\
        outline: 2px solid #39D97A;\
        outline-offset: 2px;\
      }\
      .cf-frame { -webkit-user-select: none; user-select: none; }\
      .cf-frame input, .cf-frame textarea, .cf-frame select {\
        -webkit-user-select: text; user-select: text;\
      }\
    "}</style>
  );
}

// Full-page backdrop wrapper — vertically AND horizontally centers the frame,
// so there's no dead space hanging below short pages on tall viewports, and
// pages that grow taller (more tools, longer content) just push the frame
// naturally without anything breaking.
export function CipherBackdrop({ children }) {
  return (
    <div className="cf-backdrop" style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      minHeight: "100dvh",
      background: "radial-gradient(circle at 50% 40%, #04140A 0%, #000000 65%)",
      padding: "16px 0",
    }}>
      {children}
    </div>
  );
}

// Soft, non-repeating glow spots instead of a tiled/repeating pattern — a
// repeating background combined with the desktop `zoom` scaling below can
// produce faint seam lines in some browsers (WebKit especially) when the
// tile size doesn't divide evenly into the zoomed dimensions. Non-repeating
// gradients have no tile boundary, so this class of bug can't happen here.
export function CircuitBackground() {
  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none",
      backgroundImage:
        "radial-gradient(circle at 15% 15%, " + C.accent + "26 0%, transparent 38%), " +
        "radial-gradient(circle at 85% 12%, " + C.accent + "1f 0%, transparent 34%), " +
        "radial-gradient(circle at 18% 88%, " + C.accent + "1f 0%, transparent 34%), " +
        "radial-gradient(circle at 82% 85%, " + C.accent + "26 0%, transparent 38%)",
    }} />
  );
}

export function Particles() {
  const dots = [
    { left: "12%", size: 2, dur: 9, delay: 0 }, { left: "28%", size: 1.5, dur: 12, delay: 2 },
    { left: "55%", size: 2.5, dur: 10, delay: 1 }, { left: "72%", size: 1.5, dur: 14, delay: 3 },
    { left: "88%", size: 2, dur: 11, delay: 0.5 },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {dots.map(function (d, i) {
        return (
          <div key={i} style={{
            position: "absolute", left: d.left, bottom: -10, width: d.size, height: d.size,
            borderRadius: "50%", background: C.accent, boxShadow: "0 0 6px " + C.accent,
            animation: "cfFloat " + d.dur + "s linear " + d.delay + "s infinite",
          }} />
        );
      })}
    </div>
  );
}

export function CornerBrackets() {
  const style = { position: "absolute", width: 18, height: 18, opacity: 0.8 };
  return (
    <>
      <div className="cf-corner-bracket" style={{ ...style, top: -1, left: -1, borderTop: "2px solid " + C.accent, borderLeft: "2px solid " + C.accent }} />
      <div className="cf-corner-bracket" style={{ ...style, top: -1, right: -1, borderTop: "2px solid " + C.accent, borderRight: "2px solid " + C.accent }} />
      <div className="cf-corner-bracket" style={{ ...style, bottom: -1, left: -1, borderBottom: "2px solid " + C.accent, borderLeft: "2px solid " + C.accent }} />
      <div className="cf-corner-bracket" style={{ ...style, bottom: -1, right: -1, borderBottom: "2px solid " + C.accent, borderRight: "2px solid " + C.accent }} />
    </>
  );
}

export function Mascot() {
  const [blink, setBlink] = useState(false);
  useEffect(function () {
    const id = setInterval(function () {
      setBlink(true);
      setTimeout(function () { setBlink(false); }, 140);
    }, 3200);
    return function () { clearInterval(id); };
  }, []);
  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
      <svg width="52" height="52" viewBox="0 0 52 52" style={{ animation: "cfBob 3s ease-in-out infinite" }}>
        <rect x="8" y="10" width="36" height="30" rx="8" fill={C.card2} stroke={C.accent} strokeWidth="1.5" />
        <line x1="26" y1="10" x2="26" y2="3" stroke={C.accent} strokeWidth="1.5" />
        <circle cx="26" cy="3" r="2.5" fill={C.accent} style={{ animation: "cfNodePulse 1.8s ease-in-out infinite" }} />
        {blink ? (
          <>
            <line x1="16" y1="24" x2="22" y2="24" stroke={C.accent} strokeWidth="2" strokeLinecap="round" />
            <line x1="30" y1="24" x2="36" y2="24" stroke={C.accent} strokeWidth="2" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="19" cy="24" r="3" fill={C.accent} />
            <circle cx="33" cy="24" r="3" fill={C.accent} />
          </>
        )}
        <rect x="18" y="31" width="16" height="2" rx="1" fill={C.accent} opacity="0.6" />
      </svg>
    </div>
  );
}

// Standard frame chrome bundle — background layers + corner brackets, dropped
// in once at the top of any page's frame div.
export function FrameFX() {
  return (
    <>
      <CircuitBackground />
      <Particles />
      <CornerBrackets />
    </>
  );
}

export function BootSequence({ lines, onDone }) {
  const [shown, setShown] = useState(0);
  useEffect(function () {
    if (shown >= lines.length) { const t = setTimeout(onDone, 250); return function () { clearTimeout(t); }; }
    const t = setTimeout(function () { setShown(function (s) { return s + 1; }); }, 200);
    return function () { clearTimeout(t); };
  }, [shown]);
  return (
    <div style={{ ...fontMono, fontSize: 12, color: C.accent, padding: "40px 16px", lineHeight: 1.9, position: "relative", zIndex: 1 }}>
      {lines.slice(0, shown).map(function (l, i) {
        return <div key={i} style={{ opacity: i === shown - 1 ? 1 : 0.55 }}>&gt; {l}</div>;
      })}
      <span style={{ animation: "cfBlink 1s step-start infinite" }}>▌</span>
    </div>
  );
}

// Shared header + text helpers for the legal/info pages (About, Contact,
// FAQ, Privacy, Terms) so each page file only has to hold its own content.
export function LegalHeader({ title }) {
  return (
    <>
      <a href="/" style={{ color: C.sub, textDecoration: "none", fontSize: 11, display: "inline-flex", alignItems: "center", gap: 5, marginBottom: 16 }}>
        &lt; BACK
      </a>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, letterSpacing: 1.5, color: C.accent,
          textShadow: "0 0 12px rgba(57,217,122,0.5)" }}>{title}</span>
      </div>
    </>
  );
}
export function LegalP({ children }) {
  return <p style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.7, margin: "0 0 14px" }}>{children}</p>;
}
export function LegalH2({ children }) {
  return <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: "18px 0 6px", letterSpacing: 0.3 }}>{children}</p>;
}
