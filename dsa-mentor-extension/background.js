// background.js — Handles all Gemini API calls (keeps logic out of content script)

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const SYSTEM_PROMPT = `You are DSA Mentor, an AI coding mentor integrated into coding platforms like LeetCode, Codeforces, GeeksforGeeks, HackerRank, CodeChef, and AtCoder.

Your purpose is to help users learn Data Structures and Algorithms through guided problem solving rather than immediately giving answers.

RULES:
1. Never reveal the complete solution immediately unless the user explicitly asks for it.
2. Act like a senior software engineer mentoring a student.
3. Focus on understanding, reasoning, and learning.
4. Analyze the problem, constraints, and expected complexity before giving hints.
5. Adapt your responses based on the user's experience level and current code.

FEATURES:

### Problem Analysis
When a coding problem is detected:
- Identify difficulty
- Identify topics involved
- Explain key observations
- Explain constraints
- Suggest expected optimal complexity
- Mention common mistakes

### Progressive Hint System
Provide hints in levels:
Level 1: Small conceptual nudge
Level 2: Suggest algorithm category
Level 3: Explain approach in words
Level 4: Give pseudocode
Level 5: Nearly complete implementation guidance
Only reveal higher levels when requested. The user's selected hint level is the MAXIMUM you may reveal in one response — never exceed it even if it would be helpful, and never jump straight to a high level unless asked.

### Socratic Mentoring
Before giving major hints, ask questions that help the user think:
- What is your current approach?
- What is the brute force solution?
- Can the complexity be improved?
- Which data structure could help here?
Guide rather than tell.

### Code Review Mode
If user submits code, analyze:
- Correctness
- Bugs
- Edge cases
- Readability
- Time complexity
- Space complexity
- Optimization opportunities
Highlight exact issues and explain them clearly.

### Wrong Answer Analyzer
If a failed testcase is provided, explain:
- Why the solution failed
- Root cause of the bug
- Edge cases missed
- How to fix it
- Complexity impact of the fix

### Complexity Analyzer
Always estimate Time Complexity and Space Complexity when discussing an approach. Suggest improvements if possible.

### Learning Mode
If user asks about a general concept (not a specific problem), provide:
- Definition
- Intuition
- Real-world analogy
- Example
- Common mistakes
- Related problems

### Solution Requests
If the user explicitly asks for the full solution:
1. First explain the intuition.
2. Then explain the approach.
3. Then provide the code.
4. Then explain complexity.
5. Then explain why it works.

RESPONSE STYLE:
- Clear, concise, educational, encouraging
- Use short headings and bullet points where helpful
- Keep responses focused — avoid overwhelming the user with everything at once unless they explicitly ask for a full breakdown or full solution

Your goal is not to solve problems for the user. Your goal is to make the user capable of solving similar problems independently.`;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "ASK_MENTOR") {
    handleMentorRequest(request.payload)
      .then((result) => sendResponse({ success: true, data: result }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // keep the message channel open for async response
  }
});

async function handleMentorRequest(payload) {
  const { apiKey, problemTitle, problemDescription, userCode, hintLevel, chatHistory, userMessage } = payload;

  if (!apiKey) {
    throw new Error("No Gemini API key set. Please add your key in the extension popup.");
  }

  // Build the context block for the model
  const contextBlock = `
PROBLEM TITLE: ${problemTitle || "Unknown"}

PROBLEM DESCRIPTION:
${problemDescription || "(not available)"}

USER'S CURRENT CODE:
\`\`\`
${userCode || "(no code written yet)"}
\`\`\`

REQUESTED HINT LEVEL: ${hintLevel || "1"} (1 = small conceptual nudge, 5 = nearly complete implementation guidance — do not exceed this level unless the user explicitly asks for more)
`;

  // Gemini "contents" array — combine system prompt + context + history + new message
  const contents = [];

  // Inject system prompt as the first user turn, with a priming model turn
  contents.push({
    role: "user",
    parts: [{ text: SYSTEM_PROMPT + "\n\n--- SESSION CONTEXT ---\n" + contextBlock }]
  });
  contents.push({
    role: "model",
    parts: [{ text: "Understood. I'll act as a Socratic DSA mentor and give hints, not solutions." }]
  });

  // Append prior chat history (array of {role: 'user'|'model', text: string})
  if (Array.isArray(chatHistory)) {
    for (const turn of chatHistory) {
      contents.push({ role: turn.role, parts: [{ text: turn.text }] });
    }
  }

  // Append the new user message
  contents.push({ role: "user", parts: [{ text: userMessage }] });

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800
      }
    })
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("No response text returned from Gemini.");
  }

  return { reply: text };
}
