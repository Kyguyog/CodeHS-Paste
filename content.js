document.addEventListener("paste", (e) => {
  // Check toggle state from DOM attribute
  if (document.documentElement.dataset.codehsPaster !== "on") {
    // Auto mode fallback: check pageSpecific directly in case attribute hasn't synced yet
    const autoShouldIntercept = window.pageSpecific?.preventCopyPaste === true;
    if (!autoShouldIntercept) return;
  }

  const aceEl = document.querySelector("#ace-editor") || document.querySelector(".ace_editor");
  if (!aceEl) return;

  const text = e.clipboardData.getData("text/plain");
  if (!text) return;

  e.stopImmediatePropagation();
  e.preventDefault();

  const editor = aceEl.env?.editor;
  if (editor) {
    editor.session.insert(editor.getCursorPosition(), text);
    editor.focus();
  }
}, true);
