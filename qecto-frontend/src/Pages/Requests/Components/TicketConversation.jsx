import React from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import FileItem from "./FileItem"; // Import the FileItem component

function TicketConversation({ session, onBack, onSendMessage, onPreview }) {
  return (
    <div className="flex flex-col h-full">
      <div
        className="flex-grow p-4 overflow-y-auto w-full"
        style={{ maxHeight: "50vh", minHeight: 200, overflowX: "hidden" }}
      >
        {session.tickets.map((ticket) => (
          <MessageBubble key={ticket.id} message={ticket} />
        ))}

        {/* Render attachments if they exist */}
        {session.attachments && session.attachments.length > 0 && (
          <div className="mt-2">
            <h4 className="text-xs text-gray-500 mb-1">فایل‌های این تیکت:</h4>
            <div className="space-y-1">
              {session.attachments.map((file) => (
                <FileItem key={file.id} file={file} onPreview={onPreview} />
              ))}
            </div>
          </div>
        )}
      </div>
      <MessageInput
        disabled={session.status === "closed"}
        onSendMessage={onSendMessage}
      />
    </div>
  );
}

export default TicketConversation;
