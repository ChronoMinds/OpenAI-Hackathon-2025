document.getElementById("save").addEventListener("click", async () => {
  const key = document.getElementById("apiKey").value;
  await chrome.storage.local.set({ openaiKey: key }).then(() => {
    document.getElementById("status").textContent = "Saved!";
  });
});

// Beim Laden Key anzeigen
chrome.storage.local.get("openaiKey").then((result) => {
  if (result.openaiKey) {
    document.getElementById("apiKey").value = result.openaiKey;
  }
});

