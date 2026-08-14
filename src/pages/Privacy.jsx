import { C, CipherFonts, CipherFrameStyles, CipherBackdrop, FrameFX, LegalHeader, LegalP, LegalH2 } from "../components/CipherChrome";

export default function Privacy() {
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
          <LegalHeader title="PRIVACY POLICY" />
          <p style={{ fontSize: 10.5, color: C.mute, textAlign: "center", margin: "-12px 0 20px" }}>Last updated August 2026</p>

          <LegalP>
            CipherForge ("we", "us") provides free browser-based security tools.
            This page explains exactly what data those tools handle.
          </LegalP>

          <LegalH2>Data we collect</LegalH2>
          <LegalP>
            None of our tools require an account or signup. Passwords, ciphers,
            passphrases, and anything else you type into a CipherForge tool is
            processed entirely in your browser and is never transmitted to us
            or any third party.
          </LegalP>

          <LegalH2>Local storage</LegalH2>
          <LegalP>
            Breach and Memory Ladder save your personal best scores using your
            browser's local storage, so they persist between visits on the same
            device. This data never leaves your browser and can be cleared at
            any time by clearing your browser data.
          </LegalP>

          <LegalH2>Analytics and advertising</LegalH2>
          <LegalP>
            CipherForge does not currently use analytics or display advertising.
            If that changes in the future, this policy will be updated first to
            accurately describe what's added and what data, if any, it involves.
          </LegalP>

          <LegalH2>Contact</LegalH2>
          <LegalP>
            Questions about this policy can be sent to{" "}
            <a href="mailto:forgeaccounts@gmail.com" style={{ color: C.accent }}>pausedawg@gmail.com</a>.
          </LegalP>
        </div>
      </div>
    </CipherBackdrop>
  );
}
