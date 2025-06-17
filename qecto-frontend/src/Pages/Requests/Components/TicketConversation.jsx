import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify"; // وارد کردن toast
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { closeTicketSession, reopenTicketSession } from "../../../api";

function TicketConversation({
  session,
  onSendMessage,
  userId,
  ownerId,
  onSessionStatusChange,
}) {
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAdmin = userId !== ownerId;

  useEffect(() => {
    if (messagesContainerRef.current && messagesEndRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [session.messages]);

  const handleCloseSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await closeTicketSession(session.id, {
        reason: "بسته شده توسط ادمین",
      });
      toast.success(response.message, { position: "top-right" });
      onSessionStatusChange(); // به‌روزرسانی UI
    } catch (err) {
      setError(err.error || "خطا در بستن سشن");
      toast.error(err.error || "خطا در بستن سشن", { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  const handleReopenSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reopenTicketSession(session.id);
      toast.success(response.message, { position: "top-right" });
      onSessionStatusChange(); // به‌روزرسانی UI
    } catch (err) {
      setError(err.error || "خطا در باز کردن سشن");
      toast.error(err.error || "خطا در باز کردن سشن", {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-b-xl shadow-inner">
      {isAdmin && (
        <div className="p-4 flex justify-end space-x-2">
          {session.status === "open" ? (
            <button
              onClick={handleCloseSession}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-white ${
                loading ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {loading ? "در حال پردازش..." : "بستن سشن"}
            </button>
          ) : (
            <button
              onClick={handleReopenSession}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-white ${
                loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {loading ? "در حال پردازش..." : "باز کردن سشن"}
            </button>
          )}
        </div>
      )}

      <div
        ref={messagesContainerRef}
        className="flex-grow p-4 overflow-y-auto w-full space-y-6"
        style={{ maxHeight: "60vh", minHeight: 200, overflowX: "hidden" }}
      >
        {session.messages?.length > 0 ? (
          session.messages.map((message) => {
            const isAdminMessage = message.sender.id !== ownerId;

            return (
              <div
                key={message.id}
                className={`flex ${
                  isAdminMessage ? "justify-start" : "justify-end"
                }`}
              >
                <div className="max-w-[80%]">
                  <MessageBubble
                    message={message}
                    ownerId={ownerId}
                    userId={userId}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-400 text-center py-6">
            پیامی وجود ندارد.
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-1 bg-gray-50 rounded-b-xl">
        <MessageInput
          disabled={session.status === "closed"}
          onSendMessage={onSendMessage}
        />
      </div>

      {error && <p className="text-red-500 text-sm text-center p-2">{error}</p>}
    </div>
  );
}

export default TicketConversation;
