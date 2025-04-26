// document.getElementById("submitCode").addEventListener("click", async function () {
//   const userInput = document.getElementById("codeInput").value.trim();

//   if (!userInput) {
//     alert("Please enter some text first.");
//     return;
//   }

//   try {
//     const response = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer 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` 
//       },
//       body: JSON.stringify({
//         model: "gpt-3.5-turbo",
//         messages: [{ role: "user", content: userInput }]
//       })
//     });

//     console.log("Raw response:", response);

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("OpenAI error response:", errorText);
//       alert("OpenAI error: " + errorText); // Add this to see it immediately
//       return;
//     }

//     const data = await response.json();
//     console.log("Parsed data:", data);

//     const aiMessage = data.choices?.[0]?.message?.content || "No response from AI.";
//     document.getElementById("aiResponse").value = aiMessage;

//   } catch (error) {
//     console.error("Exception caught:", error);
//     alert("Something went wrong (exception). Check console.");
//   }
// });








console.log('popup.js loaded'); // temp check that should be deleted later
const createBtn = document.getElementById('createIcsButton');
console.log('Button:', createBtn);

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
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer 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` // Warning: don't leave this exposed long-term
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userInput }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI error response:", errorText);
      alert("OpenAI error: " + errorText);
      return;
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || "No response from AI.";
    document.getElementById("aiResponse").value = aiMessage;

  } catch (error) {
    console.error("Exception caught:", error);
    alert("Something went wrong (exception). Check console.");
  }
});

// 2. Handle creating ICS file from AI output
document.getElementById('createIcsButton').addEventListener('click', () => {
  const output = document.getElementById('aiResponse').value; // Notice: use aiResponse
  console.log('Output Text:', output); 

  if (!output) {
    alert('No text available to create an event!');
    return;
  }

  const date = chrono.parseDate(output);
  console.log('Parsed Date:', date); 

  if (!date) {
    alert('Could not find a valid date/time in the output text.');
    return;
  }

  createEvent({
    start: [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes()],
    duration: { hours: 1 },
    title: 'Event from Output',
    description: output,
    location: 'Unknown'
  }, (error, value) => {
    if (error) {
      console.error('Error creating ICS:', error);
      alert('Error creating ICS file.');
      return;
    }

    const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'event.ics';
    link.click();
  });
});









