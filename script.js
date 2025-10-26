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

  // --- 🧠 UNDERSTANDING LAYER ---
  // Normalize and detect intent keywords.
  const intents = {
    greeting: ["hello", "hi", "hey", "good morning", "good evening"],
    leave: ["leave letter", "application", "holiday", "absent", "permission"],
    email: ["email", "official", "mail", "message"],
    resume: ["resume", "project", "documentation", "portfolio"],
    word: ["word", "report", "docx", "file"],
    presentation: ["presentation", "slides", "ppt", "deck"],
    code: ["code", "program", "script", "snippet"],
    motivate: ["motivate", "inspire", "encourage", "boost"]
  };

  let intent = "default";

  // simple understanding mapping
  for (const [key, words] of Object.entries(intents)) {
    if (words.some(word => msg.includes(word))) {
      intent = key;
      break;
    }
  }

  // --- 💬 RULE-BASED LAYER ---
  switch (intent) {
    case "greeting":
      response = `
        <h2>👋 Hello!</h2>
        <p>I’m <strong>Bravexa AI</strong> — your creative workspace assistant.</p>
        <p>Try me with:<br>• "Generate leave letter"<br>• "Official email"<br>• "Create project documentation"<br>• "Make presentation slides"</p>`;
      break;

    case "leave":
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
      break;

    case "email":
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
      break;

    case "resume":
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
      break;

    case "word":
      response = `
        <h2>📝 Word Document</h2>
        <div class="code-block-container">
          <div class="code-toolbar">
            <span class="lang-label">📄 .docx</span>
            <div class="btn-group">
              <button id="copyBtn">📋 Copy</button>
              <button id="saveBtn">💾 Save</button>
            </div>
          </div>
          <pre class="code-content" contenteditable="true">
<b>Title:</b> Annual Business Growth Report    

<b>Introduction:</b>    
This report outlines the performance growth, challenges, and strategic plans for the upcoming financial year.    

<b>Highlights:</b>    
- 24% increase in client acquisition    
- 15% boost in overall revenue    
- Expansion into 3 new markets    

<b>Conclusion:</b>    
Consistent improvement in operations and partnerships are key to sustaining growth.
          </pre>
        </div>`;
      break;

    case "presentation":
      response = `
        <h2>🎤 Presentation Slides</h2>
        <div class="code-block-container">
          <div class="code-toolbar">
            <span class="lang-label">🎞️ presentation</span>
            <div class="btn-group">
              <button id="copyBtn">📋 Copy</button>
              <button id="saveBtn">💾 Save</button>
            </div>
          </div>
          <pre class="code-content" contenteditable="true">
<b>Slide 1:</b> Introduction    
- Welcome to our Product Launch    
- Overview of Features    

<b>Slide 2:</b> Problem Statement    
- Current market gap    
- User needs and challenges    

<b>Slide 3:</b> Our Solution    
- AI-driven system    
- Real-time results    

<b>Slide 4:</b> Future Vision    
- Scalability    
- Global expansion
          </pre>
        </div>`;
      break;

    case "code":
      let lang = "javascript";
      if (msg.includes("python")) lang = "python";
      else if (msg.includes("java")) lang = "java";
      else if (msg.includes("html")) lang = "html";
      else if (msg.includes("css")) lang = "css";

      const examples = {
        javascript: `function greet(name) {\n  console.log("Hello, " + name + "!");\n}\n\ngreet("Bravexa User");`,
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
            <div class="btn-group"><button id="copyBtn">📋 Copy</button></div>
          </div>
          <pre class="code-content"><code>${examples[lang]}</code></pre>
        </div>`;
      break;

    case "motivate":
      response = `
        <h2>🚀 Motivation Boost</h2>
        <p>Every line of code and every idea you test is a step toward mastery. Keep building, keep believing! 💪</p>`;
      break;

    default:
      response = `
        <p>✨ I’m Bravexa AI — your workspace friend. Try:</p>
        <ul>
          <li>“Generate leave letter”</li>
          <li>“Official email”</li>
          <li>“Create project documentation”</li>
          <li>“Generate HTML code”</li>
          <li>“Make presentation slides”</li>
        </ul>`;
  }

  return response;
}
// === GLOBAL EVENT DELEGATION FOR BUTTONS ===
document.addEventListener("click", (e) => {
  const block = e.target.closest(".code-block-container");
  if (!block) return;
  const text = block.querySelector(".code-content").textContent.trim();

  // Copy text
  if (e.target.classList.contains("copyBtn")) {
    navigator.clipboard.writeText(text);
    alert("📋 Copied to clipboard!");
  }

  // Send Mail (for email & leave letters)
  if (e.target.classList.contains("sendBtn")) {
    const subject = "Generated from Bravexa AI";
    const body = encodeURIComponent(text);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      // Mobile default mail app
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    } else {
      // Desktop Gmail
      const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`;
      window.open(gmailURL, "_blank");
    }
  }

  // Save file (for code or docs)
  if (e.target.classList.contains("saveBtn")) {
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bravexa_output.txt";
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










