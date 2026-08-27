import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Brain, Trophy, RefreshCw, Sparkles } from "lucide-react";
import { C, fontMono, CipherFonts, CipherFrameStyles, CipherBackdrop, FrameFX, BootSequence } from "../components/CipherChrome";
import StructuredData from "../components/StructuredData";

const passphraseTrainerSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "CipherForge Passphrase Trainer",
  "url": "https://getcipherforge.com/memory",
  "description": "Free memory training tool for passphrases, using an escalating recall-delay ladder with mid-wait math distraction challenges.",
  "applicationCategory": "SecurityApplication",
  "operatingSystem": "Any (Web Browser)",
  "isAccessibleForFree": true,
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
};

const WORDLIST = ["nebula","cipher","quartz","vortex","ember","glacier","onyx","zenith","tundra","phantom",
  "circuit","plasma","comet","raven","forge","binary","echo","crimson","frost","ion",
  "lunar","matrix","nova","orbit","pulse","quantum","rift","shadow","titan","umbra"];

function randomPhrase(wordCount) {
  const words = [];
  for (let i = 0; i < wordCount; i++) words.push(WORDLIST[Math.floor(Math.random() * WORDLIST.length)]);
  return words.join("-");
}

const LADDER = [5, 10, 20, 35, 55, 80];
const DISTRACTION_WINDOW_MS = 2500;

function makeDistraction() {
  const a = 2 + Math.floor(Math.random() * 9);
  const b = 2 + Math.floor(Math.random() * 9);
  const op = Math.random() < 0.5 ? "+" : "-";
  const hi = Math.max(a, b), lo = Math.min(a, b);
  const answer = op === "+" ? a + b : hi - lo;
  const text = op === "+" ? a + " + " + b : hi + " - " + lo;
  return { text: text, answer: answer };
}

const BEST_KEY = "passphrase-trainer-best-v1";
function loadBest() {
  try { const raw = window.localStorage.getItem(BEST_KEY); if (raw) return Number(raw) || 0; } catch (e) {}
  return 0;
}
function saveBest(n) {
  try { window.localStorage.setItem(BEST_KEY, String(n)); } catch (e) {}
}

export default function PassphraseTrainer() {
  const [booted, setBooted] = useState(false);
  const [phase, setPhase] = useState("intro"); // intro | reveal | waiting | recall | correct | wrong
  const [round, setRound] = useState(0);
  const [phrase, setPhrase] = useState("");
  const [input, setInput] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [best, setBest] = useState(loadBest);
  const [isNewBest, setIsNewBest] = useState(false);
  const [focusScore, setFocusScore] = useState(0);
  const [distraction, setDistraction] = useState(null); // { text, answer }
  const [distractionInput, setDistractionInput] = useState("");
  const [distractionFlash, setDistractionFlash] = useState(null); // "good" | "bad" | null

  const tickRef = useRef(null);
  const distractionSpawnRef = useRef(null);
  const distractionClearRef = useRef(null);
  const inWaitingRef = useRef(false);

  useEffect(function () { document.title = "Passphrase Trainer — CipherForge"; }, []);
  useEffect(function () {
    return function () {
      clearInterval(tickRef.current);
      clearTimeout(distractionSpawnRef.current);
      clearTimeout(distractionClearRef.current);
    };
  }, []);

  function stopDistractions() {
    inWaitingRef.current = false;
    clearTimeout(distractionSpawnRef.current);
    clearTimeout(distractionClearRef.current);
    setDistraction(null);
    setDistractionInput("");
  }

  function scheduleNextDistraction() {
    if (!inWaitingRef.current) return;
    const delay = 3000 + Math.random() * 3000;
    distractionSpawnRef.current = setTimeout(function () {
      if (!inWaitingRef.current) return;
      setDistraction(makeDistraction());
      setDistractionInput("");
      distractionClearRef.current = setTimeout(function () {
        setDistraction(null);
        scheduleNextDistraction();
      }, DISTRACTION_WINDOW_MS);
    }, delay);
  }

  function submitDistraction(value) {
    if (!distraction) return;
    clearTimeout(distractionClearRef.current);
    const correct = Number(value) === distraction.answer;
    setDistractionFlash(correct ? "good" : "bad");
    if (correct) setFocusScore(function (s) { return s + 5; });
    setTimeout(function () { setDistractionFlash(null); }, 350);
    setDistraction(null);
    setDistractionInput("");
    scheduleNextDistraction();
  }

  function startRun() {
    setRound(0);
    setFocusScore(0);
    beginRound(0);
  }

  function beginRound(roundIdx) {
    stopDistractions();
    const newPhrase = randomPhrase(3 + Math.min(roundIdx, 3));
    setPhrase(newPhrase);
    setInput("");
    setPhase("reveal");
    setTimeout(function () {
      setPhase("waiting");
      const delay = LADDER[Math.min(roundIdx, LADDER.length - 1)];
      setCountdown(delay);
      clearInterval(tickRef.current);
      tickRef.current = setInterval(function () {
        setCountdown(function (c) {
          if (c <= 1) {
            clearInterval(tickRef.current);
            stopDistractions();
            setPhase("recall");
            return 0;
          }
          return c - 1;
        });
      }, 1000);

      // Only bother with distractions on rounds long enough for them to fit.
      if (LADDER[Math.min(roundIdx, LADDER.length - 1)] >= 8) {
        inWaitingRef.current = true;
        scheduleNextDistraction();
      }
    }, 4000);
  }

  function submitRecall() {
    const correct = input.trim().toLowerCase() === phrase.toLowerCase();
    if (correct) {
      setPhase("correct");
      const nextRound = round + 1;
      if (nextRound > best) {
        setBest(nextRound);
        saveBest(nextRound);
        setIsNewBest(true);
      } else {
        setIsNewBest(false);
      }
      setTimeout(function () {
        setRound(nextRound);
        beginRound(nextRound);
      }, 1200);
    } else {
      setPhase("wrong");
    }
  }

  return (
    <CipherBackdrop>
      <StructuredData data={passphraseTrainerSchema} />
      <CipherFonts />
      <CipherFrameStyles />
      <style>{"\
        @keyframes ptFadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }\
        @keyframes ptPopIn { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }\
      "}</style>
      <div className="cf-frame" style={{
        background: C.bg, color: C.text, padding: "18px 16px", ...fontMono,
        border: "1px solid rgba(57,217,122,0.35)",
        boxShadow: "0 0 40px rgba(57,217,122,0.07), inset 0 0 70px rgba(0,0,0,0.5)",
      }}>
        <FrameFX />
        {!booted ? (
          <BootSequence lines={["INITIALIZING MEMORY LADDER...", "CALIBRATING RECALL WINDOW...", "READY."]}
            onDone={function () { setBooted(true); }} />
        ) : (
        <div style={{ position: "relative", zIndex: 1, animation: "ptFadeUp 0.35s ease" }}>
          <a href="/" style={{ color: C.sub, textDecoration: "none", fontSize: 11, display: "inline-flex", alignItems: "center", gap: 5, marginBottom: 12 }}>
            <ArrowLeft size={13} /> BACK
          </a>

          <div style={{ textAlign: "center", marginBottom: 4 }}>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 19, letterSpacing: 1.5, color: C.accent,
              textShadow: "0 0 12px rgba(57,217,122,0.5)" }}>MEMORY LADDER</span>
          </div>
          <p style={{ fontSize: 10, color: C.mute, textAlign: "center", margin: "2px 0 20px", letterSpacing: 0.5 }}>
            PASSPHRASE RECALL TRAINER
          </p>

          {phase === "intro" && (
            <div style={{ textAlign: "center" }}>
              <Brain size={26} color={C.accent} style={{ margin: "6px 0 14px" }} />
              <p style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.6, margin: "0 0 8px" }}>
                You'll see a passphrase for a few seconds. It disappears. Then you wait — and type it back from memory when the timer runs out.
              </p>
              <p style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.6, margin: "0 0 8px" }}>
                On longer waits, quick math challenges will pop up. They don't end your run if you miss them — but answering keeps you actively engaged instead of just repeating the phrase silently, and earns bonus Focus points.
              </p>
              <p style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.6, margin: "0 0 18px" }}>
                One wrong final recall ends the run.
              </p>
              {best > 0 && (
                <p style={{ fontSize: 10.5, color: C.mute, margin: "0 0 16px" }}>Personal best: round {best}</p>
              )}
              <button onClick={startRun} style={{
                width: "100%", padding: "12px 0", borderRadius: 6, border: "none",
                background: C.accent, color: "#020803", fontSize: 13, fontWeight: 700, cursor: "pointer",
                textTransform: "uppercase", letterSpacing: 0.5 }}>
                Start Training
              </button>
            </div>
          )}

          {phase === "reveal" && (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 10, color: C.mute, margin: "0 0 6px" }}>ROUND {round + 1} — MEMORIZE THIS</p>
              <div style={{ background: C.card, border: "1px solid " + C.accent, borderRadius: 8, padding: "22px 14px", marginBottom: 10 }}>
                <p style={{ fontSize: 20, color: C.accent, margin: 0, wordBreak: "break-all",
                  textShadow: "0 0 8px rgba(57,217,122,0.4)" }}>{phrase}</p>
              </div>
              <p style={{ fontSize: 10, color: C.mute }}>memorizing...</p>
            </div>
          )}

          {phase === "waiting" && (
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: C.mute }}>ROUND {round + 1}</span>
                <span style={{ fontSize: 10, color: C.mute }}>FOCUS <strong style={{ color: C.accent }}>{focusScore}</strong></span>
              </div>

              {distraction ? (
                <div style={{
                  background: distractionFlash === "good" ? C.accentDark : distractionFlash === "bad" ? "#3A1418" : C.card,
                  border: "1px solid " + (distractionFlash === "good" ? C.accent : distractionFlash === "bad" ? C.danger : C.warn),
                  borderRadius: 8, padding: "22px 14px", marginBottom: 10, animation: "ptPopIn 0.15s ease",
                }}>
                  <p style={{ fontSize: 9.5, color: C.mute, margin: "0 0 8px", letterSpacing: 0.5 }}>QUICK — SOLVE IT</p>
                  <p style={{ fontSize: 22, color: C.text, margin: "0 0 12px" }}>{distraction.text} = ?</p>
                  <input value={distractionInput} autoFocus
                    onChange={function (e) { setDistractionInput(e.target.value.replace(/[^0-9]/g, "")); }}
                    onKeyDown={function (e) { if (e.key === "Enter") submitDistraction(distractionInput); }}
                    type="text" style={{
                      width: 90, background: C.card2, border: "1px solid " + C.border, borderRadius: 6,
                      color: C.text, fontSize: 16, padding: "6px 8px", textAlign: "center", ...fontMono }} />
                </div>
              ) : (
                <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 8, padding: "30px 14px", marginBottom: 10 }}>
                  <p style={{ fontSize: 34, color: C.text, margin: 0, ...fontMono }}>{countdown}s</p>
                </div>
              )}
              <p style={{ fontSize: 10, color: C.mute }}>
                {distraction ? "answer earns bonus focus points" : "the phrase is hidden — hold it in memory"}
              </p>
            </div>
          )}

          {(phase === "recall" || phase === "wrong") && (
            <div>
              <p style={{ fontSize: 10, color: C.mute, textAlign: "center", margin: "0 0 10px" }}>TYPE THE PASSPHRASE</p>
              <input value={input} onChange={function (e) { setInput(e.target.value); }}
                onKeyDown={function (e) { if (e.key === "Enter") submitRecall(); }}
                autoFocus type="text" placeholder="what was it?" style={{
                  width: "100%", background: C.card2, border: "1px solid " + (phase === "wrong" ? C.danger : C.border),
                  borderRadius: 6, color: C.text, fontSize: 14, padding: "10px 12px", boxSizing: "border-box",
                  marginBottom: 10, ...fontMono, textAlign: "center" }} />
              {phase === "wrong" ? (
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 12, color: C.danger, margin: "0 0 4px" }}>Not quite. It was:</p>
                  <p style={{ fontSize: 14, color: C.text, margin: "0 0 8px" }}>{phrase}</p>
                  <p style={{ fontSize: 10.5, color: C.mute, margin: "0 0 4px" }}>You made it to round {round + 1}.</p>
                  <p style={{ fontSize: 10.5, color: C.mute, margin: "0 0 14px" }}>Focus points earned: {focusScore}</p>
                  <button onClick={function () { setPhase("intro"); }} style={{
                    width: "100%", padding: "10px 0", borderRadius: 6, border: "none", background: C.accent,
                    color: "#020803", fontSize: 12, fontWeight: 700, cursor: "pointer", textTransform: "uppercase" }}>
                    <RefreshCw size={12} style={{ verticalAlign: -2, marginRight: 4 }} /> Try Again
                  </button>
                </div>
              ) : (
                <button onClick={submitRecall} style={{
                  width: "100%", padding: "10px 0", borderRadius: 6, border: "none", background: C.accent,
                  color: "#020803", fontSize: 12, fontWeight: 700, cursor: "pointer", textTransform: "uppercase" }}>
                  Submit
                </button>
              )}
            </div>
          )}

          {phase === "correct" && (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 14, color: C.accent, fontWeight: 700, margin: "10px 0" }}>CORRECT</p>
              {isNewBest && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: C.accentDark,
                  border: "1px solid " + C.accent, borderRadius: 20, padding: "4px 12px", marginBottom: 10 }}>
                  <Trophy size={12} color={C.accent} />
                  <span style={{ fontSize: 10, color: C.accent, letterSpacing: 0.5 }}>NEW BEST</span>
                </div>
              )}
              <p style={{ fontSize: 10, color: C.mute, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <Sparkles size={11} color={C.accent} /> focus {focusScore}
              </p>
              <p style={{ fontSize: 10, color: C.mute, marginTop: 8 }}>next round loading...</p>
            </div>
          )}
        </div>
        )}
      </div>
    </CipherBackdrop>
  );
}
