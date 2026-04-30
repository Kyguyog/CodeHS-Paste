const toggle = document.getElementById("toggle");
const autoToggle = document.getElementById("autoToggle");
const interceptLabel = document.getElementById("interceptLabel");
const dot = document.getElementById("dot");
const pasteStatus = document.getElementById("pasteStatus");

function applyAutoMode(auto) {
  toggle.disabled = auto;
  interceptLabel.className = auto ? "label dimmed" : "label";
}

// Load saved states
chrome.storage.local.get(["enabled", "autoMode"], ({ enabled, autoMode }) => {
  toggle.checked = !!enabled;
  autoToggle.checked = !!autoMode;
  applyAutoMode(!!autoMode);
  checkStatus();
});

toggle.addEventListener("change", () => {
  chrome.storage.local.set({ enabled: toggle.checked });
});

autoToggle.addEventListener("change", () => {
  const auto = autoToggle.checked;
  chrome.storage.local.set({ autoMode: auto });
  applyAutoMode(auto);
  if (auto) checkStatus(); // immediately apply based on current page status
});

async function checkStatus() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url?.includes("codehs.com")) {
    dot.className = "dot unknown";
    pasteStatus.textContent = "Not on CodeHS";
    return;
  }

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    world: "MAIN",
    func: () => document.documentElement.dataset.codehsPasteStatus,
  });

  const status = results?.[0]?.result;

  if (status === "blocked") {
    dot.className = "dot blocked";
    pasteStatus.textContent = "Paste blocked on this lesson";
  } else if (status === "allowed") {
    dot.className = "dot allowed";
    pasteStatus.textContent = "Paste allowed on this lesson";
  } else {
    dot.className = "dot unknown";
    pasteStatus.textContent = "Status unknown";
    return;
  }

  // Auto mode: sync toggle to block status
  const { autoMode } = await chrome.storage.local.get("autoMode");
  if (autoMode) {
    const shouldEnable = status === "blocked";
    toggle.checked = shouldEnable;
    chrome.storage.local.set({ enabled: shouldEnable });
  }
}

checkStatus();
