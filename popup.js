const toggle = document.getElementById("toggle");
const dot = document.getElementById("dot");
const pasteStatus = document.getElementById("pasteStatus");

// Load toggle state
chrome.storage.local.get("enabled", ({ enabled }) => {
  toggle.checked = !!enabled;
});

toggle.addEventListener("change", () => {
  chrome.storage.local.set({ enabled: toggle.checked });
});

// Read paste block status from the active tab's DOM attribute
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
  }
}

checkStatus();
