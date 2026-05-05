const toggle = document.getElementById("toggle");
const autoToggle = document.getElementById("autoToggle");
const interceptLabel = document.getElementById("interceptLabel");
const autoLabel = document.getElementById("autoLabel");
const dot = document.getElementById("dot");
const pasteStatus = document.getElementById("pasteStatus");

function applyAutoMode(auto) {
  toggle.disabled = auto;
  interceptLabel.className = auto ? "label dimmed" : "label";
}

function applyKhanMode(isKhan) {
  autoToggle.disabled = isKhan;
  autoLabel.className = isKhan ? "label dimmed" : "label";
  if (isKhan && autoToggle.checked) {
    // Turn off auto mode silently when on Khan (can't detect blocking)
    autoToggle.checked = false;
    chrome.storage.local.set({ autoMode: false });
    applyAutoMode(false);
  }
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
  if (auto) checkStatus();
});

async function checkStatus() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const isCodeHS = tab?.url?.includes("codehs.com");
  const isKhan = tab?.url?.includes("khanacademy.org");

  if (!tab || (!isCodeHS && !isKhan)) {
    dot.className = "dot unknown";
    pasteStatus.textContent = "Not on a supported site";
    applyKhanMode(false);
    return;
  }

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    world: "MAIN",
    func: () => document.documentElement.dataset.codehsPasteStatus,
  });

  const status = results?.[0]?.result;

  if (status === "khan") {
    dot.className = "dot unknown";
    pasteStatus.textContent = "Khan Academy (manual mode only)";
    applyKhanMode(true);
    return;
  }

  applyKhanMode(false);

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
