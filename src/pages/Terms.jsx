import { C, CipherFonts, CipherFrameStyles, CipherBackdrop, FrameFX, LegalHeader, LegalP, LegalH2 } from "../components/CipherChrome";

export default function Terms() {
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
          <LegalHeader title="TERMS OF USE" />
          <p style={{ fontSize: 10.5, color: C.mute, textAlign: "center", margin: "-12px 0 20px" }}>Last updated August 2026</p>

          <LegalH2>Free to use</LegalH2>
          <LegalP>
            CipherForge's tools are free, with no signup or account required.
          </LegalP>

          <LegalH2>Password Generator</LegalH2>
          <LegalP>
            Passwords are generated using your browser's cryptographically secure
            random number generator. Crack-time estimates shown alongside them
            are illustrative approximations based on entropy math, not guarantees
            — they should be treated as directional, not exact.
          </LegalP>

          <LegalH2>Cipher Playground</LegalH2>
          <LegalP>
            Caesar shift, ROT13, Base64, and XOR are classic, educational ciphers
            — not secure encryption. Don't use them to protect anything sensitive.
          </LegalP>

          <LegalH2>Breach and Memory Ladder</LegalH2>
          <LegalP>
            These are games and training exercises for entertainment and skill-building
            purposes. They don't constitute security advice or guarantee any
            real-world outcome.
          </LegalP>

          <LegalH2>No warranty</LegalH2>
          <LegalP>
            CipherForge is provided "as is," without warranties of any kind. We're
            not liable for any loss or issue resulting from use of these tools.
          </LegalP>

          <LegalH2>Advertising</LegalH2>
          <LegalP>
            CipherForge does not currently display advertising. If that changes,
            this section will be updated to accurately disclose it, including how
            to manage ad preferences where applicable.
          </LegalP>

          <LegalH2>Changes</LegalH2>
          <LegalP>
            We may update these terms or the tools themselves at any time.
            Continued use of the site means you accept the current version of
            these terms.
          </LegalP>
        </div>
      </div>
    </CipherBackdrop>
  );
}
