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


  document.getElementById("editLogoBtn").addEventListener("click", () => {
  window.location.href = "index.html";
  });



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
    if (userMessage) {
      addMessageToChat(userMessage);
      chatbox.value = "";
    }

    // Hide hero and set layout
    hero.style.display = "none";
    inputArea.style.position = "fixed";
    chatWindow.style.marginTop = "80px";
    inputArea.style.bottom = "31px";
    inputArea.style.left = "50%";
    inputArea.style.transform = "translateX(-50%)";
    footer.style.marginTop = "0px";
    chatWindow.style.display = "flex";
    footer.style.fontSize = "10px";
    footer.innerHTML = "⚡ Bravexa AI Verify important details.";
  
  }

   // Show messages inside chat window
  function addMessageToChat(message) {
    // User message
    const newMessage = document.createElement("div");
    newMessage.classList.add("message", "user-message");
    newMessage.textContent = message;
    chatWindow.appendChild(newMessage);
    makeMessageVisible(newMessage);

    // AI typing hearts animation
    const aiMessage = document.createElement("div");
    aiMessage.classList.add("message", "ai-message");
    aiMessage.innerHTML = `
     <div class="typing-hearts">
        <span><img src="chat.png"></span><p>Processing...</p>
      </div>
    `;
    chatWindow.appendChild(aiMessage);
    makeMessageVisible(aiMessage);
    
    // Replace with AI response
    setTimeout(async () => {
      const response = await generateAIResponse(message);
      aiMessage.innerHTML = "";
      typeText(aiMessage, response);
    }, 1500);
    
  }

 // === SCROLL TO SHOW MESSAGES ===
  function makeMessageVisible(messageElement) {
    setTimeout(() => {
      messageElement.classList.add("visible");
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 10);
  }

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
    motivate: ["motivate", "inspire", "encourage", "boost"],
    weather: ["weather", "temperature", "climate", "forecast"],
    news: ["news", "headlines", "latest", "today news"],
    quote: ["quote", "saying", "inspire me"],
    time: ["time", "clock", "date", "day"]
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

    case "greeting":
      response = `
        <h2>👋 Hello!</h2>
        <p>I’m <strong>Bravexa AI</strong> — your creative workspace assistant.</p>
        <p>Try:<br>• "Generate leave letter"<br>• "Official email"<br>• "Weather report"<br>• "Show latest news"</p>`;
      break;

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

<b>Objective:</b> Automate waste collection and monitoring using IoT.

<b>Technologies:</b> Arduino, Node.js, Firebase
<b>Outcome:</b> Eco-friendly waste management with live monitoring.
          </pre>
        </div>`;
      break;

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
This report summarizes the company’s growth and performance across key metrics.
          </pre>
        </div>`;
      break;

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
<b>Slide 1:</b> Introduction to Bravexa AI  
<b>Slide 2:</b> Features & AI Layers  
<b>Slide 3:</b> Vision for Future AI Workspaces  
          </pre>
        </div>`;
      break;

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
          </pre>
        </div>`;
      break;

    // 📰 NEWS
    case "news":
      response = `
        <h2>📰 Latest News</h2>
        <p>🟢 Global markets steady as tech stocks rise.</p>
        <p>🟢 India launches new space exploration project.</p>
        <p>🟢 AI startups show record growth in 2025.</p>
        <p><i>Note: For live updates, connect API integration.</i></p>`;
      break;

    // 🌤️ WEATHER
    case "weather":
      response = `
        <h2>🌤️ Weather Report</h2>
        <p>📍 Location: [Your City]</p>
        <p>🌡️ Temperature: 29°C</p>
        <p>☀️ Condition: Clear Sky</p>
        <p>💨 Wind: 10 km/h</p>
        <p><i>Live weather via API coming soon.</i></p>`;
      break;

    // ⏰ TIME
    case "time":
      const now = new Date();
      response = `
        <h2>⏰ Current Date & Time</h2>
        <p>${now.toDateString()} - ${now.toLocaleTimeString()}</p>`;
      break;

    // 💬 QUOTE
    case "quote":
      const quotes = [
        "The future belongs to those who believe in their dreams.",
        "Success is built one small victory at a time.",
        "Discipline beats talent when talent doesn't work hard.",
        "Every failure is a lesson wearing a disguise."
      ];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      response = `<h2>💬 Quote of the Moment</h2><p>${randomQuote}</p>`;
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
          <li>“Weather report”</li>
          <li>“Show latest news”</li>
          <li>“Generate leave letter”</li>
          <li>“Official email”</li>
          <li>“Project documentation”</li>
        </ul>`;
  }

  return response;        
}
// === GLOBAL EVENT DELEGATION FOR BUTTONS ===
document.addEventListener("click", (e) => {
  const block = e.target.closest(".code-block-container");
  if (!block) return;
  const textElement = block.querySelector(".code-content");

  // Disable editing in main.js (view-only)
  textElement.setAttribute("contenteditable", "false");

  // --- COPY ---
  if (e.target.classList.contains("copyBtn")) {
    const text = textElement.textContent.trim();
    navigator.clipboard.writeText(text);
    alert("📋 Copied to clipboard!");
  }

  // --- SEND (Blocked) ---
  if (e.target.classList.contains("sendBtn")) {
    alert("⚠️ Please login to send emails!");
  }

  // --- SAVE (Blocked) ---
  if (e.target.classList.contains("saveBtn")) {
    alert("⚠️ Please login to save files!");
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
});











