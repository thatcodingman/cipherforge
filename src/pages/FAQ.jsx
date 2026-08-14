import { C, CipherFonts, CipherFrameStyles, CipherBackdrop, FrameFX, LegalHeader, LegalP } from "../components/CipherChrome";

const FAQS = [
  { q: "Is anything I type or generate sent to a server?", a: "No. Every tool on CipherForge — the password generator, cipher playground, memory trainer, and Breach — runs entirely in your browser. Nothing is transmitted anywhere." },
  { q: "How does the password generator create randomness?", a: "It uses your browser's cryptographically secure random number generator (crypto.getRandomValues), the same class of randomness used in real security software — not Math.random(), which isn't safe for this." },
  { q: "Are the Cipher Playground ciphers actually secure?", a: "No — Caesar shift, ROT13, Base64, and XOR are classic/educational ciphers, easily reversible with basic tools. They're for learning and fun, not for protecting anything sensitive. Use the Password Generator for that." },
  { q: "Are the crack-time estimates in the strength scanner accurate?", a: "They're illustrative approximations based on entropy math and rough guess-rate assumptions for different attacker tiers — not a guarantee. Real-world cracking speed depends on many factors. Treat the numbers as directional, not exact." },
  { q: "Does Breach or Memory Ladder store my scores anywhere?", a: "Personal bests are saved in your browser's local storage only, tied to this device and browser. They're never sent to us or anyone else." },
  { q: "Why are there no accounts or signup?", a: "Because none of these tools need one. Everything runs client-side, so there's nothing to store on our end that would require an account." },
];

export default function FAQ() {
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
          <LegalHeader title="FAQ" />

          {FAQS.map(function (item) {
            return (
              <div key={item.q} style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: C.text, margin: "0 0 5px" }}>{item.q}</p>
                <LegalP>{item.a}</LegalP>
              </div>
            );
          })}

          <LegalP>
            Don't see your question? <a href="/contact" style={{ color: C.accent }}>Get in touch</a>.
          </LegalP>
        </div>
      </div>
    </CipherBackdrop>
  );
}
