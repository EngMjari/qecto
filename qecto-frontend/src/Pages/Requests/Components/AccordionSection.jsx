import React from "react";
import { FaChevronDown, FaLock } from "react-icons/fa";

const AccordionSection = React.forwardRef(function AccordionSection(
  {
    title,
    open,
    onToggle,
    children,
    lock,
    lastMessageSender,
    userId,
    className = "",
    headerClassName = "",
  },
  ref
) {
  const getStatusText = () => {
    if (!lastMessageSender) {
      return { text: null, color: null };
    }
    if (lock) {
      return { text: "بسته شده", color: "text-red-500" };
    }
    if (lastMessageSender.is_staff) {
      return { text: "پاسخ داده شد", color: "text-green-600" };
    }
    if (lastMessageSender.id === userId) {
      return { text: "در انتظار پاسخ", color: "text-yellow-600" };
    }
    return { text: "پاسخ داده شد", color: "text-green-600" };
  };

  const { text: statusText, color: statusColor } = getStatusText();

  return (
    <div
      ref={ref}
      className={`mb-3 border rounded-lg bg-white shadow-sm transition-all duration-300 ${
        lock ? "opacity-75 border-gray-300" : "border-blue-200 hover:shadow-md"
      } ${className}`}
    >
      <button
        type="button"
        className={`w-full flex justify-between items-center px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-blue-50 transition-colors ${headerClassName}`}
        onClick={onToggle}
      >
        <div className="flex items-center">
          {lock && <FaLock className="w-4 h-4 ml-2 text-gray-500" />}
          {title}
        </div>
        <div className="flex items-center">
          {statusText && (
            <span className={`text-xs font-semibold ${statusColor} ml-2`}>
              ({statusText})
            </span>
          )}
          <FaChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-screen" : "max-h-0"
        }`}
      >
        <div className="px-4 pb-4">{children}</div>
      </div>
    </div>
  );
});

export default AccordionSection;
