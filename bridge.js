// Runs in isolated world - can access chrome.storage
// Relays enabled state to MAIN world via DOM attribute

function applyState(enabled) {
  document.documentElement.dataset.codehsPaster = enabled ? "on" : "off";
}

chrome.storage.local.get("enabled", ({ enabled }) => applyState(!!enabled));

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) applyState(changes.enabled.newValue);
});
