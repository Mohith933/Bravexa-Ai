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
  const msg = userMessage.toLowerCase();
  let response = "";

  // --- GREETINGS ---
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    response = `
      <h2>👋 Hello!</h2>
      <p>I’m <strong>Bravexa AI</strong> — your creative workspace assistant.</p>
      <p>Try me with:<br>• "Generate leave letter"<br>• "Official email"<br>• "Create project documentation"<br>• "Make presentation slides"</p>`;
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

  // --- WORD DOCUMENT ---
  else if (msg.includes("word") || msg.includes("report")) {
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
  }

  // --- PRESENTATION ---
  else if (msg.includes("presentation") || msg.includes("slides")) {
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
  }

  // --- CODE GENERATOR ---
  else if (msg.includes("code") || msg.includes("program")) {
    let language = "javascript";
    let langLabel = "JavaScript";

    if (msg.includes("python")) { language = "python"; langLabel = "Python"; }
    else if (msg.includes("java")) { language = "java"; langLabel = "Java"; }
    else if (msg.includes("html")) { language = "html"; langLabel = "HTML"; }
    else if (msg.includes("css")) { language = "css"; langLabel = "CSS"; }

    const codeExamples = {
      javascript: `function greet(name) {\n  console.log("Hello, " + name + "!");\n}\n\ngreet("Bravexa User");`,
      python: `def greet(name):\n    print("Hello, " + name + "!")\n\ngreet("Bravexa User")`,
      java: `class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, Bravexa User!");\n  }\n}`,
      html: `<!DOCTYPE html>\n<html>\n<body>\n  <h1>Hello, Bravexa User!</h1>\n</body>\n</html>`,
      css: `body {\n  background-color: #f5f5f5;\n  color: #333;\n  font-family: Arial;\n}`
    };

    response = `
      <h2>💻 Generated ${langLabel} Code</h2>
      <div class="code-block-container">
        <div class="code-toolbar">
          <span class="lang-label">${langLabel}</span>
          <div class="btn-group">
            <button id="copyBtn">📋 Copy</button>
          </div>
        </div>
        <pre class="code-content"><code>${codeExamples[language]}</code></pre>
      </div>`;
  }

  // --- MOTIVATION ---
  else if (msg.includes("motivate") || msg.includes("inspire")) {
    response = `
      <h2>🚀 Motivation Boost</h2>
      <p>Every line of code and every idea you test is a step toward mastery. Keep building, keep believing! 💪</p>`;
  }

  // --- DEFAULT ---
  else {
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
  const text = block.querySelector(".code-content").innerText;

  // Copy text
  if (e.target.classList.contains("copyBtn")) {
    navigator.clipboard.writeText(text);
    alert("📋 Copied to clipboard!");
  }
  // Send Mail (for email & leave letters)
if (e.target.classList.contains("sendBtn")) {
  const subject = "Generated from Bravexa AI";
  const body = encodeURIComponent(text);

  // Detect mobile vs desktop
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    // Mobile → use default mail app
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  } else {
    // Desktop → use Gmail web compose
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







