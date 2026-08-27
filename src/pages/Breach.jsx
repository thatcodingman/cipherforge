import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Zap, Shield, Trophy } from "lucide-react";
import { C, fontMono, CipherFonts, CipherFrameStyles, CipherBackdrop, FrameFX, BootSequence } from "../components/CipherChrome";
import StructuredData from "../components/StructuredData";

const breachGameSchema = {
  "@context": "https://schema.org",
  "@type": "Game",
  "name": "Breach",
  "url": "https://getcipherforge.com/breach",
  "description": "Free browser-based reflex and defense game with 4 difficulty tiers and personal-best tracking, part of the CipherForge security toolkit.",
  "applicationCategory": "Game",
  "operatingSystem": "Any (Web Browser)",
  "isAccessibleForFree": true,
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
};

const TIERS = [
  { label: "Bored hacker's laptop", drip: 2.2, spawnMin: 1300, spawnMax: 1800, window: 1500, hitRelief: 5, missPenalty: 7,
    color: C.safe, tagline: "Forgiving pace — plenty of time to react", intensity: 1 },
  { label: "Gaming GPU rig", drip: 3.2, spawnMin: 1050, spawnMax: 1500, window: 1250, hitRelief: 5, missPenalty: 9,
    color: C.warn, tagline: "Nodes come quicker, ring closes faster", intensity: 2 },
  { label: "Criminal botnet", drip: 4.4, spawnMin: 800, spawnMax: 1200, window: 1000, hitRelief: 4.5, missPenalty: 11,
    color: "#FF8C42", tagline: "Fast reflexes required, misses hurt", intensity: 3 },
  { label: "Nation-state datacenter", drip: 5.8, spawnMin: 600, spawnMax: 950, window: 780, hitRelief: 4, missPenalty: 14,
    color: C.danger, tagline: "Elite pace — blink and you're breached", intensity: 4 },
];

const SAFE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // excludes I/L/O/0/1 to avoid ambiguity
const SPOTS = [
  { x: 18, y: 20 }, { x: 50, y: 15 }, { x: 82, y: 22 }, { x: 15, y: 50 },
  { x: 50, y: 55 }, { x: 85, y: 50 }, { x: 20, y: 80 }, { x: 50, y: 85 }, { x: 80, y: 80 },
];

const BEST_KEY = "breach-best-v1";
function loadBest() {
  try { const raw = window.localStorage.getItem(BEST_KEY); if (raw) return JSON.parse(raw); } catch (e) {}
  return {};
}
function saveBest(map) {
  try { window.localStorage.setItem(BEST_KEY, JSON.stringify(map)); } catch (e) {}
}

function randChar() { return SAFE_CHARS[Math.floor(Math.random() * SAFE_CHARS.length)]; }
function randSpot(excludeIdx) {
  let idx;
  do { idx = Math.floor(Math.random() * SPOTS.length); } while (idx === excludeIdx && SPOTS.length > 1);
  return idx;
}

// Small 1-4 filled/empty bar readout so difficulty is visible at a glance,
// not just implied by a label.
function IntensityBars({ level, color }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4].map(function (i) {
        return (
          <div key={i} style={{
            width: 5, height: 12, borderRadius: 1,
            background: i <= level ? color : C.border,
          }} />
        );
      })}
    </div>
  );
}

export default function Breach() {
  const [booted, setBooted] = useState(false);
  const [phase, setPhase] = useState("select"); // select | playing | over
  const [tierIdx, setTierIdx] = useState(0);
  const [best, setBest] = useState(loadBest);
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [prompt, setPrompt] = useState(null); // { char, spotIdx, id, window }
  const [shake, setShake] = useState(false);
  const [flashHit, setFlashHit] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);

  const runningRef = useRef(false);
  const spawnTimeoutRef = useRef(null);
  const expireTimeoutRef = useRef(null);
  const dripIntervalRef = useRef(null);
  const startRef = useRef(0);
  const lastSpotRef = useRef(-1);
  const progressRef = useRef(0);

  useEffect(function () { document.title = "Breach — CipherForge"; }, []);

  function clearAllTimers() {
    clearTimeout(spawnTimeoutRef.current);
    clearTimeout(expireTimeoutRef.current);
    clearInterval(dripIntervalRef.current);
  }

  function endGame() {
    runningRef.current = false;
    clearAllTimers();
    setPrompt(null);
    const tierLabel = TIERS[tierIdx].label;
    const prevBest = best[tierLabel] || 0;
    if (score > prevBest) {
      const next = Object.assign({}, best, { [tierLabel]: score });
      setBest(next);
      saveBest(next);
      setIsNewBest(true);
    } else {
      setIsNewBest(false);
    }
    setPhase("over");
  }

  function spawnPrompt() {
    if (!runningRef.current) return;
    const cfg = TIERS[tierIdx];
    const spotIdx = randSpot(lastSpotRef.current);
    lastSpotRef.current = spotIdx;
    const id = Math.random().toString(36).slice(2);
    setPrompt({ char: randChar(), spotIdx: spotIdx, id: id, window: cfg.window });

    expireTimeoutRef.current = setTimeout(function () {
      if (!runningRef.current) return;
      setCombo(0);
      setShake(true);
      setTimeout(function () { setShake(false); }, 260);
      progressRef.current = Math.min(100, progressRef.current + cfg.missPenalty);
      setProgress(progressRef.current);
      setPrompt(null);
      if (progressRef.current >= 100) { endGame(); return; }
      scheduleNextSpawn();
    }, cfg.window);
  }

  function scheduleNextSpawn() {
    if (!runningRef.current) return;
    const cfg = TIERS[tierIdx];
    const delay = cfg.spawnMin + Math.random() * (cfg.spawnMax - cfg.spawnMin);
    spawnTimeoutRef.current = setTimeout(spawnPrompt, delay);
  }

  function handleHit() {
    if (!runningRef.current || !prompt) return;
    clearTimeout(expireTimeoutRef.current);
    const cfg = TIERS[tierIdx];
    setCombo(function (c) {
      const next = c + 1;
      setBestCombo(function (b) { return Math.max(b, next); });
      setScore(function (s) { return s + Math.round(10 * (1 + Math.min(next - 1, 20) * 0.08)); });
      return next;
    });
    progressRef.current = Math.max(0, progressRef.current - cfg.hitRelief);
    setProgress(progressRef.current);
    setFlashHit(true);
    setTimeout(function () { setFlashHit(false); }, 150);
    setPrompt(null);
    scheduleNextSpawn();
  }

  useEffect(function () {
    if (phase !== "playing") return;
    function onKeyDown(e) {
      if (e.repeat) return; // ignore held-key auto-repeat so one press can't double-count
      if (!prompt) return;
      if (e.key.toUpperCase() === prompt.char) handleHit();
    }
    window.addEventListener("keydown", onKeyDown);
    return function () { window.removeEventListener("keydown", onKeyDown); };
  }, [phase, prompt, tierIdx]);

  function startGame() {
    runningRef.current = true;
    progressRef.current = 0;
    startRef.current = Date.now();
    setProgress(0);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setElapsed(0);
    setPrompt(null);
    setPhase("playing");

    dripIntervalRef.current = setInterval(function () {
      if (!runningRef.current) return;
      const cfg = TIERS[tierIdx];
      progressRef.current = Math.min(100, progressRef.current + cfg.drip / 10);
      setProgress(progressRef.current);
      setElapsed((Date.now() - startRef.current) / 1000);
      if (progressRef.current >= 100) endGame();
    }, 100);

    scheduleNextSpawn();
  }

  useEffect(function () {
    return function () { runningRef.current = false; clearAllTimers(); };
  }, []);

  const tier = TIERS[tierIdx];

  return (
    <CipherBackdrop>
      <StructuredData data={breachGameSchema} />
      <CipherFonts />
      <CipherFrameStyles />
      <style>{"\
        @keyframes brNodeIn { from { transform: scale(0.3); opacity: 0; } to { transform: scale(1); opacity: 1; } }\
        @keyframes brRingShrink { from { transform: scale(1); opacity: 0.9; } to { transform: scale(0.15); opacity: 0; } }\
        @keyframes brShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }\
        @keyframes brPulseBad { 0%, 100% { box-shadow: 0 0 12px rgba(255,71,87,0.3); } 50% { box-shadow: 0 0 24px rgba(255,71,87,0.6); } }\
        @keyframes brFadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }\
      "}</style>
      <div className="cf-frame" style={{
        background: C.bg, color: C.text, padding: "18px 16px", ...fontMono,
        border: "1px solid rgba(57,217,122,0.35)",
        boxShadow: "0 0 40px rgba(57,217,122,0.07), inset 0 0 70px rgba(0,0,0,0.5)",
        animation: shake ? "brShake 0.26s ease" : "none",
      }}>
        <FrameFX />
        {!booted ? (
          <BootSequence lines={["INITIALIZING BREACH...", "SPINNING UP INTRUSION SIM...", "STANDING BY."]}
            onDone={function () { setBooted(true); }} />
        ) : (
        <div style={{ position: "relative", zIndex: 1, animation: "brFadeUp 0.35s ease" }}>
          <a href="/" style={{ color: C.sub, textDecoration: "none", fontSize: 11, display: "inline-flex", alignItems: "center", gap: 5, marginBottom: 12 }}>
            <ArrowLeft size={13} /> BACK
          </a>

          <div style={{ textAlign: "center", marginBottom: 4 }}>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, letterSpacing: 2, color: C.accent,
              textShadow: "0 0 12px rgba(57,217,122,0.5)" }}>BREACH</span>
          </div>

          {phase === "select" && (
            <div>
              <p style={{ fontSize: 10.5, color: C.mute, textAlign: "center", margin: "2px 0 20px", letterSpacing: 0.5 }}>
                SOMETHING IS TRYING TO CRACK YOU. HOLD IT OFF.
              </p>
              <p style={{ fontSize: 11, color: C.sub, textAlign: "center", margin: "0 0 14px", lineHeight: 1.6 }}>
                A node lights up with a letter — press that key before it expires. Miss it, and the intrusion bar climbs. Fill the bar, system's breached.
              </p>
              <p style={{ fontSize: 10, color: C.mute, margin: "0 0 8px", letterSpacing: 0.5 }}>SELECT ATTACKER</p>
              {TIERS.map(function (t, i) {
                const active = tierIdx === i;
                const tierBest = best[t.label];
                return (
                  <button key={t.label} onClick={function () { setTierIdx(i); }} style={{
                    display: "block", width: "100%", textAlign: "left", padding: "10px 12px", marginBottom: 6,
                    borderRadius: 6, cursor: "pointer",
                    background: active ? t.color + "22" : C.card, border: "1px solid " + (active ? t.color : C.border),
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.3, color: active ? t.color : C.sub, fontWeight: active ? 700 : 400 }}>
                        {t.label}
                      </span>
                      <IntensityBars level={t.intensity} color={t.color} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 10, color: C.mute }}>{t.tagline}</span>
                      <span style={{ fontSize: 9.5, color: C.mute, flexShrink: 0, marginLeft: 8 }}>{tierBest ? "BEST " + tierBest : "—"}</span>
                    </div>
                  </button>
                );
              })}
              <button onClick={startGame} style={{
                width: "100%", marginTop: 14, padding: "12px 0", borderRadius: 6, border: "none",
                background: tier.color, color: "#020803", fontSize: 13, fontWeight: 700, cursor: "pointer",
                textTransform: "uppercase", letterSpacing: 0.5 }}>
                Start Breach
              </button>
            </div>
          )}

          {phase === "playing" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: C.mute }}>SCORE <strong style={{ color: C.text }}>{score}</strong></span>
                <span style={{ fontSize: 10, color: C.mute }}>COMBO <strong style={{ color: combo > 4 ? C.accent : C.text }}>x{combo}</strong></span>
                <span style={{ fontSize: 10, color: C.mute }}>{elapsed.toFixed(1)}s</span>
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 9, color: C.mute, letterSpacing: 0.5 }}>INTRUSION PROGRESS</span>
                  <span style={{ fontSize: 9, color: progress > 70 ? C.danger : C.mute }}>{progress.toFixed(0)}%</span>
                </div>
                <div style={{ height: 8, background: C.card2, borderRadius: 4, overflow: "hidden",
                  animation: progress > 75 ? "brPulseBad 0.7s ease-in-out infinite" : "none" }}>
                  <div style={{
                    height: "100%", width: progress + "%",
                    background: progress > 75 ? C.danger : progress > 45 ? C.warn : C.accent,
                    transition: "width 0.15s linear, background 0.3s ease",
                  }} />
                </div>
              </div>

              <div style={{
                position: "relative", height: 260, background: C.card, border: "1px solid " + C.border,
                borderRadius: 8, overflow: "hidden",
                boxShadow: flashHit ? "inset 0 0 30px rgba(57,217,122,0.4)" : "none",
                transition: "box-shadow 0.15s ease",
              }}>
                {prompt && (
                  <div key={prompt.id}
                    onClick={handleHit}
                    style={{
                      position: "absolute", left: SPOTS[prompt.spotIdx].x + "%", top: SPOTS[prompt.spotIdx].y + "%",
                      transform: "translate(-50%, -50%)", width: 46, height: 46, cursor: "pointer",
                      animation: "brNodeIn 0.15s ease",
                    }}>
                    <div style={{
                      position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid " + C.accent,
                      animation: "brRingShrink " + prompt.window + "ms linear forwards", pointerEvents: "none",
                    }} />
                    <div style={{
                      position: "absolute", inset: 6, borderRadius: "50%", background: C.accentDark,
                      border: "1px solid " + C.accent, display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 0 14px rgba(57,217,122,0.5)",
                    }}>
                      <span style={{ ...fontMono, fontSize: 16, fontWeight: 700, color: C.accent }}>{prompt.char}</span>
                    </div>
                  </div>
                )}
                <p style={{ position: "absolute", bottom: 8, left: 0, right: 0, textAlign: "center",
                  fontSize: 9, color: C.mute, margin: 0, pointerEvents: "none" }}>
                  press the key shown (or tap the node)
                </p>
              </div>
            </div>
          )}

          {phase === "over" && (
            <div style={{ textAlign: "center" }}>
              <Shield size={28} color={C.danger} style={{ margin: "10px 0" }} />
              <p style={{ fontSize: 16, color: C.danger, fontWeight: 700, letterSpacing: 1, margin: "0 0 4px" }}>SYSTEM BREACHED</p>
              <p style={{ fontSize: 10.5, color: C.mute, margin: "0 0 18px" }}>{tier.label}</p>

              {isNewBest && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: C.accentDark,
                  border: "1px solid " + C.accent, borderRadius: 20, padding: "4px 12px", marginBottom: 14 }}>
                  <Trophy size={12} color={C.accent} />
                  <span style={{ fontSize: 10, color: C.accent, letterSpacing: 0.5 }}>NEW BEST</span>
                </div>
              )}

              <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 8, padding: 14, marginBottom: 14 }}>
                <Stat label="Final score" value={score} accent />
                <Stat label="Survived" value={elapsed.toFixed(1) + "s"} />
                <Stat label="Best combo" value={"x" + bestCombo} />
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={startGame} style={{
                  flex: 1, padding: "10px 0", borderRadius: 6, border: "none", background: C.accent,
                  color: "#020803", fontSize: 12, fontWeight: 700, cursor: "pointer", textTransform: "uppercase" }}>
                  <Zap size={12} style={{ verticalAlign: -2, marginRight: 4 }} /> Retry
                </button>
                <button onClick={function () { setPhase("select"); }} style={{
                  flex: 1, padding: "10px 0", borderRadius: 6, border: "1px solid " + C.border, background: "none",
                  color: C.sub, fontSize: 12, cursor: "pointer" }}>
                  Change Tier
                </button>
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </CipherBackdrop>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
      <span style={{ fontSize: 11, color: C.mute }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: accent ? C.accent : C.text }}>{value}</span>
    </div>
  );
}
