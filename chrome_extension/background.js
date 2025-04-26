import * as utils from './utils.js';

chrome.contextMenus.create({                                                                                                                                                           
  id: "generateICS",                                                                                                                                                                    
  title: "Generate ICS from selected text",                                                                                                                                             
  contexts: ["selection"]                                                                                                                                                               
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "generateICS") return;


  const selectedText = info.selectionText;
  const prompt = `
  You are a strict ICS file generator.
  
  Understand the following input text and determine if it describes an event (a meeting, appointment, party, gathering, etc.).
  
  If it IS an event, extract the following fields semantically and output a valid .ics content, strictly following the ICS format:
  
  BEGIN:VCALENDAR
  VERSION:2.0
  BEGIN:VEVENT
  SUMMARY: [Event title] (If missing, generate a short fitting title)
  DTSTART: [YYYYMMDDTHHMMSSZ] (IF there is just 1 Date or DateTime given, it is always DTStart. If only Date and no Time is provided, Format is "DTSTART;VALUE=DATE:YYYYMMDD" and DTEND to 1 day after in same format)
  DTEND: [YYYYMMDDTHHMMSSZ] (If missing, set 1 hour after DTSTART)
  DESCRIPTION: [Short description, or leave empty if none]
  LOCATION: [Location, or leave empty if none]
  UID: [Use provided ID, or generate a random UUID if missing]
  END:VEVENT
  END:VCALENDAR
  
  Rules:
  
  - Dates must be in UTC and in YYYYMMDDTHHMMSSZ format.
  - No additional text outside the ICS format unless there is an ERROR.
  - Keep the ICS minimal, clean, and valid.
  ` + selectedText;

  try {
    const maxAttempts = 1;
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
      await utils.setStorage("errorFlag",1)
      await utils.setStorage("selectedText",selectedText);
      chrome.action.openPopup()
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
    console.error("Error during ICS generation: " + JSON.stringify(err, Object.getOwnPropertyNames(err)), err);
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
