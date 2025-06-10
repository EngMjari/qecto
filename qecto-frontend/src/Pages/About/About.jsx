import React, { useContext } from "react";
import { SiteConfigContext } from "Contexts/SiteConfigContext";
const UserCircleIcon = ({ c }) => (
  <svg
    className={c}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3" />
    <circle cx="12" cy="10" r="3" />
    <circle cx="12" cy="12" r="10" />
  </svg>
);
const PhoneIcon = ({ c }) => (
  <svg
    className={c}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);
const MailIcon = ({ c }) => (
  <svg
    className={c}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
  </svg>
);
const WhatsappIcon = ({ c }) => (
  <svg
    className={c}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
  </svg>
);
const TelegramIcon = ({ c }) => (
  <svg
    className={c}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15.91L18.23 18.2c-.27.67-1.02.81-1.55.4l-4.1-3.25-2.02 1.93c-.23.23-.42.41-.65.41z" />
  </svg>
);

export default function About() {
  const { siteConfig } = useContext(SiteConfigContext);
  const teamMembers = [
    {
      name: "مهندس حمید عسگری",
      role: "کارشناس عمران",
      image: "https://placehold.co/400x400/344e41/ffffff?text=H.A",
      contacts: {
        phone: "09120000001",
        email: "ali@example.com",
        whatsapp: "989120000001",
        telegram: "ali_m",
      },
    },
    {
      name: "مهندس شایان زربخش",
      role: "کارشناس عمران",
      image: null,
      contacts: {
        phone: "09120000002",
        email: "sara@example.com",
        whatsapp: "989120000002",
        telegram: "sara_r",
      },
    },
    {
      name: "مهندس نگار کاظمی",
      role: "کارشناس عمران",
      image: "https://placehold.co/400x400/588157/ffffff?text=N.K",
      contacts: {
        phone: "09120000003",
        email: "reza@example.com",
        whatsapp: "989120000003",
        telegram: "reza_h",
      },
    },
    {
      name: "مهندس امیر فربد",
      role: "کارشناس عمران",
      image: "https://placehold.co/400x400/588157/ffffff?text=A.F",
      contacts: {
        phone: "09120000003",
        email: "reza@example.com",
        whatsapp: "989120000003",
        telegram: "reza_h",
      },
    },
  ];

  return (
    <div className="animate-fade-in bg-white" style={{ direction: "rtl" }}>
      <div
        className="bg-gray-800 text-white pt-24 pb-16 lg:pt-40 lg:pb-24 bg-cover bg-center relative"
        style={{
          backgroundImage:
            "url('https://placehold.co/1920x400/2d3748/cccccc?text=About+Us')",
        }}
      >
        <div className="bg-black bg-opacity-50 inset-0 absolute"></div>
        <div className="container relative mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">درباره ما</h1>
          <p className="text-lg text-gray-300 mt-4">
            آشنایی بیشتر با داستان، اهداف و تیم{" "}
            {siteConfig.site_name || "شرکت ما"}.
          </p>
        </div>
      </div>

      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-12">
            <div className="w-full lg:w-1/2">
              <img
                src="https://placehold.co/600x400/e2e8f0/3a5a40?text=Qecto Sazeh hirkasb"
                alt="دفتر شرکت"
                className="rounded-lg shadow-xl w-full"
              />
            </div>
            <div className="w-full lg:w-1/2">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                داستان ما
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                شرکت ککتوسازهیرکاسب در سال ... با هدف ارائه خدمات نوین و دقیق
                مهندسی تاسیس شد. ما با تکیه بر دانش فنی و تجربه اعضای تیم،
                توانسته‌ایم پروژه‌های متعددی را در زمینه نقشه‌برداری، امور ثبتی
                و نظارت با موفقیت به اتمام برسانیم.
              </p>
              <p className="text-gray-600 leading-relaxed">
                چشم‌انداز ما تبدیل شدن به یکی از معتبرترین شرکت‌های مهندسی در
                سطح کشور و ارائه راهکارهای خلاقانه برای چالش‌های عمرانی است.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              تیم متخصص ما
            </h2>
            <div className="mt-4 h-1.5 w-24 bg-orange-500 mx-auto rounded-full"></div>
            <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
              موتور محرک موفقیت ما، تیمی از افراد متخصص، با انگیزه و خلاق است.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 text-center flex flex-col items-center transition-all duration-300 hover:shadow-2xl hover:scale-105"
              >
                <div className="w-32 h-32 rounded-full mb-4 shadow-md bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon c="w-24 h-24 text-gray-400" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {member.name}
                </h3>
                <p className="text-orange-500 font-semibold mb-4">
                  {member.role}
                </p>
                <div className="flex space-l-3 mt-auto pt-4 border-t w-full justify-center">
                  <a
                    href={`tel:${member.contacts.phone}`}
                    className="text-gray-500 hover:text-teal-600 p-2 rounded-full transition-colors"
                  >
                    <PhoneIcon c="w-6 h-6" />
                  </a>
                  <a
                    href={`mailto:${member.contacts.email}`}
                    className="text-gray-500 hover:text-teal-600 p-2 rounded-full transition-colors"
                  >
                    <MailIcon c="w-6 h-6" />
                  </a>
                  <a
                    href={`https://wa.me/${member.contacts.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-teal-600 p-2 rounded-full transition-colors"
                  >
                    <WhatsappIcon c="w-6 h-6" />
                  </a>
                  <a
                    href={`https://t.me/${member.contacts.telegram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-teal-600 p-2 rounded-full transition-colors"
                  >
                    <TelegramIcon c="w-6 h-6" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
