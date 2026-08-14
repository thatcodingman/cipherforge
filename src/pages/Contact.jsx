import { C, CipherFonts, CipherFrameStyles, CipherBackdrop, FrameFX, LegalHeader, LegalP } from "../components/CipherChrome";

export default function Contact() {
  return (
    <CipherBackdrop>
      <CipherFonts />
      <CipherFrameStyles />
      <div className="cf-frame" style={{
        background: C.bg, color: C.text, padding: "18px 16px",
        border: "1px solid rgba(57,217,122,0.35)",
        boxShadow: "0 0 40px rgba(57,217,122,0.07), inset 0 0 70px rgba(0,0,0,0.5)",
      }}>
        <FrameFX />
        <div style={{ position: "relative", zIndex: 1 }}>
          <LegalHeader title="CONTACT" />

          <LegalP>
            Bug report, feature idea, or something looks broken? Reach out any time.
          </LegalP>
          <LegalP>
            <a href="mailto:pausedawg@gmail.com" style={{ color: C.accent }}>pausedawg@gmail.com</a>
          </LegalP>
          <LegalP>
            For privacy or data questions specifically, see the{" "}
            <a href="/privacy" style={{ color: C.accent }}>Privacy Policy</a> — every
            tool's page also states plainly what it does and doesn't send anywhere.
          </LegalP>
        </div>
      </div>
    </CipherBackdrop>
  );
}
