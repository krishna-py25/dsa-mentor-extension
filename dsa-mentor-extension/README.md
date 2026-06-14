# DSA Mentor — Chrome Extension

A LeetCode-embedded AI mentor that gives **hints, not solutions**, powered by the Gemini API.

## Setup

### 1. Get a Gemini API Key
- Go to https://aistudio.google.com/app/apikey
- Create a free API key

### 2. Load the Extension
1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `dsa-mentor-extension` folder

### 3. Add Your API Key
- Click the extension icon in the toolbar
- Paste your Gemini API key → **Save**

### 4. Use It
- Open any problem on `leetcode.com/problems/...`
- A panel appears bottom-right
- Click **"Get a hint"** or type a question
- Choose hint level: Subtle / Medium / Strong

## How It Works
- `content.js` scrapes the problem title, description, and your current code from the Monaco editor
- `background.js` sends this context + your message to the Gemini API with a strict "mentor, not solver" system prompt
- The response is displayed in the chat panel, with conversation history maintained per session

## File Structure
```
dsa-mentor-extension/
├── manifest.json
├── background.js     # Gemini API calls
├── content.js        # Injects panel, scrapes LeetCode DOM
├── styles.css         # Panel styling
├── popup.html/css/js  # API key settings UI
└── icons/
```

## Notes
- API key is stored in `chrome.storage.sync` (synced across your signed-in Chrome browsers)
- Chat history is capped at 12 turns per session to limit token usage
- If LeetCode changes its DOM structure, selectors in `content.js` (`getProblemTitle`, `getProblemDescription`, `getUserCode`) may need updates
