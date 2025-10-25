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
// === SIMPLE AI RESPONSES ===
async function generateAIResponse(userMessage) {
  const msg = userMessage.toLowerCase();
  let response = "";

  // --- GREETINGS ---
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    response = `
      <h2>👋 Hello!</h2>
      <p>I’m <strong>Bravexa AI</strong> — ready to help you write, code, or learn something new!</p>
      <p>Try saying:<br>• "Generate leave letter"<br>• "Official email"<br>• "Project documentation"<br>• "Python code for calculator"</p>`;
  }

  // --- LEAVE LETTER ---
else if (msg.includes("leave letter") || msg.includes("application")) {
  response = `
    <h2>📄 Leave Letter</h2>
    <div class="code-block-container">
      <div class="code-toolbar">
        <span class="lang-label">📧 mailto</span>
        <div class="btn-group">
          <button id="copyBtn">📋 Copy</button>
          <button id="sendBtn">✉️ Send</button>
        </div>
      </div>
      <pre class="code-content" contenteditable="true">
To  
The Principal,  
[Your College Name],  
[City].  

Subject: Request for Leave  

Respected Sir/Madam,  
I am [Your Name], studying in [Your Department].  
I kindly request leave from [Start Date] to [End Date] due to [Reason].  

Thanking you,  
Yours faithfully,  
[Your Name]
      </pre>
    </div>`;
}

// --- OFFICIAL EMAIL ---
else if (msg.includes("email") || msg.includes("official")) {
  response = `
    <h2>📧 Official Email</h2>
    <div class="code-block-container">
      <div class="code-toolbar">
        <span class="lang-label">📧 mailto</span>
        <div class="btn-group">
          <button id="copyBtn">📋 Copy</button>
          <button id="sendBtn">✉️ Send</button>
        </div>
      </div>
      <pre class="code-content" contenteditable="true">
Subject: Regarding Project Discussion  

Dear [Recipient Name],  
I hope you are doing well.  

I would like to schedule a short discussion about our project progress and upcoming deadlines.  
Please let me know your availability.  

Best regards,  
[Your Name]  
[Your Contact Info]
      </pre>
    </div>`;
}

// --- RESUME / PROJECT DOC ---
else if (msg.includes("resume") || msg.includes("project") || msg.includes("documentation")) {
  response = `
    <h2>📘 Project Documentation</h2>
    <div class="code-block-container">
      <div class="code-toolbar">
        <span class="lang-label">📘 resume / doc</span>
        <div class="btn-group">
          <button id="copyBtn">📋 Copy</button>
          <button id="saveBtn">💾 Save</button>
        </div>
      </div>
      <pre class="code-content" contenteditable="true">
<b>Project Title:</b> Smart Waste Management System  

<b>Objective:</b> To automate waste collection and monitoring using IoT sensors.  

<b>Technologies Used:</b>  
- Arduino, Ultrasonic Sensors  
- Node.js Backend  
- Firebase Database  

<b>Outcome:</b> Efficient and eco-friendly waste management with live status monitoring.
      </pre>
    </div>`;
}

  // --- CODE GENERATION ---
  else if (msg.includes("code") || msg.includes("program")) {
    let language = "javascript";
    let langLabel = "JavaScript";

    if (msg.includes("python")) { language = "python"; langLabel = "Python"; }
    else if (msg.includes("c++") || msg.includes("cpp")) { language = "cpp"; langLabel = "C++"; }
    else if (msg.includes("java")) { language = "java"; langLabel = "Java"; }
    else if (msg.includes("html")) { language = "html"; langLabel = "HTML"; }
    else if (msg.includes("css")) { language = "css"; langLabel = "CSS"; }

    const codeExamples = {
      javascript: `function greet(name) {\n  console.log("Hello, " + name + "!");\n}\ngreet("Bravexa User");`,
      python: `def calculator(a, b, op):\n    if op == '+': return a + b\n    elif op == '-': return a - b\n    elif op == '*': return a * b\n    elif op == '/': return a / b\n\nprint(calculator(5, 3, '+'))`,
      cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, Bravexa User!";\n    return 0;\n}`,
      java: `class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, Bravexa User!");\n  }\n}`,
      html: `<!DOCTYPE html>\n<html>\n<body>\n  <h1>Welcome to Bravexa</h1>\n  <p>This is a sample web page.</p>\n</body>\n</html>`,
      css: `body {\n  background-color: #222;\n  color: #fff;\n  font-family: Arial;\n  text-align: center;\n}`
    };

    const codeSnippet = codeExamples[language];
    response = `
      <h2>💻 ${langLabel} Code Example</h2>
      <div class="code-block-container">
        <div class="code-toolbar">
          <span class="lang-label">${langLabel}</span>
          <button id="copyCodeBtn">📋 Copy</button>
        </div>
        <pre class="code-content"><code>${codeSnippet}</code></pre>
      </div>`;
  }

  // --- MOTIVATION ---
  else if (msg.includes("motivate") || msg.includes("inspire")) {
    response = `
      <h2>💪 Bravexa Motivation</h2>
      <p>Every great builder starts small — but never stops.  
      Be proud of progress, not perfection. Keep going, Founder 🚀</p>`;
  }

  // --- QUOTES & FACTS ---
  else if (msg.includes("quote")) {
    response = `
      <h2>📜 Quote</h2>
      <p>“Don’t wait for the perfect moment — take the moment and make it perfect.” ✨</p>`;
  }

  else if (msg.includes("fact") || msg.includes("knowledge")) {
    response = `
      <h2>🧠 Tech Fact</h2>
      <p>Did you know? The first computer mouse was made of wood in 1964 by Douglas Engelbart!</p>`;
  }

  // --- JOKES ---
  else if (msg.includes("joke")) {
    response = `
      <h2>😂 Tech Joke</h2>
      <p>Why did the computer go to therapy?<br>Because it had too many tabs open! 😆</p>`;
  }

  // --- DEFAULT RESPONSE ---
  else {
    response = `
      <p>💡 I’m ready to help you write letters, generate code, or document projects.<br>
      Try saying:<br>• “Official email”<br>• “Resume format”<br>• “HTML login page code”</p>`;
  }

  return response;

// === GLOBAL EVENT DELEGATION FOR BUTTONS ===
document.addEventListener("click", function (e) {
  // COPY BUTTON
  if (e.target.id === "copyCodeBtn" || e.target.id === "copyBtn") {
    const parent = e.target.closest(".editable-container, .code-block-container");
    const text = parent.querySelector(".editable-content, .code-content")?.innerText || "";
    navigator.clipboard.writeText(text);
    e.target.textContent = "✅ Copied!";
    setTimeout(() => (e.target.textContent = "📋 Copy"), 1500);
  }
  // SEND BUTTON (EMAIL)
  if (e.target.id === "sendBtn") {
    const content = e.target.closest(".editable-container").querySelector(".editable-content").innerText;
    const subject = encodeURIComponent("From Bravexa AI - Message");
    const body = encodeURIComponent(content);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  // SAVE BUTTON (for resume or projects)
  if (e.target.id === "saveBtn") {
    const parent = e.target.closest(".editable-container");
    const content = parent.querySelector(".editable-content").innerText;
    const key = "bravexa_saved_" + Date.now();
    localStorage.setItem(key, content);
    e.target.textContent = "💾 Saved!";
    setTimeout(() => (e.target.textContent = "Save"), 1500);
  }
});
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









