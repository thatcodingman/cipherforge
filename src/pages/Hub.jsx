import { useState, useEffect, Component } from "react";
import { Key, Shuffle, ArrowRight } from "lucide-react";
import { C, fontMono, CipherFonts, CipherFrameStyles, CipherBackdrop, FrameFX, Mascot, BootSequence } from "../components/CipherChrome";

// Both tools now live in one list, so every tile gets the same hover
// animation, icon treatment, and layout — no more one-off hardcoded tiles.
const ITEMS = [
  { key: "generator", icon: Key, title: "Password Generator", tag: "Free tool",
    desc: "Cryptographically secure passwords and a live strength scanner with real crack-time estimates.", href: "/generator" },
  { key: "cipher", icon: Shuffle, title: "Cipher Playground", tag: "Free tool",
    desc: "Caesar shift, ROT13, Base64, and XOR — encode and decode classic ciphers.", href: "/cipher" },
];

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error("CipherForge Hub crashed:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <CipherBackdrop>
          <div style={{ width: 390, background: C.bg, color: C.text, borderRadius: 12, border: "1px solid " + C.accent,
            padding: "40px 24px", ...fontMono, textAlign: "center" }}>
            <p style={{ fontSize: 16, margin: "0 0 8px", color: C.accent }}>SYSTEM FAULT</p>
            <p style={{ fontSize: 12, color: C.sub, margin: "0 0 20px", lineHeight: 1.5 }}>Something broke. A refresh usually fixes it.</p>
            <button onClick={function () { window.location.reload(); }} style={{
              background: C.accent, border: "none", color: "#020803", padding: "10px 20px", borderRadius: 4,
              fontSize: 12, fontWeight: 700, cursor: "pointer", ...fontMono }}>REBOOT</button>
          </div>
        </CipherBackdrop>
      );
    }
    return this.props.children;
  }
}

function HubInner() {
  const [booted, setBooted] = useState(false);
  const [hovered, setHovered] = useState(null);

  useEffect(function () { document.title = "CipherForge — Security Tools"; }, []);

  return (
    <CipherBackdrop>
      <CipherFonts />
      <CipherFrameStyles />
      <div className="cf-frame" style={{
        background: C.bg, color: C.text, padding: "24px 20px",
        border: "1px solid rgba(57,217,122,0.35)",
        boxShadow: "0 0 40px rgba(57,217,122,0.07), inset 0 0 70px rgba(0,0,0,0.5)",
      }}>
        <FrameFX />
        {!booted ? (
          <BootSequence lines={["INITIALIZING CIPHERFORGE...", "MOUNTING TOOL REGISTRY...", "LINK ESTABLISHED."]}
            onDone={function () { setBooted(true); }} />
        ) : (
          <div style={{ position: "relative", zIndex: 1 }}>
            <Mascot />
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 26, letterSpacing: 2, color: C.accent,
                textShadow: "0 0 14px rgba(57,217,122,0.5)" }}>CIPHERFORGE</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "0 0 28px" }}>
              <span style={{ ...fontMono, fontSize: 10.5, color: C.accent, letterSpacing: 1, fontWeight: 700 }}>SECURE</span>
              <span style={{ color: C.mute, fontSize: 10 }}>●</span>
              <span style={{ ...fontMono, fontSize: 10.5, color: C.sub, letterSpacing: 1 }}>NO SIGNUP</span>
              <span style={{ color: C.mute, fontSize: 10 }}>●</span>
              <span style={{ ...fontMono, fontSize: 10.5, color: C.sub, letterSpacing: 1 }}>ZERO TRACKING</span>
            </div>

            {ITEMS.map(function (item) {
              const Icon = item.icon;
              const isHovered = hovered === item.key;
              return (
                <a key={item.key} href={item.href}
                  onMouseEnter={function () { setHovered(item.key); }}
                  onMouseLeave={function () { setHovered(null); }}
                  style={{
                    display: "block", textDecoration: "none", color: "inherit",
                    background: C.card, border: "1px solid " + (isHovered ? C.accent : C.border), borderRadius: 8,
                    padding: "16px 16px", marginBottom: 12,
                    transition: "border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
                    transform: isHovered ? "translateY(-2px)" : "translateY(0)",
                    boxShadow: isHovered ? "0 8px 22px rgba(57,217,122,0.16)" : "none",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 6, background: C.accentDark,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      transition: "transform 0.25s ease",
                      transform: isHovered ? "scale(1.08)" : "scale(1)",
                    }}>
                      <Icon size={18} color={C.accent} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 0.3 }}>{item.title}</span>
                        <span style={{ fontSize: 9, color: C.mute, textTransform: "uppercase",
                          letterSpacing: 0.5, border: "1px solid " + C.border, borderRadius: 4, padding: "1px 5px" }}>
                          {item.tag}
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={15} color={isHovered ? C.accent : C.mute} style={{
                      transform: isHovered ? "translateX(3px)" : "none", transition: "transform 0.2s ease" }} />
                  </div>
                  <p style={{ fontSize: 13, color: C.sub, margin: "10px 0 0", lineHeight: 1.55 }}>{item.desc}</p>
                </a>
              );
            })}

            <a href="/breach" style={{
              display: "block", textDecoration: "none", color: "inherit",
              background: "linear-gradient(135deg, " + C.accentDark + ", " + C.card + ")",
              border: "1px solid " + C.accent, borderRadius: 8, padding: "16px 16px", marginBottom: 4,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 6, background: C.accentDark,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 17 }}>⚡</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 0.3 }}>Breach</span>
                    <span style={{ fontSize: 9, color: C.accent, textTransform: "uppercase",
                      letterSpacing: 0.5, border: "1px solid " + C.accent, borderRadius: 4, padding: "1px 5px" }}>Game</span>
                  </div>
                </div>
                <ArrowRight size={15} color={C.accent} />
              </div>
              <p style={{ fontSize: 13, color: C.sub, margin: "10px 0 0", lineHeight: 1.55 }}>
                Defend your system in real time. React fast, hold off the intrusion, see how long you survive.
              </p>
            </a>

            <p style={{ fontSize: 9.5, color: C.mute, textAlign: "center", marginTop: 22, lineHeight: 1.6 }}>
              Every tool here runs entirely in your browser. Nothing you generate, type, or scan is ever sent to a server.
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 18, flexWrap: "wrap" }}>
              <a href="/privacy" style={{ fontSize: 10, color: C.mute, textDecoration: "none" }}>Privacy Policy</a>
              <a href="/about" style={{ fontSize: 10, color: C.mute, textDecoration: "none" }}>About</a>
              <a href="/contact" style={{ fontSize: 10, color: C.mute, textDecoration: "none" }}>Contact</a>
              <a href="/faq" style={{ fontSize: 10, color: C.mute, textDecoration: "none" }}>FAQ</a>
              <a href="/terms" style={{ fontSize: 10, color: C.mute, textDecoration: "none" }}>Terms of Use</a>
            </div>
          </div>
        )}
      </div>
    </CipherBackdrop>
  );
}

export default function Hub() {
  return (
    <ErrorBoundary>
      <HubInner />
    </ErrorBoundary>
  );
}
