import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaSpinner } from "react-icons/fa";
import { fetchAdmins } from "../../api";

function ReferralModal({ isOpen, onClose, onSubmit, title, isLoading }) {
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [description, setDescription] = useState("");
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoadingAdmins(true);
      fetchAdmins()
        .then((data) => setAdmins(data))
        .catch((err) => console.error("خطا در دریافت ادمین‌ها:", err))
        .finally(() => setLoadingAdmins(false));
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAdmin) {
      alert("لطفاً یک ادمین انتخاب کنید.");
      return;
    }
    onSubmit({ assigned_admin: selectedAdmin, description });
    setSelectedAdmin("");
    setDescription("");
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md mx-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-600">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              انتخاب ادمین مقصد
            </label>
            <select
              value={selectedAdmin}
              onChange={(e) => setSelectedAdmin(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={loadingAdmins}
            >
              <option value="">انتخاب کنید...</option>
              {admins.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.full_name || admin.username}
                </option>
              ))}
            </select>
            {loadingAdmins && (
              <p className="text-xs text-gray-500 mt-1">در حال بارگذاری...</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              توضیحات (اختیاری)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows={4}
              placeholder="توضیحات ارجاع..."
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <FaSpinner className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                "ارجاع"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              لغو
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default ReferralModal;
