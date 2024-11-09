import { useState, useEffect } from "react";

function useTypingEffect(text:string, delay = 100) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!isTyping) return;

    const typeChar = () => {
      setDisplayedText((prev) => {
        if (prev.length < text.length) {
          return text.slice(0, prev.length + 1);
        } else {
          setIsTyping(false);
          return prev;
        }
      });
    };

    const timeout = setTimeout(typeChar, delay);
    return () => clearTimeout(timeout);
  }, [displayedText, text, delay, isTyping]);

  return displayedText;
}

export default useTypingEffect