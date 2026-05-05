// Intercept Ctrl+V at keydown (capture, highest priority).
// On Khan Academy the editor lives in an iframe — this script runs in that
// iframe too (all_frames: true), so getAceEditor() will find it directly.

function getAceEditor() {
  // Try DOM-based lookup first (CodeHS style)
  const aceEl = document.querySelector("#ace-editor") ||
                document.querySelector(".ace_editor") ||
                document.querySelector("[class*='ace_editor']");
  if (aceEl?.env?.editor) return aceEl.env.editor;

  // Khan Academy exposes the editor on the global ace object
  if (window.ace) {
    try {
      const el = document.querySelector(".ace_editor");
      if (el) {
        const ed = window.ace.edit(el);
        if (ed) return ed;
      }
    } catch (_) {}
  }

  return null;
}

// Ask the isolated world (bridge.js) to read the clipboard and return it.
// navigator.clipboard.readText() is unreliable in MAIN world on some sites.
function readClipboard() {
  return new Promise((resolve) => {
    document.addEventListener("codehsClipboardResponse", (e) => resolve(e.detail.text), { once: true });
    document.dispatchEvent(new CustomEvent("codehsRequestClipboard"));
  });
}

window.addEventListener("keydown", async (e) => {
  if (!((e.ctrlKey || e.metaKey) && e.key === "v")) return;

  if (document.documentElement.dataset.codehsPaster !== "on") return;

  const editor = getAceEditor();
  if (!editor) return;

  e.stopImmediatePropagation();
  e.preventDefault();

  const text = await readClipboard();
  if (!text) return;
  editor.session.insert(editor.getCursorPosition(), text);
  editor.focus();
}, true);
