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

export async function getStatus() {
  return (await chrome.storage.local.get("status")).status;
}
export async function setStatus(value) {
  await chrome.storage.local.set({ status: value });
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
