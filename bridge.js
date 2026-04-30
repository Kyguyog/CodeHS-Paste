// Isolated world: relay enabled state to MAIN world via DOM attribute
// Also handles auto mode by watching the paste status attribute

function applyEnabled(enabled) {
  document.documentElement.dataset.codehsPaster = enabled ? "on" : "off";
}

function syncAutoMode() {
  chrome.storage.local.get(["autoMode"], ({ autoMode }) => {
    if (!autoMode) return;
    const status = document.documentElement.dataset.codehsPasteStatus;
    if (status === "blocked") {
      chrome.storage.local.set({ enabled: true });
      applyEnabled(true);
    } else if (status === "allowed") {
      chrome.storage.local.set({ enabled: false });
      applyEnabled(false);
    }
  });
}

chrome.storage.local.get("enabled", ({ enabled }) => applyEnabled(!!enabled));

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) applyEnabled(changes.enabled.newValue);
});

// Watch for detector.js writing the paste status, then apply auto mode
const observer = new MutationObserver(() => syncAutoMode());
observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-codehs-paste-status"] });
