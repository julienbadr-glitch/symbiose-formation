const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let isListening = false;
let onResultCallback = null;
let onStateChangeCallback = null;
let finalTranscript = '';

/* ── iOS Safari fix: cache voices ── */
let cachedVoices = [];
function loadVoices() {
  cachedVoices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
}
if (window.speechSynthesis) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

/* ── iOS Safari fix: unlock speechSynthesis on first user gesture ── */
let synthUnlocked = false;
export function unlockSpeechSynthesis() {
  if (synthUnlocked || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance('');
  u.volume = 0;
  window.speechSynthesis.speak(u);
  synthUnlocked = true;
}

export function isSpeechSupported() {
  return !!SpeechRecognition;
}

export function initSpeechRecognition({ onResult, onStateChange }) {
  if (!SpeechRecognition) return false;

  onResultCallback = onResult;
  onStateChangeCallback = onStateChange;

  recognition = new SpeechRecognition();
  recognition.lang = 'fr-FR';
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    let interim = '';
    finalTranscript = '';
    for (let i = 0; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interim += transcript;
      }
    }
    if (onResultCallback) {
      onResultCallback({ final: finalTranscript, interim, done: finalTranscript.length > 0 });
    }
  };

  recognition.onerror = (event) => {
    console.warn('Speech recognition error:', event.error);
    if (event.error !== 'no-speech') {
      isListening = false;
      if (onStateChangeCallback) onStateChangeCallback(false);
    }
  };

  recognition.onend = () => {
    if (isListening) {
      try { recognition.start(); } catch (e) { /* already started */ }
    } else {
      if (onStateChangeCallback) onStateChangeCallback(false);
    }
  };

  return true;
}

export function startListening() {
  if (!recognition) return;
  finalTranscript = '';
  onResultCallback = arguments[0] || onResultCallback;
  try {
    recognition.start();
    isListening = true;
    if (onStateChangeCallback) onStateChangeCallback(true);
  } catch (e) {
    console.warn('Could not start recognition:', e);
  }
}

export function stopListening() {
  if (!recognition || !isListening) return;
  try {
    recognition.stop();
  } catch (e) {
    console.warn('Could not stop recognition:', e);
  }
  isListening = false;
}

export function isCurrentlyListening() {
  return isListening;
}

let currentUtterance = null;
let resumeTimer = null;

export function speakText(text, { lang = 'fr-FR', rate = 1, pitch = 1 } = {}) {
  if (!window.speechSynthesis) return;

  stopSpeaking();

  const clean = text.replace(/<[^>]*>/g, '');
  currentUtterance = new SpeechSynthesisUtterance(clean);
  currentUtterance.lang = lang;
  currentUtterance.rate = rate;
  currentUtterance.pitch = pitch;

  /* Use cached voices (iOS needs voiceschanged event first) */
  if (cachedVoices.length === 0) loadVoices();
  const frVoice = cachedVoices.find(v => v.lang.startsWith('fr') && v.name.includes('Google'))
    || cachedVoices.find(v => v.lang.startsWith('fr'));
  if (frVoice) currentUtterance.voice = frVoice;

  currentUtterance.onend = () => { clearInterval(resumeTimer); resumeTimer = null; };
  currentUtterance.onerror = () => { clearInterval(resumeTimer); resumeTimer = null; };

  window.speechSynthesis.speak(currentUtterance);

  /* ── iOS Safari fix: long utterances get cut off after ~15s ── */
  resumeTimer = setInterval(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    } else {
      clearInterval(resumeTimer);
      resumeTimer = null;
    }
  }, 10000);
}

export function stopSpeaking() {
  if (resumeTimer) { clearInterval(resumeTimer); resumeTimer = null; }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}
