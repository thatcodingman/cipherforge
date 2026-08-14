import { AlertTriangle } from "lucide-react";
import { C, fontMono, CipherFonts, CipherFrameStyles, CipherBackdrop, FrameFX } from "../components/CipherChrome";

export default function NotFound() {
  return (
    <CipherBackdrop>
      <CipherFonts />
      <CipherFrameStyles />
      <div className="cf-frame" style={{
        background: C.bg, color: C.text, padding: "40px 20px", ...fontMono, textAlign: "center",
        border: "1px solid rgba(57,217,122,0.35)",
        boxShadow: "0 0 40px rgba(57,217,122,0.07), inset 0 0 70px rgba(0,0,0,0.5)",
      }}>
        <FrameFX />
        <div style={{ position: "relative", zIndex: 1 }}>
          <AlertTriangle size={30} color={C.warn} style={{ margin: "10px 0 16px" }} />
          <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, letterSpacing: 1.5, color: C.accent,
            margin: "0 0 8px" }}>404 — MODULE NOT FOUND</p>
          <p style={{ fontSize: 12, color: C.sub, lineHeight: 1.6, margin: "0 0 24px" }}>
            That path doesn't map to anything in the registry.
          </p>
          <a href="/" style={{
            display: "inline-block", padding: "10px 24px", borderRadius: 6, border: "none",
            background: C.accent, color: "#020803", fontSize: 12, fontWeight: 700, textDecoration: "none",
            textTransform: "uppercase", letterSpacing: 0.5 }}>
            Return to Hub
          </a>
        </div>
      </div>
    </CipherBackdrop>
  );
}
