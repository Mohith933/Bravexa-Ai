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
    inputArea.style.bottom = "35px";
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

  // === TYPE EFFECT ===
  function typeText(element, htmlContent, speed = 18) {
    let i = 0;
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    const text = tempDiv.innerText;
    element.innerHTML = "";

    function typeChar() {
      if (i < text.length) {
        element.innerHTML = htmlContent.substring(0, i + 1);
        i++;
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        setTimeout(typeChar, speed);
      } else {
        element.innerHTML = htmlContent;
      }
    }
    typeChar();
  }

  // === SIMPLE AI RESPONSES ===
  // === SIMPLE RULE-BASED AI RESPONSE SYSTEM ===
async function generateAIResponse(userMessage) {
  const msg = userMessage.toLowerCase();
  let response = "";

  // --- GREETINGS ---
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    response = `
      <h2>👋 Hello!</h2>
      <p>I’m <strong>Bravexa AI</strong> — ready to help you write, code, or learn something new!</p>
      <p>You can try things like:<br>• "Generate leave letter"<br>• "Write HTML login form"<br>• "Motivate me"</p>`;
  }

  // --- LETTER / EMAIL / DOCUMENTATION ---
 else if (msg.includes("leave letter") || msg.includes("application")) {
  response = `
    <h2>📄 Leave Letter</h2>
    <div class="editable-container">
      <div id="editableContent" class="editable-content" contenteditable="false">
To  
The Principal,  
[Your College Name],  
[City].  

Subject: Request for Leave  

Respected Sir/Madam,  
I am [Your Name], studying in [Your Department]. I kindly request leave from [Start Date] to [End Date] due to [Reason].  
Kindly grant me permission.  

Thanking you,  
Yours faithfully,  
[Your Name]
      </div>
      <div class="edit-buttons">
        <button id="editBtn">✏️ Edit</button>
        <button id="saveBtn" disabled>💾 Save</button>
        <button id="sendBtn">✉️ Send Email</button>
      </div>
    </div>`;
}

else if (msg.includes("email") || msg.includes("official")) {
  response = `
    <h2>📧 Official Email</h2>
    <div class="editable-container">
      <div id="editableContent" class="editable-content" contenteditable="false">
Subject: Regarding Project Discussion  

Dear [Recipient Name],  
I hope you are doing well.  
I would like to schedule a short discussion about our project progress and upcoming deadlines.  
Please let me know your availability.  

Best regards,  
[Your Name]  
[Your Contact Info]
      </div>
      <div class="edit-buttons">
        <button id="editBtn">✏️ Edit</button>
        <button id="saveBtn" disabled>💾 Save</button>
        <button id="sendBtn">✉️ Send Email</button>
      </div>
    </div>`;
}

  // --- CODE GENERATION (QUICK MODE / GUIDE MODE) ---
    else if (msg.includes("code") || msg.includes("program")) {
      let language = "javascript"; // default language
      let langLabel = "JavaScript";

      if (msg.includes("python")) { language = "python"; langLabel = "Python"; }
      else if (msg.includes("c++") || msg.includes("cpp")) { language = "cpp"; langLabel = "C++"; }
      else if (msg.includes("java")) { language = "java"; langLabel = "Java"; }
      else if (msg.includes("html")) { language = "html"; langLabel = "HTML"; }
      else if (msg.includes("css")) { language = "css"; langLabel = "CSS"; }

      // Simple example output (you can make dynamic later)
      const codeExamples = {
        javascript: `function greet(name) {\n  console.log("Hello, " + name + "!");\n}\n\ngreet("Bravexa User");`,
        python: `def greet(name):\n    print("Hello, " + name + "!")\n\ngreet("Bravexa User")`,
        cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, Bravexa User!";\n    return 0;\n}`,
        java: `class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, Bravexa User!");\n  }\n}`,
        html: `<!DOCTYPE html>\n<html>\n<body>\n  <h1>Hello, Bravexa User!</h1>\n</body>\n</html>`,
        css: `body {\n  background-color: #f5f5f5;\n  color: #333;\n  font-family: Arial;\n}`
      };

      const codeSnippet = codeExamples[language];

      response = `
    <h2>💻 Generated ${langLabel} Code</h2>
    <div class="code-block-container">
      <div class="code-toolbar">
  <span class="lang-label">${langLabel}</span>
  <div class="btn-group">
    <button id="copyCodeBtn">📋 Copy</button>
    <button id="editCodeBtn">✏️ Edit</button>
    <button id="saveCodeBtn" disabled>💾 Save</button>
  </div>
</div>

      <pre id="codeOutput" class="code-content" contenteditable="false"><code class="${language}">${codeSnippet}</code></pre>
    </div>

    <div class="ai-note">
      <p>💡 Tip: You can edit, copy, or save this code directly. Saved code is stored in local storage.</p>
    </div>`;
    }


  // --- MOTIVATION / QUOTES / FACTS ---
  else if (msg.includes("motivate") || msg.includes("inspire")) {
    response = `
      <h2>💪 Motivation Boost</h2>
      <p>Success isn’t about doing everything perfectly — it’s about being consistent. Keep moving forward, even on small steps. 🚀</p>`;
  }

  else if (msg.includes("quote")) {
    response = `
      <h2>📜 Quote of the Day</h2>
      <p>“Believe in yourself and you’ll be unstoppable.” ✨</p>`;
  }

  else if (msg.includes("fact") || msg.includes("knowledge")) {
    response = `
      <h2>🧠 Tech Fact</h2>
      <p>Did you know? The word "algorithm" comes from the name of a Persian mathematician — Al-Khwarizmi!</p>`;
  }

  // --- JOKES ---
  else if (msg.includes("joke")) {
    response = `
      <h2>😂 Quick Tech Joke</h2>
      <p>Why do Java developers wear glasses?<br>Because they can’t C#! 😆</p>`;
  }

  // --- DEFAULT ---
  else {
    response = `
      <p>💡 I’m ready to help you write letters, generate code, or share ideas instantly.<br>
      Try saying: <br>• “Generate leave letter”<br>• “Quick HTML form code”<br>• “Motivate me”</p>`;
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
