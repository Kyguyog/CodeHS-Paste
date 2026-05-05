function updateBlockStatus() {
  const hostname = location.hostname;

  // Khan Academy: paste blocking detection is not possible, signal this with "khan"
  if (hostname.includes("khanacademy.org")) {
    document.documentElement.dataset.codehsPasteStatus = "khan";
    return;
  }

  // CodeHS: check pageSpecific flag
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
