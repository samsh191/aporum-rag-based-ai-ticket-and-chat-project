import { useCallback, useEffect, useRef, useState } from "react";

const SpeechRecognitionAPI =
  typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

export function useVoiceAssistant() {
  const [supported] = useState(!!SpeechRecognitionAPI && "speechSynthesis" in window);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!SpeechRecognitionAPI) return;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-AU";

    recognition.onresult = (event) => {
      let finalText = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += t;
        else interim += t;
      }
      setTranscript(finalText || interim);
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setTranscript("");
    setListening(true);
    try {
      recognitionRef.current.start();
    } catch {
      // already started — ignore
    }
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const speak = useCallback((text, { onEnd } = {}) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel(); // stop anything currently speaking
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1.05;
    // Prefer a female-sounding English voice if one is available in the browser.
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => /female/i.test(v.name) && /en/i.test(v.lang)) ||
      voices.find((v) => /Samantha|Google UK English Female|Zira|Ava/i.test(v.name)) ||
      voices.find((v) => /en/i.test(v.lang));
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => {
      setSpeaking(false);
      onEnd?.();
    };
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const cancelSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  return { supported, listening, speaking, transcript, startListening, stopListening, speak, cancelSpeaking };
}
