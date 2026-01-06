// theme.js
const currentTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", currentTheme);

const toggleTheme = () => {
  const newTheme =
    document.documentElement.getAttribute("data-theme") === "light"
      ? "dark"
      : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
};

// Example: Attach to your logo or a toggle button
document.querySelector(".logo").addEventListener("click", toggleTheme);


// Optionally, add a button to toggle themes
document.querySelector('.lang-button').addEventListener('click', toggleTheme);

 function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("open");
  }

  // Auto-close sidebar when a link inside is clicked
  document.querySelectorAll('.sidebar a').forEach(link => {
    link.addEventListener('click', () => {
      document.getElementById("sidebar").classList.remove("open");
    });
  });
  const audio = document.getElementById("audio");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const time = document.getElementById("time");

  playPauseBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      playPauseBtn.textContent = "⏸";
    } else {
      audio.pause();
      playPauseBtn.textContent = "▶";
    }
  });

  audio.addEventListener("timeupdate", () => {
    audio.value = (audio.currentTime / audio.duration) * 100 || 0;

    const minutes = Math.floor(audio.currentTime / 60);
    const seconds = Math.floor(audio.currentTime % 60).toString().padStart(2, "0");
    time.textContent = `${minutes}:${seconds}`;
  });

  audio.addEventListener("input", () => {
    audio.currentTime = (seekBar.value / 100) * audio.duration;
  });

  document.getElementById('shareBtn').addEventListener('click', function () {
  if (navigator.share) {
    navigator.share({
      title: 'Listen to this article',
      text: 'Check out this audio scroll from Nexora.',
      url: 'synthesized_audio.mp3' // Replace with full URL if hosted
    })
    .then(() => console.log('Audio shared successfully'))
    .catch((error) => console.error('Error sharing:', error));
  } else {
    alert('Sharing not supported on this device.');
  }
});
