import React, { useState, useRef, useEffect } from "react";
import {
  FaPaperclip,
  FaDownload,
  FaUser,
  FaShieldAlt,
  FaFileAlt,
  FaMapMarkerAlt,
  FaExpand,
  FaLock,
  FaComments,
  FaChevronLeft,
  FaFolderOpen,
  FaPaperPlane,
  FaFilePdf,
  FaFileImage,
  FaFileArchive,
  FaEye,
} from "react-icons/fa";
import { SiAutodesk } from "react-icons/si"; // آیکون اتوکد
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  fetchRequestDetails,
  fetchSurveyAttachmentPreview,
} from "../../../api/projectsApi";
import {
  getTicketSessions,
  createTicketSession,
  createTicketMessage,
  uploadMessageFiles,
} from "../../../api/ticketsApi";
import { useParams } from "react-router-dom";

function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-lg transition-shadow hover:shadow-2xl ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({ children, className = "" }) {
  return (
    <div className={`p-5 border-b border-gray-200 ${className}`}>
      <h3 className="text-lg font-bold text-gray-800">{children}</h3>
    </div>
  );
}

function getFileIcon(file) {
  const ext = (file.file_extension || "").toLowerCase();
  console.log("getFileIcon called with file:", file, "ext:", ext);
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext))
    return <FaFileImage className="w-6 h-6 text-pink-500 ml-4" />;
  if (ext === "pdf") return <FaFilePdf className="w-6 h-6 text-red-500 ml-4" />;
  if (["dwg", "dxf"].includes(ext))
    return <SiAutodesk className="w-6 h-6 text-green-700 ml-4" />; // آیکون اتوکد
  if (["rar", "zip"].includes(ext))
    return <FaFileArchive className="w-6 h-6 text-yellow-500 ml-4" />;
  // سایر فرمت‌ها
  return <FaFileAlt className="w-6 h-6 text-blue-500 ml-4" />;
}

function FileItem({ file, ticketTitle, onPreview, isAdmin }) {
  const ext = (file.file_extension || "").toLowerCase();
  // فقط عکس و PDF پیش‌نمایش دارند
  const canPreview = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "webp",
    "pdf",
  ].includes(ext);

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg border border-gray-200 w-full">
        {getFileIcon(file)}
        <div className="flex-grow">
          <p className="font-semibold text-sm text-gray-800">
            {file.custom_name || file.title || file.file.split("/").pop()}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-500">
              {file.file_extension?.toUpperCase() || ""}
            </span>
            <span className="text-xs text-gray-400">
              {file.readable_file_size || ""}
            </span>
            <span className="text-xs text-gray-400">
              {file.uploaded_at
                ? new Date(file.uploaded_at).toLocaleDateString("fa-IR")
                : ""}
            </span>
          </div>
          {ticketTitle && (
            <span className="block text-xs text-gray-500 mt-1">
              فایل مربوط به تیکت "{ticketTitle}"
              {isAdmin && (
                <span className="text-xs text-blue-600 ml-2">(کارشناس)</span>
              )}
            </span>
          )}
        </div>
        {canPreview && (
          <button
            onClick={() => onPreview(file)}
            className="p-2 rounded-full text-blue-500 hover:bg-blue-100 transition-colors ml-1"
            title="پیش‌نمایش"
            type="button"
          >
            <FaEye className="w-5 h-5" />
          </button>
        )}
        <a
          href={file.file || file.url || "#"}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
        >
          <FaDownload className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  // فرض: اگر sender_admin مقدار دارد یعنی پیام از ادمین است
  const isAdmin =
    !!message.sender_admin ||
    (message.sender && message.sender.role === "admin");
  return (
    <div
      className={`flex items-end gap-2 my-2 ${
        isAdmin ? "justify-start" : "justify-end"
      }`}
    >
      {isAdmin && <FaShieldAlt className="w-6 h-6 text-blue-400" />}
      <div
        className={`max-w-md p-3 rounded-lg shadow break-words whitespace-pre-line ${
          isAdmin
            ? "bg-blue-50 text-blue-900 rounded-bl-none"
            : "bg-blue-600 text-white rounded-br-none"
        }`}
        style={{
          borderTopLeftRadius: isAdmin ? 0 : undefined,
          borderTopRightRadius: !isAdmin ? 0 : undefined,
          fontSize: "clamp(13px, 3vw, 16px)", // سایز متن واکنش‌گرا
          wordBreak: "break-word",
          overflowWrap: "break-word",
        }}
      >
        <p className="text-sm">{message.content}</p>
        {message.files && message.files.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.files.map((file) => (
              <a
                key={file.id}
                href={file.file}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-white border px-2 py-1 rounded text-xs text-blue-600 hover:bg-blue-50"
                download
              >
                <FaFileAlt className="ml-1" />
                {file.custom_name || file.file.split("/").pop()}
              </a>
            ))}
          </div>
        )}
        <p
          className={`text-xs mt-1 opacity-70 ${
            isAdmin ? "text-right" : "text-left"
          }`}
        >
          {new Date(message.created_at).toLocaleTimeString("fa-IR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      {!isAdmin && <FaUser className="w-6 h-6 text-gray-400" />}
      {isAdmin && <span className="text-xs text-blue-600 ml-2">کارشناس</span>}
    </div>
  );
}

function MessageInput({ onSendMessage, disabled }) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleSend = () => {
    if (message.trim() === "" && files.length === 0) return;
    onSendMessage(message, files);
    setMessage("");
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleRemoveFile = (idx) => {
    setFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== idx);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return newFiles;
    });
  };

  return (
    <div className="p-4 bg-gray-50 border-t w-full">
      {disabled ? (
        <div className="text-center text-sm text-gray-500 p-3 bg-gray-200 rounded-lg flex items-center justify-center">
          <FaLock className="w-4 h-4 ml-2" />
          <span>این گفتگو بسته شده است.</span>
        </div>
      ) : (
        <div className="flex items-center border border-gray-300 rounded-full p-1 bg-white focus-within:ring-2 focus-within:ring-blue-500 w-full">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="پاسخ خود را بنویسید..."
            className="flex-grow bg-transparent outline-none px-4 text-gray-700 min-w-0"
            style={{ fontSize: "clamp(13px, 3vw, 16px)" }}
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="p-2 text-gray-500 hover:text-blue-600 flex-shrink-0"
            type="button"
          >
            <FaPaperclip className="h-5 w-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={handleFileChange}
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white rounded-full p-2.5 hover:bg-blue-700 transition-transform transform active:scale-95 flex-shrink-0"
            style={{ minWidth: 40, minHeight: 40 }}
            type="button"
          >
            <FaPaperPlane className="h-5 w-5" />
          </button>
        </div>
      )}
      {/* نمایش فایل‌های انتخاب شده */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {files.map((file, idx) => (
            <span
              key={idx}
              className="bg-blue-100 text-blue-800 font-bold px-3 py-2 rounded-lg flex items-center cursor-pointer transition-all duration-200 hover:bg-blue-200 active:scale-95 animate-[pulse_0.7s]"
              style={{
                fontSize: "1rem",
                boxShadow: "0 2px 8px 0 rgba(0,0,0,0.05)",
              }}
            >
              {file.name}
              <button
                type="button"
                className="mr-2 ml-0 flex item-start  justify-center w-7 h-7 rounded-full border border-1 border-gray-700 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 shadow-sm"
                onClick={() => handleRemoveFile(idx)}
                title="حذف فایل"
              >
                <span className="text-lg font-bold">×</span>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectDetails({ project }) {
  // وضعیت فارسی
  const statusMap = {
    pending: "در انتظار بررسی",
    in_progress: "در حال انجام",
    completed: "تکمیل شده",
    rejected: "رد شده",
    incomplete: "ناقص",
  };
  // نوع ملک فارسی
  const propertyTypeMap = {
    field: "زمین",
    Building: "ساختمان",
    other: "سایر",
  };

  // وضعیت رنگ
  const statusColor =
    {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      incomplete: "bg-gray-100 text-gray-800",
    }[project.status] || "bg-gray-100 text-gray-800";

  // آیا ارجاع شده؟
  const isAssigned = !!project.assigned_admin && !!project.assigned_admin.name;

  return (
    <Card>
      <div className="p-5">
        <div className="flex flex-col gap-1">
          <h1
            className="text-sm font-medium text-gray-900 truncate"
            style={{
              maxWidth: "100%",
              lineHeight: "1.7",
              direction: "rtl",
            }}
            title={project.project.title || "بدون عنوان"}
          >
            {project.project.title || "بدون عنوان"}
          </h1>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor} whitespace-nowrap w-fit mt-1`}
            title={statusMap[project.status] || "نامشخص"}
          >
            {statusMap[project.status] || "نامشخص"}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          ایجاد شده در:{" "}
          {project.created_at
            ? new Date(project.created_at).toLocaleDateString("fa-IR")
            : "—"}
        </p>
        <div className="mt-6 space-y-4 text-xs">
          {isAssigned && (
            <div className="flex items-center">
              <FaShieldAlt className="w-5 h-5 ml-3 text-gray-400" />
              <strong>ارجاع به:</strong>
              <span className="mr-2">{project.assigned_admin.name}</span>
            </div>
          )}
          <div className="flex items-center">
            <FaFileAlt className="w-5 h-5 ml-3 text-gray-400" />
            <strong>نوع ملک:</strong>
            <span className="mr-2">
              {propertyTypeMap[project.property_type] || "—"}
            </span>
          </div>
          <div className="flex items-center">
            <FaExpand className="w-5 h-5 ml-3 text-gray-400" />
            <strong>مساحت:</strong>
            <span className="mr-2">
              {project.area ? `${project.area} متر مربع` : "—"}
            </span>
          </div>
          {project.main_parcel_number && (
            <div className="flex items-center">
              <FaMapMarkerAlt className="w-5 h-5 ml-3 text-gray-400" />
              <strong>پلاک ثبتی اصلی:</strong>
              <span className="mr-2">{project.main_parcel_number}</span>
            </div>
          )}
          {project.sub_parcel_number && (
            <div className="flex items-center">
              <FaMapMarkerAlt className="w-5 h-5 ml-3 text-gray-400" />
              <strong>پلاک ثبتی فرعی:</strong>
              <span className="mr-2">{project.sub_parcel_number}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// توضیحات پروژه
function ProjectDescription({ description }) {
  return (
    <Card>
      <CardHeader>توضیحات پروژه</CardHeader>
      <div className="p-5 text-sm text-gray-700 whitespace-pre-line">
        {description || "توضیحی ثبت نشده است."}
      </div>
    </Card>
  );
}

// نقشه با افکت و قابلیت کلیک برای باز شدن در گوگل‌مپ
function MapView({ lat, lng }) {
  if (!lat || !lng) return null;

  const openInGoogleMaps = () => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      "_blank"
    );
  };

  return (
    <Card>
      <CardHeader>موقعیت ملک</CardHeader>
      <div className="p-5">
        <div
          className="relative h-60 bg-gray-200 rounded-lg overflow-hidden cursor-pointer transition hover:scale-105 hover:shadow-xl animate-[pulse_1.5s_ease-in-out]"
          onClick={openInGoogleMaps}
          title="مشاهده در نقشه گوگل"
        >
          <MapContainer
            center={[lat, lng]}
            zoom={15}
            scrollWheelZoom={false}
            dragging={false}
            doubleClickZoom={false}
            zoomControl={false}
            attributionControl={false}
            style={{
              height: "100%",
              width: "100%",
              minHeight: 220,
              pointerEvents: "none",
              transition: "box-shadow 0.3s, transform 0.3s",
              zIndex: 0, // اضافه شد
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]}>
              <Popup>موقعیت ملک</Popup>
            </Marker>
          </MapContainer>
          <div
            className="absolute inset-0 bg-transparent"
            style={{ pointerEvents: "auto" }}
          />
        </div>
        <div className="flex justify-between text-xs mt-3 text-gray-600">
          <span>عرض جغرافیایی: {Number(lat).toFixed(6)}</span>
          <span>طول جغرافیایی: {Number(lng).toFixed(6)}</span>
        </div>
      </div>
    </Card>
  );
}

function TicketConversation({ ticket, onBack, onSendMessage }) {
  return (
    <div className="flex flex-col h-full">
      <div
        className="flex-grow p-4 overflow-y-auto w-full"
        style={{ maxHeight: "50vh", minHeight: 200, overflowX: "hidden" }}
      >
        {ticket.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>
      <MessageInput
        disabled={ticket.status === "closed"}
        onSendMessage={onSendMessage}
      />
    </div>
  );
}

const AccordionSection = React.forwardRef(function AccordionSection(
  { title, open, onToggle, children },
  ref
) {
  return (
    <div ref={ref} className="mb-3 border rounded-lg bg-white">
      <button
        type="button"
        className="w-full flex justify-between items-center px-4 py-3 font-bold text-md focus:outline-none"
        onClick={onToggle}
      >
        <span>{title}</span>
        <span className="text-xl">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
});

function TabsManager({
  userFiles,
  adminFiles,
  tickets,
  setTickets,
  requestId,
  requestType,
  handlePreview,
  currentUserId,
}) {
  const [activeTab, setActiveTab] = useState("files");
  const [refresh, setRefresh] = useState(false);
  const [openTicketId, setOpenTicketId] = useState(null);

  // اضافه کن:
  const [openAcc, setOpenAcc] = useState({
    user: false,
    tickets: false,
    admin: false,
  });

  // refs برای آکاردئون تیکت‌ها
  const ticketRefs = useRef([]);

  useEffect(() => {
    ticketRefs.current = tickets.map(
      (_, i) => ticketRefs.current[i] || React.createRef()
    );
  }, [tickets]);

  // گرفتن لیست تیکت‌ها
  useEffect(() => {
    getTicketSessions().then((ticketRes) => {
      const data = Array.isArray(ticketRes.data.results)
        ? ticketRes.data.results
        : [];
      setTickets(data);
    });
    // eslint-disable-next-line
  }, [requestId, refresh]);

  const hasOpenTicket = tickets.some((t) => t.status === "open");

  const handleTicketCreated = () => {
    setRefresh((prev) => !prev);
    setOpenTicketId(null);
  };

  return (
    <div>
      <div className="p-3 border-b flex">
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
            {/* فایل‌های درخواست اولیه */}
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

            {/* فایل‌های مربوط به تیکت‌ها */}
            <AccordionSection
              title="فایل‌های مربوط به تیکت‌ها"
              open={openAcc.tickets}
              onToggle={() =>
                setOpenAcc((prev) => ({ ...prev, tickets: !prev.tickets }))
              }
            >
              {tickets.every(
                (ticket) =>
                  !ticket.messages ||
                  ticket.messages.every(
                    (msg) => !msg.files || msg.files.length === 0
                  )
              ) ? (
                <p className="text-xs text-gray-400">
                  فایلی در تیکت‌ها ارسال نشده است.
                </p>
              ) : (
                <div className="space-y-2">
                  {tickets.map((ticket) =>
                    ticket.messages
                      ?.filter((msg) => msg.files && msg.files.length > 0)
                      .map((msg) =>
                        msg.files.map((file) => (
                          <FileItem
                            key={file.id}
                            file={file}
                            ticketTitle={ticket.title}
                            onPreview={handlePreview}
                            isAdmin={!!msg.sender_admin}
                          />
                        ))
                      )
                  )}
                </div>
              )}
            </AccordionSection>

            {/* فایل‌های دریافتی از کارشناس */}
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
                  {adminFiles
                    .filter((file) => file.uploaded_by !== currentUserId)
                    .map((file) => (
                      <FileItem
                        key={file.id}
                        file={file}
                        onPreview={handlePreview}
                      />
                    ))}
                </div>
              )}
            </AccordionSection>
          </div>
        )}
        {activeTab === "tickets" && (
          <div className="p-3 space-y-3">
            {!hasOpenTicket ? (
              <>
                <TicketForm
                  requestId={requestId}
                  requestType={requestType}
                  onTicketCreated={handleTicketCreated}
                />
                {tickets.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-bold mb-2 text-sm text-gray-700">
                      لیست تیکت‌های قبلی:
                    </h4>
                    <ul className="space-y-2">
                      {tickets.map((ticket, idx) => (
                        <AccordionSection
                          ref={ticketRefs.current[idx]}
                          key={ticket.id}
                          title={
                            <span>
                              {ticket.title}
                              {ticket.status === "closed" && (
                                <span className="ml-2 text-xs text-red-500">
                                  (بسته شده)
                                </span>
                              )}
                            </span>
                          }
                          open={openTicketId === ticket.id}
                          onToggle={() => {
                            const willOpen = openTicketId !== ticket.id;
                            setOpenTicketId(willOpen ? ticket.id : null);
                            setTimeout(() => {
                              // دقیقا به ریشه آکاردئون اسکرول کن
                              if (
                                willOpen &&
                                ticketRefs.current[idx]?.current
                              ) {
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
                            ticket={ticket}
                            onBack={() => {}}
                            onSendMessage={async (msg, files) => {
                              try {
                                const msgRes = await createTicketMessage(
                                  ticket.id,
                                  { content: msg }
                                );
                                if (files && files.length > 0) {
                                  await uploadMessageFiles(
                                    msgRes.data.id,
                                    files
                                  );
                                }
                                const updatedSessions =
                                  await getTicketSessions();
                                const data = Array.isArray(
                                  updatedSessions.data.results
                                )
                                  ? updatedSessions.data.results
                                  : [];
                                setTickets(data);
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
              </>
            ) : tickets.length === 0 ? (
              <p className="text-xs text-gray-400">گفتگویی وجود ندارد.</p>
            ) : (
              tickets.map((ticket, idx) => (
                <AccordionSection
                  ref={ticketRefs.current[idx]}
                  key={ticket.id}
                  title={
                    <span className="flex items-center">
                      {ticket.title}
                      {ticket.status === "closed" && (
                        <>
                          <FaLock className="w-4 h-4 ml-2 text-gray-500" />
                          <span className="ml-2 text-xs text-red-500">
                            (بسته شده)
                          </span>
                        </>
                      )}
                    </span>
                  }
                  open={openTicketId === ticket.id}
                  onToggle={() => {
                    const willOpen = openTicketId !== ticket.id;
                    setOpenTicketId(willOpen ? ticket.id : null);
                    setTimeout(() => {
                      if (willOpen && ticketRefs.current[idx]?.current) {
                        ticketRefs.current[idx].current.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }, 100);
                  }}
                >
                  <TicketConversation
                    ticket={ticket}
                    onBack={() => {}}
                    onSendMessage={async (msg, files) => {
                      try {
                        const msgRes = await createTicketMessage(ticket.id, {
                          content: msg,
                        });
                        if (files && files.length > 0) {
                          await uploadMessageFiles(msgRes.data.id, files);
                        }
                        const updatedSessions = await getTicketSessions();
                        const data = Array.isArray(updatedSessions.data.results)
                          ? updatedSessions.data.results
                          : [];
                        setTickets(data);
                        setRefresh((r) => !r);
                      } catch (err) {
                        alert("خطا در ارسال پیام");
                      }
                    }}
                  />
                </AccordionSection>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RequestPage() {
  const { id } = useParams();
  const [projectData, setProjectData] = useState(null);
  const [userFiles, setUserFiles] = useState([]);
  const [adminFiles, setAdminFiles] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchRequestDetails(id)
      .then((res) => {
        const req = res.data;
        setProjectData(req);

        // جدا کردن فایل‌های یوزر و ادمین
        const allFiles = req.attachments || [];
        setUserFiles(
          allFiles.filter((file) => file.uploaded_by === req.project.owner.id)
        );
        setAdminFiles(
          allFiles.filter((file) => file.uploaded_by !== req.project.owner.id)
        );

        setTickets([]); // اگر داشتی مقدار بده
        console.log("Project data fetched:", req);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handlePreview = (file) => {
    setPreviewFile(file);
    setPreviewOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-500 text-lg">در حال بارگذاری...</span>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-red-500 text-lg">درخواستی یافت نشد.</span>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="bg-gray-100 min-h-screen font-sans"
      style={{ fontFamily: "Vazirmatn, sans-serif" }}
    >
      <div className="bg-gradient-to-b from-blue-600 to-blue-800 h-48 w-full absolute top-0 right-0"></div>
      <div className="container mx-auto p-4 md:p-8 relative">
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ستون راست: اطلاعات پروژه */}
          <div className="lg:col-span-1 space-y-8">
            <ProjectDetails project={projectData} />
            <ProjectDescription description={projectData.description} />
            <MapView
              lat={projectData.location_lat}
              lng={projectData.location_lng}
            />
          </div>
          {/* ستون چپ: تب‌ها */}
          <div className="lg:col-span-2">
            <Card className="h-full min-h-[85vh]">
              <TabsManager
                userFiles={userFiles}
                adminFiles={adminFiles}
                tickets={tickets}
                setTickets={setTickets}
                requestId={projectData.id}
                requestType={projectData.request_type}
                handlePreview={handlePreview}
                currentUserId={currentUserId} // اضافه کن
              />
            </Card>
          </div>
        </main>
      </div>
      <PreviewModal
        open={previewOpen}
        file={previewFile}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}

function TicketForm({ requestId, requestType, onTicketCreated }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      // ساخت session
      const formData = new FormData();
      formData.append("title", title);
      formData.append("session_type", requestType);
      if (requestType === "survey") {
        formData.append("survey_request", requestId);
      } else if (requestType === "expert" || requestType === "evaluation") {
        formData.append("evaluation_request", requestId);
      }
      const sessionRes = await createTicketSession(formData);
      const sessionId = sessionRes.data.id;

      // ارسال پیام اولیه
      let messageId = null;
      if (message && message.trim()) {
        const msgRes = await createTicketMessage(sessionId, {
          content: message,
        });
        messageId = msgRes.data.id;

        // آپلود فایل‌ها برای پیام
        if (files.length > 0) {
          await uploadMessageFiles(messageId, files);
        }
      }

      setTitle("");
      setMessage("");
      setFiles([]);
      setSuccessMsg("تیکت با موفقیت ثبت شد.");
      onTicketCreated();
    } catch (err) {
      setErrorMsg("خطا در ثبت تیکت. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      {successMsg && (
        <div className="bg-green-100 text-green-700 p-2 rounded text-center font-bold">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-100 text-red-700 p-2 rounded text-center font-bold">
          {errorMsg}
        </div>
      )}
      <input
        type="text"
        className="w-full border rounded p-2"
        placeholder="عنوان تیکت"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        className="w-full border rounded p-2"
        placeholder="متن پیام"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
      />
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="block"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "در حال ارسال..." : "ارسال تیکت"}
      </button>
    </form>
  );
}

function PreviewModal({ open, file, onClose }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !file) return;
    const ext = (file.file_extension || "").toLowerCase();

    // اگر عکس است، مستقیم نمایش بده
    if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) {
      setPreviewUrl(getFileUrl(file));
      setError("");
      setLoading(false);
      return;
    }

    // اگر PDF، Excel، DWG یا DXF است، از API پیش‌نمایش بگیر
    if (["pdf", "xls", "xlsx", "dwg", "dxf"].includes(ext)) {
      setLoading(true);
      setError("");
      fetchSurveyAttachmentPreview(file.id)
        .then((res) => {
          const url = URL.createObjectURL(res.data);
          setPreviewUrl(url);
        })
        .catch(() => {
          setError("پیش‌نمایش این فایل ممکن نیست.");
        })
        .finally(() => setLoading(false));
      return;
    }

    // سایر فرمت‌ها preview ندارند
    setPreviewUrl(null);
    setError("پیش‌نمایش این فرمت پشتیبانی نمی‌شود.");
    setLoading(false);
  }, [open, file]);

  if (!open || !file) return null;

  const ext = (file.file_extension || "").toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-lg p-4 max-w-2xl w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 left-2 text-gray-500 hover:text-red-500 text-xl"
        >
          ×
        </button>
        {loading ? (
          <div className="text-center text-gray-500 py-10">
            در حال دریافت پیش‌نمایش...
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : previewUrl ? (
          <img
            src={previewUrl}
            alt={file.custom_name || file.title}
            className="max-h-[70vh] mx-auto rounded"
            style={{ display: "block" }}
          />
        ) : null}
      </div>
    </div>
  );
}

function getFileUrl(file) {
  if (!file.file) return "#";
  // اگر آدرس با http شروع نشده، همان را برگردان (پراکسی کار را انجام می‌دهد)
  if (file.file.startsWith("http")) return file.file;
  return file.file;
}

const currentUserId = Number(localStorage.getItem("user_id")); // یا هر روشی که داری

export default RequestPage;
