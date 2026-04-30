document.getElementById("injectBtn").addEventListener("click", async () => {
  const code = document.getElementById("code").value;
  const status = document.getElementById("status");

  if (!code.trim()) {
    status.className = "error";
    status.textContent = "Paste some code first.";
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || !tab.url?.includes("codehs.com")) {
    status.className = "error";
    status.textContent = "Go to a CodeHS editor tab first.";
    return;
  }

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    world: "MAIN",
    func: (codeToInject) => {
      const aceEl = document.querySelector("#ace-editor") || document.querySelector(".ace_editor");
      if (aceEl && aceEl.env && aceEl.env.editor) {
        aceEl.env.editor.setValue(codeToInject);
        aceEl.env.editor.clearSelection();
        aceEl.env.editor.focus();
        return "ace";
      }
      const cmEl = document.querySelector(".CodeMirror");
      if (cmEl && cmEl.CodeMirror) {
        cmEl.CodeMirror.setValue(codeToInject);
        cmEl.CodeMirror.focus();
        return "codemirror";
      }
      return null;
    },
    args: [code],
  });

  const method = results?.[0]?.result;
  if (method) {
    status.className = "success";
    status.textContent = `Injected via ${method} ✓`;
  } else {
    status.className = "error";
    status.textContent = "No editor found — is the CodeHS editor open?";
  }
});
