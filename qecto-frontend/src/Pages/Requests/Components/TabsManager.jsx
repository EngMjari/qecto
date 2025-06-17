import React, { useState, useRef, useEffect, useContext } from "react";
import { AuthContext } from "../../../Contexts/AuthContext";
import AccordionSection from "./AccordionSection";
import TicketConversation from "./TicketConversation";
import TicketForm from "./TicketForm";
import FileItem from "./FileItem";
import TicketModal from "./TicketModal";
import { FaFolderOpen, FaComments } from "react-icons/fa";
import { getTicketSessionsByRequest, sendTicketMessage } from "../../../api";

function TabsManager({
  userFiles,
  adminFiles,
  requestId,
  requestType,
  handlePreview,
  className = "",
  ticketFiles,
  setTicketFiles,
}) {
  const { userProfile } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("files");
  const [sessions, setSessions] = useState([]);
  const [openTicketId, setOpenTicketId] = useState(null);
  const [modalSession, setModalSession] = useState(null);
  const [openAcc, setOpenAcc] = useState({
    user: false,
    ticket: false,
    admin: adminFiles.length > 0,
  });
  const [scrollTrigger, setScrollTrigger] = useState(0);
  const ticketRefs = useRef([]);
  const isMobile = window.innerWidth < 768;

  // بارگذاری اولیه سیشن‌ها
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const response = await getTicketSessionsByRequest(
          requestId,
          requestType
        );
        setSessions(response.results || []);
        console.log("Session : ", response.results);
      } catch (error) {
        console.error("خطا در بارگذاری سشن‌ها:", error);
      }
    };
    loadSessions();
  }, [requestId, requestType]);

  // تنظیم ریفرنس‌ها برای سیشن‌ها
  useEffect(() => {
    ticketRefs.current = sessions.map(
      (_, i) => ticketRefs.current[i] || React.createRef()
    );
  }, [sessions]);

  // به‌روزرسانی فایل‌های تیکت با اطلاعات فرستنده
  useEffect(() => {
    const allFiles = [];
    sessions.forEach((session) => {
      session.messages?.forEach((message) => {
        if (Array.isArray(message.attachments)) {
          allFiles.push(
            ...message.attachments.map((file) => ({
              ...file,
              message: { sender: message.sender, session: session.title },
            }))
          );
        }
      });
    });
    setTicketFiles(allFiles);
    console.log("AllFiles : ", allFiles);
  }, [sessions, setTicketFiles]);

  const hasOpenTicket = sessions.some((t) => t.status === "open");

  const handleTicketCreated = async () => {
    try {
      const response = await getTicketSessionsByRequest(requestId, requestType);
      setSessions(response.results || []);
      setOpenTicketId(null);
      setModalSession(null);
    } catch (error) {
      console.error("خطا در به‌روزرسانی سشن‌ها:", error);
    }
  };

  // رندر عنوان آکاردئون
  const renderSessionTitle = (session) => {
    return <span>{session.title}</span>;
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg transition-shadow hover:shadow-2xl ${className}`}
    >
      <div className="p-3 border-b flex">
        <button
          onClick={() => setActiveTab("files")}
          className={`px-4 py-2 rounded-lg font-semibold flex items-center transition-colors ${
            activeTab === "files"
              ? "bg-blue-100 text-blue-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <FaFolderOpen className="w-5 h-5 ml-2" /> فایل‌ها
        </button>
        <button
          onClick={() => setActiveTab("tickets")}
          className={`px-4 py-2 rounded-lg font-semibold flex items-center transition-colors ${
            activeTab === "tickets"
              ? "bg-blue-100 text-blue-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <FaComments className="w-5 h-5 ml-2" /> گفتگوها
        </button>
      </div>
      <div className="p-2">
        {activeTab === "files" && (
          <div className="p-3 space-y-3">
            {adminFiles.length > 0 && (
              <AccordionSection
                title="فایل‌های دریافتی از کارشناس"
                open={openAcc.admin}
                onToggle={() =>
                  setOpenAcc((prev) => ({ ...prev, admin: !prev.admin }))
                }
              >
                {adminFiles.length === 0 ? (
                  <p className="text-xs text-gray-400">
                    فایلی از کارشناس دریافت نشده است.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {adminFiles.map((file) => (
                      <FileItem
                        key={file.id}
                        file={file}
                        onPreview={handlePreview}
                        senderLabel="کارشناس"
                      />
                    ))}
                  </div>
                )}
              </AccordionSection>
            )}
            {userFiles.length > 0 && (
              <AccordionSection
                title="فایل‌های درخواست اولیه"
                open={openAcc.user}
                onToggle={() =>
                  setOpenAcc((prev) => ({ ...prev, user: !prev.user }))
                }
              >
                {userFiles.length === 0 ? (
                  <p className="text-xs text-gray-400">فایلی ارسال نشده است.</p>
                ) : (
                  <div className="space-y-1">
                    {userFiles.map((file) => (
                      <FileItem
                        key={file.id}
                        file={file}
                        onPreview={handlePreview}
                        senderLabel="کاربر"
                      />
                    ))}
                  </div>
                )}
              </AccordionSection>
            )}
            {ticketFiles.length > 0 && (
              <AccordionSection
                title="فایل‌های تیکت‌ها"
                open={openAcc.ticket}
                onToggle={() =>
                  setOpenAcc((prev) => ({ ...prev, ticket: !prev.ticket }))
                }
              >
                {ticketFiles.length === 0 ? (
                  <p className="text-xs text-gray-400">فایلی وجود ندارد.</p>
                ) : (
                  <div className="space-y-1">
                    {ticketFiles.map((file) => {
                      const sender = file.message?.sender;
                      const senderLabel =
                        sender.id !== userProfile?.id
                          ? `ادمین: ${sender.full_name || sender.phone_number}`
                          : `کاربر: ${sender.full_name || sender.phone}`;
                      return (
                        <FileItem
                          key={file.id}
                          file={file}
                          onPreview={handlePreview}
                          senderLabel={senderLabel}
                          session={file.message.session}
                        />
                      );
                    })}
                  </div>
                )}
              </AccordionSection>
            )}
          </div>
        )}
        {activeTab === "tickets" && (
          <div className="p-3 space-y-3">
            {!hasOpenTicket && (
              <TicketForm
                requestId={requestId}
                requestType={requestType}
                onTicketCreated={handleTicketCreated}
              />
            )}
            {sessions.length > 0 && (
              <div className="mt-6">
                <h4 className="font-bold mb-2 text-sm text-gray-700">
                  لیست تیکت‌های این درخواست:
                </h4>
                <ul className="px-0 space-y-2">
                  {sessions.map((session, idx) => (
                    <AccordionSection
                      ref={ticketRefs.current[idx]}
                      key={session.id}
                      title={renderSessionTitle(session)}
                      lock={session.status === "closed"}
                      lastMessageSender={
                        session.messages && session.messages.length > 0
                          ? session.messages[session.messages.length - 1].sender
                          : null
                      }
                      userId={userProfile?.id}
                      owenerId={session?.related_request.owner.id}
                      open={isMobile ? false : openTicketId === session.id}
                      onToggle={() => {
                        if (isMobile) {
                          setModalSession(session);
                        } else {
                          const willOpen = openTicketId !== session.id;
                          setOpenTicketId(willOpen ? session.id : null);

                          if (willOpen) {
                            // مقدار scrollTrigger را تغییر بده تا TicketConversation اسکرول کند
                            setScrollTrigger((prev) => prev + 1);

                            setTimeout(() => {
                              if (ticketRefs.current[idx]?.current) {
                                ticketRefs.current[idx].current.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                                if (window.innerWidth >= 1024) {
                                  window.scrollBy({
                                    top: -70,
                                    behavior: "smooth",
                                  });
                                }
                              }
                            }, 100);
                          }
                        }
                      }}
                    >
                      {!isMobile && (
                        <TicketConversation
                          session={session}
                          userId={userProfile?.id}
                          owenerId={session?.related_request.owner.id}
                          onSendMessage={async (msg, files) => {
                            try {
                              await sendTicketMessage(session.id, {
                                message: msg,
                                attachments: files, // آرایه‌ای از { file, title }
                              });
                              const updatedSessions =
                                await getTicketSessionsByRequest(
                                  requestId,
                                  requestType
                                );
                              setSessions(updatedSessions.results || []);
                              setScrollTrigger((prev) => prev + 1);
                            } catch (error) {
                              console.error("خطا در ارسال پیام:", error);
                              throw error; // ارور رو به MessageInput برگردون
                            }
                          }}
                          onPreview={handlePreview}
                          scrollToBottomTrigger={scrollTrigger}
                        />
                      )}
                    </AccordionSection>
                  ))}
                </ul>
              </div>
            )}
            {sessions.length === 0 && (
              <p className="text-xs text-gray-400">گفتگویی وجود ندارد.</p>
            )}
          </div>
        )}
        {modalSession && (
          <TicketModal
            session={modalSession}
            onClose={() => setModalSession(null)}
            onSendMessage={async (msg, files) => {
              try {
                await sendTicketMessage(modalSession.id, {
                  message: msg,
                  attachments: files, // آرایه‌ای از { file, title }
                });
                const updatedSessions = await getTicketSessionsByRequest(
                  requestId,
                  requestType
                );
                setSessions(updatedSessions.results || []);
              } catch (error) {
                console.error("خطا در ارسال پیام:", error);
                throw error; // ارور رو به MessageInput برگردون
              }
            }}
            onPreview={handlePreview}
          />
        )}
      </div>
    </div>
  );
}

export default TabsManager;
