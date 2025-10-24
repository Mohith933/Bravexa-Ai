document.addEventListener("DOMContentLoaded", function () {
  // === ELEMENT REFERENCES ===
  const hero = document.querySelector('.hero');
  const chatWindow = document.querySelector('.chat-window');
  const sendBtn = document.querySelector('.send-btn');
  const chatbox = document.querySelector('.chatbox');
  const inputArea = document.querySelector('.input-box');
  const footer = document.querySelector('.footer');
  const uploadDropdown = document.getElementById("uploadDropdown");
  const avatarIcon = document.getElementById("avatarIcon");
  const dropdownMenu = document.getElementById("dropdownMenu");
  const plusBtn = document.getElementById("plusBtn");
  const screenshotBtn = document.getElementById("screenshotBtn");
  const historyList = document.getElementById("historyList");
  const toggleHistoryBtn = document.getElementById("toggleHistory");

  // === LOCAL STORAGE ===
  let conversations = JSON.parse(localStorage.getItem("bravexaChats")) || [];
  let currentChatId = null;

  // === GREETING & USERNAME ===
  // === GREETING & USERNAME (only for dashboard) ===
  const username = localStorage.getItem("username") || "User";
  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";

  const usernameEl = document.querySelector("#username");
  const heroEl = document.querySelector(".hero h1");

  // Run only if these exist (dashboard)
  if (usernameEl && heroEl) {
    usernameEl.textContent = username;
    heroEl.textContent = `${greeting}, ${username}!`;
  }
  if (localStorage.getItem("username") && window.location.pathname.includes("index.html")) {
    window.location.href = "dashboard.html";
  }


  // === MESSAGE SEND EVENTS ===
  sendBtn.addEventListener('click', sendMessage);
  chatbox.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });

  // === SEND MESSAGE ===
  function sendMessage() {
    const userMessage = chatbox.value.trim();
    if (!userMessage) return;

    if (!currentChatId) startNewConversation(userMessage);

    addMessageToChat(userMessage, false);
    saveMessage(currentChatId, "user", userMessage);
    chatbox.value = "";

    // Hide hero and set layout
    hero.style.display = "none";
    inputArea.style.position = "fixed";
    chatWindow.style.marginTop = "80px";
    inputArea.style.bottom = "30px";
    inputArea.style.left = "50%";
    inputArea.style.transform = "translateX(-50%)";
    footer.style.marginTop = "0px";
    chatWindow.style.display = "flex";
    footer.style.fontSize = "10px";
    uploadDropdown.style.bottom = "30px";
    footer.innerHTML = "⚡ Bravexa AI Verify important details.";

    // Add AI typing placeholder
    const aiMessage = document.createElement("div");
    aiMessage.classList.add("message", "ai-message");
    aiMessage.innerHTML = `
      <div class="typing-hearts">
        <span><img src="chat.png"></span><p>Processing...</p>
      </div>`;
    chatWindow.appendChild(aiMessage);
    makeMessageVisible(aiMessage);

    setTimeout(async () => {
      const response = await generateAIResponse(userMessage);
      aiMessage.innerHTML = "";
      typeText(aiMessage, response);
      saveMessage(currentChatId, "ai", response);
    }, 1000);
  }

  // === START NEW CONVERSATION ===
  function startNewConversation(firstMessage) {
    chatWindow.innerHTML = ""; // Clear previous chat
    const chatId = Date.now();
    const title = firstMessage.length > 25 ? firstMessage.slice(0, 25) + "..." : firstMessage;
    const newChat = { id: chatId, title, messages: [] };
    conversations.unshift(newChat);
    currentChatId = chatId;
    updateHistorySidebar();
    saveToLocal();
  }

  // === ADD MESSAGE TO CHAT ===
  function addMessageToChat(message, isAI = false) {
    const newMessage = document.createElement("div");
    newMessage.classList.add("message", isAI ? "ai-message" : "user-message");
    newMessage.innerHTML = message;
    chatWindow.appendChild(newMessage);
    makeMessageVisible(newMessage);
  }

  // === SAVE MESSAGE ===
  function saveMessage(chatId, sender, text) {
    const chat = conversations.find(c => c.id === chatId);
    if (!chat) return;
    chat.messages.push({ sender, text });
    saveToLocal();
  }

  // === TOGGLE HISTORY SIDEBAR ===
  if (toggleHistoryBtn && historyList) {
    toggleHistoryBtn.addEventListener("click", () => {
      const isVisible = historyList.style.display === "block";
      historyList.style.display = isVisible ? "none" : "block";
    });
  }

  // === UPDATE HISTORY SIDEBAR ===
  function updateHistorySidebar() {
    if (!historyList) return;
    historyList.innerHTML = "";

    conversations.forEach(chat => {
      const item = document.createElement("div");
      item.className = "history-item";

      const titleSpan = document.createElement("span");
      titleSpan.textContent = chat.title;
      titleSpan.addEventListener("click", () => loadConversation(chat.id));

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️";
      deleteBtn.className = "delete-btn";
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteConversation(chat.id);
      });

      item.appendChild(titleSpan);
      item.appendChild(deleteBtn);
      historyList.appendChild(item);
    });

    // Enable scroll if many chats
    historyList.style.overflowY = "auto";
    historyList.style.maxHeight = "250px";
  }


  // === DELETE CONVERSATION ===
  function deleteConversation(chatId) {
    const confirmDelete = confirm("🗑️ Delete this conversation permanently?");
    window.location.href = "dashboard.html";
    if (!confirmDelete) return;

    conversations = conversations.filter(c => c.id !== chatId);
    saveToLocal();
    updateHistorySidebar();

    // If current chat deleted, reset chat view
    if (currentChatId === chatId) {
      currentChatId = null;
      chatWindow.innerHTML = "";
    }
  }

  // === LOAD CONVERSATION ===
  function loadConversation(chatId) {
    const chat = conversations.find(c => c.id === chatId);
    if (!chat) return;
    currentChatId = chatId;

    chatWindow.innerHTML = "";
    hero.style.display = "none";
    inputArea.style.position = "fixed";
    chatWindow.style.marginTop = "80px";
    inputArea.style.bottom = "30px";
    inputArea.style.left = "50%";
    inputArea.style.transform = "translateX(-50%)";
    footer.style.marginTop = "0px";
    chatWindow.style.display = "flex";
    footer.style.fontSize = "10px";
    uploadDropdown.style.bottom = "30px";
    footer.innerHTML = "⚡ Bravexa AI Verify important details.";

    chat.messages.forEach(msg => addMessageToChat(msg.text, msg.sender === "ai"));
  }

  // === SAVE TO LOCAL STORAGE ===
  function saveToLocal() {
    localStorage.setItem("bravexaChats", JSON.stringify(conversations));
  }

  // === SCROLL TO SHOW MESSAGES ===
  function makeMessageVisible(messageElement) {
    setTimeout(() => {
      messageElement.classList.add("visible");
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 10);
  }

  // === TYPE EFFECT ===
  // === BRAVEXA TYPE EFFECT ===  
function typeText(element, htmlContent, speed = 8) {
  let i = 0;
  const cleanText = htmlContent.replace(/<[^>]*>/g, ''); // removes HTML tags for smoother timing
  element.innerHTML = "";

  // show text quickly (faster than typing each char)
  const interval = setInterval(() => {
    element.innerHTML = htmlContent.substring(0, i);
    i += 3; // jump 3 chars per tick (superfast)
    if (i >= htmlContent.length) {
      element.innerHTML = htmlContent; // ensure full content at end
      clearInterval(interval);
    }
  }, speed);

  // smooth scroll effect
  const scrollInterval = setInterval(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, 80);

  // stop scroll when done
  setTimeout(() => clearInterval(scrollInterval), (htmlContent.length / 3) * speed + 100);
}
  // === SIMPLE AI RESPONSES ===
  // === 💫 BRAVEXA B1 — INTELLIGENT RESPONSE ENGINE ===
async function generateAIResponse(userMessage) {
  const msg = userMessage.toLowerCase();
  let response = "";

  // === 🟢 0. GREETING & INTRODUCTION ===
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    response = `
      <h2>👋 Hello, Founder!</h2>
      <p>I’m <strong>Bravexa AI (Build 1.0)</strong> — your intelligent assistant for logic, emotion, and creation.</p>
      <p>I can assist in <strong>Problem Solving</strong>, <strong>Fact Checking</strong>, <strong>Analysis</strong>, <strong>Generation</strong>, <strong>Research</strong>, and <strong>Conclusion</strong>.</p>
      <p>💡 Try something like:<br>
      • “Solve 25% of 240”<br>
      • “Generate a leave letter for 2 days”<br>
      • “Compare AI and ML”</p>
      <p>Let’s build clarity together. 🚀</p>`;
  }

  // === 🧩 1. PROBLEM SOLVING ===
  else if (msg.includes("solve") || msg.includes("find") || msg.includes("calculate")) {
    const exampleProblems = `
      <ul>
        <li>Find 15% of 480</li>
        <li>Solve 5x + 3 = 18</li>
        <li>Calculate area of a circle (radius 7cm)</li>
      </ul>`;

    response = `
      <h2>🧩 Problem Solving Mode</h2>
      <p>Bravexa breaks complex logic into clear steps.</p>
      <p>${exampleProblems}</p>
      <p>Try one, and I’ll solve it step-by-step ⚙️</p>`;
  }

  // === 🧠 2. FACT CHECKING ===
  else if (msg.includes("fact") || msg.includes("true or false") || msg.includes("check")) {
    response = `
      <h2>🧠 Fact Checking Mode</h2>
      <p>Bravexa verifies information using reasoning logic and contextual awareness.</p>
      <p>🔍 Try:</p>
      <ul>
        <li>“Check if humans can live on Mars”</li>
        <li>“Fact check: water boils at 90°C”</li>
        <li>“Is AI faster than the human brain?”</li>
      </ul>`;
  }

  // === 📊 3. ANALYSIS MODE ===
  else if (msg.includes("analyze") || msg.includes("compare") || msg.includes("difference")) {
    response = `
      <h2>📊 Analysis Mode</h2>
      <p>Bravexa compares, contrasts, and explains topics with balanced reasoning.</p>
      <p>🔍 Example:</p>
      <ul>
        <li>“Analyze Python vs Java”</li>
        <li>“Compare AI and ML”</li>
        <li>“Difference between RAM and ROM”</li>
      </ul>`;
  }

  // === ⚙️ 4. GENERATION (Docs + Code) ===
  else if (
    msg.includes("generate") ||
    msg.includes("leave letter") ||
    msg.includes("email") ||
    msg.includes("resume") ||
    msg.includes("project report") ||
    msg.includes("privacy policy") ||
    msg.includes("code") ||
    msg.includes("program")
  ) {
    // === LEAVE LETTER / EMAIL ===
    if (msg.includes("leave letter") || msg.includes("email")) {
      response = `
        <h2>✉️ Document Ready</h2>
        <p>Here’s your ${msg.includes("leave letter") ? "Leave Letter" : "Email"}:</p>
        <textarea id="docOutput" class="w-full p-3 rounded-lg border">${generateBravexaContent(msg)}</textarea>
        <button onclick="sendEmail()" class="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700">Send</button>
        <script>
          function sendEmail() {
            alert("✅ Document sent successfully via Bravexa Mail Engine!");
          }
        </script>`;
    }

    // === RESUME / PROJECT REPORT ===
    else if (msg.includes("resume") || msg.includes("project report")) {
      response = `
        <h2>📄 ${msg.includes("resume") ? "Resume" : "Project Report"} Generated</h2>
        <textarea id="copyText" class="w-full p-3 rounded-lg border">${generateBravexaContent(msg)}</textarea>
        <button onclick="copyText()" class="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700">Copy</button>
        <script>
          function copyText() {
            const text = document.getElementById('copyText');
            text.select();
            document.execCommand('copy');
            alert('✅ Copied successfully!');
          }
        </script>`;
    }

    // === CODE / PROGRAM ===
    else if (msg.includes("code") || msg.includes("program")) {
      response = `
        <h2>💻 Code Generated</h2>
        <pre id="codeOutput" class="bg-gray-900 text-white p-3 rounded-lg overflow-auto">${generateBravexaContent(msg)}</pre>
        <button onclick="copyCode()" class="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700">Copy Code</button>
        <script>
          function copyCode() {
            const code = document.getElementById('codeOutput');
            navigator.clipboard.writeText(code.innerText);
            alert('✅ Code copied!');
          }
        </script>`;
    }

    // === PRIVACY POLICY / GENERIC ===
    else {
      response = `
        <h2>📘 Document Generated</h2>
        <textarea id="genericCopy" class="w-full p-3 rounded-lg border">${generateBravexaContent(msg)}</textarea>
        <button onclick="copyGeneric()" class="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700">Copy</button>
        <script>
          function copyGeneric() {
            const text = document.getElementById('genericCopy');
            text.select();
            document.execCommand('copy');
            alert('✅ Copied successfully!');
          }
        </script>`;
    }
  }

  // === 🔍 5. DEEP RESEARCH ===
  else if (msg.includes("research") || msg.includes("study") || msg.includes("report on")) {
    response = `
      <h2>🔍 Deep Research Mode</h2>
      <p>Bravexa compiles structured knowledge and critical data for reports and essays.</p>
      <p>Try topics like:</p>
      <ul>
        <li>“Research about AI ethics”</li>
        <li>“Study of renewable energy trends”</li>
        <li>“Report on space exploration progress”</li>
      </ul>`;
  }

  // === 🧭 6. CONCLUSION ===
  else if (msg.includes("conclude") || msg.includes("summary") || msg.includes("final")) {
    response = `
      <h2>🧭 Conclusion Mode</h2>
      <p>Bravexa gives concise logical summaries to close your topic perfectly.</p>
      <p>Example:</p>
      <ul>
        <li>“Give conclusion for report on AI”</li>
        <li>“Summarize renewable energy advantages”</li>
      </ul>`;
  }

  // === 💤 7. DEFAULT / HELP MODE ===
  else {
    response = `
      <h2>💡 Bravexa Assistance</h2>
      <p>I can help across six intelligent modes:</p>
      <ul>
        <li>🧩 Problem Solving</li>
        <li>🧠 Fact Checking</li>
        <li>📊 Analysis</li>
        <li>⚙️ Generation</li>
        <li>🔍 Deep Research</li>
        <li>🧭 Conclusion</li>
      </ul>
      <p>Type your question to begin ⚡</p>`;
  }

  return response;
}
// === 💫 BRAVEXA B1 — Dynamic Content Generator ===
function generateBravexaContent(msg) {
  msg = msg.toLowerCase();
  let output = "";

  // === ✉️ LEAVE LETTER / EMAIL ===
  if (msg.includes("leave letter") || msg.includes("email")) {
    output = `
To,
The Principal,
[Your College Name]

Subject: Request for Leave

Respected Sir/Madam,
I am [Your Name], studying in [Your Department]. I kindly request leave from [Start Date] to [End Date] due to [Reason].

Thanking you,
Yours faithfully,
[Your Name]
`;
  }

  // === 🧑‍💼 RESUME ===
  else if (msg.includes("resume")) {
    output = `
Name: [Your Name]
Email: [Your Email]
Phone: [Your Phone]

Objective:
To contribute to emotionally intelligent systems that connect logic and creativity.

Skills:
• JavaScript  • Python  • AI Integration  • UI/UX Logic

Projects:
• Bravexa AI — Emotion + Logic Engine
• Valantine AI — Creative Poetry Model

Education:
• B.Tech in Computer Science (or your course)
• [College Name], [Year]

Thank you.
`;
  }

  // === 📘 PROJECT REPORT ===
  else if (msg.includes("project report")) {
    output = `
📘 Project Report — Bravexa AI

Title: Bravexa AI — Emotionally Intelligent System
Objective: To design an AI that combines logical clarity with emotional reasoning.

Modules:
1. UI/UX Interface
2. LLM Core Engine
3. Memory Layer
4. Code & Document Generator

Outcome:
The system bridges emotional intelligence with code reasoning for better human–AI connection.

Status: Beta Build 1.0 — Stable.
`;
  }

  // === 🔒 PRIVACY POLICY ===
  else if (msg.includes("privacy policy")) {
    output = `
🔒 Privacy Policy — Bravexa AI

Bravexa AI respects your privacy and ensures your data remains confidential.
• No personal data is stored without user consent.
• All interactions remain on your local device unless shared manually.
• Emotional and creative safety are our priority.

By using Bravexa AI, you agree to responsible and transparent AI use.
`;
  }

  // === 💻 CODE / PROGRAM ===
  else if (msg.includes("code") || msg.includes("program")) {
    // Detect language from user input
    let language = "javascript";
    if (msg.includes("python")) language = "python";
    else if (msg.includes("java")) language = "java";
    else if (msg.includes("c++") || msg.includes("cpp")) language = "cpp";
    else if (msg.includes("html")) language = "html";
    else if (msg.includes("css")) language = "css";

    const codeSnippets = {
      javascript: `// Simple Calculator Example
function calculate(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b !== 0 ? a / b : 'Error: divide by 0';
    default: return 'Invalid operator';
  }
}
console.log("Result:", calculate(5, 3, '+'));`,

      python: `# Simple Calculator Example
def calculate(a, b, op):
    if op == '+': return a + b
    elif op == '-': return a - b
    elif op == '*': return a * b
    elif op == '/': return a / b if b != 0 else 'Error: divide by 0'
    else: return 'Invalid operator'

print("Result:", calculate(5, 3, '+'))`,

      cpp: `#include <iostream>
using namespace std;
int main() {
    int a = 5, b = 3;
    char op = '+';
    int result;
    switch(op) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        default: result = 0;
    }
    cout << "Result: " << result << endl;
    return 0;
}`,

      java: `class Main {
  public static void main(String[] args) {
    int a = 5, b = 3;
    char op = '+';
    int result = 0;
    switch(op) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
    }
    System.out.println("Result: " + result);
  }
}`,

      html: `<!DOCTYPE html>
<html>
  <body>
    <h2>Simple Calculator</h2>
    <input id="a" type="number" placeholder="Number 1">
    <input id="b" type="number" placeholder="Number 2">
    <button onclick="alert(parseInt(a.value) + parseInt(b.value))">Add</button>
  </body>
</html>`,

      css: `body {
  background: #f9f9f9;
  font-family: Arial;
  color: #222;
}`
    };

    output = codeSnippets[language] || "// Code example not found.";
  }

  // === 🌐 FALLBACK (Generic) ===
  else {
    output = `
Bravexa AI generated your content successfully.
Use copy or send to proceed further. 💫`;
  }

  return output;
}
  // === AVATAR DROPDOWN ===
  avatarIcon.addEventListener("click", () => {
    dropdownMenu.classList.toggle("active");
  });

  // === UPLOAD DROPDOWN ===
  plusBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    uploadDropdown.style.display =
      uploadDropdown.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", (e) => {
    if (!uploadDropdown.contains(e.target) && e.target !== plusBtn) {
      uploadDropdown.style.display = "none";
    }
  });
  
  // === FILE UPLOAD HANDLER ===
  document.querySelectorAll("#imageUpload, #videoUpload, #fileUpload").forEach(input => {
    input.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) alert(`File uploaded: ${file.name}`);
    });
  });

  // === SCREENSHOT CAPTURE ===
  screenshotBtn.addEventListener("click", async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);
      const blob = await imageCapture.takePhoto();
      track.stop();

      const url = URL.createObjectURL(blob);
      const img = document.createElement("img");
      img.src = url;
      img.alt = "Screenshot";
      img.style.maxWidth = "200px";
      img.style.borderRadius = "8px";
      chatWindow.appendChild(img);
    } catch {
      alert("Failed to take screenshot. Please allow permission.");
    }
  });

  // === RESPONSIVE LAYOUT ===
  function adjustLayoutForViewport() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isLandscape = viewportWidth > viewportHeight;

    if (viewportWidth <= 420) {
      sendBtn.style.right = isLandscape ? "50px" : "20px";
      inputArea.style.width = "90%";
    } else if (viewportWidth <= 1024) {
      sendBtn.style.right = isLandscape ? "60px" : "30px";
      inputArea.style.width = "80%";
    } else {
      sendBtn.style.right = "40px";
      inputArea.style.width = "50%";
    }
  }

  window.addEventListener("resize", adjustLayoutForViewport);
  adjustLayoutForViewport();
  updateHistorySidebar(); // Load history at startup
});









