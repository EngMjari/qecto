import React from "react";

function CardHeader({ children, className = "" }) {
  return (
    <div className={`p-3 border-b border-gray-200 ${className}`}>
      <h3 className="text-lg font-bold text-gray-800">{children}</h3>
    </div>
  );
}

export default CardHeader;
