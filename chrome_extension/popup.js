import * as utils from './utils.js';

console.log('popup.js loaded');

const createBtn = document.getElementById('createIcsButton');
console.log('Button:', createBtn);
document.getElementById("codeInput").value = await utils.getStatus();
await utils.setStatus("");
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
    const aiMessage = await utils.generateICSFromOpenAI(userInput);

    if (!aiMessage) {
      alert("No response from AI.");
      return;
    }

    document.getElementById("aiResponse").value = aiMessage;

  } catch (error) {
    console.error("Exception caught:", error);
    alert("Something went wrong (exception). Check console.");
  }
});

// 2. Handle creating ICS file from AI output
document.getElementById('createIcsButton').addEventListener('click', async () => {
  const output = document.getElementById('aiResponse').value;
  console.log('Output Text:', output);

  if (!output) {
    alert('No text available to create an event!');
    return;
  }

  if (!utils.validateICS(output)) {
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

