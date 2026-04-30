// Runs in isolated world - relays storage state to MAIN world via DOM attribute
// Also detects if this lesson blocks pasting

function applyState(enabled) {
  document.documentElement.dataset.codehsPaster = enabled ? "on" : "off";
}

chrome.storage.local.get("enabled", ({ enabled }) => applyState(!!enabled));

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) applyState(changes.enabled.newValue);
});
