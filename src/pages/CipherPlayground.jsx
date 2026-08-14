import { useState, useMemo, Component } from "react";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { C, fontMono, CipherFonts, CipherFrameStyles, CipherBackdrop, FrameFX } from "../components/CipherChrome";

function caesarShift(str, shift) {
  return str.replace(/[a-zA-Z]/g, function (ch) {
    const base = ch <= "Z" ? 65 : 97;
    return String.fromCharCode(((ch.charCodeAt(0) - base + shift) % 26 + 26) % 26 + base);
  });
}

function xorCipher(str, key) {
  if (!key) return str;
  let out = "";
  for (let i = 0; i < str.length; i++) {
    out += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return out;
}
// XOR output is often unprintable, so display/copy as hex.
function toHex(str) {
  return Array.from(str).map(function (c) { return c.charCodeAt(0).toString(16).padStart(2, "0"); }).join(" ");
}
function fromHex(hex) {
  const bytes = hex.trim().split(/\s+/).filter(Boolean);
  return bytes.map(function (b) { return String.fromCharCode(parseInt(b, 16) || 0); }).join("");
}

function safeBase64Encode(str) {
  try { return btoa(unescape(encodeURIComponent(str))); } catch (e) { return "ERROR: could not encode"; }
}
function safeBase64Decode(str) {
  try { return decodeURIComponent(escape(atob(str))); } catch (e) { return "ERROR: invalid Base64 input"; }
}

const CIPHERS = {
  caesar: { label: "Caesar Shift" },
  rot13: { label: "ROT13" },
  base64: { label: "Base64" },
  xor: { label: "XOR" },
};

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error("Cipher Playground crashed:", error, info); }
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

function PlaygroundInner() {
  const [cipher, setCipher] = useState("caesar");
  const [mode, setMode] = useState("encode");
  const [input, setInput] = useState("");
  const [shift, setShift] = useState(3);
  const [xorKey, setXorKey] = useState("key");
  const [copied, setCopied] = useState(false);

  const output = useMemo(function () {
    if (!input) return "";
    if (cipher === "caesar") {
      return caesarShift(input, mode === "encode" ? shift : -shift);
    }
    if (cipher === "rot13") {
      return caesarShift(input, 13); // ROT13 is its own inverse
    }
    if (cipher === "base64") {
      return mode === "encode" ? safeBase64Encode(input) : safeBase64Decode(input);
    }
    if (cipher === "xor") {
      if (mode === "encode") return toHex(xorCipher(input, xorKey));
      return xorCipher(fromHex(input), xorKey);
    }
    return "";
  }, [input, cipher, mode, shift, xorKey]);

  function handleCopy() {
    if (!output) return;
    navigator.clipboard.writeText(output).then(function () {
      setCopied(true);
      setTimeout(function () { setCopied(false); }, 1500);
    }).catch(function () {});
  }

  const showModeToggle = cipher === "caesar" || cipher === "base64" || cipher === "xor";

  return (
    <CipherBackdrop>
      <CipherFonts />
      <CipherFrameStyles />
      <div className="cf-frame" style={{
        background: C.bg, color: C.text, padding: "18px 16px", ...fontMono,
        border: "1px solid rgba(57,217,122,0.35)",
        boxShadow: "0 0 40px rgba(57,217,122,0.07), inset 0 0 70px rgba(0,0,0,0.5)",
      }}>
        <FrameFX />
        <div style={{ position: "relative", zIndex: 1 }}>
          <a href="/" style={{ color: C.sub, textDecoration: "none", fontSize: 11, display: "inline-flex", alignItems: "center", gap: 5, marginBottom: 14 }}>
            <ArrowLeft size={13} /> BACK
          </a>

          <div style={{ textAlign: "center", marginBottom: 4 }}>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 19, letterSpacing: 1.5, color: C.accent,
              textShadow: "0 0 12px rgba(57,217,122,0.5)" }}>CIPHER PLAYGROUND</span>
          </div>
          <p style={{ fontSize: 10, color: C.mute, textAlign: "center", margin: "2px 0 18px", letterSpacing: 0.5 }}>
            CLASSIC ENCODING // DECODING SANDBOX
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5, marginBottom: 12 }}>
            {Object.entries(CIPHERS).map(function (entry) {
              const key = entry[0]; const c = entry[1];
              const active = cipher === key;
              return (
                <button key={key} onClick={function () { setCipher(key); setMode("encode"); }} style={{
                  padding: "8px 2px", fontSize: 10, borderRadius: 5, cursor: "pointer",
                  background: active ? C.accentDark : "none", border: "1px solid " + (active ? C.accent : C.border),
                  color: active ? C.accent : C.sub }}>{c.label}</button>
              );
            })}
          </div>

          {showModeToggle && (
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {["encode", "decode"].map(function (m) {
                const active = mode === m;
                return (
                  <button key={m} onClick={function () { setMode(m); }} style={{
                    flex: 1, padding: "7px 0", fontSize: 11, borderRadius: 5, cursor: "pointer",
                    background: active ? C.accentDark : "none", border: "1px solid " + (active ? C.accent : C.border),
                    color: active ? C.accent : C.sub, textTransform: "uppercase" }}>{m}</button>
                );
              })}
            </div>
          )}

          {cipher === "caesar" && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, color: C.mute, display: "block", marginBottom: 4 }}>SHIFT: {shift}</label>
              <input type="range" min="1" max="25" value={shift} onChange={function (e) { setShift(Number(e.target.value)); }}
                style={{ width: "100%", accentColor: C.accent }} />
            </div>
          )}
          {cipher === "xor" && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, color: C.mute, display: "block", marginBottom: 4 }}>KEY</label>
              <input value={xorKey} onChange={function (e) { setXorKey(e.target.value); }} type="text" style={{
                width: "100%", background: C.card2, border: "1px solid " + C.border, borderRadius: 6,
                color: C.text, fontSize: 13, padding: "8px 10px", boxSizing: "border-box", ...fontMono }} />
            </div>
          )}

          <label style={{ fontSize: 10, color: C.mute, display: "block", marginBottom: 4 }}>
            {cipher === "xor" && mode === "decode" ? "INPUT (hex bytes)" : "INPUT"}
          </label>
          <textarea value={input} onChange={function (e) { setInput(e.target.value); }} rows={4}
            placeholder={cipher === "xor" && mode === "decode" ? "4a 1e 0f 33 ..." : "type something..."} style={{
              width: "100%", background: C.card2, border: "1px solid " + C.border, borderRadius: 6,
              color: C.text, fontSize: 13, padding: "10px 12px", resize: "vertical", boxSizing: "border-box",
              marginBottom: 12, ...fontMono }} />

          <div style={{
            background: C.card, border: "1px solid " + C.accent, borderRadius: 8, padding: "12px 14px", marginBottom: 10,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 9.5, color: C.mute, letterSpacing: 0.5 }}>OUTPUT</span>
              <button onClick={handleCopy} style={{ background: "none", border: "none", color: C.sub, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4, fontSize: 10 }}>
                {copied ? <Check size={12} color={C.accent} /> : <Copy size={12} />}
                {copied ? "COPIED" : "COPY"}
              </button>
            </div>
            <p style={{ fontSize: 14, color: C.accent, margin: 0, wordBreak: "break-all", lineHeight: 1.5,
              textShadow: "0 0 6px rgba(57,217,122,0.35)", minHeight: 20 }}>
              {output || "—"}
            </p>
          </div>

          <p style={{ fontSize: 9, color: C.mute, textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
            These are classic/educational ciphers, not secure encryption. Don't use them to protect anything sensitive — for that, use the Password Generator.
          </p>
        </div>
      </div>
    </CipherBackdrop>
  );
}

export default function CipherPlayground() {
  return (
    <ErrorBoundary>
      <PlaygroundInner />
    </ErrorBoundary>
  );
}
