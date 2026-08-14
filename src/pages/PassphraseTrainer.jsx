import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Brain, Trophy, RefreshCw } from "lucide-react";
import { C, fontMono, CipherFonts, CipherFrameStyles, CipherBackdrop, FrameFX, BootSequence } from "../components/CipherChrome";

// Small local wordlist for now — same idea as the Password Generator's
// passphrase mode. Worth promoting to a shared export in CipherChrome if
// both tools end up wanting the exact same list later.
const WORDLIST = ["nebula","cipher","quartz","vortex","ember","glacier","onyx","zenith","tundra","phantom",
  "circuit","plasma","comet","raven","forge","binary","echo","crimson","frost","ion",
  "lunar","matrix","nova","orbit","pulse","quantum","rift","shadow","titan","umbra"];

function randomPhrase(wordCount) {
  const words = [];
  for (let i = 0; i < wordCount; i++) words.push(WORDLIST[Math.floor(Math.random() * WORDLIST.length)]);
  return words.join("-");
}

// The ladder: each rung is a longer memory-hold delay. Reaching a rung
// without a miss is the score — same "how far did you get" shape as Breach.
const LADDER = [5, 10, 20, 35, 55, 80]; // seconds of delay before recall, per round

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

  const tickRef = useRef(null);

  useEffect(function () { document.title = "Passphrase Trainer — CipherForge"; }, []);
  useEffect(function () { return function () { clearInterval(tickRef.current); }; }, []);

  function startRun() {
    setRound(0);
    beginRound(0);
  }

  function beginRound(roundIdx) {
    const newPhrase = randomPhrase(3 + Math.min(roundIdx, 3)); // gets a little longer on later rungs
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
            setPhase("recall");
            return 0;
          }
          return c - 1;
        });
      }, 1000);
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
      <CipherFonts />
      <CipherFrameStyles />
      <style>{"@keyframes ptFadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }"}</style>
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
              <p style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.6, margin: "0 0 18px" }}>
                Each round the wait gets longer. One wrong recall ends the run.
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
              <p style={{ fontSize: 10, color: C.mute, margin: "0 0 10px" }}>HOLD IT IN MEMORY</p>
              <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 8, padding: "30px 14px", marginBottom: 10 }}>
                <p style={{ fontSize: 34, color: C.text, margin: 0, ...fontMono }}>{countdown}s</p>
              </div>
              <p style={{ fontSize: 10, color: C.mute }}>the phrase is hidden — recall prompt comes up automatically</p>
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
                  <p style={{ fontSize: 14, color: C.text, margin: "0 0 14px" }}>{phrase}</p>
                  <p style={{ fontSize: 10.5, color: C.mute, margin: "0 0 14px" }}>You made it to round {round + 1}.</p>
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
              <p style={{ fontSize: 10, color: C.mute }}>next round loading...</p>
            </div>
          )}

          <p style={{ fontSize: 9, color: C.mute, textAlign: "center", marginTop: 20, lineHeight: 1.5 }}>
            Groundwork v1 — a distraction task during the wait (instead of just staring at a timer) is planned next to make recall genuinely harder to fake.
          </p>
        </div>
        )}
      </div>
    </CipherBackdrop>
  );
}
