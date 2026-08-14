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
      }\
      @keyframes cfNodePulse { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; } }\
      @keyframes cfFloat { 0% { transform: translateY(0); opacity: 0; } 10% { opacity: 0.7; } 90% { opacity: 0.4; } 100% { transform: translateY(-520px); opacity: 0; } }\
      @keyframes cfBlink { 50% { opacity: 0; } }\
      @keyframes cfBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }\
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
      minHeight: "100dvh", background: "#000", padding: "16px 0",
    }}>
      {children}
    </div>
  );
}

export function CircuitBackground() {
  const nodes = [
    { x: 40, y: 60, delay: 0 }, { x: 340, y: 90, delay: 0.6 }, { x: 90, y: 220, delay: 1.2 },
    { x: 300, y: 260, delay: 0.3 }, { x: 60, y: 380, delay: 0.9 }, { x: 330, y: 420, delay: 1.5 },
  ];
  return (
    <svg viewBox="0 0 390 500" preserveAspectRatio="none"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.35 }}>
      <g stroke={C.accent} strokeWidth="0.6" fill="none" opacity="0.5">
        <path d="M40,60 L40,140 L120,140" />
        <path d="M340,90 L260,90 L260,180" />
        <path d="M90,220 L90,300 L200,300 L200,340" />
        <path d="M300,260 L340,260 L340,340" />
        <path d="M60,380 L150,380" />
        <path d="M330,420 L250,420 L250,460" />
      </g>
      {nodes.map(function (n, i) {
        return (
          <circle key={i} cx={n.x} cy={n.y} r="2.5" fill={C.accent}
            style={{ animation: "cfNodePulse 2.4s ease-in-out " + n.delay + "s infinite" }} />
        );
      })}
    </svg>
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
      <div style={{ ...style, top: -1, left: -1, borderTop: "2px solid " + C.accent, borderLeft: "2px solid " + C.accent }} />
      <div style={{ ...style, top: -1, right: -1, borderTop: "2px solid " + C.accent, borderRight: "2px solid " + C.accent }} />
      <div style={{ ...style, bottom: -1, left: -1, borderBottom: "2px solid " + C.accent, borderLeft: "2px solid " + C.accent }} />
      <div style={{ ...style, bottom: -1, right: -1, borderBottom: "2px solid " + C.accent, borderRight: "2px solid " + C.accent }} />
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
