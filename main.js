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

  // Utility function (moved to top for global access)
  function includes(...words) {
    return words.some(w => msg.includes(w));
  }

  // --- GREETINGS ---
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    response = `
      <h2>👋 Hello!</h2>
      <p>I’m <strong>Bravexa AI</strong> — ready to help you write, code, or learn something new!</p>
      <p>Try saying:<br>• "Generate leave letter"<br>• "Official email"<br>• "Project documentation"<br>• "Python code for calculator"</p>`;
  }

  // --- LEAVE LETTER ---
  else if (includes("leave letter", "application", "leave request")) {
    response = `
      <h2>📄 Leave Letter</h2>
      <div class="neon-block">
        <div class="neon-toolbar">
          <span class="neon-label">📝 Letter</span>
          <div class="btn-group">
            <button class="copyBtn">📋 Copy</button>
            <button class="sendBtn">✉️ Send</button>
          </div>
        </div>
        <pre class="neon-content">
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
  else if (includes("email", "official", "mail format")) {
    response = `
      <h2>📧 Official Email</h2>
      <div class="neon-block">
        <div class="neon-toolbar">
          <span class="neon-label">📨 Email</span>
          <div class="btn-group">
            <button class="copyBtn">📋 Copy</button>
            <button class="sendBtn">✉️ Send</button>
          </div>
        </div>
        <pre class="neon-content">
Subject: Regarding Project Discussion  

Dear [Recipient Name],  
I hope this email finds you well.  

I would like to schedule a short discussion about our project progress and upcoming deadlines.  
Please let me know your availability.  

Best regards,  
[Your Name]  
[Your Contact Info]
        </pre>
      </div>`;
  }

  // --- RESUME / PROJECT / DOCS ---
  else if (includes("resume", "project", "documentation", "report")) {
    response = `
      <h2>📘 Project Documentation</h2>
      <div class="neon-block">
        <div class="neon-toolbar">
          <span class="neon-label">📂 Resume / Docs</span>
          <div class="btn-group">
            <button class="copyBtn">📋 Copy</button>
            <button class="saveBtn">💾 Save</button>
          </div>
        </div>
        <pre class="neon-content">
<b>Project Title:</b> Smart Waste Management System  

<b>Objective:</b> To automate waste collection and monitoring using IoT sensors.  

<b>Technologies Used:</b>  
- Arduino, Ultrasonic Sensors  
- Node.js Backend  
- Firebase Database  

<b>Outcome:</b> Efficient and eco-friendly waste management with live monitoring.
        </pre>
      </div>`;
  }

  // --- EXCEL / WORD ---
  else if (includes("excel", "spreadsheet", "word document", "report file")) {
    response = `
      <h2>📑 Document Format</h2>
      <div class="neon-block">
        <div class="neon-toolbar">
          <span class="neon-label">📊 Word / Excel</span>
          <div class="btn-group">
            <button class="copyBtn">📋 Copy</button>
            <button class="saveBtn">💾 Save</button>
          </div>
        </div>
        <pre class="neon-content">
📘 <b>Report Title:</b> Monthly Sales Analysis  

- Data Source: Internal Database  
- Tools: Excel & Power BI  
- Summary: Sales improved by 12% compared to last quarter.  

<b>Conclusion:</b> Marketing strategy and customer engagement drove higher conversions.
        </pre>
      </div>`;
  }

  // --- CODE GENERATOR (MULTI-LANG) ---
  else if (includes("code", "program", "script")) {
    let language = "javascript", label = "JavaScript";
    if (msg.includes("python")) { language = "python"; label = "Python"; }
    if (msg.includes("java")) { language = "java"; label = "Java"; }
    if (msg.includes("html")) { language = "html"; label = "HTML"; }

    const examples = {
      javascript: `function greet(name){\n  console.log("Hello, " + name + "!");\n}\ngreet("Bravexa User");`,
      python: `def greet(name):\n    print("Hello, " + name + "!")\n\ngreet("Bravexa User")`,
      java: `class Main{\n  public static void main(String[] args){\n    System.out.println("Hello, Bravexa User!");\n  }\n}`,
      html: `<!DOCTYPE html>\n<html>\n<body>\n<h1>Hello, Bravexa User!</h1>\n</body>\n</html>`
    };

    response = `
      <h2>💻 ${label} Code</h2>
      <div class="neon-block">
        <div class="neon-toolbar">
          <span class="neon-label">⚙️ ${label}</span>
          <div class="btn-group">
            <button class="copyBtn">📋 Copy</button>
          </div>
        </div>
        <pre class="neon-content"><code>${examples[language]}</code></pre>
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
}

// === GLOBAL EVENT DELEGATION FOR BUTTONS ===
document.addEventListener("click", (e) => {
  const block = e.target.closest(".neon-block");
  if (!block) return;
  const text = block.querySelector(".neon-content").innerText;

  // Copy text
  if (e.target.classList.contains("copyBtn")) {
    navigator.clipboard.writeText(text);
    alert("📋 Copied to clipboard!");
  }

  // Send Mail (for email & leave letters)
  if (e.target.classList.contains("sendMailBtn")) {
    const subject = "Generated from Bravexa AI";
    const body = encodeURIComponent(text);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  // Share on LinkedIn (for projects & resumes)
  if (e.target.classList.contains("shareLinkedInBtn")) {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      "https://bravexa.ai"
    )}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
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





