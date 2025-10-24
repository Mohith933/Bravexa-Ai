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

    else if (msg.includes("email") || msg.includes("official")) {
  response = `
  <h2>📧 Official Email</h2>
  <div class="editable-container">
    <div id="editableContent-email" class="editable-content" contenteditable="false">
      <p><strong>Subject:</strong> Regarding Project Discussion</p>
      <p>Dear [Recipient Name],</p>
      <p>I hope you are doing well.</p>
      <p>I would like to schedule a short discussion about our project progress and upcoming deadlines.</p>
      <p>Please let me know your availability.</p>
      <p>Best regards,<br>[Your Name]<br>[Your Contact Info]</p>
    </div>
    <div class="edit-buttons">
      <button id="editBtn-email">✏️ Edit</button>
      <button id="saveBtn-email" disabled>💾 Save</button>
      <button id="sendBtn-email">📤 Send</button>
    </div>
  </div>`;
}

else if (msg.includes("leave letter") || msg.includes("application")) {
  response = `
  <h2>📄 Leave Letter</h2>
  <div class="editable-container">
    <div id="editableContent-letter" class="editable-content" contenteditable="false">
      <p><strong>To</strong><br>The Principal,<br>[Your College Name],<br>[City]</p>
      <p><strong>Subject:</strong> Request for Leave</p>
      <p>Respected Sir/Madam,<br>
      I am [Your Name], studying in [Your Department]. I kindly request leave from [Start Date] to [End Date] due to [Reason].<br>
      Kindly grant me permission.</p>
      <p>Thanking you,<br>Yours faithfully,<br>[Your Name]</p>
    </div>
    <div class="edit-buttons">
      <button id="editBtn-letter">✏️ Edit</button>
      <button id="saveBtn-letter" disabled>💾 Save</button>
      <button id="sendBtn-letter">📤 Send</button>
    </div>
  </div>`;
}

else if (msg.includes("code") || msg.includes("program")) {
  let language = "javascript";
  let langLabel = "JavaScript";

  if (msg.includes("python")) { language = "python"; langLabel = "Python"; }
  else if (msg.includes("c++") || msg.includes("cpp")) { language = "cpp"; langLabel = "C++"; }
  else if (msg.includes("c language") || msg.includes("c program")) { language = "c"; langLabel = "C"; }
  else if (msg.includes("java")) { language = "java"; langLabel = "Java"; }
  else if (msg.includes("html")) { language = "html"; langLabel = "HTML"; }
  else if (msg.includes("css")) { language = "css"; langLabel = "CSS"; }
  else if (msg.includes("js") || msg.includes("javascript")) { language = "javascript"; langLabel = "JavaScript"; }

  const codeExamples = {
    javascript: `function greet(name) {\n  console.log("Hello, " + name + "!");\n}\n\ngreet("Bravexa User");`,
    python: `def greet(name):\n    print("Hello, " + name + "!")\n\ngreet("Bravexa User")`,
    cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, Bravexa User!";\n    return 0;\n}`,
    c: `#include <stdio.h>\nint main() {\n    printf("Hello, Bravexa User!\\n");\n    return 0;\n}`,
    java: `class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, Bravexa User!");\n  }\n}`,
    html: `<!DOCTYPE html>\n<html>\n<body>\n  <h1>Hello, Bravexa User!</h1>\n</body>\n</html>`,
    css: `body {\n  background-color: #f5f5f5;\n  color: #333;\n  font-family: Arial;\n}`
  };

  const codeSnippet = codeExamples[language];

  response = `
  <h2>💻 Generated ${langLabel} Code</h2>
  <div class="editable-container">
    <div id="editableContent-code" class="editable-content" contenteditable="false">
<pre><code class="${language}">
${codeSnippet}
</code></pre>
    </div>
    <div class="edit-buttons">
      <button id="editBtn-code">✏️ Edit</button>
      <button id="saveBtn-code" disabled>💾 Save</button>
      <button id="sendBtn-code">📤 Send</button>
    </div>
  </div>`;
}

else if (msg.includes("project") || msg.includes("document")) {
  response = `
  <h2>📂 Project Document</h2>
  <div class="editable-container">
    <div id="editableContent-project" class="editable-content" contenteditable="false">
      <p><strong>Project Title:</strong> Bravexa AI – Emotional Prompt Engine</p>
      <p><strong>Objective:</strong> To build a system that listens to unstructured, emotional prompts and translates them into structured AI tasks.</p>
      <p><strong>Modules:</strong><br>
      - Prompt Normalization Layer<br>
      - Code Generator<br>
      - Email & Letter Composer<br>
      - Resume Builder<br>
      - Search Agent</p>
      <p><strong>Status:</strong> Beta architecture in progress. UI and prompt rituals under development.</p>
    </div>
    <div class="edit-buttons">
      <button id="editBtn-project">✏️ Edit</button>
      <button id="saveBtn-project" disabled>💾 Save</button>
      <button id="sendBtn-project">📤 Send</button>
    </div>
  </div>`;
}

else if (msg.includes("resume") || msg.includes("cv")) {
  response = `
  <h2>📄 Resume</h2>
  <div class="editable-container">
    <div id="editableContent-resume" class="editable-content" contenteditable="false">
      <p><strong>Name:</strong> [Your Name]</p>
      <p><strong>Objective:</strong> To contribute to emotionally intelligent AI systems that serve real users with clarity.</p>
      <p><strong>Skills:</strong><br>
      - Prompt Normalization<br>
      - UI/UX with Emotional Clarity<br>
      - JavaScript, Python, Django<br>
      - Founder-style Product Thinking</p>
      <p><strong>Projects:</strong><br>
      - Bravexa AI<br>
      - Valantine AI</p>
      <p><strong>Contact:</strong> [Your Email] | [Phone]</p>
    </div>
    <div class="edit-buttons">
      <button id="editBtn-resume">✏️ Edit</button>
      <button id="saveBtn-resume" disabled>💾 Save</button>
      <button id="sendBtn-resume">📤 Send</button>
    </div>
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
  // Check if the clicked element is inside a container
  const container = event.target.closest(".editable-container");
  if (!container) return; // Not clicked inside an editable block

  const editable = container.querySelector(".editable-content");
  const editBtn = container.querySelector("#editBtn");
  const saveBtn = container.querySelector("#saveBtn");
  const sendBtn = container.querySelector("#sendBtn");

  // EDIT BUTTON
  if (event.target.id === "editBtn") {
    editable.contentEditable = "true";
    editable.style.border = "1px solid #007bff";
    editable.style.background = "#0d1b2a";
    editBtn.disabled = true;
    saveBtn.disabled = false;
  }

  // SAVE BUTTON
  if (event.target.id === "saveBtn") {
    editable.contentEditable = "false";
    editable.style.border = "none";
    editable.style.background = "transparent";
    saveBtn.disabled = true;
    editBtn.disabled = false;

    // Save to localStorage (unique key per block type)
    const blockType = container.querySelector("h2")?.innerText || "Document";
    localStorage.setItem(`${blockType}_LastEdited`, editable.innerText);
    alert(`✅ ${blockType} saved locally!`);
  }

    if (event.target.id === "sendBtn") {
  const container = event.target.closest(".editable-container");
  if (!container) return;

  const editable = container.querySelector("#editableContent");
  const blockTitle = container.querySelector("h2")?.innerText || "Bravexa AI Message";

  // 💬 Grab dynamic edited content
  const fullText = editable.innerText.trim();

  // 🧠 Try to extract subject automatically
  let firstLine = fullText.split("\n")[0];
  let subject = "";
  let body = fullText;

  if (firstLine.toLowerCase().startsWith("subject:")) {
    subject = firstLine.replace(/subject:/i, "").trim();
    body = fullText.split("\n").slice(1).join("\n").trim();
  } else {
    subject = blockTitle;
  }

  // 📩 Ask recipient dynamically
  const recipient = prompt("📧 Enter recipient email address:", "example@gmail.com");
  if (!recipient) return alert("❌ Email not sent — no recipient specified.");

const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
window.location.href = mailtoLink;
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
      codeOutput.style.background = "#1e1e1e";
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









