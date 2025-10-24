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
  async function generateAIResponse(userMessage) {
  const msg = userMessage.toLowerCase();
  let response = "";

  // === 🟢 1. GREETINGS ===
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    response = `
      <h2>👋 Welcome to Bravexa B1</h2>
      <p>Hey Founder, I’m <strong>Bravexa AI</strong> — your assistant for research, coding, and logic generation.</p>
      <p>Try categories like:<br>
      • Problem Solving 🧩<br>
      • Fact Checking 🧠<br>
      • Analysis 📊<br>
      • Generation ⚙️<br>
      • Deep Research 🔍<br>
      • Conclusion 🧭</p>`;
  }

  // === 🧩 2. PROBLEM SOLVING ===
  else if (msg.includes("solve") || msg.includes("find") || msg.includes("calculate")) {
    response = `
      <h2>🧩 Problem Solving</h2>
      <p>Bravexa breaks it down step-by-step:</p>
      <ol>
        <li>Identify the core question</li>
        <li>Analyze the logic</li>
        <li>Generate the answer clearly</li>
      </ol>
      <p>Try: “Solve 25% of 240” or “Find area of circle with radius 7.”</p>`;
  }

  // === 🧠 3. FACT CHECKING ===
  else if (msg.includes("fact") || msg.includes("true or false") || msg.includes("check")) {
    response = `
      <h2>🧠 Fact Checking</h2>
      <p>Fact verification mode activated. Bravexa checks information validity with logical reasoning.</p>
      <p>Try: “Check if humans can survive on Mars.”</p>`;
  }

  // === 📊 4. ANALYSIS ===
  else if (msg.includes("analyze") || msg.includes("compare") || msg.includes("difference")) {
    response = `
      <h2>📊 Analysis Mode</h2>
      <p>Bravexa compares and breaks down data into insights.</p>
      <p>Try: “Analyze Java vs Python” or “Compare AI and ML.”</p>`;
  }

  // === ⚙️ 5. GENERATION (Docs + Code) ===
else if (
  msg.includes("generate") ||
  msg.includes("leave letter") ||
  msg.includes("email") ||
  msg.includes("resume") ||
  msg.includes("project report") ||
  msg.includes("privacy policy") ||
  msg.includes("code") ||
  msg.includes("program")
) {
  // === LEAVE LETTER / EMAIL ===
  if (msg.includes("leave letter") || msg.includes("email")) {
    response = `
      <h2>✉️ Document Ready</h2>
      <p>Here’s your ${msg.includes("leave letter") ? "Leave Letter" : "Email"}:</p>
      <textarea id="docOutput" class="w-full p-3 rounded-lg border">${generateBravexaContent(msg)}</textarea>
      <button onclick="sendEmail()" class="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700">Send</button>
      <script>
        function sendEmail() {
          alert("✅ Document sent successfully via Bravexa Mail Engine!");
        }
      </script>
    `;
  }

  // === RESUME / PROJECT REPORT ===
  else if (msg.includes("resume") || msg.includes("project report")) {
    response = `
      <h2>📄 ${msg.includes("resume") ? "Resume" : "Project Report"} Generated</h2>
      <textarea id="copyText" class="w-full p-3 rounded-lg border">${generateBravexaContent(msg)}</textarea>
      <button onclick="copyText()" class="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700">Copy</button>
      <script>
        function copyText() {
          const text = document.getElementById('copyText');
          text.select();
          document.execCommand('copy');
          alert('✅ Copied successfully!');
        }
      </script>
    `;
  }

  // === CODE / PROGRAM ===
  else if (msg.includes("code") || msg.includes("program")) {
    response = `
      <h2>💻 Code Generated</h2>
      <pre id="codeOutput" class="bg-gray-900 text-white p-3 rounded-lg overflow-auto">${generateBravexaContent(msg)}</pre>
      <button onclick="copyCode()" class="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700">Copy Code</button>
      <script>
        function copyCode() {
          const code = document.getElementById('codeOutput');
          navigator.clipboard.writeText(code.innerText);
          alert('✅ Code copied!');
        }
      </script>
    `;
  }

  // === PRIVACY POLICY OR OTHERS (Fallback Copy Only) ===
  else {
    response = `
      <h2>📘 Document Generated</h2>
      <textarea id="genericCopy" class="w-full p-3 rounded-lg border">${generateBravexaContent(msg)}</textarea>
      <button onclick="copyGeneric()" class="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700">Copy</button>
      <script>
        function copyGeneric() {
          const text = document.getElementById('genericCopy');
          text.select();
          document.execCommand('copy');
          alert('✅ Copied successfully!');
        }
      </script>
    `;
  }
}

  // === 🔍 6. DEEP RESEARCH ===
  else if (msg.includes("research") || msg.includes("study") || msg.includes("report on")) {
    response = `
      <h2>🔍 Deep Research Mode</h2>
      <p>Bravexa builds structured research breakdown:</p>
      <ul>
        <li>Topic Overview</li>
        <li>Key Data Points</li>
        <li>Sources / Validation</li>
        <li>Concise Summary</li>
      </ul>
      <p>Try: “Research about AI ethics” or “Study of renewable energy trends.”</p>`;
  }

  // === 🧭 7. CONCLUSION ===
  else if (msg.includes("conclude") || msg.includes("summary") || msg.includes("final")) {
    response = `
      <h2>🧭 Conclusion</h2>
      <p>Bravexa gives concise logical summaries that close your session smoothly.</p>
      <p>Try: “Give conclusion for my report on AI.”</p>`;
  }

  // === DEFAULT FALLBACK ===
  else {
    response = `
      <p>💡 Bravexa can help in 6 categories:<br>
      1. Problem Solving<br>
      2. Fact Checking<br>
      3. Analysis<br>
      4. Generation<br>
      5. Deep Research<br>
      6. Conclusion</p>
      <p>Type your query to begin ⚡</p>`;
  }

  return response;
}

// === 🔧 BRAVEXA GENERATION SYSTEM ===
function generateBravexaContent(msg) {
  // use your previous unified generation system here (leave, resume, policy, code, etc.)
  // the version you shared earlier fits perfectly here.
  return finalResponse;
}
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









