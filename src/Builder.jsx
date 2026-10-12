import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  Code2,
  Construction,
  Download,
  Eye,
  LoaderCircle,
  Sparkles,
  WandSparkles,
  Palette,
  MoveVertical,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import "./builder.css";

/* ------------------------------------------------------------------ */
/* Messages shown on the "under construction" page, by failure type    */
/* ------------------------------------------------------------------ */
const OUTAGES = {
  no_credit: {
    title: "The AI studio is under construction",
    text: "We're upgrading the builder and it's temporarily unavailable. Please check back soon.",
  },
  busy: {
    title: "The studio is very busy right now",
    text: "A lot of people are building at the same time. Give it a minute and try again.",
  },
  config: {
    title: "We're setting things up",
    text: "The AI builder is being configured and will be back shortly.",
  },
  timeout: {
    title: "That took too long",
    text: "Your website was too big to finish in time. Try a shorter or simpler request.",
  },
  offline: {
    title: "We can't reach the studio",
    text: "Check your internet connection, or the builder may be restarting. Try again in a moment.",
  },
  empty: {
    title: "The AI came back empty-handed",
    text: "Something went wrong while building your website. Try again, or describe it a little differently.",
  },
  unknown: {
    title: "This page is under construction",
    text: "Something unexpected happened on our side. We're on it. Please try again shortly.",
  },
};

function makeEditableHtml(html) {
  const editorScript = `
<script data-vyntrix-editor>
(function () {
  if (window.__vyntrixEditorInstalled) return;
  window.__vyntrixEditorInstalled = true;

  var selected = null;
  var dragged = null;

  var editorStyle = document.createElement("style");
  editorStyle.id = "vyntrix-editor-style";
  editorStyle.textContent = [
    ".vyntrix-selected { outline: 2px solid #9333ea !important; outline-offset: 3px !important; cursor: pointer; }",
    ".vyntrix-dragging { opacity: .45 !important; }",
    "body { min-height: 100vh; }"
  ].join("");
  document.head.appendChild(editorStyle);

  function send(type, extra) {
    var payload = Object.assign({ type: type }, extra || {});
    parent.postMessage(payload, "*");
  }

  function cleanHtml() {
    var copy = document.documentElement.cloneNode(true);
    copy.querySelectorAll(
      "#vyntrix-editor-style, script[data-vyntrix-editor]"
    ).forEach(function (el) { el.remove(); });

    copy.querySelectorAll("*").forEach(function (el) {
      el.classList.remove("vyntrix-selected", "vyntrix-dragging");
      if (!el.className || !String(el.className).trim()) {
        el.removeAttribute("class");
      }
      el.removeAttribute("contenteditable");
      el.removeAttribute("draggable");
      el.removeAttribute("data-vyntrix-section");
    });

    return "<!DOCTYPE html>\\n" + copy.outerHTML;
  }

  function save() {
    send("vyntrix-html", { html: cleanHtml() });
  }

  function choose(el) {
    if (selected) selected.classList.remove("vyntrix-selected");
    selected = el;
    if (selected) {
      selected.classList.add("vyntrix-selected");
      send("vyntrix-selected", {
        label: (selected.tagName || "Element").toLowerCase(),
        text: (selected.innerText || "").trim().slice(0, 100)
      });
    }
  }

  function sectionFor(el) {
    return el && el.closest("section, header, footer, nav, article");
  }

  document.addEventListener("click", function (event) {
    if (event.detail > 1) return;
    var el = event.target.closest("body *");
    if (!el || el === document.body || el === document.documentElement) return;
    choose(el);
  });

  document.addEventListener("dblclick", function (event) {
    var el = event.target.closest("h1,h2,h3,h4,p,span,a,button,li,label");
    if (!el) return;
    event.preventDefault();
    choose(el);
    el.setAttribute("contenteditable", "true");
    el.focus();
    send("vyntrix-editing", { label: "Editing text" });
  });

  document.addEventListener("focusout", function (event) {
    if (event.target.hasAttribute("contenteditable")) {
      event.target.removeAttribute("contenteditable");
      save();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && document.activeElement.hasAttribute("contenteditable")) {
      document.activeElement.blur();
    }
  });

  document.querySelectorAll("section, header, footer, nav, article").forEach(function (el) {
    el.setAttribute("draggable", "true");
    el.setAttribute("data-vyntrix-section", "true");
  });

  document.addEventListener("dragstart", function (event) {
    var el = sectionFor(event.target);
    if (!el || el === document.body) return;
    dragged = el;
    event.dataTransfer.effectAllowed = "move";
    try { event.dataTransfer.setData("text/plain", "vyntrix-section"); } catch (_) {}
    el.classList.add("vyntrix-dragging");
  });

  document.addEventListener("dragover", function (event) {
    if (dragged && sectionFor(event.target)) event.preventDefault();
  });

  document.addEventListener("drop", function (event) {
    var target = sectionFor(event.target);
    if (!dragged || !target || dragged === target) return;
    event.preventDefault();
    var rect = target.getBoundingClientRect();
    var after = event.clientY > rect.top + rect.height / 2;
    target.parentNode.insertBefore(dragged, after ? target.nextSibling : target);
    dragged.classList.remove("vyntrix-dragging");
    choose(dragged);
    dragged = null;
    save();
  });

  document.addEventListener("dragend", function () {
    if (dragged) dragged.classList.remove("vyntrix-dragging");
    dragged = null;
  });

  window.addEventListener("message", function (event) {
    var data = event.data || {};

    if (data.type === "vyntrix-color") {
      var style = document.getElementById("vyntrix-client-theme");
      if (!style) {
        style = document.createElement("style");
        style.id = "vyntrix-client-theme";
        document.head.appendChild(style);
      }

      var rules = [];
      if (data.background) {
        rules.push("body{background:" + data.background + " !important;}");
      }
      if (data.text) {
        rules.push("body{color:" + data.text + " !important;}");
        rules.push("body h1,body h2,body h3,body h4,body p,body li,body label{color:" + data.text + " !important;}");
      }
      if (data.accent) {
        rules.push("body button,body .button,body [role=button]{background-color:" + data.accent + " !important;border-color:" + data.accent + " !important;}");
        rules.push("body a{color:" + data.accent + " !important;}");
      }
      style.textContent = rules.join("\\n");
      save();
    }

    if (data.type === "vyntrix-move" && selected) {
      var section = sectionFor(selected);
      if (!section || !section.parentNode) return;
      if (data.direction === "up" && section.previousElementSibling) {
        section.parentNode.insertBefore(section, section.previousElementSibling);
      } else if (data.direction === "down" && section.nextElementSibling) {
        section.parentNode.insertBefore(section.nextElementSibling, section);
      }
      choose(section);
      save();
    }
  });

  send("vyntrix-ready");
})();
</script>`;

  if (/<\/body\s*>/i.test(html)) {
    return html.replace(/<\/body\s*>/i, editorScript + "</body>");
  }
  return html + editorScript;
}

/* Friendly full-canvas page shown whenever the AI can't do its job */
function ConstructionPage({ code, onRetry, onBack, hasWebsite, onDismiss }) {
  const info = OUTAGES[code] || OUTAGES.unknown;
  return (
    <div className="construction-page" role="status">
      <div className="construction-stripe" aria-hidden="true" />
      <div className="construction-icon"><Construction size={34} /></div>
      <span className="construction-kicker">UNDER CONSTRUCTION</span>
      <h2>{info.title}</h2>
      <p>{info.text}</p>
      <div className="construction-actions">
        <button type="button" className="construction-primary" onClick={onRetry}>
          <RefreshCw size={16} /> Try again
        </button>
        {hasWebsite && (
          <button type="button" className="construction-secondary" onClick={onDismiss}>
            <Eye size={16} /> Back to my website
          </button>
        )}
        <button type="button" className="construction-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Vyntrix
        </button>
      </div>
      <div className="construction-stripe" aria-hidden="true" />
    </div>
  );
}

export default function Builder({ onBack }) {
  const [prompt, setPrompt] = React.useState("");
  const [html, setHtml] = React.useState("");
  const [frameHtml, setFrameHtml] = React.useState("");
  const [error, setError] = React.useState("");
  const [outage, setOutage] = React.useState(null); // failure code → construction page
  const [loading, setLoading] = React.useState(false);
  const [view, setView] = React.useState("preview");
  const [background, setBackground] = React.useState("#ffffff");
  const [textColor, setTextColor] = React.useState("#222222");
  const [accent, setAccent] = React.useState("#9333ea");
  const [selectedElement, setSelectedElement] = React.useState("");
  const [ready, setReady] = React.useState(false);
  const frameRef = React.useRef(null);

  React.useEffect(() => {
    function receiveMessage(event) {
      if (frameRef.current && event.source !== frameRef.current.contentWindow) return;
      const data = event.data || {};

      if (data.type === "vyntrix-html" && typeof data.html === "string") {
        setHtml(data.html);
      }
      if (data.type === "vyntrix-selected") {
        setSelectedElement(data.label + (data.text ? " · " + data.text : ""));
      }
      if (data.type === "vyntrix-ready") {
        setReady(true);
      }
    }

    window.addEventListener("message", receiveMessage);
    return () => window.removeEventListener("message", receiveMessage);
  }, []);

  function sendToPreview(message) {
    frameRef.current?.contentWindow?.postMessage(message, "*");
  }

  async function runGeneration() {
    if (prompt.trim().length < 10) return;

    setError("");
    setOutage(null);
    setLoading(true);

    try {
      let response;
      try {
        response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            ...(html ? { existingHtml: html } : {}),
          }),
        });
      } catch {
        setOutage("offline");
        return;
      }

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      // Bad input (too short, etc.) stays as a normal inline message
      if (response.status === 400 && data?.error) {
        setError(data.error);
        return;
      }

      // Anything else going wrong → construction page
      if (!response.ok || !data) {
        setOutage(data?.code || (response.status >= 500 ? "offline" : "unknown"));
        return;
      }
      if (!data.html) {
        setOutage("empty");
        return;
      }

      setHtml(data.html);
      setFrameHtml(makeEditableHtml(data.html));
      setView("preview");
      setReady(false);
      setSelectedElement("");
      setPrompt("");
    } catch {
      setOutage("unknown");
    } finally {
      setLoading(false);
    }
  }

  function generateWebsite(event) {
    event.preventDefault();
    runGeneration();
  }

  function changeColor(key, value) {
    if (key === "background") setBackground(value);
    if (key === "text") setTextColor(value);
    if (key === "accent") setAccent(value);

    sendToPreview({
      type: "vyntrix-color",
      background: key === "background" ? value : background,
      text: key === "text" ? value : textColor,
      accent: key === "accent" ? value : accent,
    });
  }

  function resetPreview() {
    if (!html) return;
    setFrameHtml(makeEditableHtml(html));
    setReady(false);
    setSelectedElement("");
  }

  function downloadWebsite() {
    if (!html) return;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vyntrix-website.html";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="builder-page">
      <header className="builder-header">
        <button className="builder-back" onClick={onBack}>
          <ArrowLeft size={17} /> Back to Vyntrix
        </button>
        <a className="builder-brand" href="#builder">
          <span className="builder-brand-mark">V</span>
          VYNTRIX <span className="builder-brand-muted">AI STUDIO</span>
        </a>
        <span className="builder-status"><span /> VISUAL AI BUILDER</span>
      </header>

      <main className="builder-layout">
        <section className="builder-sidebar">
          <div className="builder-kicker"><Sparkles size={15} /> YOUR IDEA, YOUR DESIGN</div>
          <h1>Imagine it.<br /><span>Build it.</span></h1>
          <p className="builder-intro">
            Generate a website, edit it visually, and tell the AI what you want to change.
          </p>

          <form className="builder-form" onSubmit={generateWebsite}>
            <label htmlFor="website-prompt">
              {html ? "What would you like to change?" : "What do you want to create?"}
            </label>
            <textarea
              id="website-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder={html
                ? "Make the hero section taller, add a testimonials section, or give the website a luxury look..."
                : "Create a premium sneaker store with bold typography, product cards, and a shopping section..."}
              minLength={10}
              maxLength={5000}
              required
            />
            <div className="builder-prompt-footer">
              <span>{prompt.length}/5000 characters</span>
              <span>{html ? "AI will revise this site" : "Describe your idea"}</span>
            </div>
            <button className="builder-generate" type="submit" disabled={loading || prompt.trim().length < 10}>
              {loading ? (
                <><LoaderCircle className="builder-spinner" size={18} /> {html ? "Updating website..." : "Building website..."}</>
              ) : (
                <><WandSparkles size={18} /> {html ? "Apply AI changes" : "Generate website"} <ArrowRight size={17} /></>
              )}
            </button>
          </form>

          {error && <div className="builder-error" role="alert">{error}</div>}

          {html && (
            <div className="visual-controls">
              <div className="visual-controls-title"><Palette size={16} /> QUICK DESIGN CONTROLS</div>
              <label className="color-control">
                <span>Background</span>
                <input type="color" value={background} onChange={(e) => changeColor("background", e.target.value)} />
              </label>
              <label className="color-control">
                <span>Text color</span>
                <input type="color" value={textColor} onChange={(e) => changeColor("text", e.target.value)} />
              </label>
              <label className="color-control">
                <span>Accent / buttons</span>
                <input type="color" value={accent} onChange={(e) => changeColor("accent", e.target.value)} />
              </label>
              <div className="color-presets">
                {["#9333ea", "#2563eb", "#0f766e", "#e11d48", "#ea580c", "#111827"].map((color) => (
                  <button key={color} type="button" style={{ background: color }} aria-label={"Use accent " + color} onClick={() => changeColor("accent", color)} />
                ))}
              </div>
              <div className="selection-label">
                <strong>Selected element</strong>
                <span>{selectedElement || "Click an element in the preview"}</span>
              </div>
              <div className="move-controls">
                <button type="button" onClick={() => sendToPreview({ type: "vyntrix-move", direction: "up" })}>
                  <MoveVertical size={15} /> Move section up
                </button>
                <button type="button" onClick={() => sendToPreview({ type: "vyntrix-move", direction: "down" })}>
                  <MoveVertical size={15} /> Move section down
                </button>
              </div>
              <button className="visual-reset" type="button" onClick={resetPreview}>
                <RotateCcw size={14} /> Reset preview to last AI version
              </button>
              <p className="visual-hint">
                Tip: double-click text to edit it. Drag sections by their content to rearrange them.
                Color changes and text edits don't use AI credits.
              </p>
            </div>
          )}

          <div className="builder-tips">
            <strong>Ideas to include</strong>
            <span>✦ Purpose and audience</span>
            <span>✦ Colors and visual style</span>
            <span>✦ Sections and features</span>
          </div>
          <p className="builder-disclaimer">
            This is a working preview. Publishing and backend integrations are handled separately.
          </p>
        </section>

        <section className="builder-workspace">
          <div className="workspace-toolbar">
            <div className="workspace-heading">
              <span className="workspace-live-dot" />
              <div>
                <strong>Website workspace</strong>
                <small>{html ? "Select, edit, and rearrange" : "Ready for your idea"}</small>
              </div>
            </div>
            <div className="workspace-actions">
              <button className={view === "preview" ? "workspace-tab active" : "workspace-tab"} onClick={() => setView("preview")} disabled={!html}>
                <Eye size={15} /> Preview
              </button>
              <button className={view === "code" ? "workspace-tab active" : "workspace-tab"} onClick={() => setView("code")} disabled={!html}>
                <Code2 size={15} /> HTML
              </button>
              <button className="workspace-download" onClick={downloadWebsite} disabled={!html} title="Download HTML" aria-label="Download generated HTML">
                <Download size={16} />
              </button>
            </div>
          </div>

          <div className="workspace-canvas">
            {loading ? (
              <div className="workspace-empty">
                <LoaderCircle className="builder-spinner workspace-loader" size={36} />
                <h2>{html ? "Refining your website" : "Creating your idea"}</h2>
                <p>AI is working on your request. This can take up to a minute for a full website.</p>
              </div>
            ) : outage ? (
              <ConstructionPage
                code={outage}
                hasWebsite={Boolean(html)}
                onRetry={runGeneration}
                onDismiss={() => setOutage(null)}
                onBack={onBack}
              />
            ) : html && view === "preview" ? (
              <iframe
                ref={frameRef}
                key={frameHtml}
                className="website-preview"
                title="Generated website preview"
                srcDoc={frameHtml}
                sandbox="allow-scripts allow-forms"
              />
            ) : html && view === "code" ? (
              <pre className="website-code"><code>{html}</code></pre>
            ) : (
              <div className="workspace-empty">
                <div className="workspace-empty-icon"><Code2 size={29} /><Sparkles size={16} /></div>
                <h2>Your canvas is waiting</h2>
                <p>Describe your idea on the left to generate your first website.</p>
                <div className="workspace-example">
                  <span>TRY THIS PROMPT</span>
                  “Create a sleek agency landing page with purple gradients, project cards, and smooth interactions.”
                </div>
              </div>
            )}
          </div>
          <div className="workspace-footer">
            <span><span className="workspace-live-dot" /> VYNTRIX WORKSPACE</span>
            <span>HTML · CSS · JAVASCRIPT</span>
          </div>
        </section>
      </main>
    </div>
  );
}