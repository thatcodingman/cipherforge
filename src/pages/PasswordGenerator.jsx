import { useState, useEffect, useRef, useMemo, Component } from "react";
import { Copy, Check, RefreshCw, Settings, X, Zap } from "lucide-react";
import { C, fontMono, CipherFonts, CipherFrameStyles, CipherBackdrop, FrameFX, BootSequence } from "../components/CipherChrome";

const CHARSETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};
const AMBIGUOUS = "il1Lo0O";

const WORDLIST = ["nebula","cipher","quartz","vortex","ember","glacier","onyx","zenith","tundra","phantom",
  "circuit","plasma","comet","raven","forge","binary","echo","crimson","frost","ion",
  "lunar","matrix","nova","orbit","pulse","quantum","rift","shadow","titan","umbra",
  "vector","widget","xenon","yield","zephyr","anchor","blade","cinder","drift","flux"];

function randInt(max) {
  const arr = new Uint32Array(1);
  window.crypto.getRandomValues(arr);
  return arr[0] % max;
}
function randChar(str) { return str[randInt(str.length)]; }

function generatePassword(opts) {
  if (opts.mode === "passphrase") {
    const words = [];
    for (let i = 0; i < opts.wordCount; i++) words.push(WORDLIST[randInt(WORDLIST.length)]);
    let phrase = words.join(opts.separator);
    if (opts.numbers) phrase += randInt(90) + 10;
    return phrase;
  }
  let pool = "";
  if (opts.lower) pool += CHARSETS.lower;
  if (opts.upper) pool += CHARSETS.upper;
  if (opts.numbers) pool += CHARSETS.numbers;
  if (opts.symbols) pool += CHARSETS.symbols;
  if (opts.excludeAmbiguous) pool = pool.split("").filter(function (c) { return AMBIGUOUS.indexOf(c) === -1; }).join("");
  if (!pool) pool = CHARSETS.lower;
  let out = "";
  for (let i = 0; i < opts.length; i++) out += randChar(pool);
  return out;
}

function entropyBits(str, opts) {
  if (opts.mode === "passphrase") {
    return Math.log2(WORDLIST.length) * opts.wordCount + (opts.numbers ? Math.log2(90) : 0);
  }
  let poolSize = 0;
  if (opts.lower) poolSize += 26;
  if (opts.upper) poolSize += 26;
  if (opts.numbers) poolSize += 10;
  if (opts.symbols) poolSize += CHARSETS.symbols.length;
  if (poolSize === 0) poolSize = 26;
  return str.length * Math.log2(poolSize);
}

function estimatePoolSize(str) {
  let pool = 0;
  if (/[a-z]/.test(str)) pool += 26;
  if (/[A-Z]/.test(str)) pool += 26;
  if (/[0-9]/.test(str)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(str)) pool += 33;
  return pool || 26;
}

const ATTACKERS = [
  { label: "Bored hacker's laptop", rate: 1e6 },
  { label: "Gaming GPU rig", rate: 1e10 },
  { label: "Criminal botnet", rate: 1e12 },
  { label: "Nation-state datacenter", rate: 1e15 },
];

function formatDuration(seconds) {
  if (seconds < 1) return "instantly";
  const units = [
    ["millennia", 31557600000], ["centuries", 3155760000], ["years", 31557600],
    ["days", 86400], ["hours", 3600], ["minutes", 60], ["seconds", 1],
  ];
  if (seconds > 31557600 * 1e6) return "longer than the heat death of the universe";
  for (let i = 0; i < units.length; i++) {
    const [label, size] = units[i];
    if (seconds >= size) {
      const val = seconds / size;
      const formatted = val >= 1000 ? val.toExponential(2) : val.toFixed(val >= 10 ? 0 : 1);
      return formatted + " " + label;
    }
  }
  return "instantly";
}

function strengthVerdict(bits) {
  if (bits < 28) return { label: "TRIVIAL", color: C.danger };
  if (bits < 45) return { label: "WEAK", color: C.danger };
  if (bits < 60) return { label: "FAIR", color: C.warn };
  if (bits < 80) return { label: "STRONG", color: C.safe };
  return { label: "FORTRESS", color: C.accent };
}

function useScrambleReveal(target, trigger) {
  const [display, setDisplay] = useState(target);
  const frameRef = useRef(null);
  useEffect(function () {
    if (!target) { setDisplay(""); return; }
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let iteration = 0;
    const totalFrames = 14;
    clearInterval(frameRef.current);
    frameRef.current = setInterval(function () {
      setDisplay(function () {
        return target.split("").map(function (ch, idx) {
          const settlePoint = (idx / target.length) * totalFrames;
          if (iteration > settlePoint + 4) return ch;
          return chars[randInt(chars.length)];
        }).join("");
      });
      iteration++;
      if (iteration > totalFrames + 6) {
        clearInterval(frameRef.current);
        setDisplay(target);
      }
    }, 30);
    return function () { clearInterval(frameRef.current); };
  }, [target, trigger]);
  return display;
}

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error("CipherForge generator crashed:", error, info); }
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

function GeneratorInner() {
  const [booted, setBooted] = useState(false);
  const [mode, setMode] = useState("random");
  const [length, setLength] = useState(16);
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState("-");
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [password, setPassword] = useState("");
  const [genTick, setGenTick] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [checkInput, setCheckInput] = useState("");
  const [attackerIdx, setAttackerIdx] = useState(1);

  useEffect(function () { document.title = "Password Generator — CipherForge"; }, []);

  const opts = { mode: mode, length: length, wordCount: wordCount, separator: separator,
    lower: lower, upper: upper, numbers: numbers, symbols: symbols, excludeAmbiguous: excludeAmbiguous };

  function handleGenerate() {
    const pw = generatePassword(opts);
    setPassword(pw);
    setGenTick(function (t) { return t + 1; });
    setCopied(false);
  }
  useEffect(function () { if (booted) handleGenerate(); }, [booted, mode, length, wordCount, separator, lower, upper, numbers, symbols, excludeAmbiguous]);

  const displayPw = useScrambleReveal(password, genTick);
  const bits = useMemo(function () { return entropyBits(password, opts); }, [password, mode, length, wordCount, lower, upper, numbers, symbols]);
  const verdict = strengthVerdict(bits);
  const attacker = ATTACKERS[attackerIdx];
  const crackSeconds = Math.pow(2, bits) / attacker.rate / 2;

  const checkBits = checkInput ? checkInput.length * Math.log2(estimatePoolSize(checkInput)) : 0;
  const checkVerdict = strengthVerdict(checkBits);
  const checkSeconds = checkInput ? Math.pow(2, checkBits) / attacker.rate / 2 : 0;

  function handleCopy() {
    if (!password) return;
    navigator.clipboard.writeText(password).then(function () {
      setCopied(true);
      setTimeout(function () { setCopied(false); }, 1500);
    }).catch(function () {});
  }

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
        {!booted ? (
          <BootSequence lines={["INITIALIZING CIPHERFORGE...", "LOADING ENTROPY POOL...", "CRYPTO MODULE ONLINE.", "READY."]}
            onDone={function () { setBooted(true); }} />
        ) : (
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <a href="/" style={{ color: C.sub, textDecoration: "none", fontSize: 11 }}>&lt; BACK</a>
              <button onClick={function () { setShowSettings(!showSettings); }} aria-label="Appearance and length settings" style={{
                background: showSettings ? C.accentDark : "none", border: "1px solid " + (showSettings ? C.accent : C.border),
                color: showSettings ? C.accent : C.sub, borderRadius: 4, padding: "5px 8px", cursor: "pointer" }}>
                <Settings size={13} />
              </button>
            </div>

            <div style={{ textAlign: "center", marginBottom: 4 }}>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 20, letterSpacing: 2, color: C.accent,
                textShadow: "0 0 12px rgba(57,217,122,0.5)" }}>CIPHERFORGE</span>
            </div>
            <p style={{ fontSize: 10.5, color: C.mute, textAlign: "center", margin: "2px 0 18px", letterSpacing: 0.5 }}>
              PASSWORD GENERATOR // STRENGTH ANALYSIS
            </p>

            {showSettings && (
              <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 8, padding: 12, marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <p style={{ fontSize: 10.5, color: C.mute, margin: 0 }}>CONFIG</p>
                  <button onClick={function () { setShowSettings(false); }} style={{ background: "none", border: "none", color: C.sub, cursor: "pointer" }}>
                    <X size={13} />
                  </button>
                </div>
                <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                  {["random", "passphrase"].map(function (m) {
                    const active = mode === m;
                    return (
                      <button key={m} onClick={function () { setMode(m); }} style={{
                        flex: 1, padding: "7px 0", fontSize: 10.5, borderRadius: 4, cursor: "pointer",
                        background: active ? C.accentDark : "none", border: "1px solid " + (active ? C.accent : C.border),
                        color: active ? C.accent : C.sub, textTransform: "uppercase" }}>{m}</button>
                    );
                  })}
                </div>

                {mode === "random" ? (
                  <div>
                    <label style={{ fontSize: 10, color: C.mute, display: "block", marginBottom: 4 }}>LENGTH: {length}</label>
                    <input type="range" min="6" max="64" value={length} onChange={function (e) { setLength(Number(e.target.value)); }}
                      style={{ width: "100%", accentColor: C.accent, marginBottom: 12 }} />
                    {[["Lowercase", lower, setLower], ["Uppercase", upper, setUpper], ["Numbers", numbers, setNumbers],
                      ["Symbols", symbols, setSymbols], ["Exclude ambiguous (il1Lo0O)", excludeAmbiguous, setExcludeAmbiguous]].map(function (row) {
                      return (
                        <button key={row[0]} onClick={function () { row[2](!row[1]); }} style={{
                          display: "flex", alignItems: "center", gap: 8, background: "none", border: "none",
                          cursor: "pointer", padding: "5px 0", width: "100%" }}>
                          <div style={{ width: 14, height: 14, borderRadius: 3, border: "1px solid " + (row[1] ? C.accent : C.border),
                            background: row[1] ? C.accentDark : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {row[1] && <Check size={10} color={C.accent} />}
                          </div>
                          <span style={{ fontSize: 11, color: C.sub }}>{row[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div>
                    <label style={{ fontSize: 10, color: C.mute, display: "block", marginBottom: 4 }}>WORDS: {wordCount}</label>
                    <input type="range" min="3" max="8" value={wordCount} onChange={function (e) { setWordCount(Number(e.target.value)); }}
                      style={{ width: "100%", accentColor: C.accent, marginBottom: 10 }} />
                    <label style={{ fontSize: 10, color: C.mute, display: "block", marginBottom: 4 }}>SEPARATOR</label>
                    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                      {["-", "_", ".", " "].map(function (s) {
                        const active = separator === s;
                        return (
                          <button key={s} onClick={function () { setSeparator(s); }} style={{
                            flex: 1, padding: "6px 0", fontSize: 11, borderRadius: 4, cursor: "pointer",
                            background: active ? C.accentDark : "none", border: "1px solid " + (active ? C.accent : C.border),
                            color: active ? C.accent : C.sub }}>{s === " " ? "space" : s}</button>
                        );
                      })}
                    </div>
                    <button onClick={function () { setNumbers(!numbers); }} style={{
                      display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: "5px 0" }}>
                      <div style={{ width: 14, height: 14, borderRadius: 3, border: "1px solid " + (numbers ? C.accent : C.border),
                        background: numbers ? C.accentDark : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {numbers && <Check size={10} color={C.accent} />}
                      </div>
                      <span style={{ fontSize: 11, color: C.sub }}>Append number</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <div style={{
              background: C.card, border: "1px solid " + C.accent, borderRadius: 8, padding: "16px 14px", marginBottom: 10,
            }}>
              <p style={{
                fontSize: 17, color: C.accent, margin: 0, wordBreak: "break-all", lineHeight: 1.5,
                textShadow: "0 0 8px rgba(57,217,122,0.4)", minHeight: 26,
              }}>{displayPw || " "}</p>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button onClick={handleGenerate} style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                background: C.accent, border: "none", borderRadius: 6, color: "#020803", fontSize: 12, fontWeight: 700,
                padding: "10px 0", cursor: "pointer", textTransform: "uppercase", letterSpacing: 0.5 }}>
                <RefreshCw size={13} /> Regenerate
              </button>
              <button onClick={handleCopy} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: 100,
                background: "none", border: "1px solid " + C.border, borderRadius: 6, color: C.sub, fontSize: 12,
                cursor: "pointer" }}>
                {copied ? <Check size={13} color={C.accent} /> : <Copy size={13} />}
                {copied ? "COPIED" : "COPY"}
              </button>
            </div>

            <EntropyPanel bits={bits} verdict={verdict} attacker={attacker} attackerIdx={attackerIdx}
              setAttackerIdx={setAttackerIdx} crackSeconds={crackSeconds} title="THIS PASSWORD" />

            <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px dashed " + C.border }}>
              <p style={{ fontSize: 11, color: C.sub, margin: "0 0 4px", letterSpacing: 0.5 }}>&gt; STRENGTH SCANNER</p>
              <p style={{ fontSize: 9.5, color: C.mute, margin: "0 0 10px", lineHeight: 1.5 }}>
                Test any password. Analysis runs entirely in your browser — nothing typed here is ever sent anywhere.
              </p>
              <input value={checkInput} onChange={function (e) { setCheckInput(e.target.value); }}
                type="text" placeholder="paste a password to analyze..." style={{
                  width: "100%", background: C.card2, border: "1px solid " + C.border, borderRadius: 6,
                  color: C.text, fontSize: 13, padding: "9px 11px", boxSizing: "border-box", marginBottom: 12, ...fontMono }} />
              {checkInput && (
                <EntropyPanel bits={checkBits} verdict={checkVerdict} attacker={attacker} attackerIdx={attackerIdx}
                  setAttackerIdx={setAttackerIdx} crackSeconds={checkSeconds} title="SCANNED INPUT" hideAttackerPicker />
              )}
            </div>

            <p style={{ fontSize: 9, color: C.mute, textAlign: "center", marginTop: 20, lineHeight: 1.5 }}>
              Generated with your browser's cryptographically secure random number generator (crypto.getRandomValues). Crack-time estimates are illustrative approximations, not guarantees.
            </p>
          </div>
        )}
      </div>
    </CipherBackdrop>
  );
}

function EntropyPanel({ bits, verdict, attacker, attackerIdx, setAttackerIdx, crackSeconds, title, hideAttackerPicker }) {
  const pct = Math.min(100, (bits / 100) * 100);
  return (
    <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 8, padding: "12px 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 9.5, color: C.mute, letterSpacing: 0.5 }}>{title}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: verdict.color, letterSpacing: 1 }}>{verdict.label}</span>
      </div>
      <div style={{ height: 6, background: C.card2, borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
        <div style={{
          height: "100%", width: pct + "%", background: verdict.color, borderRadius: 3,
          transition: "width 0.4s ease, background 0.4s ease", boxShadow: "0 0 8px " + verdict.color,
        }} />
      </div>
      <p style={{ fontSize: 10, color: C.mute, margin: "0 0 10px" }}>{bits.toFixed(1)} bits of entropy</p>

      {!hideAttackerPicker && (
        <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
          {ATTACKERS.map(function (a, i) {
            const active = attackerIdx === i;
            return (
              <button key={a.label} onClick={function () { setAttackerIdx(i); }} style={{
                fontSize: 9, padding: "4px 6px", borderRadius: 4, cursor: "pointer",
                background: active ? C.accentDark : "none", border: "1px solid " + (active ? C.accent : C.border),
                color: active ? C.accent : C.mute }}>{a.label}</button>
            );
          })}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Zap size={12} color={C.accent} />
        <p style={{ fontSize: 11, color: C.text, margin: 0 }}>
          <span style={{ color: C.mute }}>{attacker.label} would need:</span>{" "}
          <strong style={{ color: verdict.color }}>{formatDuration(crackSeconds)}</strong>
        </p>
      </div>
    </div>
  );
}

export default function CipherForgeGenerator() {
  return (
    <ErrorBoundary>
      <GeneratorInner />
    </ErrorBoundary>
  );
}
