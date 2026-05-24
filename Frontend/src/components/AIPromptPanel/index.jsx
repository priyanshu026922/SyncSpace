import { useState, useContext } from "react";
import boardContext from "../../store/board-context";
import classes from "./index.module.css";

const EXAMPLES = [
  "System design for URL shortener",
  "Auth flow with JWT tokens",
  "Microservices for e-commerce",
  "CI/CD pipeline",
];

function AIPromptPanel({ onShapesGenerated }) {
  const { showAIPanel, setShowAIPanel } = useContext(boardContext);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!showAIPanel) return null;

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/ai/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onShapesGenerated(data.shapes);
      setShowAIPanel(false);
      setPrompt("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.overlay} onClick={() => setShowAIPanel(false)}>
      <div className={classes.panel} onClick={(e) => e.stopPropagation()}>
        <div className={classes.header}>
          <span>✨ AI Diagram Generator</span>
          <button className={classes.closeBtn} onClick={() => setShowAIPanel(false)}>✕</button>
        </div>

        <textarea
          className={classes.textarea}
          placeholder="Describe a system or flow…&#10;e.g. System design for URL shortener"
          value={prompt}
          rows={4}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && e.ctrlKey && generate()}
        />

        <div className={classes.examples}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              className={classes.chip}
              onClick={() => setPrompt(ex)}
            >
              {ex}
            </button>
          ))}
        </div>

        {error && <p className={classes.error}>{error}</p>}

        <button
          className={classes.generateBtn}
          onClick={generate}
          disabled={loading || !prompt.trim()}
        >
          {loading ? "Generating…" : "Generate Diagram ✨"}
        </button>

        <p className={classes.hint}>Tip: Ctrl + Enter to generate</p>
      </div>
    </div>
  );
}

export default AIPromptPanel;