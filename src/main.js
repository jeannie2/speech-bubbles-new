const API_KEY = import.meta.env.VITE_GOOGLE_FONTS_API_KEY;
let fontsList = [];
let visibleDelay = 0;
let listening;
let hiddenDelay = 1600;
let noError;
let recognition;
    
if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
  alert("Speech recognition not supported.");
  throw new Error("Speech recognition not supported.");
}

const runSpeechRecognition = () => {
  recognition.onstart = () => {
    listening = true;
    noError = true;
    visibleDelay = 0; 
    hiddenDelay = 1600;
    console.log("listening...");
  };

  if (!listening) {
    recognition.start();
  } else {
    console.log("already listening!");
    return; 
  }
}

const initSpeechRecognition = () => {
//   const SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  recognition = new SpeechRecognition();
//   let transcriptNoSpaces;
  
  recognition.continuous = true; 
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1; 

  recognition.onresult = (e) => {
  const spokenResults = e.results;

  // e.resultIndex: new results
  for (let i = e.resultIndex; i < spokenResults.length; i++) {
    const transcript = spokenResults[i][0].transcript.trim(); 

    if (spokenResults[i].isFinal && transcript !== "") {
      processTranscript(transcript); 
      console.log("processed transcript:", transcript);
    }
  }
};
  
  recognition.onend = () => {
    console.log("ended");
    listening = false; 
    noError = true;
    visibleDelay = 0;
    hiddenDelay = 1600;
    alert("recognition stopped, press spacebar to restart");
    document.getElementById("start-content").style.display = "block";
  };

  recognition.onnomatch = (e) => {
    console.log("Speech not recognised");
  };

  recognition.onerror = (e) => {
    console.log("speech recognition error: " + e.error);
    recognition.stop();
    noError = false;
    listening = false;
    visibleDelay = 0; 
    hiddenDelay = 1600;
    alert("error, please refresh to try again");
  };

  window.addEventListener("unload", () => {
    window.speechSynthesis.cancel();
  });

  document.body.onkeyup = (e) => {
    if (e.key == " ") {
      runSpeechRecognition();
      document.getElementById("start-content").style.display = "none";
    }
  };

  document.addEventListener("visibilitychange", () => {
    window.speechSynthesis.cancel();
  });
}

const randomRGB = () => {
  let r = Math.floor(Math.random() * 256);
  let g = Math.floor(Math.random() * 256);
  let b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

const randomRGBA = () => {
  let r = Math.floor(Math.random() * 256);
  let g = Math.floor(Math.random() * 256);
  let b = Math.floor(Math.random() * 256);
  const a = Math.random() * 0.5 + 0.5;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

const randomOpacity = () => {
  return (Math.random() * (1.0 - 0.5) + 0.5).toFixed(1); 
}

const randomLocation = () => {
  const bottomSpace = Math.floor(Math.random() * 36) + "vh"; 
  const rightSpace = Math.floor(Math.random() * 43) + "vw"; 
  return [bottomSpace, rightSpace];
}

const loadFontsList = async () => {
  try {
    const result = await fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}`
    );
    const data = await result.json();
    return data.items;
  } catch (e) {
    console.log("error loading fonts: " + e.message);
  }
}

const loadRandomFont = (fontsList) => {
  const randomIndex = Math.floor(Math.random() * fontsList.length);
  const chosenFont = fontsList[randomIndex].family;
  WebFont.load({
    google: {
      families: [chosenFont]
    }
  });
  return chosenFont;
}

const createText = (transcript) => {
  let letterSpace = Math.floor(Math.random() * 4);
  const speechText = document.createElement("p");  
  speechText.style.padding = 0; 
  speechText.style.margin = 0; 
  speechText.textContent = transcript;
  speechText.style.visibility = "hidden";
  speechText.style.fontFamily = loadRandomFont(fontsList);
  speechText.style.color = randomRGBA();
  speechText.style["-webkit-text-stroke-width"] = letterSpace + "px"; 
  speechText.style["-webkit-text-stroke-color"] = randomRGB(); 
  return speechText;
}

const createTextNoBubble = (transcript) => {
  let randFontSize = Math.floor(Math.random() * (4 - 1 + 1) + 4); 
  const speechText = createText(transcript);  
  speechText.style.position = "fixed";
  speechText.style.bottom = randomLocation()[0];
  speechText.style.right = randomLocation()[1];
  speechText.style.fontSize = randFontSize + "vw";   
  document.body.appendChild(speechText);  
  setTimeout(() => {
    speechText.style.visibility = "visible";
    setTimeout(() => {
      speechText.style.visibility = "hidden";
    }, (hiddenDelay += 400));
    }, (visibleDelay += 50)); 
}

const createTextBubble = (transcript) => {
  let bubbleWidth = Math.floor(Math.random() * (15 - 8 + 1)) + 8; 
  let borderThickness = Math.floor(Math.random() * 7); 
  let ellipse = document.createElement("div");  
  ellipse.style.width = bubbleWidth + "vw";
  ellipse.style.height = bubbleWidth / 2 + "vw";
  ellipse.style.bottom = randomLocation()[0]; 
  ellipse.style.right = randomLocation()[1];   
  ellipse.classList.add("bubble");
  ellipse.style.margin = 0; 
  ellipse.style.padding = 0; 
  ellipse.style.lineHeight = ellipse.style.height; 
  ellipse.style.visibility = "hidden";
  ellipse.style.zIndex = "-1"; // behind speechText
  ellipse.style.textAlign = "center";
  ellipse.style.opacity = randomOpacity();
  ellipse.style.background = randomRGB();  
  ellipse.style.backgroundImage =
  "radial-gradient(" +
  randomRGB() +
  " 15%, transparent 20%),radial-gradient(" +
  randomRGB() +
  " 15%, transparent 20%)"; 
  ellipse.style.backgroundSize = "7px 7px";
  ellipse.style.backgroundPosition = "20 20, 80px 80px";
  ellipse.style.border = borderThickness + "px solid " + randomRGB();  
  document.body.appendChild(ellipse);  
  let speechText = createText(transcript);
  speechText.style.position = "relative";
  speechText.style.fontSize = bubbleWidth / 4 + "vw";   
  ellipse.appendChild(speechText);  
  setTimeout(() => {
    speechText.style.visibility = "visible";
    ellipse.style.visibility = "visible";
    setTimeout(() => {
      speechText.style.visibility = "hidden";
      ellipse.style.visibility = "hidden";
    }, (hiddenDelay += 400)); 
  }, (visibleDelay += 50)); 
}

const loadBubblesAndText = (transcript) => {
  if (Math.random() < 0.7) {
    createTextBubble(transcript);
  } else {
    createTextNoBubble(transcript);
  }
}

const processTranscript = (spokenTranscript) => {
  const transcriptNoSpaces = spokenTranscript.split(" ");
  for (let i = 0; i < transcriptNoSpaces.length; i++) {
    loadBubblesAndText(transcriptNoSpaces[i]);
  }
}

window.addEventListener("load", async () => {
  fontsList = await loadFontsList();
  initSpeechRecognition();
});