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
  const msg = userMessage.toLowerCase().trim();
  let response = "";

  // --- 🧠 UNDERSTANDING LAYER ---
  const intents = {
    greeting: ["hello", "hi", "hey", "good morning", "good evening"],
    leave: ["leave letter", "application", "holiday", "absent", "permission"],
    email: ["email", "official", "mail", "message"],
    resume: ["resume", "project", "documentation", "portfolio"],
    word: ["word", "report", "docx", "document"],
    excel: ["excel", "sheet", "table", "spreadsheet"],
    presentation: ["presentation", "slides", "ppt", "deck", "powerpoint"],
    access: ["access", "database", "query", "record"],
    code: ["code", "program", "script", "snippet"],
    motivate: ["motivate", "inspire", "encourage", "boost"],
    computer: ["computer", "algorithm", "network", "software", "ai"],
    physics: ["physics", "force", "energy", "motion", "quantum"],
    math: ["math", "mathematics", "algebra", "geometry", "calculus"]
  };

  let intent = "default";

  for (const [key, words] of Object.entries(intents)) {
    if (words.some(word => msg.includes(word))) {
      intent = key;
      break;
    }
  }

  // --- 💬 RULE-BASED LAYER ---
  switch (intent) {
    case "greeting":
      response = `
        <h2>👋 Hello!</h2>
        <p>I’m <strong>Bravexa AI</strong> — your creative workspace assistant.</p>
        <p>Try me with:<br>• "Generate leave letter"<br>• "Official email"<br>• "Excel sheet"<br>• "Physics notes"</p>`;
      break;

    case "leave":
      response = `
        <h2>📄 Leave Letter</h2>
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
        </pre>`;
      break;

    case "email":
      response = `
        <h2>📧 Official Email</h2>
        <pre class="code-content" contenteditable="true">
Subject: Regarding Project Discussion    

Dear [Recipient Name],    
I hope you are doing well.    

I would like to schedule a discussion about our project progress and upcoming deadlines.    
Please let me know your availability.    

Best regards,    
[Your Name]    
[Your Contact Info]
        </pre>`;
      break;

    case "resume":
      response = `
        <h2>📘 Project Documentation</h2>
        <pre class="code-content" contenteditable="true">
<b>Project Title:</b> Smart Waste Management System    

<b>Objective:</b> Automate waste collection using IoT sensors.    

<b>Technologies Used:</b>    
- Arduino, Node.js, Firebase    

<b>Outcome:</b> Efficient and eco-friendly waste management with live monitoring.
        </pre>`;
      break;

    case "word":
      response = `
        <h2>📝 Microsoft Word Document</h2>
        <pre class="code-content" contenteditable="true">
<b>Title:</b> Annual Report    

<b>Introduction:</b>    
Performance summary and strategic outlook.    

<b>Highlights:</b>    
- 24% growth    
- 3 new branches    
- Improved retention    

<b>Conclusion:</b>    
Focus on innovation and teamwork.
        </pre>`;
      break;

    case "excel":
      response = `
        <h2>📊 Microsoft Excel Sheet</h2>
        <pre class="code-content" contenteditable="true">
| Month | Sales | Profit | Growth |
|--------|--------|---------|---------|
| Jan    | 12000  | 4000   | 33%     |
| Feb    | 15000  | 5000   | 35%     |
| Mar    | 18000  | 6000   | 38%     |
        </pre>`;
      break;

    case "presentation":
      response = `
        <h2>🎤 PowerPoint Presentation</h2>
        <pre class="code-content" contenteditable="true">
<b>Slide 1:</b> Introduction    
- Welcome to Bravexa AI    

<b>Slide 2:</b> Vision    
- Smarter workspace assistant    

<b>Slide 3:</b> Features    
- Word, Excel, Presentation, Access    
- Multi-subject understanding    

<b>Slide 4:</b> Future Roadmap    
- AI Agent Upgrade (November)    
- Voice + Document fusion
        </pre>`;
      break;

    case "access":
      response = `
        <h2>💾 Microsoft Access Database</h2>
        <pre class="code-content" contenteditable="true">
<b>Table:</b> StudentRecords    

| ID | Name | Department | Marks | Grade |
|----|------|-------------|--------|--------|
| 1  | John | CS | 87 | A |
| 2  | Priya | ECE | 91 | A+ |
| 3  | Rahul | ME | 76 | B+ |

<b>Query Example:</b>    
SELECT Name, Department, Marks FROM StudentRecords WHERE Marks > 80;
        </pre>`;
      break;

    case "computer":
      response = `
        <h2>💻 Computer Science Notes</h2>
        <pre class="code-content" contenteditable="true">
<b>Topic:</b> Algorithm Time Complexity    

<b>Example:</b> Binary Search — O(log n)    

<b>Explanation:</b>    
Each iteration halves the search space. Used in sorted arrays for fast lookups.
        </pre>`;
      break;

    case "physics":
      response = `
        <h2>⚛️ Physics Summary</h2>
        <pre class="code-content" contenteditable="true">
<b>Topic:</b> Newton’s Laws of Motion    

1️⃣ Law of Inertia — Objects resist change in motion    
2️⃣ F = m × a    
3️⃣ Action-Reaction Principle    

<b>Example:</b> Rocket propulsion uses the 3rd law.
        </pre>`;
      break;

    case "math":
      response = `
        <h2>📐 Mathematics Formula Sheet</h2>
        <pre class="code-content" contenteditable="true">
<b>Topic:</b> Calculus Basics    

d/dx (x²) = 2x    
∫ x dx = x² / 2 + C    

<b>Topic:</b> Algebra    
(a + b)² = a² + 2ab + b²
        </pre>`;
      break;

    case "code":
      let lang = "javascript";
      if (msg.includes("python")) lang = "python";
      else if (msg.includes("java")) lang = "java";
      else if (msg.includes("html")) lang = "html";
      else if (msg.includes("css")) lang = "css";

      const examples = {
        javascript: `function greet(name){\n  console.log("Hello, " + name + "!");\n}\ngreet("Bravexa User");`,
        python: `def greet(name):\n    print("Hello, " + name + "!")\n\ngreet("Bravexa User")`,
        java: `class Main {\n  public static void main(String[] args){\n    System.out.println("Hello, Bravexa User!");\n  }\n}`,
        html: `<!DOCTYPE html>\n<html>\n<body>\n  <h1>Hello, Bravexa User!</h1>\n</body>\n</html>`,
        css: `body {\n  background-color: #f5f5f5;\n  color: #333;\n  font-family: Arial;\n}`
      };

      response = `
        <h2>💻 ${lang.toUpperCase()} Code</h2>
        <pre class="code-content"><code>${examples[lang]}</code></pre>`;
      break;

    case "motivate":
      response = `
        <h2>🚀 Motivation Boost</h2>
        <p>Keep building — your ideas shape the future! Bravexa learns from every experiment you run 💪</p>`;
      break;

    default:
      response = `
        <p>✨ I’m Bravexa AI — your workspace friend.</p>
        <ul>
          <li>Generate Word, Excel, or PowerPoint content</li>
          <li>Write Physics or Computer Science notes</li>
          <li>Create code snippets</li>
          <li>Motivate you to keep progressing</li>
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









