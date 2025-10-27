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
 async function generateAIResponse(userMessage) {        
  const msg = userMessage.toLowerCase().trim();        
  let response = "";        

  // --- 🧩 UNDERSTANDING LAYER ---        
  const intents = {        
    greeting: ["hello", "hi", "hey", "good morning", "good evening"],        
    leave: ["leave letter", "application", "holiday", "absent", "permission"],        
    email: ["email", "official", "mail", "message"],        
    resume: ["resume", "project", "documentation", "portfolio"],        
    word: ["word", "report", "docx", "file"],        
    excel: ["excel", "sheet", "data", "xlsx"],        
    powerpoint: ["presentation", "slides", "ppt", "deck"],        
    access: ["access", "database", "accdb"],        
    cs: ["computer science", "programming", "algorithm", "data structure"],        
    physics: ["physics", "force", "motion", "energy"],        
    math: ["math", "algebra", "geometry", "calculus"],        
    code: ["code", "program", "script", "snippet"],        
    motivate: ["motivate", "inspire", "encourage", "boost"]        
  };        

  let intent = "default";        
  for (const [key, words] of Object.entries(intents)) {        
    if (words.some(word => msg.includes(word))) {        
      intent = key;        
      break;        
    }        
  }        

  // --- ⚙️ RULE-BASED RESPONSE LAYER ---        
  switch (intent) {        

    // 🎯 GREETING (No Buttons)
    case "greeting":
      response = `
        <h2>👋 Hello!</h2>
        <p>I’m <strong>Bravexa AI</strong> — your creative workspace assistant.</p>
        <p>Try me with:<br>• "Generate leave letter"<br>• "Official email"<br>• "Create project documentation"<br>• "Make presentation slides"</p>`;
      break;

    // 📨 EMAIL (Copy + Send)
    case "email":
      response = `
        <h2>📧 Official Email</h2>
        <div class="code-block-container">
          <div class="code-toolbar">
            <span class="lang-label">📧 mailto</span>
            <div class="btn-group">
              <button class="copyBtn">📋 Copy</button>
              <button class="sendBtn">✉️ Send</button>
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
      break;

    // 📝 LEAVE LETTER (Copy + Send)
    case "leave":
      response = `
        <h2>📄 Leave Letter</h2>
        <div class="code-block-container">
          <div class="code-toolbar">
            <span class="lang-label">📧 mailto</span>
            <div class="btn-group">
              <button class="copyBtn">📋 Copy</button>
              <button class="sendBtn">✉️ Send</button>
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
      break;

    // 📘 PROJECT / RESUME (Copy + Save)
    case "resume":
      response = `
        <h2>📘 Project Documentation</h2>
        <div class="code-block-container">
          <div class="code-toolbar">
            <span class="lang-label">📘 resume / doc</span>
            <div class="btn-group">
              <button class="copyBtn">📋 Copy</button>
              <button class="saveBtn">💾 Save</button>
            </div>
          </div>
          <pre class="code-content" contenteditable="true">
<b>Project Title:</b> Smart Waste Management System

<b>Objective:</b> To automate waste collection and monitoring using IoT sensors.

<b>Technologies Used:</b>
- Arduino, Ultrasonic Sensors
- Node.js Backend
- Firebase Database

<b>Outcome:</b> Efficient and eco-friendly waste management with live monitoring.
          </pre>
        </div>`;
      break;

    // 🧾 WORD DOC (Copy + Save)
    case "word":
      response = `
        <h2>📝 Microsoft Word Document</h2>
        <div class="code-block-container">
          <div class="code-toolbar">
            <span class="lang-label">📄 .docx</span>
            <div class="btn-group">
              <button class="copyBtn">📋 Copy</button>
              <button class="saveBtn">💾 Save</button>
            </div>
          </div>
          <pre class="code-content" contenteditable="true">
<b>Title:</b> Annual Business Report

<b>Introduction:</b>
This document presents a detailed analysis of company growth, revenue trends, and improvement plans.

<b>Key Points:</b>
- Q1 sales growth: +15%
- Q2 market expansion: +10%
- Future outlook: optimistic growth

<b>Conclusion:</b>
Sustained innovation and customer focus remain top priorities.
          </pre>
        </div>`;
      break;

    // 📊 EXCEL (Copy + Save)
    case "excel":
      response = `
        <h2>📊 Microsoft Excel Sheet</h2>
        <div class="code-block-container">
          <div class="code-toolbar">
            <span class="lang-label">📈 .xlsx</span>
            <div class="btn-group">
              <button class="copyBtn">📋 Copy</button>
              <button class="saveBtn">💾 Save</button>
            </div>
          </div>
          <pre class="code-content" contenteditable="true">
| Month | Sales | Profit | Growth |
|--------|--------|---------|---------|
| Jan    | 12000  | 4000   | 33%     |
| Feb    | 15000  | 5000   | 35%     |
| Mar    | 18000  | 6000   | 38%     |
          </pre>
        </div>`;
      break;

    // 🎤 POWERPOINT (Copy + Save)
    case "powerpoint":
      response = `
        <h2>🎤 PowerPoint Presentation</h2>
        <div class="code-block-container">
          <div class="code-toolbar">
            <span class="lang-label">🎞️ .pptx</span>
            <div class="btn-group">
              <button class="copyBtn">📋 Copy</button>
              <button class="saveBtn">💾 Save</button>
            </div>
          </div>
          <pre class="code-content" contenteditable="true">
<b>Slide 1:</b> Introduction
- Welcome to Bravexa AI Presentation

<b>Slide 2:</b> Problem & Solution
- Challenges in workspace automation
- Bravexa AI’s Intelligent Assistant Layer

<b>Slide 3:</b> Future Vision
- Integration with MS Office Suite
- AI Collaboration System
          </pre>
        </div>`;
      break;

    // 💾 ACCESS DATABASE (Copy + Save)
    case "access":
      response = `
        <h2>💾 Microsoft Access Database Report</h2>
        <div class="code-block-container">
          <div class="code-toolbar">
            <span class="lang-label">📁 .accdb</span>
            <div class="btn-group">
              <button class="copyBtn">📋 Copy</button>
              <button class="saveBtn">💾 Save</button>
            </div>
          </div>
          <pre class="code-content" contenteditable="true">
<b>Table:</b> StudentRecords

| ID | Name        | Department | Marks | Grade |
|----|--------------|-------------|--------|--------|
| 1  | John Doe     | CS          | 87     | A      |
| 2  | Priya Sharma | ECE         | 91     | A+     |
| 3  | Rahul Kumar  | ME          | 76     | B+     |
          </pre>
        </div>`;
      break;

    // 💻 CODE (Copy Only)
    case "code":
      let lang = "javascript";        
      if (msg.includes("python")) lang = "python";        
      else if (msg.includes("java")) lang = "java";        
      else if (msg.includes("html")) lang = "html";        
      else if (msg.includes("css")) lang = "css";        

      const examples = {        
        javascript: `function greet(name) {\n  console.log("Hello, " + name + "!");\n}\ngreet("Bravexa User");`,        
        python: `def greet(name):\n    print("Hello, " + name + "!")\n\ngreet("Bravexa User")`,        
        java: `class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, Bravexa User!");\n  }\n}`,        
        html: `<!DOCTYPE html>\n<html>\n<body>\n  <h1>Hello, Bravexa User!</h1>\n</body>\n</html>`,        
        css: `body {\n  background-color: #f5f5f5;\n  color: #333;\n  font-family: Arial;\n}`        
      };        

      response = `
        <h2>💻 ${lang.toUpperCase()} Code</h2>
        <div class="code-block-container">
          <div class="code-toolbar">
            <span class="lang-label">${lang.toUpperCase()}</span>
            <div class="btn-group"><button class="copyBtn">📋 Copy</button></div>
          </div>
          <pre class="code-content"><code>${examples[lang]}</code></pre>
        </div>`;
      break;

    // 📚 SUBJECTS (No Buttons)
    case "cs":
      response = `<h2>💻 Computer Science Note</h2><p><b>Topic:</b> Time Complexity</p><p>Binary Search → O(log n)</p>`;
      break;

    case "physics":
      response = `<h2>⚛️ Physics Concept</h2><p><b>Topic:</b> Newton’s Laws of Motion</p><p>F = m × a</p>`;
      break;

    case "math":
      response = `<h2>📐 Mathematics Formula</h2><p><b>Topic:</b> Calculus</p><p>d/dx (x²) = 2x</p>`;
      break;

    // 🚀 MOTIVATION
    case "motivate":
      response = `<h2>🚀 Motivation Boost</h2><p>Every small step builds your mastery. Keep moving forward! 💪</p>`;
      break;

    // 🌟 DEFAULT
    default:
      response = `
        <p>✨ I’m Bravexa AI — your workspace friend. Try:</p>
        <ul>
          <li>“Generate leave letter”</li>
          <li>“Official email”</li>
          <li>“Create project documentation”</li>
          <li>“Generate Excel data”</li>
          <li>“Make presentation slides”</li>
        </ul>`;
  }

  return response;        
}
// === GLOBAL EVENT DELEGATION FOR BUTTONS ===
document.addEventListener("click", (e) => {
  const block = e.target.closest(".code-block-container");
  if (!block) return;

  const textElement = block.querySelector(".code-content");
  if (!textElement) return;

  // Get the current live edited text
  const text = textElement.innerText.trim();

  // --- COPY BUTTON ---
  if (e.target.classList.contains("copyBtn")) {
    navigator.clipboard.writeText(text)
      .then(() => alert("📋 Copied to clipboard!"))
      .catch(() => alert("❌ Failed to copy. Please try again."));
  }

  // --- SEND BUTTON (Email or Leave Letter) ---
  if (e.target.classList.contains("sendBtn")) {
    const subject = "Generated from Bravexa AI";
    const body = encodeURIComponent(text);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      // Mobile: open default mail app
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    } else {
      // Desktop: open Gmail compose window
      const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`;
      window.open(gmailURL, "_blank");
    }
  }

  // --- SAVE BUTTON (for docs, excel, ppt, access, resume, etc.) ---
  if (e.target.classList.contains("saveBtn")) {
    // Try to detect document type label
    const label = block.querySelector(".lang-label")?.innerText.toLowerCase() || "output";
    let fileName = "bravexa_output.txt";

    if (label.includes("word") || label.includes(".docx")) fileName = "Bravexa_Word_Document.docx";
    else if (label.includes("excel") || label.includes(".xlsx")) fileName = "Bravexa_Excel_Sheet.xlsx";
    else if (label.includes("ppt") || label.includes("presentation")) fileName = "Bravexa_Presentation.pptx";
    else if (label.includes("access") || label.includes("database")) fileName = "Bravexa_Access_DB.accdb";
    else if (label.includes("resume")) fileName = "Bravexa_Project_Doc.txt";
    else if (label.includes("code")) fileName = "Bravexa_Code.txt";

    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
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










