import { useState, useEffect, Component } from "react";
import QRCode from "qrcode";
import { ArrowLeft, Copy, Check, RefreshCw } from "lucide-react";
import { C, fontMono, CipherFonts, CipherFrameStyles, CipherBackdrop, FrameFX, BootSequence } from "../components/CipherChrome";
import StructuredData from "../components/StructuredData";

const totpGeneratorSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "CipherForge QR/TOTP Generator",
  "url": "https://getcipherforge.com/totp",
  "description": "Free RFC 6238-compliant TOTP 2FA code generator with QR code output for authenticator apps, using crypto.getRandomValues for secret generation.",
  "applicationCategory": "SecurityApplication",
  "operatingSystem": "Any (Web Browser)",
  "isAccessibleForFree": true,
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
};

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const PERIOD = 30;
const DIGITS = 6;

function base32Decode(input) {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = "";
  for (const ch of clean) {
    const val = BASE32_ALPHABET.indexOf(ch);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, "0");
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substr(i, 8), 2));
  }
  return new Uint8Array(bytes);
}

function randomBase32Secret(length) {
  const bytes = new Uint8Array(length);
  window.crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += BASE32_ALPHABET[bytes[i] % 32];
  return out;
}

// RFC 6238 TOTP over RFC 4226 HOTP, using the browser's real HMAC-SHA1 —
// this is the same algorithm actual authenticator apps run, not a mockup.
async function computeTOTP(secretBase32) {
  const keyBytes = base32Decode(secretBase32);
  if (keyBytes.length === 0) return null;
  const counter = Math.floor(Date.now() / 1000 / PERIOD);
  const counterBuf = new ArrayBuffer(8);
  new DataView(counterBuf).setUint32(4, counter, false);
  try {
    const key = await window.crypto.subtle.importKey(
      "raw", keyBytes, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]
    );
    const sig = await window.crypto.subtle.sign("HMAC", key, counterBuf);
    const hmac = new Uint8Array(sig);
    const offset = hmac[hmac.length - 1] & 0xf;
    const binCode = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
    return (binCode % Math.pow(10, DIGITS)).toString().padStart(DIGITS, "0");
  } catch (e) {
    return null;
  }
}

function secondsRemaining() {
  return PERIOD - (Math.floor(Date.now() / 1000) % PERIOD);
}

class Boundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error("TOTP Generator crashed:", error, info); }
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

function TOTPInner() {
  const [booted, setBooted] = useState(false);
  const [secret, setSecret] = useState(function () { return randomBase32Secret(16); });
  const [account, setAccount] = useState("user@example.com");
  const [issuer, setIssuer] = useState("CipherForge");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [code, setCode] = useState("------");
  const [remaining, setRemaining] = useState(secondsRemaining());
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedUri, setCopiedUri] = useState(false);
  const [qrReady, setQrReady] = useState(false);

  useEffect(function () { document.title = "QR / TOTP Generator — CipherForge"; }, []);

  const otpauthUri = "otpauth://totp/" + encodeURIComponent(issuer + ":" + account) +
    "?secret=" + secret + "&issuer=" + encodeURIComponent(issuer) +
    "&algorithm=SHA1&digits=" + DIGITS + "&period=" + PERIOD;

  // Regenerate the QR whenever the underlying secret/account/issuer changes.
  useEffect(function () {
    let cancelled = false;
    setQrReady(false);
    QRCode.toDataURL(otpauthUri, { margin: 1, width: 220, color: { dark: "#39D97A", light: "#00000000" } })
      .then(function (url) { if (!cancelled) { setQrDataUrl(url); setQrReady(true); } })
      .catch(function () { if (!cancelled) setQrReady(false); });
    return function () { cancelled = true; };
  }, [otpauthUri]);

  // Live 6-digit code, recomputed every second, re-synced to the real time step.
  useEffect(function () {
    let cancelled = false;
    function tick() {
      computeTOTP(secret).then(function (c) { if (!cancelled && c) setCode(c); });
      setRemaining(secondsRemaining());
    }
    tick();
    const id = setInterval(tick, 1000);
    return function () { cancelled = true; clearInterval(id); };
  }, [secret]);

  function regenerateSecret() {
    setSecret(randomBase32Secret(16));
  }

  function copySecret() {
    navigator.clipboard.writeText(secret).then(function () {
      setCopiedSecret(true);
      setTimeout(function () { setCopiedSecret(false); }, 1500);
    }).catch(function () {});
  }
  function copyUri() {
    navigator.clipboard.writeText(otpauthUri).then(function () {
      setCopiedUri(true);
      setTimeout(function () { setCopiedUri(false); }, 1500);
    }).catch(function () {});
  }

  const ringPct = (remaining / PERIOD) * 100;
  const ringColor = remaining <= 5 ? C.danger : C.accent;

  return (
    <CipherBackdrop>
      <StructuredData data={totpGeneratorSchema} />
      <CipherFonts />
      <CipherFrameStyles />
      <style>{"@keyframes qrPopIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }"}</style>
      <div className="cf-frame" style={{
        background: C.bg, color: C.text, padding: "18px 16px", ...fontMono,
        border: "1px solid rgba(57,217,122,0.35)",
        boxShadow: "0 0 40px rgba(57,217,122,0.07), inset 0 0 70px rgba(0,0,0,0.5)",
      }}>
        <FrameFX />
        {!booted ? (
          <BootSequence lines={["INITIALIZING TOTP MODULE...", "DERIVING KEY MATERIAL...", "SYNCING CLOCK...", "READY."]}
            onDone={function () { setBooted(true); }} />
        ) : (
        <div style={{ position: "relative", zIndex: 1 }}>
          <a href="/" style={{ color: C.sub, textDecoration: "none", fontSize: 11, display: "inline-flex", alignItems: "center", gap: 5, marginBottom: 14 }}>
            <ArrowLeft size={13} /> BACK
          </a>

          <div style={{ textAlign: "center", marginBottom: 4 }}>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, letterSpacing: 1.5, color: C.accent,
              textShadow: "0 0 12px rgba(57,217,122,0.5)" }}>QR / TOTP GENERATOR</span>
          </div>
          <p style={{ fontSize: 10, color: C.mute, textAlign: "center", margin: "2px 0 18px", letterSpacing: 0.5 }}>
            SCAN IT — OR VERIFY IT RIGHT HERE FIRST
          </p>

          <label style={{ fontSize: 10, color: C.mute, display: "block", marginBottom: 4 }}>ACCOUNT / EMAIL</label>
          <input value={account} onChange={function (e) { setAccount(e.target.value); }} type="text" style={{
            width: "100%", background: C.card2, border: "1px solid " + C.border, borderRadius: 6,
            color: C.text, fontSize: 13, padding: "8px 10px", boxSizing: "border-box", marginBottom: 10, ...fontMono }} />

          <label style={{ fontSize: 10, color: C.mute, display: "block", marginBottom: 4 }}>ISSUER / SERVICE NAME</label>
          <input value={issuer} onChange={function (e) { setIssuer(e.target.value); }} type="text" style={{
            width: "100%", background: C.card2, border: "1px solid " + C.border, borderRadius: 6,
            color: C.text, fontSize: 13, padding: "8px 10px", boxSizing: "border-box", marginBottom: 14, ...fontMono }} />

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
            <div style={{
              width: 220, height: 220, background: C.card, border: "1px solid " + C.accent, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
            }}>
              {qrReady && qrDataUrl ? (
                <img src={qrDataUrl} alt="TOTP QR code" width={220} height={220} style={{ animation: "qrPopIn 0.25s ease" }} />
              ) : (
                <span style={{ fontSize: 10, color: C.mute }}>generating...</span>
              )}
            </div>
          </div>
          <p style={{ fontSize: 9, color: C.mute, textAlign: "center", margin: "6px 0 18px" }}>
            scan with your authenticator app
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 10, color: C.mute, flexShrink: 0 }}>SECRET</span>
            <span style={{ flex: 1, fontSize: 12, color: C.text, wordBreak: "break-all" }}>{secret}</span>
            <button onClick={copySecret} aria-label="Copy secret key" style={{ background: "none", border: "none", color: C.sub, cursor: "pointer", flexShrink: 0 }}>
              {copiedSecret ? <Check size={13} color={C.accent} /> : <Copy size={13} />}
            </button>
          </div>
          <button onClick={regenerateSecret} style={{
            display: "flex", alignItems: "center", gap: 5, background: "none", border: "1px solid " + C.border,
            borderRadius: 6, color: C.sub, fontSize: 11, padding: "6px 10px", cursor: "pointer", marginBottom: 18 }}>
            <RefreshCw size={11} /> Generate a new random secret
          </button>

          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 8, padding: "16px 14px", textAlign: "center" }}>
            <p style={{ fontSize: 9.5, color: C.mute, margin: "0 0 8px", letterSpacing: 0.5 }}>LIVE CODE — VERIFY BEFORE YOU COMMIT</p>
            <p style={{ fontSize: 30, color: C.accent, letterSpacing: 4, margin: "0 0 8px",
              textShadow: "0 0 8px rgba(57,217,122,0.4)" }}>{code}</p>
            <div style={{ height: 5, background: C.card2, borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
              <div style={{ height: "100%", width: ringPct + "%", background: ringColor,
                transition: "width 1s linear, background 0.3s ease" }} />
            </div>
            <p style={{ fontSize: 9.5, color: C.mute, margin: 0 }}>refreshes in {remaining}s</p>
          </div>

          <button onClick={copyUri} style={{
            width: "100%", marginTop: 12, padding: "9px 0", borderRadius: 6, border: "1px solid " + C.border,
            background: "none", color: C.sub, fontSize: 11, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", gap: 5 }}>
            {copiedUri ? <Check size={12} color={C.accent} /> : <Copy size={12} />}
            {copiedUri ? "Copied" : "Copy otpauth:// URI"}
          </button>

          <p style={{ fontSize: 9, color: C.mute, textAlign: "center", marginTop: 18, lineHeight: 1.5 }}>
            The code shown is computed live in your browser using the real TOTP algorithm (RFC 6238) — the same one your authenticator app uses. Nothing here is sent anywhere.
          </p>
        </div>
        )}
      </div>
    </CipherBackdrop>
  );
}

export default function TOTPGenerator() {
  return (
    <Boundary>
      <TOTPInner />
    </Boundary>
  );
}
