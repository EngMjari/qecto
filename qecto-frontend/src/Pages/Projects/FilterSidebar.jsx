import React from "react";
import { FaTimes } from "react-icons/fa";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import "react-multi-date-picker/styles/layouts/mobile.css";

const getRequestTypeName = (type) => {
  const types = {
    survey: "نقشه‌برداری",
    supervision: "نظارت",
    expert: "کارشناسی",
    execution: "اجرا",
    registration: "ثبت",
  };
  return types[type] || "نامشخص";
};

function FilterSidebar({ filters, onFilterChange, setIsOpen, isMobile }) {
  const handleResetFilters = () => {
    onFilterChange({
      search: "",
      request_type: "all",
      request_status: "all",
      start_date: "",
      end_date: "",
      main_parcel_number: "",
      sub_parcel_number: "",
    });
    if (isMobile) setIsOpen(false);
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
    if (isMobile) setIsOpen(false);
  };

  const statusMap = {
    "در حال بررسی": "pending",
    "در حال انجام": "in_progress",
    "تکمیل شده": "completed",
    "رد شده": "rejected",
    ناقص: "incomplete",
  };

  const handleDateChange = (key, value) => {
    if (value) {
      const gregorianDate = value.toDate();
      const formattedDate = gregorianDate.toISOString().split("T")[0];
      onFilterChange({ [key]: formattedDate });
    } else {
      onFilterChange({ [key]: "" });
    }
  };

  return (
    <div
      className={`h-full flex flex-col bg-white ${
        isMobile ? "fixed inset-0 z-30 overflow-y-auto" : "p-4"
      }`}
    >
      <div
        className={`flex justify-between items-center border-b border-gray-200 ${
          isMobile ? "p-3 sticky top-0 bg-white z-10" : "mb-4"
        }`}
      >
        <h2 className="text-base font-bold text-gray-800">فیلترها</h2>
        {isMobile && (
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-gray-600"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        )}
      </div>
      <div
        className={`flex-grow space-y-3 ${isMobile ? "p-3 pt-2" : "space-y-4"}`}
      >
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            نوع درخواست
          </label>
          <div className="flex bg-gray-100 p-1 rounded-lg flex-wrap gap-1">
            <button
              onClick={() => onFilterChange({ request_type: "all" })}
              className={`flex-1 py-1.5 px-2 text-xs rounded-lg transition-colors ${
                filters.request_type === "all"
                  ? "bg-white shadow-sm font-semibold text-blue-600"
                  : "hover:bg-gray-200 text-gray-600"
              }`}
            >
              همه
            </button>
            {[
              "survey",
              "supervision",
              "expert",
              "execution",
              "registration",
            ].map((type) => (
              <button
                key={type}
                onClick={() => onFilterChange({ request_type: type })}
                className={`flex-1 py-1.5 px-2 text-xs rounded-lg transition-colors ${
                  filters.request_type === type
                    ? "bg-white shadow-sm font-semibold text-blue-600"
                    : "hover:bg-gray-200 text-gray-600"
                }`}
              >
                {getRequestTypeName(type)}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="status-filter"
            className="block text-sm font-medium text-gray-700"
          >
            وضعیت درخواست
          </label>
          <select
            id="status-filter"
            value={filters.request_status}
            onChange={(e) => onFilterChange({ request_status: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">همه وضعیت‌ها</option>
            {Object.entries(statusMap).map(([fa, en]) => (
              <option key={en} value={en}>
                {fa}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            تاریخ ثبت (شمسی)
          </label>
          <div className="grid grid-cols-1 gap-2">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">
                از تاریخ
              </label>
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                format="YYYY/MM/DD"
                value={filters.start_date ? new Date(filters.start_date) : null}
                onChange={(value) => handleDateChange("start_date", value)}
                inputClassName="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                containerClassName="w-full"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">
                تا تاریخ
              </label>
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                format="YYYY/MM/DD"
                value={filters.end_date ? new Date(filters.end_date) : null}
                onChange={(value) => handleDateChange("end_date", value)}
                inputClassName="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                containerClassName="w-full"
              />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            پلاک اصلی
          </label>
          <input
            type="text"
            placeholder="مثال: 1234"
            value={filters.main_parcel_number}
            onChange={(e) =>
              onFilterChange({ main_parcel_number: e.target.value })
            }
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            پلاک فرعی
          </label>
          <input
            type="text"
            placeholder="مثال: 567"
            value={filters.sub_parcel_number}
            onChange={(e) =>
              onFilterChange({ sub_parcel_number: e.target.value })
            }
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>
      {isMobile && (
        <div className="sticky bottom-0 bg-white p-3 border-t border-gray-200 flex-shrink-0">
          <div className="flex gap-2">
            <button
              onClick={handleApplyFilters}
              className="flex-1 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              اعمال فیلتر
            </button>
            <button
              onClick={handleResetFilters}
              className="flex-1 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              پاک کردن
            </button>
          </div>
        </div>
      )}
      {!isMobile && (
        <div className="flex-shrink-0 pt-3">
          <button
            onClick={handleResetFilters}
            className="w-full py-2 text-sm text-red-500 font-semibold hover:bg-red-50 rounded-lg transition-colors border border-red-200"
          >
            پاک کردن فیلترها
          </button>
        </div>
      )}
    </div>
  );
}

export default FilterSidebar;
