import { C, CipherFonts, CipherFrameStyles, CipherBackdrop, FrameFX, LegalHeader, LegalP, LegalH2 } from "../components/CipherChrome";

export default function About() {
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
          <LegalHeader title="ABOUT" />

          <LegalP>
            CipherForge is a set of free, browser-only security tools: a password
            generator with real crack-time analysis, a classic cipher playground,
            a passphrase memory trainer, and a reflex-based defense game. No
            signup, no accounts, nothing typed here ever leaves your browser.
          </LegalP>

          <LegalH2>Why it exists</LegalH2>
          <LegalP>
            Most password generators online are a text box and nothing else.
            CipherForge tries to actually teach something along the way — real
            entropy math, real crack-time estimates against different attacker
            tiers, and tools that make security concepts tangible instead of
            abstract.
          </LegalP>

          <LegalH2>How it's funded</LegalH2>
          <LegalP>
            CipherForge doesn't currently run ads or analytics. If that changes,
            it'll be disclosed accurately in the <a href="/terms" style={{ color: C.accent }}>Terms of Use</a> and{" "}
            <a href="/privacy" style={{ color: C.accent }}>Privacy Policy</a>.
          </LegalP>

          <LegalH2>Get in touch</LegalH2>
          <LegalP>
            Questions, bug reports, tool ideas? Visit the{" "}
            <a href="/contact" style={{ color: C.accent }}>Contact</a> page.
          </LegalP>
        </div>
      </div>
    </CipherBackdrop>
  );
}
