function updateBlockStatus() {
  const ps = window.pageSpecific;
  let status;
  if (!ps) {
    status = "unknown";
  } else if (ps.preventCopyPaste) {
    status = "blocked";
  } else {
    status = "allowed";
  }
  document.documentElement.dataset.codehsPasteStatus = status;
}

updateBlockStatus();
setInterval(updateBlockStatus, 1000);
