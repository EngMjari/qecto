import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllData } from "../../api/projectsApi";
import { createTicketSession, createTicketMessage } from "../../api/ticketsApi";

function NewTicket() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [relatedRequestId, setRelatedRequestId] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadRequests() {
      try {
        const data = await fetchAllData();
        setRequests(data.data.requests || []);
        console.log(data.data);
      } catch (err) {
        console.error("خطا در دریافت درخواست‌ها:", err);
      }
    }
    loadRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("لطفا موضوع تیکت را وارد کنید.");
      return;
    }
    if (!content.trim()) {
      setError("لطفا متن پیام اولیه را وارد کنید.");
      return;
    }

    setLoading(true);
    try {
      const sessionPayload = {
        title,
        session_type: "general", // مقدار پیش‌فرض
      };

      if (relatedRequestId) {
        const related = requests.find((r) => r.id === parseInt(relatedRequestId));
        if (related) {
          // تعیین نوع سشن بر اساس نوع درخواست
          sessionPayload.session_type = related.request_type || "general";

          // اگر خواستی این بخش برای شناسه درخواست مرتبط هم بماند:
          if (related.request_type === "survey") {
            sessionPayload.survey_request = related.id;
          } else if (related.request_type === "evaluation") {
            sessionPayload.evaluation_request = related.id;
          }
        }
      }

      const sessionRes = await createTicketSession(sessionPayload);
      const sessionId = sessionRes.data.id;

      await createTicketMessage(sessionId, { content });

      navigate(`/tickets/session/${sessionId}`);
    } catch (err) {
      console.error("Error response:", err.response?.data);
      setError("ارسال تیکت با مشکل مواجه شد، دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-ticket-container">
      <h2>ارسال تیکت جدید</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="ticket-form">
        <label htmlFor="title">موضوع تیکت:</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          placeholder="موضوع تیکت را وارد کنید"
          required
        />

        <label htmlFor="relatedRequest">درخواست مرتبط (اختیاری):</label>
        <select
          id="relatedRequest"
          value={relatedRequestId}
          onChange={(e) => setRelatedRequestId(e.target.value)}
          disabled={loading}
        >
          <option value="">عمومی</option>
          {requests.map((req) => (
            <option key={req.id} value={req.id}>
              {req.project.title} ({req.request_type === "survey" ? "نقشه‌برداری" : "کارشناسی"})
            </option>
          ))}
        </select>

        <label htmlFor="content">متن پیام اولیه:</label>
        <textarea
          id="content"
          rows="6"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
          placeholder="پیام خود را بنویسید..."
          required
        ></textarea>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "در حال ارسال..." : "ارسال تیکت"}
        </button>
      </form>

      <style jsx>{`
        .new-ticket-container {
          max-width: 600px;
          margin: 2rem auto;
          padding: 1.5rem;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
          font-family: Vazir, sans-serif;
          color: #002a3a;
        }

        h2 {
          text-align: center;
          margin-bottom: 1.5rem;
          color: #ff5700;
          font-weight: 700;
        }

        .error-message {
          background-color: #fdecea;
          color: #d32f2f;
          padding: 10px;
          margin-bottom: 1rem;
          border-radius: 6px;
          text-align: center;
          font-weight: 600;
        }

        .ticket-form label {
          display: block;
          margin-bottom: 0.3rem;
          font-weight: 600;
        }

        .ticket-form input[type="text"],
        .ticket-form select,
        .ticket-form textarea {
          width: 100%;
          padding: 10px;
          margin-bottom: 1.3rem;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 1rem;
          color: #002a3a;
          transition: border-color 0.3s ease;
        }

        .ticket-form input[type="text"]:focus,
        .ticket-form select:focus,
        .ticket-form textarea:focus {
          outline: none;
          border-color: #ff5700;
          box-shadow: 0 0 8px #ff5700aa;
        }

        .submit-btn {
          width: 100%;
          padding: 12px;
          background-color: #ff5700;
          color: white;
          font-size: 1.1rem;
          font-weight: 700;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .submit-btn:disabled {
          background-color: #ffa066;
          cursor: not-allowed;
        }

        .submit-btn:hover:not(:disabled) {
          background-color: #e04e00;
        }

        @media (max-width: 600px) {
          .new-ticket-container {
            margin: 1rem;
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

export default NewTicket;
