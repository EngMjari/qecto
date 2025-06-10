import React, { useEffect, useRef, useState } from "react";

const CountUp = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const startTime = Date.now();
          const frame = () => {
            const now = Date.now();
            const progress = (now - startTime) / duration;
            if (progress < 1) {
              setCount(Math.min(end, Math.floor(end * progress)));
              requestAnimationFrame(frame);
            } else {
              setCount(end);
            }
          };
          requestAnimationFrame(frame);
          observer.unobserve(ref.current);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [end, duration]);

  return <span ref={ref}>{count.toLocaleString("fa-IR")}</span>;
};
export default CountUp;
// Usage example:
// <CountUp end={1000} duration={2000} />
// This will count up to 1000 over 2 seconds, formatted in Persian locale.
