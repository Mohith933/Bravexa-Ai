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
    voiceBtn.style.marginTop = "10px";
    footer.style.fontSize = "10px";
    uploadDropdown.style.bottom = "45px";
    uploadDropdown.style.left = "20px";
    uploadDropdown.style.marginTop = "0px";
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
     window.location.href = "dashboard.html";
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
    voiceBtn.style.marginTop = "10px";
    uploadDropdown.style.bottom = "45px";
    uploadDropdown.style.left = "20px";
    uploadDropdown.style.marginTop = "0px";
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
  const msg = (userMessage || "").toLowerCase().trim();
  let response = "";

  // --- simple normalization + intent mapping ---
  const intents = {
    greeting: ["hello", "hi", "hey", "good morning", "good evening", "good night", "bye"],
    leave: ["leave letter", "application", "holiday", "absent", "permission"],
    email: ["email", "official", "mail", "message", "compose email"],
    resume: ["resume", "portfolio"],
    project: ["project","documentation"],
    cv : ["cv","curicullam", "vitae"],
    word: ["word", "doc", "docx", "report"],
    excel: ["excel", "sheet", "xlsx", "csv"],
    powerpoint: ["presentation", "slides", "ppt", "deck"],
    access: ["access", "database", "accdb"],
    code: ["code", "program", "script", "snippet", "c", "c++", "cpp", "python", "java", "html", "css", "js"],
    cs: ["computer science", "cs", "algorithm", "data structure"],
    os: ["operating system", "os", "process", "scheduling"],
    dbms: ["dbms", "database management", "sql", "joins"],
    software: ["software engineering", "srs", "sdlc", "software"],
    physics: ["physics"],
    math: ["math", "mathematics"],
    news: ["news", "headlines", "updates"],
    weather: ["weather", "forecast", "temperature"],
    stock: ["stock", "market", "share", "nifty", "nasdaq"],
    motivate: ["motivate", "inspire", "encourage", "boost"]
  };

  // find intent (first matching category)
  let intent = "default";
  for (const [key, words] of Object.entries(intents)) {
    if (words.some(w => msg.includes(w))) {
      intent = key;
      break;
    }
  }

  // --- RULE-BASED RESPONSES (Ordered as you asked) ---
  switch (intent) {

    // 1) GREETINGS & ROUTINES (no buttons)
    case "greeting":
      response = `
        <h2>👋 Hello — Bravexa AI</h2>
        <p>I'm Bravexa — your workspace assistant. Try: "Generate leave letter", "Compose email", "Make a resume".</p>
        <p class="muted">Routines: daily summary, reminders, quick greetings.</p>
      `;
      break;

    // 2) DOCUMENTATION — LEAVE (copy + send)
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
        </div>
      `;
      break;

    // 2) DOCUMENTATION — EMAIL (copy + send)
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
        </div>
      `;
      break;

    // 2) DOCUMENTATION — RESUME / PROJECT (copy + save)
    // 🧾 RESUME
case "resume":
  response = `
    <h2>🧾 Resume Template</h2>
    <div class="code-block-container">
      <div class="code-toolbar">
        <span class="lang-label">📄 .docx</span>
        <div class="btn-group">
          <button class="copyBtn">📋 Copy</button>
          <button class="saveBtn">💾 Save</button>
        </div>
      </div>
      <pre class="code-content" contenteditable="true">
<b>Name:</b> [Your Full Name]  
<b>Email:</b> [you@example.com]  
<b>Phone:</b> [Your Number]  

<b>Objective:</b>  
To obtain a responsible position where I can utilize my skills and contribute to the organization’s growth.  

<b>Skills:</b>  
- Problem Solving  
- Team Collaboration  
- Programming (C, Python, Java)  

<b>Education:</b>  
B.Tech in Computer Science, [College Name]  

<b>Experience:</b>  
Intern – Web Developer, [Company Name]  
      </pre>
    </div>
  `;
  break;

// 📃 CV TEMPLATE
case "cv":
  response = `
    <h2>📃 Curriculum Vitae</h2>
    <div class="code-block-container">
      <div class="code-toolbar">
        <span class="lang-label">🧑‍💼 .docx</span>
        <div class="btn-group">
          <button class="copyBtn">📋 Copy</button>
          <button class="saveBtn">💾 Save</button>
        </div>
      </div>
      <pre class="code-content" contenteditable="true">
<b>Personal Details:</b>  
Name: [Your Name]  
Date of Birth: [DD/MM/YYYY]  
Address: [Your Address]  
Email: [you@example.com]  
Phone: [Your Number]  

<b>Education:</b>  
- B.Tech in [Branch] – [University Name]  
- Intermediate – [School Name]  

<b>Achievements:</b>  
- Won Coding Contest 2025  
- Best Project Award in Final Year  

<b>Declaration:</b>  
I hereby declare that the above information is true to the best of my knowledge.  
      </pre>
    </div>
  `;
  break;

// 📘 PROJECT REPORT
case "project":
  response = `
    <h2>📘 Project Report</h2>
    <div class="code-block-container">
      <div class="code-toolbar">
        <span class="lang-label">📄 .txt</span>
        <div class="btn-group">
          <button class="copyBtn">📋 Copy</button>
          <button class="saveBtn">💾 Save</button>
        </div>
      </div>
      <pre class="code-content" contenteditable="true">
<b>Title:</b> Smart Chatbot Assistant using Bravexa AI  

<b>Abstract:</b>  
This project focuses on developing a rule-based AI chatbot capable of generating templates,  
handling documentation tasks, and automating conversation workflows.

<b>Modules:</b>  
1. User Interface  
2. Rule-based Response Layer  
3. File Generator System  

<b>Tools Used:</b>  
HTML, CSS, JavaScript  

<b>Conclusion:</b>  
The chatbot automates daily communication and document creation efficiently.  
      </pre>
    </div>
  `;
  break;
    // 2) DOCUMENTATION — Word (copy + save)
    case "word":
      response = `
        <h2>📝 Microsoft Word / Report</h2>
        <div class="code-block-container">
          <div class="code-toolbar">
            <span class="lang-label">📄 .docx</span>
            <div class="btn-group">
              <button class="copyBtn">📋 Copy</button>
              <button class="saveBtn">💾 Save</button>
            </div>
          </div>
          <pre class="code-content" contenteditable="true">
Title: Annual Business Report

Introduction:
This report outlines performance, challenges and strategy.

Key Highlights:
- Revenue growth: 15%
- New markets: 3 regions

Conclusion:
Focus on operational excellence.
          </pre>
        </div>
      `;
      break;

    // === EXCEL / SHEET ===
case "excel":        
  response = `        
    <h2>📊 Excel / Sheet</h2>        
    <div class="code-block-container">        
      <div class="code-toolbar">        
        <span class="lang-label">📈 .xlsx</span>        
        <div class="btn-group">        
          <button class="copyBtn">📋 Copy</button>        
          <button class="saveBtn">💾 Save</button>        
        </div>        
      </div>        

      <pre class="code-content" contenteditable="true">        
📅 Month | 💰 Sales | 📈 Profit | 🧾 Expense  
-------------------------------------------  
January  | 12000    | 4000      | 2000  
February | 15000    | 5000      | 2500  
March    | 18000    | 6000      | 3000  
April    | 21000    | 7000      | 3500  

💡 Tip: You can track growth percentage or add totals below.  
      </pre>        
    </div>        
  `;        
  break;        


// === POWERPOINT / PRESENTATION ===
case "powerpoint":        
  response = `        
    <h2>🎞️ Presentation (PPT)</h2>        
    <div class="code-block-container">        
      <div class="code-toolbar">        
        <span class="lang-label">📽 .pptx</span>        
        <div class="btn-group">        
          <button class="copyBtn">📋 Copy</button>        
          <button class="saveBtn">💾 Save</button>        
        </div>        
      </div>        

      <pre class="code-content" contenteditable="true">        
📘 Slide 1: Title  
Introduce your topic or project clearly.  

💡 Slide 2: Objective  
State your main purpose in one or two lines.  

🧩 Slide 3: Key Points  
List your main ideas or solutions briefly.  

📊 Slide 4: Results / Data  
Show your key findings or outcomes.  

🚀 Slide 5: Conclusion  
Wrap up with summary and call to action.  
      </pre>        
    </div>        
  `;        
  break;

   // === ACCESS / DATABASE ===
case "access":        
  response = `        
    <h2>🗄️ Microsoft Access Database</h2>        
    <div class="code-block-container">        
      <div class="code-toolbar">        
        <span class="lang-label">📚 .accdb</span>        
        <div class="btn-group">        
          <button class="copyBtn">📋 Copy</button>        
          <button class="saveBtn">💾 Save</button>        
        </div>        
      </div>        

      <pre class="code-content" contenteditable="true">        
📋 Table Name: Employees  
-------------------------------------------  
| ID | Name        | Department | Salary |  
|----|--------------|-------------|--------|  
| 1  | John Smith   | HR          | 45000  |  
| 2  | Priya Patel  | IT          | 60000  |  
| 3  | Arjun Mehta  | Finance     | 55000  |  
| 4  | Emma Brown   | Marketing   | 52000  |  

📋 Table Name: Projects  
-------------------------------------------  
| ProjectID | ProjectName    | StartDate  | EndDate    |  
|------------|----------------|-------------|------------|  
| P001       | Bravexa AI     | 2025-01-01  | 2025-06-30 |  
| P002       | Valantine AI   | 2025-02-10  | 2025-07-30 |  
| P003       | Clarity Voice  | 2025-03-05  | 2025-08-20 |  

🔗 Relationship Example:  
Employees.ID → Projects.ProjectID (Manager Assigned)  

💡 Tip: Use this format to visualize Access tables and relationships before building your database.  
      </pre>        
    </div>        
  `;        
  break;

    // 3) CODE GENERATOR (copy only) - support many languages
    case "code": {
      // detect language
      let lang = "javascript";
      if (msg.includes("python")) lang = "python";
      else if (msg.includes("c++") || msg.includes("cpp")) lang = "cpp";
      else if (msg.match(/\bc\b/) && !msg.includes("css")) lang = "c";
      else if (msg.includes("java")) lang = "java";
      else if (msg.includes("html")) lang = "html";
      else if (msg.includes("css")) lang = "css";
      else if (msg.includes("js") || msg.includes("javascript")) lang = "javascript";

      const templates = {
        c: `#include <stdio.h>\nint main(){ printf("Hello C\\n"); return 0; }`,
        cpp: `#include <iostream>\nusing namespace std;\nint main(){ cout << "Hello C++\\n"; return 0; }`,
        python: `def greet(name):\n    print(f"Hello, {name}")\n\ngreet("Bravexa User")`,
        java: `public class Main { public static void main(String[] args){ System.out.println("Hello Java"); } }`,
        html: `<!doctype html>\n<html>\n  <body>\n    <h1>Hello Bravexa</h1>\n  </body>\n</html>`,
        css: `body { font-family: Arial; background: #fff; color: #333; }`,
        javascript: `function greet(name) {\n  console.log("Hello, " + name + "!");\n}\ngreet("Bravexa User");`
      };

      const snippet = templates[lang] || templates.javascript;

      response = `
        <h2>💻 ${lang.toUpperCase()} Code</h2>
        <div class="code-block-container">
          <div class="code-toolbar">
            <span class="lang-label">${lang.toUpperCase()}</span>
            <div class="btn-group">
              <button class="copyBtn">📋 Copy</button>
            </div>
          </div>
          <pre class="code-content"><code>${snippet}</code></pre>
        </div>
      `;
      break;
    }

    // 4) SUBJECTS & ACADEMICS (no buttons)
    case "cs":
      response = `
        <h2>💻 Computer Science</h2>
        <p><b>Topic:</b> Time Complexity — Binary Search → O(log n)</p>
      `;
      break;
    case "os":
      response = `
        <h2>🖥️ Operating Systems</h2>
        <p><b>Concept:</b> Process scheduling — Round Robin, FCFS, SJF, Priority</p>
      `;
      break;
    case "dbms":
      response = `
        <h2>🗄️ DBMS / SQL</h2>
        <p><b>Note:</b> JOIN types — INNER, LEFT, RIGHT, FULL. Normalize to 3NF for schema design.</p>
      `;
      break;
    case "software":
      response = `
        <h2>📐 Software Engineering</h2>
        <p><b>Topic:</b> SDLC phases — Requirements → Design → Implementation → Testing → Deployment</p>
      `;
      break;
    case "physics":
      response = `<h2>⚛️ Physics</h2><p>Newton's laws — F = m × a</p>`;
    case "math":
      response = `<h2>📐 Mathematics</h2><p>Calculus: d/dx(x²) = 2x</p>`;
      // Note: fall-through to default handled by break below if needed
      break;

    // 5) NEWS / WEATHER / STOCK
    case "news":
      response = `
        <h2>📰 Latest News</h2>
        <ul>
          <li>🌐 AI research: new small-model optimizations announced.</li>
          <li>📈 Markets: tech stocks show mixed movement.</li>
          <li>🚀 Space: new small launch vehicle completed tests.</li>
        </ul>
      `;
      break;

    case "weather":
      response = `
        <h2>☀️ Weather</h2>
        <p><b>Location:</b> Your City</p>
        <p><b>Now:</b> 28°C — Partly Cloudy</p>
        <p><b>Today:</b> High 30°C / Low 22°C</p>
      `;
      break;

    case "stock":
      response = `
        <h2>📈 Stock Snapshot</h2>
        <p><b>Sample:</b> BRAVEXA (BRV) — Price: ₹120.50 (▲ 1.8%)</p>
        <p>Note: live market requires an API key — frontend shows sample values.</p>
      `;
      break;

    // MOTIVATION
    case "motivate":
      response = `<h2>🚀 Motivation</h2><p>Take small daily steps — consistent improvement beats fast perfection.</p>`;
      break;

    // DEFAULT (examples)
    default:
      response = `
        <h2>✨ Bravexa AI — Ready</h2>
        <p>I can create docs, code snippets, notes, and quick reports. Try one of these:</p>
        <ul>
          <li>Generate leave letter</li>
          <li>Compose official email</li>
          <li>Create resume / project summary</li>
          <li>Generate C / Python / HTML template</li>
          <li>Show weather or news</li>
        </ul>
      `;
  } // end switch

  return response;
}


// === ENABLE EDIT + REAL ACTIONS ===
document.addEventListener("click", (e) => {
  const block = e.target.closest(".code-block-container");
  if (!block) return;
  const textElement = block.querySelector(".code-content");
  textElement.setAttribute("contenteditable", "true");

  // --- COPY ---
  if (e.target.classList.contains("copyBtn")) {
    const text = textElement.textContent.trim();
    navigator.clipboard.writeText(text);
    alert("✅ Copied to clipboard!");
  }

  // --- SEND EMAIL ---
  if (e.target.classList.contains("sendBtn")) {
    const body = encodeURIComponent(textElement.textContent.trim());
    const mailto = `mailto:?subject=Bravexa Document&body=${body}`;
    window.location.href = mailto;
  }

  // --- SAVE TXT / DOCX / XLSX / PPTX ---
  if (e.target.classList.contains("saveBtn")) {
    const text = textElement.textContent.trim();

    // detect file type
    const fileType = block.getAttribute("data-type") || "txt";

    let blob, filename;
    switch (fileType) {
      case "word":
        filename = "document.docx";
        blob = new Blob([text], { type: "application/msword" });
        break;
      case "excel":
        filename = "sheet.xlsx";
        blob = new Blob([text], { type: "application/vnd.ms-excel" });
        break;
      case "ppt":
        filename = "presentation.pptx";
        blob = new Blob([text], { type: "application/vnd.ms-powerpoint" });
        break;
      default:
        filename = "document.txt";
        blob = new Blob([text], { type: "text/plain" });
    }

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }
});

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