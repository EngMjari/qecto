import React, { useState, useRef, useEffect } from "react";
import AccordionSection from "./AccordionSection";
import TicketConversation from "./TicketConversation";
import TicketForm from "./TicketForm";
import FileItem from "./FileItem";
import { FaFolderOpen, FaComments, FaLock } from "react-icons/fa";
import {
  getTicketSessions,
  createTicketMessage,
  uploadMessageFiles,
} from "../../api/ticketsApi";

function TabsManager({
  userFiles,
  adminFiles,
  sessions,
  setSessions,
  requestId,
  requestType,
  handlePreview,
  className = "",
  ticketFiles,
  setTicketFiles,
}) {
  const [activeTab, setActiveTab] = useState("files");
  const [refresh, setRefresh] = useState(false);
  const [openTicketId, setOpenTicketId] = useState(null);
  const [openAcc, setOpenAcc] = useState({
    user: false,
    ticket: false,
    admin: adminFiles.length > 0,
  });
  const ticketRefs = useRef([]);

  // اینجا ریفرنس‌ها را بر اساس تعداد تیکت‌ها تنظیم می‌کنیم
  useEffect(() => {
    ticketRefs.current = sessions.map(
      (_, i) => ticketRefs.current[i] || React.createRef()
    );
  }, [sessions]);
  useEffect(() => {
    if (!sessions || sessions.length === 0) return;
    const allFiles = [];
    sessions.forEach((session) => {
      session.tickets.forEach((ticket) => {
        if (Array.isArray(ticket.files)) {
          allFiles.push(...ticket.files);
        }
      });
    });

    setTicketFiles(allFiles);
  }, [sessions, setTicketFiles]);

  const hasOpenTicket = sessions.some((t) => t.status === "open");

  const handleTicketCreated = () => {
    setRefresh((prev) => !prev);
    setOpenTicketId(null);
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg transition-shadow hover:shadow-2xl ${className}`}
    >
      <div className="p-3 border-b flex  ">
        <button
          onClick={() => setActiveTab("files")}
          className={`px-4 py-2 rounded-lg font-semibold flex items-center ${
            activeTab === "files"
              ? "bg-blue-100 text-blue-600"
              : "text-gray-600"
          }`}
        >
          <FaFolderOpen className="w-5 h-5 ml-2" /> فایل‌ها
        </button>
        <button
          onClick={() => setActiveTab("tickets")}
          className={`px-4 py-2 rounded-lg font-semibold flex items-center ${
            activeTab === "tickets"
              ? "bg-blue-100 text-blue-600"
              : "text-gray-600"
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
                  setOpenAcc((prev) => ({
                    ...prev,
                    ticket: !prev.ticket,
                  }))
                }
              >
                {ticketFiles.length === 0 ? (
                  <p className="text-xs text-gray-400">فایلی وجود ندارد.</p>
                ) : (
                  <div className="space-y-1">
                    {ticketFiles.map((file) => (
                      <FileItem
                        key={file.id}
                        file={file}
                        onPreview={handlePreview}
                      />
                    ))}
                  </div>
                )}
              </AccordionSection>
            )}
          </div>
        )}
        {activeTab === "tickets" && (
          <div className="p-3 space-y-3">
            {/* اگر هیچ سشن باز نیست، فرم نمایش داده شود */}
            {!hasOpenTicket && (
              <TicketForm
                requestId={requestId}
                requestType={requestType}
                onTicketCreated={handleTicketCreated}
              />
            )}

            {/* لیست تیکت‌ها همیشه نمایش داده شود اگر وجود دارد */}
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
                      title={<span>{session.title}</span>}
                      lock={(session.status === "closed" && true) || false}
                      open={openTicketId === session.id}
                      onToggle={() => {
                        const willOpen = openTicketId !== session.id;
                        setOpenTicketId(willOpen ? session.id : null);
                        setTimeout(() => {
                          if (willOpen && ticketRefs.current[idx]?.current) {
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
                      }}
                    >
                      <TicketConversation
                        session={session}
                        onBack={() => {}}
                        onSendMessage={async (msg, files) => {
                          try {
                            const msgRes = await createTicketMessage(
                              session.id,
                              {
                                content: msg,
                              }
                            );
                            if (files && files.length > 0) {
                              await uploadMessageFiles(msgRes.data.id, files);
                            }
                            const updatedSessions = await getTicketSessions();
                            const data = Array.isArray(
                              updatedSessions.data.results
                            )
                              ? updatedSessions.data.results
                              : [];
                            setSessions(data);
                            setRefresh((r) => !r);
                          } catch (err) {
                            alert("خطا در ارسال پیام");
                          }
                        }}
                      />
                    </AccordionSection>
                  ))}
                </ul>
              </div>
            )}
            {/* اگر هیچ تیکتی وجود ندارد و فرم هم نمایش داده نمی‌شود */}
            {sessions.length === 0 && hasOpenTicket && (
              <p className="text-xs text-gray-400">گفتگویی وجود ندارد.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TabsManager;
