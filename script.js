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
  // === SIMPLE RULE-BASED AI RESPONSE SYSTEM ===
  // === SIMPLE AI RESPONSES ===
async function generateAIResponse(userMessage) {
  const msg = userMessage.toLowerCase();
  let response = "";

  // --- GREETINGS ---
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    response = `
      <h2>👋 Welcome to Bravexa B1</h2>
      <p>Hey Founder, I’m <strong>Bravexa AI</strong> — your creative and coding partner.</p>
      <p>Try prompts like:<br>
      • “Generate privacy policy”<br>
      • “Create responsive navbar in HTML”<br>
      • “Write official email to client”</p>`;
  }

  // --- DOCUMENTATION / PROJECT WRITING ---
  else if (msg.includes("project report") || msg.includes("documentation") || msg.includes("project intro")) {
    response = `
      <h2>📘 Project Documentation Template</h2>
      <div class="editable-container">
        <div id="editableContent" class="editable-content" contenteditable="false">
<h3>Project Title:</h3> Bravexa AI – Intelligent Assistant System

<h3>Objective:</h3>
To build a multimodal AI assistant that supports text, image, and audio interactions for educational and productivity use.

<h3>Modules:</h3>
1️⃣ User Interface (Frontend)<br>
2️⃣ LLM Processing Core<br>
3️⃣ Data Handling Layer<br>
4️⃣ Emotion + Memory Engine<br>
5️⃣ Cloud Deployment (AWS)

<h3>Conclusion:</h3>
Bravexa B1 is designed to bridge emotional clarity and technical intelligence, offering comfort and creativity together.
        </div>
        <div class="edit-buttons">
          <button id="editBtn">✏️ Edit</button>
          <button id="saveBtn" disabled>💾 Save</button>
          <button id="downloadBtn">⬇️ Download</button>
        </div>
      </div>`;
  }

  else if (msg.includes("privacy policy")) {
    response = `
      <h2>🔒 Privacy Policy</h2>
      <div class="editable-container">
        <div id="editableContent" class="editable-content" contenteditable="false">
<h3>Privacy Policy for Bravexa AI</h3>
We respect your privacy. Bravexa B1 does not collect, store, or share personal data without your consent.
All files processed in guest mode remain local to your device. Logged-in users have full control of their data.
Your emotional and creative safety is our foundation.
        </div>
        <div class="edit-buttons">
          <button id="editBtn">✏️ Edit</button>
          <button id="saveBtn" disabled>💾 Save</button>
        </div>
      </div>`;
  }

  // --- EMAIL / LETTERS / COMMUNICATION ---
  else if (msg.includes("email") || msg.includes("official") || msg.includes("mail")) {
    response = `
      <h2>📧 Official Email Template</h2>
      <div class="editable-container">
        <div id="editableContent" class="editable-content" contenteditable="false">
Subject: Regarding Upcoming Project Meeting  

Dear [Recipient Name],  
I hope you are doing well.  
I would like to confirm the details for our upcoming project discussion scheduled for [Date].  
Please let me know if the timing works for you.  

Warm regards,  
[Your Name]  
[Your Position]  
[Your Contact Info]
        </div>
        <div class="edit-buttons">
          <button id="editBtn">✏️ Edit</button>
          <button id="saveBtn" disabled>💾 Save</button>
          <button id="sendBtn">✉️ Send</button>
        </div>
      </div>`;
  }

  else if (msg.includes("thank you") || msg.includes("appreciation")) {
    response = `
      <h2>💌 Appreciation Email</h2>
      <p>Subject: Heartfelt Thanks!</p>
      <p>Dear [Name],</p>
      <p>I sincerely appreciate your support and collaboration.  
      Your efforts made a real difference in the project’s success. 🌟</p>
      <p>Warm regards,<br>[Your Name]</p>`;
  }

  else if (msg.includes("leave letter") || msg.includes("application")) {
    response = `
      <h2>📄 Leave Letter</h2>
      <div class="editable-container">
        <div id="editableContent" class="editable-content" contenteditable="false">
To  
The Principal,  
[Your College Name],  

Subject: Request for Leave  

Respected Sir/Madam,  
I am [Your Name], studying in [Your Department].  
I kindly request leave from [Start Date] to [End Date] due to [Reason].  

Thanking you,  
Yours faithfully,  
[Your Name]
        </div>
        <div class="edit-buttons">
          <button id="editBtn">✏️ Edit</button>
          <button id="saveBtn" disabled>💾 Save</button>
        </div>
      </div>`;
  }

  // --- CODE GENERATION (HTML, JS, PYTHON, etc.) ---
  // --- CODE GENERATION (FULL TOOLBAR + EDIT + COPY + SAVE) ---
else if (msg.includes("code") || msg.includes("program")) {
  let language = "javascript";
  let langLabel = "JavaScript";

  if (msg.includes("python")) { language = "python"; langLabel = "Python"; }
  else if (msg.includes("java")) { language = "java"; langLabel = "Java"; }
  else if (msg.includes("c++") || msg.includes("cpp")) { language = "cpp"; langLabel = "C++"; }
  else if (msg.includes("html")) { language = "html"; langLabel = "HTML"; }
  else if (msg.includes("css")) { language = "css"; langLabel = "CSS"; }

  // Example snippets
  const codeExamples = {
    javascript: `function greet(name) {\n  console.log("Hello, " + name + "!");\n}\n\ngreet("Bravexa User");`,
    python: `def greet(name):\n    print("Hello, " + name + "!")\n\ngreet("Bravexa User")`,
    cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, Bravexa User!";\n    return 0;\n}`,
    java: `class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, Bravexa User!");\n  }\n}`,
    html: `<!DOCTYPE html>\n<html>\n<body>\n  <h1>Hello, Bravexa User!</h1>\n</body>\n</html>`,
    css: `body {\n  background-color: #fff0f5;\n  color: #222;\n  font-family: 'Quicksand', sans-serif;\n  text-align: center;\n}`
  };

  const codeSnippet = codeExamples[language];

  response = `
  <h2>💻 ${langLabel} Code Generator</h2>
  <div class="code-block-container">
    <div class="code-toolbar">
      <span class="lang-label">${langLabel}</span>
      <div class="btn-group">
        <button id="editCodeBtn">✏️ Edit</button>
        <button id="saveCodeBtn" disabled>💾 Save</button>
        <button id="copyCodeBtn">📋 Copy</button>
      </div>
    </div>

    <pre id="codeOutput" class="code-content" contenteditable="false"><code class="${language}">${codeSnippet}</code></pre>
  </div>

  <div class="ai-note">
    <p>💡 Tip: You can edit, save, or copy this code directly — saved code is stored in your local storage.</p>
  </div>`;

  // --- Add event handling dynamically ---
  setTimeout(() => {
    const codeOutput = document.getElementById("codeOutput");
    const editBtn = document.getElementById("editCodeBtn");
    const saveBtn = document.getElementById("saveCodeBtn");
    const copyBtn = document.getElementById("copyCodeBtn");

    if (editBtn && saveBtn && codeOutput) {
      editBtn.addEventListener("click", () => {
        codeOutput.contentEditable = "true";
        codeOutput.focus();
        saveBtn.disabled = false;
      });

      saveBtn.addEventListener("click", () => {
        localStorage.setItem("savedCode", codeOutput.innerText);
        saveBtn.disabled = true;
        alert("💾 Code saved successfully!");
      });

      copyBtn.addEventListener("click", async () => {
        await navigator.clipboard.writeText(codeOutput.innerText);
        alert("📋 Code copied to clipboard!");
      });
    }
  }, 100);
}

  // --- PRODUCTIVITY TOOLS ---
  else if (msg.includes("todo") || msg.includes("task")) {
    response = `
      <h2>🗓️ To-Do List Template</h2>
      <ul>
        <li>🧠 Plan your day’s priorities</li>
        <li>💻 Code 2 hours for Bravexa B1</li>
        <li>🌿 Take 15 mins calm walk</li>
        <li>📖 Read or learn something creative</li>
      </ul>`;
  }

  // --- MOTIVATION / QUOTES ---
  else if (msg.includes("motivate") || msg.includes("inspire")) {
    response = `
      <h2>🔥 Daily Drive</h2>
      <p>“You don’t need permission to rise. You only need direction and courage.” 🚀</p>
      <p>Stay consistent — even small effort builds a future Founder energy. 💪</p>`;
  }

  else if (msg.includes("quote")) {
    response = `
      <h2>📜 Founder Quote</h2>
      <p>“Build something that outlives you.” — Anonymous Visionary 🪜</p>`;
  }

  else if (msg.includes("fact")) {
    response = `
      <h2>🧠 Tech Fact</h2>
      <p>The word “robot” was first used in a 1920 Czech play — derived from “robota”, meaning “forced labor.” 🤖</p>`;
  }

  // --- DEFAULT ---
  else {
    response = `
      <p>💡 I can help you write project docs, generate letters, or code fast.<br>
      Try prompts like:<br>
      • “Generate privacy policy”<br>
      • “Write official mail”<br>
      • “Quick HTML login form code”</p>`;
  }

  return response;
}
  document.addEventListener("click", (e) => {
  const target = e.target;

  // Identify which section the button belongs to
  const container = target.closest(".editable-container");
  if (!container) return;

  const editable = container.querySelector(".editable-content");
  const editBtn = container.querySelector("button[id^='editBtn']");
  const saveBtn = container.querySelector("button[id^='saveBtn']");
  const sendBtn = container.querySelector("button[id^='sendBtn']");

  // === EDIT BUTTON ===
  if (target.id.startsWith("editBtn")) {
    editable.contentEditable = "true";
    editable.style.border = "1px dashed #007bff";
    editable.style.background = "#0d1b2a";
    editBtn.disabled = true;
    saveBtn.disabled = false;
  }

  // === SAVE BUTTON ===
  if (target.id.startsWith("saveBtn")) {
    editable.contentEditable = "false";
    editable.style.border = "none";
    editable.style.background = "transparent";
    saveBtn.disabled = true;
    editBtn.disabled = false;

    // Validation for email type
    if (editable.id.includes("email")) {
      const content = editable.innerText;
      const mustHave = ["Subject:", "Dear", "Best regards"];
      const missing = mustHave.filter(phrase => !content.includes(phrase));

      if (missing.length > 0) {
        alert("⚠️ Structure missing. Restoring original format.");
        const original = localStorage.getItem("EmailTemplate_Original");
        if (original) editable.innerHTML = original;
      } else {
        localStorage.setItem(`${editable.id}_LastEdited`, editable.innerHTML);
        alert("✅ Content saved locally!");
      }
    }
  }

  // === SEND BUTTON ===
  if (target.id.startsWith("sendBtn")) {
    const recipient = prompt("📧 Enter recipient email address:", "example@gmail.com");
    if (!recipient) return alert("❌ Email not sent — no recipient specified.");

    const rawText = editable.innerText;
    const subjectMatch = rawText.match(/Subject:\s*(.+)/i);
    const subject = subjectMatch ? subjectMatch[1].trim() : "Bravexa Email";
    const bodyStart = rawText.indexOf("Dear");
    const body = bodyStart !== -1 ? rawText.slice(bodyStart).trim() : rawText.trim();
    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
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
  // === Enable Copy, Edit, and Save for document.addEventListener("click", (event) => {
  const target = event.target;
  if (!target.id) return;

  const match = target.id.match(/(copyCodeBtn|editCodeBtn|saveCodeBtn)-(\w+)/);
  if (!match) return;

  const action = match[1];
  const language = match[2];
  const codeOutput = document.getElementById(`codeOutput-${language}`);
  const copyBtn = document.getElementById(`copyCodeBtn-${language}`);
  const editBtn = document.getElementById(`editCodeBtn-${language}`);
  const saveBtn = document.getElementById(`saveCodeBtn-${language}`);

  if (action === "copyCodeBtn") {
    navigator.clipboard.writeText(codeOutput.innerText);
    copyBtn.textContent = "✅ Copied!";
    setTimeout(() => (copyBtn.textContent = "📋 Copy"), 1500);
  }

  if (action === "editCodeBtn") {
    codeOutput.contentEditable = "true";
    codeOutput.style.background = "#2a2a2a";
    codeOutput.style.outline = "1px dashed #00c3ff";
    editBtn.disabled = true;
    saveBtn.disabled = false;
  }

  if (action === "saveCodeBtn") {
    codeOutput.contentEditable = "false";
    codeOutput.style.outline = "none";
    localStorage.setItem(`Bravexa_${language}_Code`, codeOutput.innerText);
    alert(`💾 ${language.toUpperCase()} code saved locally!`);
    saveBtn.disabled = true;
    editBtn.disabled = false;
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









