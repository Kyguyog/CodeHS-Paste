// Check toggle state before intercepting
function isEnabled(cb) {
  // MAIN world can't access chrome.storage, so store state in a DOM attribute
  cb(document.documentElement.dataset.codehsPaster === "on");
}

// Listen for state changes from a separate isolated content script via DOM
const observer = new MutationObserver(() => {});
observer.observe(document.documentElement, { attributes: true });

document.addEventListener("paste", (e) => {
  if (document.documentElement.dataset.codehsPaster !== "on") return;

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
