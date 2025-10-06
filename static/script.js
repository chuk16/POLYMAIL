// Full supported languages (alphabetical)
const languages = [
  "Arabic", "Bengali", "Bulgarian", "Chinese (Simplified)", "Chinese (Traditional)", 
  "Croatian", "Czech", "Danish", "Dutch", "English (UK)", "English (US)", "Estonian", 
  "Finnish", "French", "German", "Greek", "Hebrew", "Hindi", "Hungarian", "Indonesian", 
  "Italian", "Japanese", "Korean", "Latvian", "Lithuanian", "Malay", "Norwegian", 
  "Polish", "Portuguese", "Romanian", "Russian", "Serbian", "Slovak", "Slovene", 
  "Spanish", "Swedish", "Swahili", "Thai", "Turkish", "Ukrainian", "Urdu"
];

// Populate language dropdown
const targetLangSelect = document.getElementById("targetLang");
languages.forEach(lang => {
  const option = document.createElement("option");
  option.value = lang;
  option.textContent = lang;
  targetLangSelect.appendChild(option);
});

// Handle translation form submit
document.getElementById("translateForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("emailText").value;
  const language = document.getElementById("targetLang").value;
  const style = document.getElementById("desiredTone").value;

  if (!email || !language) {
    alert("Please enter an email and select a target language.");
    return;
  }

  document.getElementById("output").textContent = "Translating...";

  try {
    const response = await fetch("/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, language, style })
    });

    const data = await response.json();

    if (data.translation) {
      document.getElementById("output").textContent = data.translation;
    } else {
      document.getElementById("output").textContent = "Error: " + data.error;
    }

  } catch (err) {
    document.getElementById("output").textContent = "Error: " + err.message;
  }
});

// Contact form handler
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const feedbackEl = document.getElementById("formFeedback");
    feedbackEl.style.display = "none";
    feedbackEl.style.color = "green";

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) {
      feedbackEl.textContent = "Please fill in all fields.";
      feedbackEl.style.color = "red";
      feedbackEl.style.display = "block";
      return;
    }

    try {
      // Use absolute URL to ensure it works on Render
      const response = await fetch(window.location.origin + "/send_contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message })
      });

      const result = await response.json();

      if (response.ok) {
        feedbackEl.textContent = "Your message has been sent! We'll get back to you shortly.";
        feedbackEl.style.color = "green";
        feedbackEl.style.display = "block";
        contactForm.reset();
      } else {
        feedbackEl.textContent = result.error || "Something went wrong. Please try again later.";
        feedbackEl.style.color = "red";
        feedbackEl.style.display = "block";
      }

    } catch (err) {
      feedbackEl.textContent = "An error occurred. Please try again later.";
      feedbackEl.style.color = "red";
      feedbackEl.style.display = "block";
      console.error("Contact form error:", err);
    }
  });
}


// Copy output to clipboard
document.getElementById("copyBtn").addEventListener("click", () => {
  const output = document.getElementById("output").textContent;
  navigator.clipboard.writeText(output);
  alert("Copied to clipboard!");
});
