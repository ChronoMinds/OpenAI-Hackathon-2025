import * as utils from './utils.js';

console.log('popup.js loaded');

var ics = "";

const createBtn = document.getElementById('createIcsButton');
console.log('Button:', createBtn);
if(await utils.getStorage("errorFlag") == 1) {
  document.getElementById("codeInput").value = await utils.getStorage("selectedText");

  document.getElementById("aiResponse").value = await utils.generateICSFromOpenAI("Please formulate an instructive sentence for the user, to add all needed informations, based on this error log: " + await utils.getStorage("log"));

  await utils.setStorage("errorFlag",0);
}
else {
  await utils.setStorage("log", "");
}
if (createBtn) {
  createBtn.addEventListener('click', () => {
    console.log('Create ICS Button clicked!');
  });
} else {
  console.error('Create ICS Button not found!');
}

// 1. Handle sending code to OpenAI
document.getElementById("submitCode").addEventListener("click", async function () {
  const userInput = document.getElementById("codeInput").value.trim();

  if (!userInput) {
    alert("Please enter some text first.");
    return;
  }

  try {
    const log = await utils.getStorage("log");
    const prompt = "Please execute the user task/information in question and add a valid ICS file after five hashtags ('#####'). The user does not get to see the ics itself but the system will take care of it. User task/information: " + userInput;
    const aiMessage = await utils.generateICSFromOpenAI(prompt);
    if (!aiMessage) {
      alert("No response from AI.");
      return;
    }

    document.getElementById("aiResponse").value = aiMessage.split("#####")[0];
    ics = aiMessage.split("#####")[1].trim()

  } catch (error) {
    console.error("Exception caught:", error);
    alert("Something went wrong (exception). Check console.");
  }
});

// 2. Handle creating ICS file from AI output
document.getElementById('createIcsButton').addEventListener('click', async () => {
  // const output = document.getElementById('aiResponse').value;
  const output = ics;
  console.log('Output Text:', output);

  if (!output) {
    alert('No text available to create an event!');
    return;
  }

  if (!(utils.validateICS(output))) {
    alert('Generated text is not a valid ICS format.');
    return;
  }

  try {
    const blob = new Blob([output], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'event.ics';
    link.click();
  } catch (error) {
    console.error('Error creating ICS file:', error);
    alert('Error creating ICS file.');
  }
});

document.getElementById("codeInput").addEventListener("keydown", function (event) {
  if (event.key === "Enter" && event.ctrlKey) {
    event.preventDefault(); // Verhindert neues Zeilenzeichen
    document.getElementById("submitCode").click(); // Löst den Klick-Handler aus
  }
});
