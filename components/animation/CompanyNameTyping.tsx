"use client";

import {
  memo,
  useEffect,
  useState,
} from "react";

interface CompanyNameTypingProps {
  text: string;
  speed?: number;
  pause?: number;
}

function CompanyNameTyping({
  text,
  speed = 65,
  pause = 3000,
}: CompanyNameTypingProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    let index = 0;
    let timerId: number;

    const typeText = () => {
      if (index < text.length) {
        index += 1;
        setValue(text.slice(0, index));
        timerId = window.setTimeout(typeText, speed);
        return;
      }

      timerId = window.setTimeout(() => {
        index = 0;
        setValue("");
        timerId = window.setTimeout(typeText, 300);
      }, pause);
    };

    typeText();

    return () => {
      window.clearTimeout(timerId);
    };
  }, [pause, speed, text]);

  return <span aria-hidden="true">{value}</span>;
}

export default memo(CompanyNameTyping);