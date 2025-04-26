// utils.js
import ICAL from './ical.js'

export async function getOpenAIKey() {
  const result = await chrome.storage.local.get("openaiKey");
  return result.openaiKey;
}

export function validateICS(icsContent) {
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

export async function generateICSFromOpenAI(prompt) {
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


export function convertICSToGoogleEvent(icsContent) {
  try {
    const jcalData = ICAL.parse(icsContent);
    const comp = new ICAL.Component(jcalData);
    const vevent = comp.getFirstSubcomponent("vevent");

    if (!vevent) {
      console.error("No VEVENT found in ICS.");
      return null;
    }

    const summary = vevent.getFirstPropertyValue("summary") || '';
    const description = vevent.getFirstPropertyValue("description") || '';
    const location = vevent.getFirstPropertyValue("location") || '';
    const uid = vevent.getFirstPropertyValue("uid") || '';
    const startTime = vevent.getFirstPropertyValue("dtstart");
    const endTime = vevent.getFirstPropertyValue("dtend");

    if (!startTime || !endTime) {
      console.error("Missing start or end time in ICS.");
      return null;
    }

    // Format the dateTime correctly
    //const startDateTime = startTime.toString(); // e.g. '20250427T150000Z'
    //const endDateTime = endTime.toString();     // e.g. '20250427T160000Z'

    // Convert 'YYYYMMDDTHHmmssZ' → 'YYYY-MM-DDTHH:mm:ssZ'
    function formatICALDate(icalDateObj) {
      // icalDateObj is an ICAL.Time object, not a plain string
      const year = icalDateObj.year.toString().padStart(4, '0');
      const month = icalDateObj.month.toString().padStart(2, '0');
      const day = icalDateObj.day.toString().padStart(2, '0');
      const hour = icalDateObj.hour.toString().padStart(2, '0');
      const minute = icalDateObj.minute.toString().padStart(2, '0');
      const second = icalDateObj.second.toString().padStart(2, '0');
    
      return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
    }
    
    
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    

    const googleEvent = {
      summary,
      location,
      description,
      start: {
        dateTime: formatICALDate(startTime),
        timeZone: userTimeZone, // You could dynamically detect if needed
      },
      end: {
        dateTime: formatICALDate(endTime),
        timeZone: userTimeZone,
      },
    };

    return googleEvent;

  } catch (e) {
    console.error("Error parsing ICS:", e);
    return null;
  }
}

