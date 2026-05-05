// Isolated world: relay enabled state to MAIN world via DOM attribute
// Also handles auto mode by watching the paste status attribute
// Also relays clipboard reads from MAIN world (where clipboardRead permission is unreliable)

function applyEnabled(enabled) {
  document.documentElement.dataset.codehsPaster = enabled ? "on" : "off";
}

function syncAutoMode() {
  try {
    chrome.storage.local.get(["autoMode"], ({ autoMode }) => {
      if (!autoMode) return;
      const status = document.documentElement.dataset.codehsPasteStatus;
      // Auto mode is not supported on Khan Academy
      if (status === "khan") return;
      if (status === "blocked") {
        chrome.storage.local.set({ enabled: true });
        applyEnabled(true);
      } else if (status === "allowed") {
        chrome.storage.local.set({ enabled: false });
        applyEnabled(false);
      }
    });
  } catch (_) {}
}

try {
  chrome.storage.local.get("enabled", ({ enabled }) => applyEnabled(!!enabled));

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled) applyEnabled(changes.enabled.newValue);
  });
} catch (_) {}

// Watch for detector.js writing the paste status, then apply auto mode
const observer = new MutationObserver(() => syncAutoMode());
observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-codehs-paste-status"] });

// Clipboard relay: MAIN world requests clipboard text, isolated world reads it
// and dispatches the result back. clipboardRead permission works here reliably.
document.addEventListener("codehsRequestClipboard", async () => {
  let text = "";
  try {
    text = await navigator.clipboard.readText();
  } catch (_) {}
  document.dispatchEvent(new CustomEvent("codehsClipboardResponse", { detail: { text } }));
});
