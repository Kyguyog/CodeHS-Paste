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

window.addEventListener("keydown", async (e) => {
  if (!((e.ctrlKey || e.metaKey) && e.key === "v")) return;

  if (document.documentElement.dataset.codehsPaster !== "on") {
    const autoShouldIntercept = window.pageSpecific?.preventCopyPaste === true;
    if (!autoShouldIntercept) return;
  }

  const editor = getAceEditor();
  if (!editor) return;

  e.stopImmediatePropagation();
  e.preventDefault();

  try {
    const text = await navigator.clipboard.readText();
    if (!text) return;
    editor.session.insert(editor.getCursorPosition(), text);
    editor.focus();
  } catch (err) {
    console.warn("[Paster] clipboard.readText failed, falling back to paste event:", err);
    document.addEventListener("paste", function oncePaste(evt) {
      document.removeEventListener("paste", oncePaste, true);
      const editor2 = getAceEditor();
      if (!editor2) return;
      const text2 = evt.clipboardData.getData("text/plain");
      if (!text2) return;
      evt.stopImmediatePropagation();
      evt.preventDefault();
      editor2.session.insert(editor2.getCursorPosition(), text2);
      editor2.focus();
    }, true);
  }
}, true);
