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

  // === AUTO RESIZE TEXTAREA ===
  chatbox.addEventListener("input", () => {
    chatbox.style.height = "auto";
    chatbox.style.height = chatbox.scrollHeight + "px";
  });
const voiceBtn = document.querySelector('.voice-icon');

// Check if browser supports speech recognition
if ('webkitSpeechRecognition' in window) {
  const recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  voiceBtn.addEventListener('click', () => {
    recognition.start();
    voiceBtn.style.color = '#00e1ff'; // glowing when active
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    chatbox.value += (chatbox.value ? ' ' : '') + transcript;
    voiceBtn.style.color = '#fff';
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    voiceBtn.style.color = '#fff';
  };

  recognition.onend = () => {
    voiceBtn.style.color = '#fff';
  };
} else {
  alert('Speech Recognition not supported in this browser 😞');
}

  // === LOCAL STORAGE ===
  let conversations = JSON.parse(localStorage.getItem("bravexaChats")) || [];
  let currentChatId = null;

  // === GREETING & USERNAME ===
  const username = localStorage.getItem("username") || "User";
  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";

  const usernameEl = document.querySelector("#username");
  const heroEl = document.querySelector(".hero h1");

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
    chatbox.style.height = "auto"; // ✅ reset natural height smoothly

    // UI layout setup
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

    // AI typing placeholder
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
    chatWindow.innerHTML = "";
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

    historyList.style.overflowY = "auto";
    historyList.style.maxHeight = "250px";
  }

  // === DELETE CONVERSATION ===
  function deleteConversation(chatId) {
    const confirmDelete = confirm("🗑️ Delete this conversation permanently?");
    if (!confirmDelete) return;

    conversations = conversations.filter(c => c.id !== chatId);
    saveToLocal();
    updateHistorySidebar();

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
    chatbox.style.height = "auto"; // ✅ keeps resize natural
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

  // === SMOOTH SCROLL ===
  function makeMessageVisible(messageElement) {
    setTimeout(() => {
      messageElement.classList.add("visible");
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 10);
  }

  // === TYPE EFFECT ===
  function typeText(element, htmlContent, speed = 8) {
    let i = 0;
    element.innerHTML = "";
    const interval = setInterval(() => {
      element.innerHTML = htmlContent.substring(0, i);
      i += 3;
      if (i >= htmlContent.length) {
        element.innerHTML = htmlContent;
        clearInterval(interval);
      }
    }, speed);
    const scrollInterval = setInterval(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 80);
    setTimeout(() => clearInterval(scrollInterval), (htmlContent.length / 3) * speed + 100);
  }

  // === AI RESPONSE GENERATOR ===
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
    motivate: ["motivate", "inspire", "encourage", "boost"],
    weather: ["weather", "temperature", "climate", "forecast"],
    news: ["news", "headlines", "update", "latest"],
    voice: ["voice", "speak", "read", "talk"]
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
  
    // 🎯 GREETING  
    case "greeting":  
      response = `  
        <h2>👋 Hello!</h2>  
        <p>I’m <strong>Bravexa AI</strong> — your creative workspace assistant.</p>  
        <p>Try me with:<br>• "Generate leave letter"<br>• "Official email"<br>• "Weather today"<br>• "Latest news"</p>`;  
      break;  

    // 📨 EMAIL  
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

    // 📝 LEAVE LETTER  
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

    // 🧾 WORD DOC  
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

    // 💻 CODE  
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

    // ☁️ WEATHER REPORT  
    case "weather":  
      response = `  
        <h2>☁️ Weather Report</h2>  
        <p><b>Location:</b> Your City</p>  
        <p><b>Temperature:</b> 29°C</p>  
        <p><b>Condition:</b> Partly Cloudy ⛅</p>  
        <p><b>Advice:</b> Great day to study outside — take water with you! 💧</p>`;  
      break;  

    // 🗞️ NEWS UPDATE  
    case "news":  
      response = `  
        <h2>🗞️ Latest News</h2>  
        <ul>  
          <li>🌐 AI innovation accelerates global startups.</li>  
          <li>🚀 Space mission success: new satellite deployed.</li>  
          <li>📱 Tech giants announce collaboration for open AI frameworks.</li>  
        </ul>`;  
      break;  

    // 🔊 VOICE READER  
    case "voice":  
      response = `  
        <h2>🔊 Voice Mode</h2>  
        <p>Click below to hear Bravexa AI speak!</p>  
        <button id="speakBtn">🎤 Speak</button>  
        <script>  
          document.getElementById("speakBtn").onclick = () => {  
            const msg = new SpeechSynthesisUtterance("Hello, I am Bravexa AI. I can read your content aloud.");  
            msg.rate = 1;  
            msg.pitch = 1;  
            speechSynthesis.speak(msg);  
          };  
        </script>`;  
      break;  

    // 📚 SUBJECTS  
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
          <li>“Weather report”</li>  
          <li>“Read in voice”</li>  
          <li>“Show latest news”</li>  
        </ul>`;  
  }  
  
  return response;          
}

  // === VOICE BUTTON ===
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("voiceBtn")) {
      const content = e.target.parentElement.innerText || "No text available";
      speakText(content);
    }
  });

  function speakText(text) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.pitch = 1.0;
    utterance.rate = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  // === AVATAR MENU ===
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
      if (file) {
        const fileType = file.type.split("/")[0];
        alert(`📁 File uploaded: ${file.name} (${fileType})`);
      }
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

      alert("📸 Screenshot captured successfully!");
    } catch {
      alert("⚠️ Failed to take screenshot. Please allow permission.");
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
  updateHistorySidebar();
});

