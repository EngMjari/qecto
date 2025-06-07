import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTicketMessages,
  createTicketMessage,
  getTicketSessionById,
  uploadMessageFiles,
} from "../../api/ticketsApi";
import { IoIosAttach } from "react-icons/io";
import "./TicketSession.css";
import noPreviewImage from "./../../assets/images/NoPreview.png";
// Helper function to check if a file is an image by its name
const isImageFile = (fileName) => {
  if (!fileName || typeof fileName !== "string") return false;
  return /(jpe?g|png|gif|webp|bmp|svg)$/i.test(fileName);
};
function downloadClickedFile(event, filename) {
  event.preventDefault();

  let url = "";
  const target = event.currentTarget;

  if (target.tagName === "IMG") {
    url = target.src;
  } else if (target.tagName === "A") {
    url = target.href;
  } else {
    // اگر عنصر دیگه‌ای بود، مثلاً داده‌ای از data attribute
    url = target.getAttribute("data-file-url") || "";
  }

  if (!url) {
    alert("آدرس فایل یافت نشد!");
    return;
  }

  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
      console.log("Ticket title: ", response.data);
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
        if (isImageFile(file.name)) {
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
    return lastMsg.sender_user ? "در انتظار پاسخ شما" : "پاسخ داده شد";
  };

  const ticketStatusColor = () => {
    if (!messages || messages.length === 0) return "bg-yellow-500";
    const lastMsg = messages[messages.length - 1];
    return lastMsg.sender_user ? "bg-blue-500" : "bg-green-500";
  };

  const ticketSubject = ticketInfo?.title || "در حال بارگذاری...";
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
              موضوع تیکت : {ticketInfo.title}
              <div class="text-orange-600">این متن باید نارنجی تیره باشه</div>
            </h2>
            <span
              className={`px-3 py-1 text-xs font-semibold text-white rounded-full ${ticketStatusColor()}`}
            >
              {ticketStatusText()}
            </span>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            <p>
              <strong>موضوع:</strong> {ticketSubject}
            </p>
            <p>
              <strong>تاریخ ایجاد:</strong> {ticketCreatedAt}
            </p>
          </div>
        </div>
      </header>

      <main className="container px-lg-5 d-flex mainChatContainer">
        <div className="justify-content-between mx-auto vw-100">
          {messages.length === 0 && (
            <p className="text-center text-gray-500 py-10">
              هیچ پیامی وجود ندارد. اولین پیام را شما ارسال کنید!
            </p>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`d-flex  ${
                msg.sender_user
                  ? "justify-content-end"
                  : "justify-content-start"
              }`}
            >
              <div
                className={`p-3 my-1 shadow border border-1   ${
                  // General styling
                  msg.sender_user
                    ? "userChat" // User's message: orange, tail bottom-right
                    : `adminChat` // Support's message: gray, tail bottom-left
                }`}
              >
                <p
                  className={`h6 msgContainer${
                    msg.files && msg.files.length && msg.content
                      ? "border-bottom border-2"
                      : "ss"
                  }`}
                >
                  {msg.content}
                </p>
                {/* Files */}
                {msg.files && msg.files.length > 0 && (
                  <div
                    className={`mt-2 fileContainer rounded rounded-2 shadow ${
                      msg.sender_user
                        ? "FileUserContainer"
                        : "border-t FileAdminContainer"
                    }`}
                  >
                    {msg.files.map((file, index) => (
                      <div key={file.id || index}>
                        {isImageFile(file.file_extension) ? (
                          <img
                            src={file.file}
                            onClick={(e) =>
                              downloadClickedFile(
                                e,
                                `${file.title || "پیوست عکس"}.${
                                  file.file_extension
                                }`
                              )
                            }
                            alt={file.title || "پیوست عکس"}
                            className="imageChat"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = { noPreviewImage };
                            }}
                          />
                        ) : (
                          <a
                            href={file.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`fileAttachment rounded ${
                              msg.sender_user ? "text-white" : "text-dark" // Adjusted support file button
                            }`}
                          >
                            <IoIosAttach size={20} />
                            {file.title || "فایل پیوست"}
                          </a>
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
        className="d-none"
        onChange={handleFileChange}
        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt,.csv"
      />

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-out"
          onClick={closeModalAndClearFiles}
        >
          <div
            className="bg-white p-5 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-out scale-95 opacity-0 animate-modalshow"
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
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>

            {selectedFiles.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                هیچ فایلی انتخاب نشده است. برای انتخاب، روی دکمه گیره کاغذ کلیک
                کنید.
              </p>
            ) : (
              <ul className="space-y-3 max-h-64 overflow-y-auto mb-4 pr-2 custom-scrollbar">
                {selectedFiles.map((file, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-700 flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 justify-between"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {isImageFile(file.name) && previewUrls[file.name] ? (
                        <img
                          src={previewUrls[file.name]}
                          alt={file.name}
                          className="w-12 h-12 object-cover rounded-md border"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center border">
                          <FileIcon />
                        </div>
                      )}
                      <div className="truncate">
                        <p className="font-medium text-gray-800 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
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

            {selectedFiles.length === 0 && (
              <button
                onClick={() => {
                  closeModalAndClearFiles();
                  fileInputRef.current?.click();
                }}
                className="w-full mt-2 px-4 py-2.5 text-sm rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors flex items-center justify-center gap-2"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                انتخاب فایل‌ها
              </button>
            )}

            {selectedFiles.length > 0 && (
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-2">
                <button
                  onClick={closeModalAndClearFiles}
                  className="px-5 py-2.5 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                  disabled={isSending}
                >
                  انصراف
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
                    "ارسال پیام و فایل‌ها"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="bg-dark p-3 shadow-top fixed-bottom bottom-0 border-t border-gray-200 z-10">
        <div className=" input-group container mx-auto max-w-3xl flex items-end gap-2">
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
            className="form-control  flex-1 p-2.5 border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-sm min-h-[44px] max-h-[120px] custom-scrollbar"
            rows="1"
            disabled={isSending}
          />
          {/* <span
            title="افزودن فایل"
            
            className="text-danger p-2.5 rounded rounded-2  transition-colors disabled:opacity-50 items-center justify-center"
            
          > */}
          <IoIosAttach
            title="افزودن فایل"
            size={40}
            cursor={"pointer"}
            className="text-danger"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            disabled={isSending}
          />
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
