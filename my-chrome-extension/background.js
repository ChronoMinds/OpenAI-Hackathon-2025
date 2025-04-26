let lastSelectedText = "";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "textSelected") {
    lastSelectedText = message.text;
  } else if (message.action === "getSelectedText") {
    sendResponse({ text: lastSelectedText });
  }
});