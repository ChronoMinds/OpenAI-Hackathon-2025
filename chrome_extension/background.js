import * as utils from './utils.js';

chrome.contextMenus.create({                                                                                                                                                           
  id: "generateICS",                                                                                                                                                                    
  title: "Generate ICS from selected text",                                                                                                                                             
  contexts: ["selection"]                                                                                                                                                               
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "generateICS") return;

  const selectedText = info.selectionText;
  const prompt = "Please generate an ICS for: " + selectedText;

  try {
    const maxAttempts = 3;
    let icsContent = null;
    let attempt = 0;

    while (attempt < maxAttempts) {
      icsContent = await utils.generateICSFromOpenAI(prompt);
      if (utils.validateICS(icsContent)) break;

      console.warn(`Attempt ${attempt + 1} failed ICS validation.`);
      attempt++;
    }

    if (!icsContent || !utils.validateICS(icsContent)) {
      console.error("Failed to generate valid ICS after multiple attempts.");
      return;
    }

    const blob = new Blob([icsContent], { type: "text/calendar" });

    const reader = new FileReader();
    reader.onload = function () {
      const url = reader.result; // das ist jetzt eine data:URL

      chrome.downloads.download({
        url: url,
        filename: "generated-event.ics",
        saveAs: true
      });
    };

    reader.onerror = function (err) {
      console.error("Error reading blob as Data URL:", err);
    };
    reader.readAsDataURL(blob);
  } catch (err) {
    console.error("Error during ICS generation:", err);
  }
});

let lastSelectedText = "";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "textSelected") {
    lastSelectedText = message.text;
  } else if (message.action === "getSelectedText") {
    sendResponse({ text: lastSelectedText });
  }
});
