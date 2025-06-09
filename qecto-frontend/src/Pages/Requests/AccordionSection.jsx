import React from "react";
import { FaLock, FaLockOpen } from "react-icons/fa";
const AccordionSection = React.forwardRef(function AccordionSection(
  { title, open, onToggle, children, lock },
  ref
) {
  return (
    <div ref={ref} className="mb-3 border rounded-lg bg-white w-full">
      <button
        type="button"
        className="w-full flex justify-between items-center px-4 py-3 font-bold text-md focus:outline-none"
        onClick={onToggle}
      >
        <span>
          {title}
          {lock && (
            <span className="px-2 text-xs text-red-500">(بسته شده)</span>
          )}
        </span>
        <div className="flex text-lg ">
          {lock && lock !== undefined && (
            <span className="px-1">
              {lock ? <FaLock /> : <FaLockOpen title="تیکت باز است" />}
            </span>
          )}
          <span className="px-1">{open ? "−" : "+"}</span>
        </div>
      </button>
      {open && <div className="px-0 pb-0">{children}</div>}
    </div>
  );
});

export default AccordionSection;
