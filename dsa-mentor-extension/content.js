// content.js — Injects the mentor panel into LeetCode problem pages

(function () {
  let chatHistory = []; // {role: 'user'|'model', text: string}
  let panelInjected = false;

  function getPlatform() {
    const host = window.location.hostname;
    if (host.includes("leetcode.com")) return "leetcode";
    if (host.includes("geeksforgeeks.org")) return "gfg";
    if (host.includes("codechef.com")) return "codechef";
    return "unknown";
  }

  function getProblemTitle() {
    const platform = getPlatform();

    if (platform === "leetcode") {
      const titleEl = document.querySelector('[data-cy="question-title"]') ||
                      document.querySelector('a[href*="/problems/"] div.text-title-large') ||
                      document.querySelector('div.text-title-large');
      return titleEl ? titleEl.textContent.trim() : document.title;
    }

    if (platform === "gfg") {
      const titleEl = document.querySelector('div.problems_header_content__title h3') ||
                      document.querySelector('.problem-tab h1') ||
                      document.querySelector('h1');
      return titleEl ? titleEl.textContent.trim() : document.title;
    }

    if (platform === "codechef") {
      const titleEl = document.querySelector('.problem-title') ||
                      document.querySelector('h1') ||
                      document.querySelector('._problem-name_');
      return titleEl ? titleEl.textContent.trim() : document.title;
    }

    return document.title;
  }

  function getProblemDescription() {
    const platform = getPlatform();

    if (platform === "leetcode") {
      const descEl = document.querySelector('[data-track-load="description_content"]') ||
                      document.querySelector('div.elfjS') ||
                      document.querySelector('div[class*="description"]');
      return descEl ? descEl.innerText.trim().slice(0, 4000) : "";
    }

    if (platform === "gfg") {
      const descEl = document.querySelector('div.problems_problem_content__Xm_eO') ||
                      document.querySelector('.problemStatementContainer') ||
                      document.querySelector('.problem-statement') ||
                      document.querySelector('[class*="problem_content"]');
      return descEl ? descEl.innerText.trim().slice(0, 4000) : "";
    }

    if (platform === "codechef") {
      const descEl = document.querySelector('.problem-statement') ||
                      document.querySelector('._statement_') ||
                      document.querySelector('[class*="problem-statement"]') ||
                      document.querySelector('main');
      return descEl ? descEl.innerText.trim().slice(0, 4000) : "";
    }

    return "";
  }

  function getUserCode() {
    const platform = getPlatform();

    // Monaco editor (LeetCode, GFG new UI, CodeChef new UI)
    const monacoLines = document.querySelectorAll(".monaco-editor .view-lines .view-line");
    if (monacoLines.length) {
      return Array.from(monacoLines).map((l) => l.textContent).join("\n").slice(0, 4000);
    }

    // CodeMirror editor (older GFG/CodeChef)
    const cmLines = document.querySelectorAll(".CodeMirror-line");
    if (cmLines.length) {
      return Array.from(cmLines).map((l) => l.textContent).join("\n").slice(0, 4000);
    }

    // ACE editor fallback
    const aceLines = document.querySelectorAll(".ace_line");
    if (aceLines.length) {
      return Array.from(aceLines).map((l) => l.textContent).join("\n").slice(0, 4000);
    }

    return "";
  }

  function isSupportedPage() {
    return getPlatform() !== "unknown";
  }

  function createPanel() {
    if (panelInjected) return;
    panelInjected = true;

    const panel = document.createElement("div");
    panel.id = "dsa-mentor-panel";
    panel.innerHTML = `
      <div id="dsa-mentor-header">
        <span>🧭 DSA Mentor</span>
        <div>
          <button id="dsa-mentor-minimize" title="Minimize">—</button>
          <button id="dsa-mentor-close" title="Close">✕</button>
        </div>
      </div>
      <div id="dsa-mentor-body">
        <div id="dsa-mentor-chat"></div>
        <div id="dsa-mentor-quick-actions">
          <button class="dsa-quick-btn" data-action="analyze">📋 Analyze Problem</button>
          <button class="dsa-quick-btn" data-action="review">🔍 Review My Code</button>
          <button class="dsa-quick-btn" data-action="complexity">⏱️ Complexity</button>
          <button class="dsa-quick-btn" data-action="solution">🧩 Full Solution</button>
        </div>
        <div id="dsa-mentor-controls">
          <select id="dsa-hint-level">
            <option value="1">Level 1: Conceptual nudge</option>
            <option value="2">Level 2: Algorithm category</option>
            <option value="3">Level 3: Approach explained</option>
            <option value="4">Level 4: Pseudocode</option>
            <option value="5">Level 5: Near-implementation</option>
          </select>
          <button id="dsa-mentor-ask-default">Get a hint</button>
        </div>
        <div id="dsa-mentor-input-row">
          <textarea id="dsa-mentor-input" placeholder="Ask the mentor anything (e.g. 'why is my code wrong?')"></textarea>
          <button id="dsa-mentor-send">Send</button>
        </div>
      </div>
    `;
    document.body.appendChild(panel);

    // Toggle button (floating icon to reopen if closed)
    const toggleBtn = document.createElement("button");
    toggleBtn.id = "dsa-mentor-toggle";
    toggleBtn.textContent = "🧭";
    toggleBtn.title = "Open DSA Mentor";
    toggleBtn.style.display = "none";
    document.body.appendChild(toggleBtn);

    document.getElementById("dsa-mentor-close").addEventListener("click", () => {
      panel.style.display = "none";
      toggleBtn.style.display = "flex";
    });

    document.getElementById("dsa-mentor-minimize").addEventListener("click", () => {
      panel.classList.toggle("minimized");
    });

    toggleBtn.addEventListener("click", () => {
      panel.style.display = "flex";
      toggleBtn.style.display = "none";
    });

    document.getElementById("dsa-mentor-send").addEventListener("click", () => {
      const input = document.getElementById("dsa-mentor-input");
      const msg = input.value.trim();
      if (!msg) return;
      input.value = "";
      sendToMentor(msg);
    });

    document.getElementById("dsa-mentor-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        document.getElementById("dsa-mentor-send").click();
      }
    });

    document.getElementById("dsa-mentor-ask-default").addEventListener("click", () => {
      sendToMentor("Can you give me a hint for this problem based on my current code?");
    });

    const quickActionPrompts = {
      analyze: "Please analyze this problem: identify the difficulty, topics involved, key observations, constraints, expected optimal complexity, and common mistakes.",
      review: "Please review my current code for correctness, bugs, edge cases, readability, time complexity, space complexity, and optimization opportunities.",
      complexity: "What is the time and space complexity of my current approach/code? Suggest improvements if possible.",
      solution: "I'm asking for the full solution. Please explain the intuition, then the approach, then provide the code, then the complexity, then why it works."
    };

    document.querySelectorAll(".dsa-quick-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        sendToMentor(quickActionPrompts[action]);
      });
    });

    // Greeting
    addChatBubble("model", `Hi! I'm your DSA mentor for "${getProblemTitle()}". I'll guide you with hints — ask me anything or click "Get a hint".`);
  }

  function simpleMarkdownToHtml(text) {
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Code blocks ```...```
    html = html.replace(/```([\s\S]*?)```/g, (_, code) => `<pre class="dsa-code">${code.trim()}</pre>`);
    // Inline code `...`
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    // Bold **...**
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // Headings ### or ##
    html = html.replace(/^#{1,6}\s?(.+)$/gm, "<strong class='dsa-heading'>$1</strong>");
    // Bullet points
    html = html.replace(/^[-*]\s+(.+)$/gm, "• $1");
    // Line breaks
    html = html.replace(/\n/g, "<br>");

    return html;
  }

  function addChatBubble(role, text, isLoading = false) {
    const chat = document.getElementById("dsa-mentor-chat");
    const bubble = document.createElement("div");
    bubble.className = `dsa-bubble dsa-${role}` + (isLoading ? " dsa-loading" : "");
    if (role === "model" && !isLoading) {
      bubble.innerHTML = simpleMarkdownToHtml(text);
    } else {
      bubble.textContent = text;
    }
    chat.appendChild(bubble);
    chat.scrollTop = chat.scrollHeight;
    return bubble;
  }

  function sendToMentor(userMessage) {
    addChatBubble("user", userMessage);
    const loadingBubble = addChatBubble("model", "Thinking...", true);

    chrome.storage.sync.get(["geminiApiKey"], (result) => {
      const apiKey = result.geminiApiKey;
      const hintLevel = document.getElementById("dsa-hint-level").value;

      const payload = {
        apiKey,
        problemTitle: getProblemTitle(),
        problemDescription: getProblemDescription(),
        userCode: getUserCode(),
        hintLevel,
        chatHistory,
        userMessage
      };

      chrome.runtime.sendMessage({ type: "ASK_MENTOR", payload }, (response) => {
        loadingBubble.remove();
        if (!response) {
          addChatBubble("model", "Error: no response from background script.");
          return;
        }
        if (!response.success) {
          addChatBubble("model", `⚠️ ${response.error}`);
          return;
        }
        const reply = response.data.reply;
        addChatBubble("model", reply);
        chatHistory.push({ role: "user", text: userMessage });
        chatHistory.push({ role: "model", text: reply });
        // Cap history length to avoid huge payloads
        if (chatHistory.length > 12) chatHistory = chatHistory.slice(-12);
      });
    });
  }

  // Wait for the page's content to load before injecting
  function descriptionLikelyLoaded() {
    const platform = getPlatform();
    if (platform === "leetcode") {
      return !!(document.querySelector('[data-track-load="description_content"]') || document.querySelector("div.elfjS"));
    }
    if (platform === "gfg") {
      return !!(document.querySelector('div.problems_problem_content__Xm_eO') || document.querySelector('.problemStatementContainer') || document.querySelector('.problem-statement'));
    }
    if (platform === "codechef") {
      return !!(document.querySelector('.problem-statement') || document.querySelector('._statement_') || document.querySelector('main'));
    }
    return false;
  }

  if (isSupportedPage()) {
    const observer = new MutationObserver(() => {
      if (descriptionLikelyLoaded()) {
        createPanel();
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Fallback in case observer never fires
    setTimeout(createPanel, 5000);
  }
})();
