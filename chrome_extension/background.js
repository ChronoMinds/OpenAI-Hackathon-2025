import ICAL from './ical.js'

chrome.contextMenus.create({                                                                                                                                                           
  id: "generateICS",                                                                                                                                                                    
  title: "Generate ICS from selected text",                                                                                                                                             
  contexts: ["selection"]                                                                                                                                                               
});

async function getOpenAIKey() {
  const result = await chrome.storage.local.get("openaiKey");
  return result.openaiKey;
}

function validateICS(icsContent) {
  try {
    const jcalData = ICAL.parse(icsContent);
    const comp = new ICAL.Component(jcalData);
    const vevent = comp.getFirstSubcomponent("vevent");
    if (vevent) {
      const summary = vevent.getFirstPropertyValue("summary");
      console.log("Valid ICS: summary =", summary);
      return true;
    }
  } catch (e) {
    console.error("Invalid ICS format:", e);
  }
  return false;
}

async function generateICSFromOpenAI(prompt) {
  const apiKey = await getOpenAIKey();
  if (!apiKey) {
    console.error("OpenAI API key not set.");
    return;
  }
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4.1-nano", // oder "gpt-3.5-turbo"
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("OpenAI API Error:", data);
    throw new Error("OpenAI request failed");
  }

  return data.choices[0].message.content;
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "generateICS") return;

  const selectedText = info.selectionText;
  const prompt = "Please generate an ICS for: " + selectedText;

  try {
    const maxAttempts = 3;
    let icsContent = null;
    let attempt = 0;

    while (attempt < maxAttempts) {
      icsContent = await generateICSFromOpenAI(prompt);
      if (validateICS(icsContent)) break;

      console.warn(`Attempt ${attempt + 1} failed ICS validation.`);
      attempt++;
    }

    if (!icsContent || !validateICS(icsContent)) {
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
