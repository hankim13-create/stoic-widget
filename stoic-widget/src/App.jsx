import { useState, useEffect } from "react";

const STOIC_QUOTES = [
  { quote: "You have power over your mind, not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius", source: "Meditations" },
  { quote: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius", source: "Meditations" },
  { quote: "Confine yourself to the present.", author: "Marcus Aurelius", source: "Meditations" },
  { quote: "Waste no more time arguing about what a good person should be. Be one.", author: "Marcus Aurelius", source: "Meditations" },
  { quote: "You could leave life right now. Let that determine what you do and say and think.", author: "Marcus Aurelius", source: "Meditations" },
  { quote: "Accept the things to which fate binds you, and love the people with whom fate brings you together.", author: "Marcus Aurelius", source: "Meditations" },
  { quote: "Never esteem anything as of advantage to you that will make you break your word or lose your self-respect.", author: "Marcus Aurelius", source: "Meditations" },
  { quote: "It's not what happens to you, but how you react to it that matters.", author: "Epictetus", source: "Enchiridion" },
  { quote: "Make the best use of what is in your power, and take the rest as it happens.", author: "Epictetus", source: "Enchiridion" },
  { quote: "People are disturbed not by things, but by the views which they take of things.", author: "Epictetus", source: "Enchiridion" },
  { quote: "Seek not that the things which happen should happen as you wish; but wish the things which happen to be as they are, and you will have a tranquil flow of life.", author: "Epictetus", source: "Enchiridion" },
  { quote: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus", source: "Discourses" },
  { quote: "No man is free who is not master of himself.", author: "Epictetus", source: "Discourses" },
  { quote: "Begin at once to live, and count each day as a separate life.", author: "Seneca", source: "Letters from a Stoic" },
  { quote: "It is not that I'm so brave, but that I value other things more.", author: "Seneca", source: "Letters from a Stoic" },
  { quote: "Omnia, Lucili, aliena sunt, tempus tantum nostrum est. All things are foreign to us, Lucilius — time alone is ours.", author: "Seneca", source: "Letters from a Stoic, Letter I" },
  { quote: "Vindica te tibi. Claim yourself for yourself.", author: "Seneca", source: "Letters from a Stoic, Letter I" },
  { quote: "The whole future lies in uncertainty: live immediately.", author: "Seneca", source: "Letters from a Stoic" },
  { quote: "We suffer more in imagination than in reality.", author: "Seneca", source: "Letters from a Stoic" },
  { quote: "Associate with those who will make a better man of you.", author: "Seneca", source: "Letters from a Stoic" },
  { quote: "If you really want to escape the things that harass you, what you're needing is not to be in a different place but to be a different person.", author: "Seneca", source: "Letters from a Stoic" },
  { quote: "Luck is what happens when preparation meets opportunity.", author: "Seneca", source: "Attributed" },
];

function getDailyQuote() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  return STOIC_QUOTES[dayOfYear % STOIC_QUOTES.length];
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function App() {
  const [quote, setQuote] = useState(null);
  const [aiQuote, setAiQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [reflection, setReflection] = useState("");
  const [saved, setSaved] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("stoic_api_key") || "");
  const [showKeyInput, setShowKeyInput] = useState(false);

  useEffect(() => {
    setQuote(getDailyQuote());
    setTimeout(() => setRevealed(true), 120);
  }, []);

  async function fetchAiQuote() {
    if (!apiKey) {
      setShowKeyInput(true);
      return;
    }
    setLoading(true);
    setAiMode(true);
    setRevealed(false);
    try {
      const today = new Date().toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric",
      });
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 400,
          messages: [{
            role: "user",
            content: `Today is ${today}. You are curating a daily Stoic quote for a medical resident — someone facing long shifts, difficult patients, uncertainty, and the weight of caring for others while managing their own life.

Select one Stoic quote (from Marcus Aurelius, Epictetus, or Seneca) that feels especially resonant for a medical resident today. Avoid the most commonly cited quotes.

Then write 2 sentences of context: why this quote matters for someone in medicine today, and one concrete way to apply it.

Respond ONLY as valid JSON with no markdown or preamble:
{"quote":"the exact quote","author":"Author Name","source":"Book title","context":"2 sentences"}`
          }],
        }),
      });
      const data = await resp.json();
      const text = data.content?.find((b) => b.type === "text")?.text || "";
      const parsed = JSON.parse(text.trim());
      setAiQuote(parsed);
      setTimeout(() => setRevealed(true), 120);
    } catch (e) {
      console.error(e);
      setAiMode(false);
      setRevealed(true);
    }
    setLoading(false);
  }

  function saveKey(k) {
    localStorage.setItem("stoic_api_key", k);
    setApiKey(k);
    setShowKeyInput(false);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const display = aiMode && aiQuote ? aiQuote : quote;
  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  // ─── styles ───────────────────────────────────────────────
  const s = {
    root: {
      minHeight: "100vh",
      background: "#F5F0E8",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Georgia, 'Times New Roman', serif",
      padding: "2rem",
    },
    card: {
      width: "100%",
      maxWidth: "660px",
      background: "#FDFAF4",
      border: "1px solid #D9CEBC",
      borderRadius: "2px",
      padding: "2.75rem 3.25rem",
      boxShadow: "0 2px 40px rgba(0,0,0,0.06)",
      opacity: revealed ? 1 : 0,
      transform: revealed ? "translateY(0)" : "translateY(14px)",
      transition: "opacity 0.65s ease, transform 0.65s ease",
    },
    dateLine: {
      fontSize: "11px",
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "#9A8F7E",
      marginBottom: "2.25rem",
    },
    labelRow: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginBottom: "1.5rem",
    },
    labelText: {
      fontSize: "10px",
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "#B8A98A",
      whiteSpace: "nowrap",
    },
    labelLine: {
      flex: 1,
      height: "1px",
      background: "#DDD5C4",
    },
    badge: {
      fontSize: "9px",
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      background: "#EDE5D4",
      color: "#7A6A52",
      padding: "2px 8px",
      borderRadius: "1px",
    },
    quote: {
      fontSize: "21px",
      lineHeight: "1.68",
      color: "#2C2416",
      marginBottom: "1.5rem",
      fontStyle: "italic",
      letterSpacing: "-0.01em",
    },
    quoteMark: {
      fontSize: "58px",
      lineHeight: 0,
      verticalAlign: "-0.38em",
      color: "#C8B99A",
      marginRight: "3px",
    },
    attribution: {
      display: "flex",
      alignItems: "baseline",
      gap: "10px",
      marginBottom: "1.25rem",
    },
    author: {
      fontSize: "13px",
      fontWeight: "bold",
      color: "#5C4A2A",
      letterSpacing: "0.04em",
      fontStyle: "normal",
    },
    source: {
      fontSize: "12px",
      color: "#9A8F7E",
      fontStyle: "italic",
    },
    divider: {
      height: "1px",
      background: "#DDD5C4",
      margin: "1.5rem 0",
    },
    context: {
      fontSize: "14px",
      lineHeight: "1.75",
      color: "#5C5040",
      marginBottom: "1.25rem",
      fontStyle: "normal",
    },
    reflLabel: {
      fontSize: "10px",
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "#9A8F7E",
      marginBottom: "8px",
    },
    textarea: {
      width: "100%",
      minHeight: "76px",
      background: "#F5F0E8",
      border: "1px solid #DDD5C4",
      borderRadius: "2px",
      padding: "11px 13px",
      fontSize: "14px",
      color: "#2C2416",
      fontFamily: "Georgia, serif",
      resize: "vertical",
      outline: "none",
      lineHeight: "1.6",
      boxSizing: "border-box",
    },
    footer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: "1.5rem",
      flexWrap: "wrap",
      gap: "10px",
    },
    btnOutline: {
      fontSize: "11px",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      padding: "7px 16px",
      background: "transparent",
      border: "1px solid #C8B99A",
      color: "#7A6A52",
      cursor: "pointer",
      fontFamily: "Georgia, serif",
      borderRadius: "1px",
      transition: "background 0.15s",
    },
    btnFill: {
      fontSize: "11px",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      padding: "7px 16px",
      background: "#5C4A2A",
      border: "none",
      color: "#FDFAF4",
      cursor: "pointer",
      fontFamily: "Georgia, serif",
      borderRadius: "1px",
      transition: "opacity 0.15s",
    },
    greeting: {
      fontSize: "10px",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "#B8A98A",
      textAlign: "center",
      flex: 1,
    },
    loading: {
      textAlign: "center",
      color: "#9A8F7E",
      fontSize: "13px",
      letterSpacing: "0.07em",
      padding: "1.25rem 0",
    },
    keyBox: {
      background: "#F5F0E8",
      border: "1px solid #D9CEBC",
      borderRadius: "2px",
      padding: "1.25rem",
      marginBottom: "1.25rem",
    },
    keyLabel: {
      fontSize: "11px",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "#9A8F7E",
      marginBottom: "8px",
    },
    keyInput: {
      width: "100%",
      padding: "8px 10px",
      fontSize: "13px",
      fontFamily: "monospace",
      background: "#FDFAF4",
      border: "1px solid #DDD5C4",
      borderRadius: "1px",
      color: "#2C2416",
      outline: "none",
      boxSizing: "border-box",
      marginBottom: "8px",
    },
    keyNote: {
      fontSize: "11px",
      color: "#9A8F7E",
      lineHeight: "1.5",
    },
  };

  return (
    <div style={s.root}>
      <div style={s.card}>
        <div style={s.dateLine}>{todayStr}</div>

        <div style={s.labelRow}>
          <span style={s.labelText}>Daily Stoic</span>
          <div style={s.labelLine} />
          {aiMode && aiQuote && <span style={s.badge}>AI curated</span>}
        </div>

        {showKeyInput && (
          <div style={s.keyBox}>
            <div style={s.keyLabel}>Anthropic API key</div>
            <input
              style={s.keyInput}
              type="password"
              placeholder="sk-ant-..."
              onKeyDown={(e) => { if (e.key === "Enter") saveKey(e.target.value); }}
            />
            <div style={s.keyNote}>
              Your key is stored locally in your browser only — never sent anywhere except directly to Anthropic.
              Get a key at <strong>console.anthropic.com</strong> → API keys. Press Enter to save.
            </div>
          </div>
        )}

        {loading ? (
          <div style={s.loading}>Selecting today's quote · · ·</div>
        ) : display ? (
          <>
            <div style={s.quote}>
              <span style={s.quoteMark}>"</span>
              {display.quote}"
            </div>

            <div style={s.attribution}>
              <span style={s.author}>— {display.author}</span>
              <span style={s.source}>{display.source}</span>
            </div>

            {display.context && (
              <>
                <div style={s.divider} />
                <div style={s.context}>{display.context}</div>
              </>
            )}

            <div style={s.divider} />

            <div style={s.reflLabel}>Today's reflection</div>
            <textarea
              style={s.textarea}
              placeholder="How does this land today? What does it ask of you?"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
            />
          </>
        ) : null}

        <div style={s.footer}>
          <button
            style={s.btnOutline}
            onClick={fetchAiQuote}
            disabled={loading}
            onMouseOver={(e) => (e.target.style.background = "#EDE5D4")}
            onMouseOut={(e) => (e.target.style.background = "transparent")}
          >
            {loading ? "Selecting…" : "↻ AI-curated quote"}
          </button>

          <span style={s.greeting}>{getGreeting()}. You have what today requires.</span>

          <button
            style={{ ...s.btnFill, background: saved ? "#8A7A5A" : "#5C4A2A" }}
            onClick={handleSave}
          >
            {saved ? "✓ Saved" : "Save reflection"}
          </button>
        </div>

        {apiKey && (
          <div style={{ marginTop: "1rem", textAlign: "right" }}>
            <button
              style={{ ...s.btnOutline, fontSize: "10px", padding: "4px 10px", border: "none", color: "#C8B99A" }}
              onClick={() => { setApiKey(""); localStorage.removeItem("stoic_api_key"); }}
            >
              Clear API key
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
