import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTicketMessages,
  createTicketMessage,
  getTicketSessionById,
  uploadMessageFiles,
} from "../../api";
import { ImAttachment } from "react-icons/im";
import "./TicketSession.css";
import { CiFileOn, CiCirclePlus } from "react-icons/ci";

const isImageFile = (fileName) => {
  if (!fileName || typeof fileName !== "string") return false;
  return /(jpe?g|png|gif|webp|bmp|svg)$/i.test(fileName);
};
function forceDownload(fileUrl, fileName) {
  fetch(fileUrl, {
    method: "GET",
    headers: {
      // اگر نیاز به احراز هویت یا هدر خاص داری اینجا بذار
    },
  })
    .then((res) => res.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    })
    .catch((err) => console.error("Download failed:", err));
}

// Icon for non-image files in the modal
const FileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-gray-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  </svg>
);

function TicketSession() {
  const { sessionId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [ticketInfo, setTicketInfo] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]); // Array of File objects
  const [isModalOpen, setIsModalOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();
  const [previewUrls, setPreviewUrls] = useState({});

  useEffect(() => {
    fetchTicketInfo();
    fetchMessages();
    startPolling();

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      // Revoke any active object URLs when component unmounts
      Object.values(previewUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [sessionId]);

  const startPolling = () => {
    pollingIntervalRef.current = setInterval(() => {
      fetchMessages(true);
    }, 7000); // Increased polling interval slightly
  };

  const fetchTicketInfo = async () => {
    try {
      const response = await getTicketSessionById(sessionId);
      setTicketInfo(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("خطا در دریافت اطلاعات تیکت:", error);
      if (error.response && error.response.status === 404) {
        navigate("/404");
      }
    }
  };

  const fetchMessages = async (isPoll = false) => {
    try {
      const response = await getTicketMessages(sessionId, { page_size: 1000 });
      let messagesData = response.data.results;
      if (!Array.isArray(messagesData)) messagesData = [];
      else
        messagesData = messagesData.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );

      setMessages((prevMessages) => {
        if (JSON.stringify(prevMessages) !== JSON.stringify(messagesData)) {
          if (
            !isPoll ||
            messagesData.length > prevMessages.length ||
            messagesData.some(
              (msg, idx) =>
                JSON.stringify(msg) !== JSON.stringify(prevMessages[idx])
            )
          ) {
          }
          return messagesData;
        }
        return prevMessages;
      });
    } catch (error) {
      console.error("خطا در دریافت پیام‌ها:", error);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newPreviewUrls = { ...previewUrls };

    setSelectedFiles((prevFiles) => {
      const newFiles = files.filter(
        (f) => !prevFiles.some((pf) => pf.name === f.name && pf.size === f.size)
      );
      newFiles.forEach((file) => {
        if (isImageFile(file.file_extension)) {
          newPreviewUrls[file.name] = URL.createObjectURL(file);
        }
      });
      setPreviewUrls(newPreviewUrls);
      return [...prevFiles, ...newFiles];
    });

    setIsModalOpen(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (indexToRemove) => {
    const fileToRemove = selectedFiles[indexToRemove];
    if (fileToRemove && previewUrls[fileToRemove.name]) {
      URL.revokeObjectURL(previewUrls[fileToRemove.name]);
      setPreviewUrls((prev) => {
        const newPreviews = { ...prev };
        delete newPreviews[fileToRemove.name];
        return newPreviews;
      });
    }
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((_, i) => i !== indexToRemove)
    );
  };

  const closeModalAndClearFiles = () => {
    setIsModalOpen(false);
    Object.values(previewUrls).forEach((url) => URL.revokeObjectURL(url)); // Revoke all on close
    setPreviewUrls({});
    setSelectedFiles([]);
  };

  const closeModalAddFile = (e) => {
    if (isModalOpen) {
      setIsModalOpen(false);
    }

    const newFiles = Array.from(e.target.files);
    const updatedFiles = [
      ...selectedFiles,
      ...newFiles.map((file) => ({
        file,
        name: file.name,
        size: file.size,
        file_extension: file.name.split(".").pop().toLowerCase(),
      })),
    ];
    setSelectedFiles(updatedFiles);

    // update preview URLs
    const newPreviewUrls = {};
    newFiles.forEach((file) => {
      if (isImageFile(file.name)) {
        newPreviewUrls[file.name] = URL.createObjectURL(file);
      }
    });
    setPreviewUrls((prev) => ({ ...prev, ...newPreviewUrls }));
  };

  const confirmSendFromModal = async () => {
    await handleSendMessage(true);
  };

  const handleSendMessage = async (isSendingFromModal = false) => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    // If main send button is pressed, files are selected, and modal isn't open, open modal first.
    if (!isSendingFromModal && selectedFiles.length > 0 && !isModalOpen) {
      setIsModalOpen(true);
      return;
    }

    setIsSending(true);

    try {
      let newMsgData = null;
      let messageIdToUploadTo = null;

      if (newMessage.trim()) {
        const response = await createTicketMessage(sessionId, {
          content: newMessage.trim(),
        });
        newMsgData = response.data;
        messageIdToUploadTo = newMsgData.id;
      }

      if (selectedFiles.length > 0) {
        if (!messageIdToUploadTo) {
          // Sending only files, create a message (possibly empty or with a placeholder)
          const response = await createTicketMessage(sessionId, {
            content: newMessage.trim() || "",
          });
          newMsgData = response.data;
          messageIdToUploadTo = newMsgData.id;
        }

        // Create a FormData object to send files
        // This part depends heavily on how your 'uploadMessageFiles' API is structured
        // Assuming it takes one file at a time for simplicity, matching existing logic.
        // If your API can take multiple files, adjust accordingly.
        for (const file of selectedFiles) {
          await uploadMessageFiles(messageIdToUploadTo, [file]); // Your API function
        }
      }

      setNewMessage("");
      Object.values(previewUrls).forEach((url) => URL.revokeObjectURL(url));
      setPreviewUrls({});
      setSelectedFiles([]);
      setIsModalOpen(false);
      await fetchMessages();
    } catch (error) {
      // Fixed the syntax error here: removed underscore
      console.error(
        "خطا در ارسال پیام:",
        error.response?.data || error.message || error
      );
    } finally {
      setIsSending(false);
    }
  };

  const ticketStatusText = () => {
    if (!messages || messages.length === 0) return "در انتظار پاسخ";
    const lastMsg = messages[messages.length - 1];
    return lastMsg.sender_user ? "در انتظار پاسخ" : "پاسخ داده شد";
  };

  const ticketStatusColor = () => {
    if (!messages || messages.length === 0) return "bg-yellow-500";
    const lastMsg = messages[messages.length - 1];
    return lastMsg.sender_user ? "bg-blue-500" : "bg-green-500";
  };

  const ticketSubject = ticketInfo?.title || "در حال بارگذاری...";
  const requestTitle =
    ticketInfo?.session_type === "survey"
      ? `نقشه بردای - ${ticketInfo.survey_request?.project.title}`
      : ticketInfo?.session_type === "expert"
      ? `کارشناسی - ${ticketInfo.evaluation_request?.project.title}`
      : ticketInfo?.session_type === "general"
      ? `عمومی `
      : "در حال بارگذاری...";
  const ticketCreatedAt = ticketInfo?.created_at
    ? new Date(ticketInfo.created_at).toLocaleString("fa-IR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "-";

  return (
    <div className="flex flex-col h-screen bg-gray-100" dir="rtl">
      <header className="bg-white p-3 shadow-md sticky top-0 z-20">
        <div className="container mx-auto max-w-3xl">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-orange-600">
              موضوع تیکت: {ticketSubject}
            </h2>
            <span
              className={`px-3 py-1 text-xs font-semibold text-white rounded-full ${ticketStatusColor()}`}
            >
              {ticketStatusText()}
            </span>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            <p>
              <strong>موضوع درخواست :</strong> {requestTitle}
            </p>
            <p>
              <strong>تاریخ ایجاد:</strong> {ticketCreatedAt}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
        <div className="container mx-auto max-w-3xl">
          {messages.length === 0 && (
            <p className="text-center text-gray-500 py-10">
              هیچ پیامی وجود ندارد. اولین پیام را شما ارسال کنید!
            </p>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex my-1 ${
                msg.sender_user ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] md:max-w-[70%] p-3 shadow-md ${
                  // General styling
                  msg.sender_user
                    ? "bg-orange-500 text-white rounded-xl rounded-br-none" // User's message: orange, tail bottom-right
                    : "bg-gray-200 text-gray-700 rounded-xl rounded-bl-none" // Support's message: gray, tail bottom-left
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {msg.content}
                </p>

                {msg.files && msg.files.length > 0 && (
                  <div
                    className={`mt-2 pt-2 space-y-2 ${
                      msg.sender_user
                        ? "border-t border-orange-400/60"
                        : "border-t border-gray-300/70"
                    }`}
                  >
                    {msg.files.map((file, index) => (
                      <div key={file.id || index}>
                        {isImageFile(file.file_extension) ? (
                          <button
                            className="block group"
                            onClick={() =>
                              forceDownload(
                                file.file,
                                file.custom_name || "file"
                              )
                            }
                          >
                            <img
                              src={file.file}
                              alt={file.title || "پیوست عکس"}
                              className="max-w-[200px] md:max-w-[280px] max-h-72 rounded-lg object-cover border border-gray-300 group-hover:opacity-90 transition-opacity"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://placehold.co/200x150/CCCCCC/FFFFFF?text=Preview+Error&font=arial";
                              }}
                            />
                          </button>
                        ) : (
                          <button
                            className={`inline-flex items-center text-decoration-none gap-2 text-xs px-3 py-1.5 rounded-md transition-colors ${
                              msg.sender_user
                                ? "bg-orange-400 hover:bg-orange-300 text-white"
                                : "bg-gray-300 hover:bg-gray-400 text-gray-700" // Adjusted support file button
                            }`}
                            onClick={() =>
                              forceDownload(
                                file.file,
                                file.custom_name || "file"
                              )
                            }
                          >
                            <ImAttachment size={14} />
                            {"فایل پیوست"}
                            <div className="= small">
                              {file.readable_file_size || "بدون حجم"}
                            </div>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className={`text-xs mt-1.5 ${
                    msg.sender_user ? "text-orange-200" : "text-gray-500"
                  } text-left`}
                >
                  {new Date(msg.created_at).toLocaleString("fa-IR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <input
        type="file"
        multiple
        id="fileUpload"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt,.csv"
      />

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 mt-5 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-out"
          onClick={closeModalAndClearFiles}
        >
          <div
            className="bg-white p-3 rounded-xl shadow-2xl w-full My-modal max-w-lg transform transition-all duration-300 ease-out animate-modalshow"
            onClick={(e) => e.stopPropagation()}
            style={{
              animationName: "modalShowAnimation",
              animationDuration: "0.3s",
              animationFillMode: "forwards",
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-800">
                فایل‌های آماده برای ارسال
              </h4>
              <button
                onClick={closeModalAndClearFiles}
                className="text-red-500 hover:text-red-700 px-2 h3 rounded-full rounded-circle hover:scale-125 transition-all text-xl"
              >
                &times;
              </button>
            </div>

            {selectedFiles.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                هیچ فایلی انتخاب نشده است برای انتخاب فایل روی دکمه پایین کلیک
                کنید
              </p>
            ) : (
              <ul className="space-y-3 max-h-36 overflow-y-auto mb-1 pr-2 custom-scrollbar">
                {selectedFiles.map((file, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-700 flex items-center p-2 bg-gray-50 rounded-lg border border-gray-200 justify-between"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {isImageFile(file.file_extension) &&
                      previewUrls[file.file] ? (
                        <img
                          src={previewUrls[file.file]}
                          alt={file.custom_name}
                          className="w-12 h-12 object-cover rounded-md border"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center border">
                          <CiFileOn size={50} />
                        </div>
                      )}
                      <div className="truncate">
                        <p className="font-medium text-gray-800 m-0 py-1">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 m-0 py-1">
                          {(file.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors text-xl"
                      aria-label="حذف فایل"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="my-4">
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                پیام شما :
              </label>
              <textarea
                id="message"
                rows={4}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                placeholder="توضیحی درباره فایل‌ها یا درخواست خود وارد کنید..."
              />
            </div>
            {selectedFiles.length === 0 && (
              <button
                onClick={() => {
                  closeModalAndClearFiles();
                  fileInputRef.current?.click();
                }}
                className="w-full mt-2 px-4 py-2.5 text-sm rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors flex items-center justify-center gap-2"
              >
                <CiCirclePlus size={22} />
                انتخاب فایل‌ها
              </button>
            )}

            {selectedFiles.length > 0 && (
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-2">
                {/* :TODO fix button Size in mobile view */}
                <button
                  onClick={closeModalAndClearFiles}
                  className="px-5 py-2.5 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                  disabled={isSending}
                >
                  انصراف
                </button>
                <button
                  onClick={() =>
                    fileInputRef.current && fileInputRef.current.click()
                  }
                  className="px-5 py-2.5 text-sm rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors flex items-center min-w-[120px] justify-center"
                >
                  افزودن فایل
                </button>
                <button
                  onClick={confirmSendFromModal}
                  className="px-5 py-2.5 text-sm rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors flex items-center min-w-[120px] justify-center"
                  disabled={isSending || selectedFiles.length === 0}
                >
                  {isSending ? (
                    <>
                      <svg
                        className="animate-spin rtl:-mr-1 ltr:mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="rtl:mr-2 ltr:ml-2">در حال ارسال...</span>
                    </>
                  ) : (
                    "ارسال"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="bg-white p-3 shadow-top sticky bottom-0 border-t border-gray-200 z-10">
        <div className="container mx-auto max-w-3xl flex items-end gap-2">
          <textarea
            placeholder="پیام خود را بنویسید..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (
                  !isSending &&
                  (newMessage.trim() || selectedFiles.length > 0)
                )
                  handleSendMessage();
              }
            }}
            className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-sm min-h-[44px] max-h-[120px] custom-scrollbar"
            rows="1"
            disabled={isSending}
          />
          <button
            title="افزودن فایل"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="p-2.5 h-[44px] border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors disabled:opacity-50 flex items-center justify-center"
            disabled={isSending}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 16 16"
              className="transform rtl:rotate-90"
            >
              <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a1.5 1.5 0 0 1-3 0V4.5a.5.5 0 0 1 1 0v7.5a.5.5 0 0 0 1 0V4.5a.5.5 0 0 1 .5-.5z" />
            </svg>
          </button>
          <button
            onClick={() => handleSendMessage()}
            className="px-5 h-[44px] bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center disabled:opacity-50 min-w-[52px]"
            disabled={
              isSending || (!newMessage.trim() && selectedFiles.length === 0)
            }
          >
            {isSending ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                className="transform rtl:-rotate-45"
                viewBox="0 0 16 16"
              >
                <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-5.47Z" />
              </svg>
            )}
          </button>
        </div>
      </footer>
      <style jsx global>{`
        @keyframes modalShowAnimation {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modalshow {
          animation-name: modalShowAnimation;
          animation-duration: 0.2s; /* Faster animation */
          animation-timing-function: ease-out;
          animation-fill-mode: forwards;
        }
        /* Custom Scrollbar for webkit browsers */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c7c7c7;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a3a3a3;
        }
        /* For Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #c7c7c7 #f1f1f1;
        }
      `}</style>
    </div>
  );
}

export default TicketSession;
