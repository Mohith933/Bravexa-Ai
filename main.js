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
  const msg = (userMessage || "").toLowerCase().trim();
  let response = "";

  // --- simple normalization + intent mapping ---
  const intents = {
    greeting: ["hello", "hi", "hey", "good morning", "good evening", "good night", "bye"],
    leave: ["leave letter", "application", "holiday", "absent", "permission"],
    email: ["email", "official", "mail", "message", "compose email"],
    resume: ["resume", "project", "documentation", "portfolio", "cv"],
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
    <h2>🏫 Leave Letter</h2>
    <div class="code-block-container" data-type="leave">
      <div class="code-toolbar">
        <span class="lang-label">📝 .txt</span>
        <div class="btn-group">
          <button class="copyBtn">📋 Copy</button>
          <button class="sendBtn">📨 Send</button>
        </div>
      </div>
      <pre class="code-content" contenteditable="true">
──────────────────────────────
To  
The Principal,  
ABC College of Engineering,  
Bangalore.  

Subject: Request for Leave

Respected Sir/Madam,

I am writing to inform you that I am unable to attend classes from 30th October 2025 to 1st November 2025 due to personal reasons. I kindly request you to grant me leave for the mentioned period.

I assure you that I will compensate for the missed lectures and assignments upon my return.

Thanking you in anticipation.

Yours obediently,  
Your Name  
Register No: 22EC1004  
Department of CSE  
Date: 29/10/2025  
──────────────────────────────
*Generated by Valantine AI Writer*
      </pre>
    </div>
  `;
  break;

    // 2) DOCUMENTATION — EMAIL (copy + send)
    case "email":
  response = `
    <h2>✉️ Professional Email</h2>
    <div class="code-block-container" data-type="email">
      <div class="code-toolbar">
        <span class="lang-label">📧 .eml</span>
        <div class="btn-group">
          <button class="copyBtn">📋 Copy</button>
          <button class="sendBtn">📨 Send</button>
        </div>
      </div>
      <pre class="code-content" contenteditable="true">
──────────────────────────────
To: hr@company.com
From: yourname@email.com
Subject: Application for Software Developer Position
──────────────────────────────

Dear Hiring Manager,

I hope this message finds you well. I am writing to express my interest in the Software Developer position at your esteemed organization. I have a strong background in web technologies, Python, and cloud-based AI applications such as Bravexa AI and Valantine AI Writer.

I am confident that my skills and passion for innovation align with your company’s vision. Please find my resume attached for your review.

Looking forward to your response.

Warm regards,  
Your Name  
📞 +91 98765 43210  
📧 yourname@email.com  
──────────────────────────────
*Auto-generated Email Template — Valantine AI Writer*
      </pre>
    </div>
  `;
  break;
    // 2) DOCUMENTATION — RESUME / PROJECT (copy + save)
    case "resume":
      response = `
        <h2>📘 Resume / Project</h2>
        <div class="code-block-container">
          <div class="code-toolbar">
            <span class="lang-label">📘 resume</span>
            <div class="btn-group">
              <button class="copyBtn">📋 Copy</button>
              <button class="saveBtn">💾 Save</button>
            </div>
          </div>
          <pre class="code-content" contenteditable="true">
Project Title: Smart Waste Management System

Objective:
To automate waste collection and monitoring using IoT sensors.

Technologies:
- Arduino, Ultrasonic sensors
- Node.js backend
- Firebase / NoSQL db

Outcome:
Delivered prototype and user testing reports.
          </pre>
        </div>
      `;
      break;

    // 2) DOCUMENTATION — Word (copy + save)
  case "word":
  response = `
    <h2>📄 Word Document (Essay / Report)</h2>
    <div class="code-block-container" data-type="word">
      <div class="code-toolbar">
        <span class="lang-label">📝 .docx</span>
        <div class="btn-group">
          <button class="copyBtn">📋 Copy</button>
          <button class="saveBtn">💾 Save</button>
        </div>
      </div>
      <pre class="code-content" contenteditable="true">
──────────────────────────────
🌍 Title: The Role of Artificial Intelligence in Modern Society
──────────────────────────────

**Introduction**

Artificial Intelligence (AI) has become one of the most transformative forces of the 21st century. From virtual assistants to self-driving cars, AI technologies are reshaping industries, education, and even personal lifestyles. As algorithms continue to learn and evolve, the boundaries of human–machine interaction are being redefined.

**Impact on Industries**

AI plays a critical role in automating repetitive tasks and analyzing massive datasets with speed and accuracy. In healthcare, AI assists doctors in diagnosing diseases and predicting patient outcomes. In finance, it detects fraudulent transactions and enhances customer service through chatbots. Similarly, in manufacturing, AI-driven robots improve precision and reduce human error.

**Education and Creativity**

The educational field benefits from AI-powered tutoring systems that adapt to each student’s learning style. Creative professionals now use AI tools to write content, compose music, and generate artwork. Tools like Bravexa AI and Valantine AI exemplify how writing and communication can evolve through natural language understanding and creativity.

**Challenges and Ethics**

Despite its benefits, AI raises significant ethical concerns. Issues such as job displacement, data privacy, and algorithmic bias must be carefully managed. Governments and companies are now focusing on responsible AI frameworks to ensure fairness and transparency in automation systems.

**Future Possibilities**

The future of AI lies in collaboration, not replacement. When humans and AI systems work together, innovation accelerates. The emergence of multimodal AI systems — integrating text, image, voice, and emotion — marks the next evolution in intelligent computing. Startups like Valantine Labs envision this transformation as a movement towards human-centered technology.

**Conclusion**

AI is no longer a futuristic dream but a daily reality. Its integration into our lives brings both promise and responsibility. As society continues to adapt, the ultimate goal of AI should remain clear — to empower humans, enhance creativity, and make the world a better, more connected place.

──────────────────────────────
*Document generated by Valantine AI Writer — November 2025*
      </pre>
    </div>
  `;
  break;

case "resume":
  response = `
    <h2>📘 Resume</h2>
    <div class="code-block-container" data-type="resume">
      <div class="code-toolbar">
        <span class="lang-label">📄 .docx</span>
        <div class="btn-group">
          <button class="copyBtn">📋 Copy</button>
          <button class="saveBtn">💾 Save</button>
        </div>
      </div>
      <pre class="code-content" contenteditable="true">
──────────────────────────────
**Name:** Your Name  
**Email:** yourname@email.com  
**Phone:** +91 98765 43210  
**LinkedIn:** linkedin.com/in/yourname  
**Portfolio:** bravexa.ai/yourname  

──────────────────────────────
🎓 **Education**
B.Tech in Computer Science Engineering  
ABC College of Engineering — 2021–2025  

──────────────────────────────
💼 **Experience**
Intern – AI Developer | Solulire Labs  
(June 2024 – August 2024)  
- Developed an AI writing assistant using JavaScript and OpenAI API.  
- Worked on Valantine AI Writer’s prompt engine and UI.

──────────────────────────────
🛠️ **Technical Skills**
Languages: Python, JavaScript, C++, HTML/CSS  
Frameworks: Django, React  
Tools: Git, Figma, Docker  

──────────────────────────────
🏆 **Projects**
- **Bravexa AI Chatbot:** A multimodal assistant for real-time responses.  
- **Valantine AI Writer:** An emotional writing platform powered by natural language processing.  

──────────────────────────────
🌟 **Objective**
To become a creative AI developer who builds innovative tools that help people think, write, and connect better.  

──────────────────────────────
*Created using Valantine AI Writer — November 2025*
      </pre>
    </div>
  `;
  break;

case "resume":
  response = `
    <h2>📘 Resume</h2>
    <div class="code-block-container" data-type="resume">
      <div class="code-toolbar">
        <span class="lang-label">📄 .docx</span>
        <div class="btn-group">
          <button class="copyBtn">📋 Copy</button>
          <button class="saveBtn">💾 Save</button>
        </div>
      </div>
      <pre class="code-content" contenteditable="true">
──────────────────────────────
**Name:** Your Name  
**Email:** yourname@email.com  
**Phone:** +91 98765 43210  
**LinkedIn:** linkedin.com/in/yourname  
**Portfolio:** bravexa.ai/yourname  

──────────────────────────────
🎓 **Education**
B.Tech in Computer Science Engineering  
ABC College of Engineering — 2021–2025  

──────────────────────────────
💼 **Experience**
Intern – AI Developer | Solulire Labs  
(June 2024 – August 2024)  
- Developed an AI writing assistant using JavaScript and OpenAI API.  
- Worked on Valantine AI Writer’s prompt engine and UI.

──────────────────────────────
🛠️ **Technical Skills**
Languages: Python, JavaScript, C++, HTML/CSS  
Frameworks: Django, React  
Tools: Git, Figma, Docker  

──────────────────────────────
🏆 **Projects**
- **Bravexa AI Chatbot:** A multimodal assistant for real-time responses.  
- **Valantine AI Writer:** An emotional writing platform powered by natural language processing.  

──────────────────────────────
🌟 **Objective**
To become a creative AI developer who builds innovative tools that help people think, write, and connect better.  

──────────────────────────────
*Created using Valantine AI Writer — November 2025*
      </pre>
    </div>
  `;
  break;

    // 2) DOCUMENTATION — Excel (copy + save)
    case "excel":
  response = `
    <h2>📊 Sales Report (Excel / Sheet)</h2>
    <div class="code-block-container" data-type="excel">
      <div class="code-toolbar">
        <span class="lang-label">📈 .xlsx</span>
        <div class="btn-group">
          <button class="copyBtn">📋 Copy</button>
          <button class="saveBtn">💾 Save</button>
        </div>
      </div>
      <pre class="code-content" contenteditable="true">
| Month | Product | Units Sold | Sales ($) | Profit ($) | Profit % |
|--------|----------|-------------|------------|-------------|-----------|
| Jan    | AlphaPad | 120         | 12,000     | 4,000       | 33.3%     |
| Feb    | AlphaPad | 150         | 15,000     | 5,000       | 33.3%     |
| Mar    | AlphaPad | 180         | 18,000     | 6,000       | 33.3%     |
| Apr    | AlphaPhone | 100       | 25,000     | 8,000       | 32.0%     |
| May    | AlphaPhone | 130       | 31,200     | 10,000      | 32.0%     |
| Jun    | AlphaPhone | 160       | 38,400     | 12,000      | 31.2%     |
| Jul    | AlphaWatch | 90        | 9,000      | 3,500       | 38.8%     |
| Aug    | AlphaWatch | 100       | 10,200     | 4,000       | 39.2%     |
| Sep    | AlphaWatch | 120       | 12,800     | 5,000       | 39.1%     |
| Oct    | AlphaTab | 200         | 20,000     | 7,000       | 35.0%     |
| Nov    | AlphaTab | 230         | 23,400     | 8,000       | 34.2%     |
| Dec    | AlphaTab | 250         | 25,000     | 9,000       | 36.0%     |

**Summary:**
Total Sales = $234,000
Total Profit = $77,500
Average Profit Margin = 33.1%
      </pre>
    </div>
  `;
  break;

    // 2) DOCUMENTATION — PowerPoint (copy + save)
    case "powerpoint":
  response = `
    <h2>🎞️ Project Presentation (PowerPoint)</h2>
    <div class="code-block-container" data-type="ppt">
      <div class="code-toolbar">
        <span class="lang-label">📽 .pptx</span>
        <div class="btn-group">
          <button class="copyBtn">📋 Copy</button>
          <button class="saveBtn">💾 Save</button>
        </div>
      </div>
      <pre class="code-content" contenteditable="true">
──────────────────────────────
🎯 Slide 1: Title & Overview
──────────────────────────────
Project: Bravexa AI — The Future of Conversational Intelligence
Team: Valantine Labs
Date: November 2025

──────────────────────────────
💡 Slide 2: Problem Statement
──────────────────────────────
• Current chatbots lack context understanding
• Repetitive responses frustrate users
• No emotional or adaptive interaction

──────────────────────────────
🚀 Slide 3: Proposed Solution
──────────────────────────────
• AI system with layered understanding engine
• Rule-based + Generative hybrid model
• Adaptive memory + emotional tone control
• Integrated image & voice modules

──────────────────────────────
📊 Slide 4: Market Opportunity
──────────────────────────────
• Global AI market: $300B+ by 2030
• Growing demand for personalized AI tools
• Ideal for content creators, students, professionals

──────────────────────────────
🧩 Slide 5: Roadmap & Features
──────────────────────────────
Phase 1 — Valantine AI (Writer)
Phase 2 — Bravexa AI (Chatbot)
Phase 3 — Clarity AI (Voice Engine)
Phase 4 — Integration & API Access

──────────────────────────────
💰 Slide 6: Business Model
──────────────────────────────
• Freemium + Subscription plans
• Pro and Enterprise tiers
• AI Add-ons and Custom API licensing

──────────────────────────────
👥 Slide 7: Team & Contact
──────────────────────────────
Founder & Visionary: [Your Name]
Mentor AI: GPT-5
Contact: hello@valantineai.com

──────────────────────────────
✅ Slide 8: Thank You
──────────────────────────────
"Don’t just build AI — build the dream behind it."
      </pre>
    </div>
  `;
  break;

    // 2) DOCUMENTATION — Access (copy + save)
    case "access":
      response = `
        <h2>💾 Access / DB Report</h2>
        <div class="code-block-container">
          <div class="code-toolbar">
            <span class="lang-label">📁 .accdb</span>
            <div class="btn-group">
              <button class="copyBtn">📋 Copy</button>
              <button class="saveBtn">💾 Save</button>
            </div>
          </div>
          <pre class="code-content" contenteditable="true">
Table: StudentRecords
ID | Name | Dept | Marks
1  | John | CS   | 87
2  | Priya| ECE  | 91
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











