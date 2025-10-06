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

// Copy output to clipboard
document.getElementById("copyBtn").addEventListener("click", () => {
  const output = document.getElementById("output").textContent;
  navigator.clipboard.writeText(output);
  alert("Copied to clipboard!");
});
