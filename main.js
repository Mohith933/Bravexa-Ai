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
// === Enable Edit/Save for Generated Letters & Emails ===
document.addEventListener("click", (event) => {
  const editable = document.getElementById("editableContent");
  const editBtn = document.getElementById("editBtn");
  const saveBtn = document.getElementById("saveBtn");
  const sendBtn = document.getElementById("sendBtn");

  if (!editable) return;

  if (event.target.id === "editBtn") {
    editable.contentEditable = "true";
    editable.style.border = "1px solid #007bff";
    editable.style.background = "#0d1b2a";
    editBtn.disabled = true;
    saveBtn.disabled = false;
  }

  if (event.target.id === "saveBtn") {
    editable.contentEditable = "false";
    editable.style.border = "none";
    editable.style.background = "transparent";
    saveBtn.disabled = true;
    editBtn.disabled = false;

    // Optional: Save updated content to localStorage
    localStorage.setItem("lastEditedDoc", editable.innerText);
    alert("✅ Changes saved locally!");
  }

  if (event.target.id === "sendBtn") {
    alert("📧 Email sending feature coming soon — integration ready!");
  }
});

// === Enable Copy, Edit, and Save for Generated Code ===
document.addEventListener("click", (event) => {
  const codeOutput = document.getElementById("codeOutput");
  const copyBtn = document.getElementById("copyCodeBtn");
  const editBtn = document.getElementById("editCodeBtn");
  const saveBtn = document.getElementById("saveCodeBtn");

  if (!codeOutput) return;

  // === COPY CODE ===
  if (event.target.id === "copyCodeBtn") {
    navigator.clipboard.writeText(codeOutput.innerText)
      .then(() => {
        copyBtn.textContent = "✅ Copied";
        setTimeout(() => copyBtn.textContent = "📋 Copy", 2000);
      });
  }

  // === EDIT CODE ===
  if (event.target.id === "editCodeBtn") {
    codeOutput.contentEditable = "true";
    codeOutput.style.background = "#f5f7ff";
    codeOutput.style.border = "1px solid #007bff";
    editBtn.disabled = true;
    saveBtn.disabled = false;
  }

  // === SAVE CODE ===
  if (event.target.id === "saveCodeBtn") {
    codeOutput.contentEditable = "false";
    codeOutput.style.background = "#1e1e1e";
    codeOutput.style.border = "none";
    saveBtn.disabled = true;
    editBtn.disabled = false;

    // Optional: Save edited code to local storage
    localStorage.setItem("lastEditedCode", codeOutput.innerText);
    alert("💾 Code saved locally!");
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





