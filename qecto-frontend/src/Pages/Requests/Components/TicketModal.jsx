import React from "react";
import { FaTimes } from "react-icons/fa";
import TicketConversation from "./TicketConversation";

// TODO: fix pading top and button in mobile view
function TicketModal({ session, onClose, onSendMessage, onPreview }) {
  return (
    <div className="fixed inset-0 page-content bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full h-full flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">{session.title}</h2>
          <button onClick={onClose}>
            <FaTimes className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <TicketConversation
            session={session}
            onSendMessage={onSendMessage}
            onPreview={onPreview}
          />
        </div>
      </div>
    </div>
  );
}

export default TicketModal;
