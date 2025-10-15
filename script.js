document.addEventListener('DOMContentLoaded', function () {
  const hero = document.querySelector('.hero');
  const chatWindow = document.querySelector('.chat-window');
  const sendBtn = document.querySelector('.send-btn');
  const chatbox = document.querySelector('.chatbox');
  const inputArea = document.querySelector('.input-box');
  const footer = document.querySelector('.footer');
  const uploadDropdown = document.getElementById("uploadDropdown");

  // Send message when button clicked
  sendBtn.addEventListener('click', sendMessage);

  // Send message on Enter key (Shift+Enter makes new line)
  chatbox.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });

  // Main send function
  function sendMessage() {
    const userMessage = chatbox.value.trim();
    if (userMessage) {
      addMessageToChat(userMessage);
      chatbox.value = "";
    }

    adjustLayoutForViewport();

    // Hide hero, fix input
    hero.style.display = "none";
    inputArea.style.position = "fixed";
    chatWindow.style.marginTop = "80px";
    inputArea.style.bottom = "35px";
    inputArea.style.left = "50%";
    inputArea.style.transform = "translateX(-50%)";
    footer.style.marginTop = "0px";
    chatWindow.style.display = "flex";
    footer.style.fontSize = "10px";
    uploadDropdown.style.bottom = "30px";
    footer.innerHTML = "⚡ Bravexa AI Verify important details.";
  }

  // Display messages
  function addMessageToChat(message) {
    // User message
    const newMessage = document.createElement("div");
    newMessage.classList.add("message", "user-message");
    newMessage.textContent = message;
    chatWindow.appendChild(newMessage);
    makeMessageVisible(newMessage);

    // AI typing animation
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
    }, 1000);
  }

  function makeMessageVisible(messageElement) {
    setTimeout(() => {
      messageElement.classList.add("visible");
      const nearBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 100;
      if (nearBottom) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }
    }, 10);
  }

  function typeText(element, htmlContent, speed = 18) {
    let i = 0;
    let tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    let text = tempDiv.innerText;
    element.innerHTML = "";

    function typeChar() {
      if (i < text.length) {
        element.innerHTML = htmlContent.substring(0, i + 1);
        i++;
        const nearBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 100;
        if (nearBottom) {
          window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        }
        setTimeout(typeChar, speed);
      } else {
        element.innerHTML = htmlContent;
        const nearBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 100;
        if (nearBottom) {
          window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        }
      }
    }
    typeChar();
  }

  // === AI Response Logic ===
  async function generateAIResponse(userMessage) {
    const msg = userMessage.toLowerCase();
    let response = "";

    if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
      response = `<p>👋 Hello! I’m <strong>Bravexa AI</strong>, your intelligent assistant for productivity, learning, and insights.</p>`;
    }

    else if (msg.includes("who are you")) {
      response = `<p>🤖 I’m Bravexa AI — built to help you think faster, work smarter, and stay inspired every day.</p>`;
    }

    else if (msg.includes("motivate") || msg.includes("inspire")) {
      response = `<h2>💪 Motivation Boost</h2><p>Success starts with small consistent actions. Keep your focus, stay adaptable, and you’ll achieve more than you imagine. 🚀</p>`;
    }

    else if (msg.includes("quote")) {
      response = `<h2>📜 Quote of the Moment</h2><p>“Don’t watch the clock; do what it does — keep going.” ⏱️</p>`;
    }

    else if (msg.includes("advice")) {
      response = `<h2>🧭 Advice</h2><p>Plan smart, work with intent, and remember: clarity beats speed. Every strong step builds momentum. ⚡</p>`;
    }

    else if (msg.includes("knowledge") || msg.includes("fact")) {
      response = `<h2>🧠 Tech Fact</h2><p>Did you know? The first computer “bug” was an actual moth found inside a Harvard Mark II machine in 1947! 🪲</p>`;
    }

    else if (msg.includes("ai") || msg.includes("bravexa")) {
      response = `<h2>🤖 About Bravexa AI</h2><p>Bravexa AI is your modern digital companion — blending intelligence, creativity, and precision to power your ideas. 🌐</p>`;
    }

    else if (msg.includes("joke") || msg.includes("funny")) {
      response = `<h2>😂 Quick Tech Joke</h2><p>Why did the developer go broke?<br>Because he used up all his cache! 💸</p>`;
    }

    else if (msg.includes("table") || msg.includes("info")) {
      response = `
        <h2>📊 Bravexa Insights</h2>
        <table border="1">
          <tr><th>Category</th><th>Symbol</th><th>Focus</th></tr>
          <tr><td>Productivity</td><td>⚙️</td><td>Optimize daily routines</td></tr>
          <tr><td>Learning</td><td>📘</td><td>Knowledge for every domain</td></tr>
          <tr><td>Motivation</td><td>💪</td><td>Keep pushing your limits</td></tr>
          <tr><td>Innovation</td><td>🚀</td><td>Think beyond boundaries</td></tr>
        </table>`;
    }

    else if (msg.includes("story")) {
      response = `<h2>📖 A Short Story</h2><p>Once a coder built an AI to automate small things. Soon, it began solving bigger ones — not by magic, but by learning every day. Just like you. 🌟</p>`;
    }

    else if (msg.includes("bye") || msg.includes("goodbye")) {
      response = `<p>👋 Until next time — stay curious, stay brave. <strong>Bravexa AI</strong> signing off. ⚡</p>`;
    }

    else {
      response = `<p>💡 I’m ready to help with insights, quotes, productivity tips, or facts. What would you like to know?</p>`;
    }

    return response;
  }

  // === Layout Adjustments ===
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

// Simple dropdown toggle
    const avatarIcon = document.getElementById("avatarIcon");
    const dropdownMenu = document.getElementById("dropdownMenu");
    avatarIcon.addEventListener("click", () => {
      dropdownMenu.classList.toggle("active");
    });

  // script.js
document.addEventListener("DOMContentLoaded", function() {
  const username = "MohithSai"; // replace or fetch dynamically
  const hour = new Date().getHours();
  let greeting = "Good evening";

  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";

  document.querySelector("#username").textContent = username;
  document.querySelector(".hero h1").textContent = `${greeting}, ${username}!`;
});
document.addEventListener("DOMContentLoaded", () => {
  const plusBtn = document.getElementById("plusBtn");
  const uploadDropdown = document.getElementById("uploadDropdown");
  const screenshotBtn = document.getElementById("screenshotBtn");

  // 🔹 Toggle dropdown
  plusBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    uploadDropdown.style.display =
      uploadDropdown.style.display === "block" ? "none" : "block";
  });

  // 🔹 Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!uploadDropdown.contains(e.target) && e.target !== plusBtn) {
      uploadDropdown.style.display = "none";
    }
  });

  // 🔹 Handle file uploads (optional preview in console)
  document.querySelectorAll("#imageUpload, #videoUpload, #fileUpload").forEach(input => {
    input.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        console.log(`Uploaded: ${file.name} (${file.type})`);
        alert(`File uploaded: ${file.name}`);
      }
    });
  });

  // 🔹 Take Screenshot
  screenshotBtn.addEventListener("click", async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);
      const blob = await imageCapture.takePhoto();
      track.stop();

      const url = URL.createObjectURL(blob);
      console.log("Screenshot captured:", url);
      alert("Screenshot captured successfully!");

      // Example: display screenshot in chat
      const img = document.createElement("img");
      img.src = url;
      img.alt = "Screenshot";
      img.style.maxWidth = "200px";
      img.style.borderRadius = "8px";
      document.querySelector(".chat-window").appendChild(img);

    } catch (error) {
      console.error("Screenshot failed:", error);
      alert("Failed to take screenshot. Please allow screen capture permission.");
    }
  });
});


