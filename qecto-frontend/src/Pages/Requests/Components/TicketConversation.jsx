import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

function TicketConversation({ session, onSendMessage, userId }) {
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesContainerRef.current && messagesEndRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
      // یا اگر بخوای می‌تونی از scrollIntoView روی messagesEndRef استفاده کنی:
      // messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [session.messages]);

  return (
    <div className="flex flex-col h-full bg-white rounded-b-xl shadow-inner">
      <div
        ref={messagesContainerRef}
        className="flex-grow p-4 overflow-y-auto w-full space-y-6"
        style={{ maxHeight: "60vh", minHeight: 200, overflowX: "hidden" }}
      >
        {session.messages?.length > 0 ? (
          session.messages.map((message) => {
            const isAdmin = message.sender.id !== userId;

            return (
              <div
                key={message.id}
                className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}
              >
                <div className="max-w-[80%]">
                  <MessageBubble message={message} userId={userId} />
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-400 text-center py-6">
            پیامی وجود ندارد.
          </p>
        )}
        {/* این div برای اسکرول کردن به آخر پیام‌ها */}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-1 bg-gray-50 rounded-b-xl">
        <MessageInput
          disabled={session.status === "closed"}
          onSendMessage={onSendMessage}
        />
      </div>
    </div>
  );
}

export default TicketConversation;
