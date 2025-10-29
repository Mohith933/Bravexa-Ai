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


chatbox.addEventListener("input", () => {
  chatbox.style.height = "auto"; // reset height
  chatbox.style.height = chatbox.scrollHeight + "px"; // set to full content height
});


  document.getElementById("editLogoBtn").addEventListener("click", () => {
  window.location.href = "index.html";
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
uploadDropdown.style.bottom = "30px";
chatbox.style.height = "50px";
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

// === LIMITED UPLOAD FUNCTIONALITY ===
document.querySelectorAll("#imageUpload, #videoUpload, #audioUpload").forEach(input => {
  input.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) alert(`Uploaded: ${file.name}`);
  });
});

// === SCREENSHOT DEMO ===
screenshotBtn.addEventListener("click", () => {
  alert("📸 Screenshot feature available only in Bravexa Dashboard.");
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











