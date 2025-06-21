import React from "react";
import { FaTimes } from "react-icons/fa";
import TicketConversation from "./TicketConversation";
import { AuthContext } from "../../../Contexts/AuthContext";

function TicketModal({ session, onClose, onSendMessage, onPreview }) {
  const { userProfile } = React.useContext(AuthContext);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 md:hidden"
      onClick={onClose}
      style={{ top: "64px", height: "calc(100vh - 160px)" }} // 64px navbar + 96px footer
    >
      <div
        className="bg-white w-full h-full flex flex-col rounded-none"
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
            ownerId={session?.related_request.owner.id}
          />
        </div>
      </div>
      <style jsx global>{`
        @media (min-width: 1025px) {
          .ticket-modal {
            display: none;
          }
        }
        .ticket-modal::-webkit-scrollbar {
          width: 8px;
        }
        .ticket-modal::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 12px;
        }
        .ticket-modal::-webkit-scrollbar-thumb {
          background: #c7c7c7;
          border-radius: 12px;
        }
        .ticket-modal::-webkit-scrollbar-thumb:hover {
          background: #a3a3a3;
        }
        .ticket-modal {
          scrollbar-width: thin;
          scrollbar-color: #c7c7c7 #f1f1f1;
        }
      `}</style>
    </div>
  );
}

export default TicketModal;
