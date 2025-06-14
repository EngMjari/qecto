import React from "react";

function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-lg transition-shadow hover:shadow-2xl ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;
