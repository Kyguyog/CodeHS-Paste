const toggle = document.getElementById("toggle");
const status = document.getElementById("status");

// Load saved state
chrome.storage.local.get("enabled", ({ enabled }) => {
  toggle.checked = !!enabled;
  status.textContent = enabled ? "Active on CodeHS" : "Disabled";
});

toggle.addEventListener("change", () => {
  const enabled = toggle.checked;
  chrome.storage.local.set({ enabled });
  status.textContent = enabled ? "Active on CodeHS" : "Disabled";
});
