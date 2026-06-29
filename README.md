# dsa-mentor-extension

# 🧭 DSA Mentor

AI-powered Chrome extension that helps you solve coding problems through guided hints, code reviews, and complexity analysis instead of instantly revealing solutions.

---

## ✨ Features

- 📋 Problem Analysis
- 💡 Progressive Hint System (Levels 1–5)
- 🔍 Code Review & Debugging
- ⏱ Complexity Analysis
- 🧩 Full Solution Mode
- 🤖 Powered by Gemini AI

---

## 🌐 Supported Platforms

- LeetCode
- GeeksforGeeks
- CodeChef

---

## 🚀 Installation

### 1. Get a Gemini API Key

Visit:

```text
https://aistudio.google.com/app/apikey
```

### 2. Load Extension

1. Open `chrome://extensions`
2. Enable **Developer Mode**
3. Click **Load Unpacked**
4. Select the project folder

### 3. Configure API Key

1. Click the extension icon
2. Paste your Gemini API Key
3. Click **Save**

---
## 📂 Project Structure

```text
dsa-mentor/
│
├── manifest.json      # Extension configuration
├── background.js      # Gemini API communication
├── content.js         # Injects mentor panel into coding platforms
├── styles.css         # Mentor panel styling
│
├── popup.html         # Extension popup UI
├── popup.css          # Popup styling
├── popup.js           # API key management
│
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## 📖 Usage

1. Open a supported coding problem.
2. DSA Mentor appears automatically.
3. Use quick actions:

- Analyze Problem
- Review My Code
- Complexity Analysis
- Get Hint
- Full Solution

---

## 🛠 Tech Stack

- JavaScript
- Chrome Extension (Manifest V3)
- Gemini API
- Chrome Storage API

---

## 🔒 Privacy

- No backend server
- API key stored locally
- No tracking
- No data collection

---

## 🤝 Contributing

Pull requests and suggestions are welcome.

---

## 📄 License

MIT License


