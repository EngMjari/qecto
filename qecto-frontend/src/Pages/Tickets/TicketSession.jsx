import React, { useEffect, useRef, useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchTicketSessions, sendTicketMessage } from "../../api";
import { AuthContext } from "../../Contexts/AuthContext";
import MessageBubble from "../Requests/Components/MessageBubble";
import MessageInput from "../Requests/Components/MessageInput";
import TicketModal from "../Requests/Components/TicketModal";
import { FaSync } from "react-icons/fa";

function TicketSession() {
  const { sessionId } = useParams();
  const { userProfile } = useContext(AuthContext);
  const [ticketInfo, setTicketInfo] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchTicketInfo();
  }, [sessionId]);

  const fetchTicketInfo = async () => {
    try {
      const response = await fetchTicketSessions({ id: sessionId });
      const session = response.results?.[0];
      if (!session) {
        throw { status: 404, error: "سشن یافت نشد" };
      }
      setTicketInfo(session);
    } catch (error) {
      console.error("خطا در دریافت اطلاعات تیکت:", error);
      if (error.status === 404 || error.response?.status === 404) {
        navigate("/404");
      }
    }
  };

  useEffect(() => {
    if (messagesContainerRef.current && messagesEndRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [ticketInfo?.messages]);

  const handleRefresh = () => {
    fetchTicketInfo();
  };

  const ticketStatusText = () => {
    if (!ticketInfo?.messages || ticketInfo.messages.length === 0)
      return "در انتظار پاسخ";
    const lastMsg = ticketInfo.messages[ticketInfo.messages.length - 1];
    return lastMsg.sender.id === userProfile?.id
      ? "در انتظار پاسخ"
      : "پاسخ داده شده";
  };

  const ticketStatusColor = () => {
    if (!ticketInfo?.messages || ticketInfo.messages.length === 0)
      return "bg-yellow-500";
    const lastMsg = ticketInfo.messages[ticketInfo.messages.length - 1];
    return lastMsg.sender.id === userProfile?.id
      ? "bg-yellow-500"
      : "bg-green-500";
  };

  const ticketSubject = ticketInfo?.title || "در حال بارگذاری...";
  const ticketCreatedAt = ticketInfo?.created_at
    ? new Date(ticketInfo.created_at).toLocaleString("fa-IR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "-";

  if (isMobile) {
    return (
      <TicketModal
        session={ticketInfo || { messages: [], title: "در حال بارگذاری..." }}
        onClose={() => navigate("/dashboard")}
        onSendMessage={async (msg, files) => {
          try {
            await sendTicketMessage(sessionId, {
              message: msg,
              attachments: files,
            });
            await fetchTicketInfo();
          } catch (error) {
            console.error("خطا در ارسال پیام:", error);
            throw error;
          }
        }}
        onPreview={() => {}}
      />
    );
  }

  return (
    <div
      className="page-content flex flex-col min-h-screen bg-gray-100"
      dir="rtl"
    >
      <header className="bg-white p-1 shadow-md sticky top-0 z-20">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-orange-600 truncate">
              موضوع: {ticketSubject}
            </h2>
            <button
              onClick={handleRefresh}
              className="rounded-full hover:bg-gray-200 text-gray-600 transition-colors duration-150"
              title="رفرش پیام‌ها"
            >
              <FaSync className="w-5 h-5" />
            </button>
          </div>
          <span
            className={`px-3 py-1 text-sm font-semibold text-white rounded-full ${ticketStatusColor()}`}
          >
            {ticketStatusText()}
          </span>
        </div>
        <div className="container mx-auto max-w-4xl text-sm text-gray-500">
          <p>نوع درخواست: {ticketInfo?.session_type_display || "نامشخص"}</p>
          <p>ایجاد: {ticketCreatedAt}</p>
        </div>
      </header>

      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto max-w-4xl h-full">
          <div className="flex flex-col h-full bg-white rounded-xl shadow-inner">
            <div
              ref={messagesContainerRef}
              className="flex-grow p-6 overflow-y-auto w-full space-y-6 custom-scrollbar"
              style={{ height: "calc(100vh - 200px)", overflowX: "hidden" }}
            >
              {ticketInfo?.messages?.length > 0 ? (
                ticketInfo.messages.map((message) => {
                  const isAdmin = message.sender.id !== userProfile?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        isAdmin ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div className="max-w-[70%]">
                        <MessageBubble
                          message={message}
                          userId={userProfile?.id}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-base text-gray-400 text-center py-8">
                  پیامی وجود ندارد.
                </p>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-2 bg-gray-50 rounded-b-xl">
              <MessageInput
                disabled={ticketInfo?.status === "closed"}
                onSendMessage={async (msg, files) => {
                  try {
                    await sendTicketMessage(sessionId, {
                      message: msg,
                      attachments: files,
                    });
                    await fetchTicketInfo();
                  } catch (error) {
                    console.error("خطا در ارسال پیام:", error);
                    throw error;
                  }
                }}
              />
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c7c7c7;
          border-radius: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a3a3a3;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #c7c7c7 #f1f1f1;
        }
      `}</style>
    </div>
  );
}

export default TicketSession;
