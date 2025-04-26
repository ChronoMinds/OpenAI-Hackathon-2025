document.getElementById('changeColorButton').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: changeColor,
    });
  });
});

function changeColor() {
  document.body.style.backgroundColor = 'lightgreen';
}