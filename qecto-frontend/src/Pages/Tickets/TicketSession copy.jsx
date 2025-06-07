import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getTicketMessages, createTicketMessage, getTicketSessionById, uploadMessageFiles } from "../../api/ticketsApi";

function TicketSession() {
  const { sessionId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [ticketInfo, setTicketInfo] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]); // آرایه فایل‌ها
  const [isModalOpen, setIsModalOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchTicketInfo();
    fetchMessages();
    startPolling();

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [sessionId]);

  const startPolling = () => {
    pollingIntervalRef.current = setInterval(() => {
      fetchMessages();
    }, 5000);
  };

  const fetchTicketInfo = async () => {
    try {
      const response = await getTicketSessionById(sessionId);
      setTicketInfo(response.data);
    } catch (error) {
      console.error("خطا در دریافت اطلاعات تیکت:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await getTicketMessages(sessionId, { page_size: 1000 });
      let messagesData = response.data.results;
      if (!Array.isArray(messagesData)) messagesData = [];
      else messagesData = messagesData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      setMessages(messagesData);
      console.log(messagesData);
      scrollToBottom();
    } catch (error) {
      console.error("خطا در دریافت پیام‌ها:", error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  // وقتی کاربر فایل انتخاب می‌کنه
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // فایل‌های جدید رو به آرایه فایل‌ها اضافه می‌کنیم (می‌تونیم جلوگیری از تکراری بودن هم اضافه کنیم)
    setSelectedFiles((prevFiles) => {
      // جلوگیری از اضافه شدن فایل‌های تکراری (بر اساس نام و اندازه)
      const newFiles = files.filter((f) => !prevFiles.some((pf) => pf.name === f.name && pf.size === f.size));
      return [...prevFiles, ...newFiles];
    });

    // مودال نمایش فایل‌ها رو باز می‌کنیم
    setIsModalOpen(true);

    // مقدار input رو ریست می‌کنیم تا اجازه انتخاب مجدد هم بده
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // حذف یک فایل از لیست فایل‌های انتخاب شده
  const removeFile = (index) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // بستن مودال
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // ارسال پیام به همراه فایل‌ها
  const handleSendMessage = async () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    try {
      // ابتدا پیام متنی (اگر هست) ارسال شود
      let newMsg = null;
      if (newMessage.trim()) {
        const response = await createTicketMessage(sessionId, { content: newMessage.trim() });
        newMsg = response.data;
      }

      // اگر فقط فایل داریم یا فایل هم داریم، پیام جدید با متن خالی ایجاد کنیم تا فایل‌ها آپلود شود
      let messageId = newMsg?.id;
      if (selectedFiles.length > 0 && !messageId) {
        const response = await createTicketMessage(sessionId, { content: "" });
        messageId = response.data.id;
      }

      // آپلود تمام فایل‌ها به پیام
      if (messageId) {
        for (const file of selectedFiles) {
          await uploadMessageFiles(messageId, [file]);
          // دقت کنید API شما اگر بتواند چند فایل همزمان آپلود کند، بهتر است
        }
      }

      // پاکسازی فرم
      setNewMessage("");
      setSelectedFiles([]);
      setIsModalOpen(false);

      // رفرش پیام‌ها
      await fetchMessages();
    } catch (error) {
      console.error("خطا در ارسال پیام:", error.response?.data || error.message || error);
    }
  };

  const ticketStatus = () => {
    if (messages.length === 0) return "در انتظار پاسخ";
    const lastMsg = messages[messages.length - 1];
    return lastMsg.sender_user ? "در انتظار پاسخ" : "پاسخ داده شد";
  };

  const ticketSubject = ticketInfo?.subject || "بدون موضوع";
  const ticketCreatedAt = ticketInfo?.created_at ? new Date(ticketInfo.created_at).toLocaleString("fa-IR") : "-";

  return (
    <div style={{ maxWidth: "700px", margin: "auto", padding: "1rem", fontFamily: "Tahoma, Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1rem", color: "#ff5700" }}>تیکت شماره: {sessionId}</h2>

      <div
        style={{
          marginBottom: "1rem",
          padding: "1rem",
          backgroundColor: "#f9f9f9",
          borderRadius: 8,
          boxShadow: "0 0 10px rgba(0,0,0,0.05)",
        }}
      >
        <p>
          <strong>موضوع تیکت:</strong> {ticketSubject}
        </p>
        <p>
          <strong>تاریخ ایجاد:</strong> {ticketCreatedAt}
        </p>
        <p>
          <strong>وضعیت:</strong> {ticketStatus()}
        </p>
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          height: "400px",
          overflowY: "auto",
          padding: "1rem",
          marginBottom: "1rem",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 0 8px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.length === 0 && <p style={{ textAlign: "center", color: "#888", marginTop: "2rem" }}>هیچ پیامی وجود ندارد.</p>}
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              marginBottom: "10px",
              display: "flex",
              justifyContent: msg.sender_user ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "70%",
                backgroundColor: msg.sender_user ? "#ff5700" : "#ddd",
                color: msg.sender_user ? "white" : "#333",
                padding: "10px 15px",
                borderRadius: msg.sender_user ? "15px 15px 0 15px" : "15px 15px 15px 0",
                wordBreak: "break-word",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                fontSize: "0.95rem",
                lineHeight: "1.4",
              }}
            >
              {msg.content}

              {/* نمایش فایل‌ها */}
              {msg.files && msg.files.length > 0 && (
                <div style={{ marginTop: "8px" }}>
                  {msg.files.map((file) => (
                    <a
                      key={file.id}
                      href={file.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "inline-block", marginRight: 10, color: "#004aad", textDecoration: "underline", fontSize: "0.85rem" }}
                    >
                      📎 {file.title}
                    </a>
                  ))}
                </div>
              )}

              <div
                style={{
                  fontSize: "0.7rem",
                  marginTop: "5px",
                  opacity: 0.6,
                  textAlign: "right",
                  fontFamily: "Vazir, Tahoma, Arial, sans-serif",
                }}
              >
                {new Date(msg.created_at).toLocaleString("fa-IR")}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ورودی فایل */}
      <input
        type="file"
        multiple
        id="fileUpload"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.zip"
      />

      {/*
نمایش فایل‌ها در مودال */}
      {isModalOpen && selectedFiles.length > 0 && (
        <div style={{ backgroundColor: "rgba(0,0,0,0.6)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
          <div
            style={{
              backgroundColor: "white",
              maxWidth: "500px",
              margin: "10vh auto",
              padding: "1.5rem",
              borderRadius: "10px",
              boxShadow: "0 0 10px rgba(0,0,0,0.25)",
            }}
          >
            <h4 style={{ marginBottom: "1rem" }}>فایل‌های انتخاب‌شده</h4>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {selectedFiles.map((file, index) => (
                <li key={index} style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "space-between" }}>
                  <span>{file.name}</span>
                  <button onClick={() => removeFile(index)} style={{ color: "red", border: "none", background: "none" }}>
                    ✖
                  </button>
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
              <button onClick={closeModal}>بستن</button>
              <button
                onClick={handleSendMessage}
                style={{ backgroundColor: "#ff5700", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "5px" }}
              >
                ارسال پیام
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <textarea
          placeholder="پیام خود را بنویسید..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc", minHeight: "60px" }}
        />

        <button onClick={() => document.getElementById("fileUpload").click()} style={{ fontSize: "20px", background: "none", border: "none" }}>
          📎
        </button>

        <button
          onClick={handleSendMessage}
          style={{ backgroundColor: "#ff5700", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "5px" }}
        >
          ارسال
        </button>
      </div>
    </div>
  );
}

export default TicketSession;
