// popup.js — Save and load Gemini API key using chrome.storage.sync

const apiKeyInput = document.getElementById("apiKey");
const saveBtn = document.getElementById("saveBtn");
const status = document.getElementById("status");

// Load existing key on popup open
chrome.storage.sync.get(["geminiApiKey"], (result) => {
  if (result.geminiApiKey) {
    apiKeyInput.value = result.geminiApiKey;
  }
});

saveBtn.addEventListener("click", () => {
  const key = apiKeyInput.value.trim();
  if (!key) {
    status.textContent = "Please enter a key.";
    status.style.color = "#f87171";
    return;
  }
  chrome.storage.sync.set({ geminiApiKey: key }, () => {
    status.textContent = "Saved! Open a LeetCode problem to start.";
    status.style.color = "#4ade80";
    setTimeout(() => (status.textContent = ""), 3000);
  });
});
