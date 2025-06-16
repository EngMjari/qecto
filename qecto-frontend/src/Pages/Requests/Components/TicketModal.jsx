import React from "react";
import { FaTimes } from "react-icons/fa";
import TicketConversation from "./TicketConversation";
import { AuthContext } from "../../../Contexts/AuthContext";

function TicketModal({ session, onClose, onSendMessage, onPreview }) {
  const { userProfile } = React.useContext(AuthContext);

  return (
    <div
      className="fixed inset-0 page-content bg-black bg-opacity-50 flex items-center justify-center z-1000"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md h-[80vh] flex flex-col rounded-lg shadow-2xl my-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800 truncate">
            {session.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <TicketConversation
            session={session}
            onSendMessage={onSendMessage}
            onPreview={onPreview}
            userId={userProfile?.id}
          />
        </div>
      </div>
    </div>
  );
}

export default TicketModal;
