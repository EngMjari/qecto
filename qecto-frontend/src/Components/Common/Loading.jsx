import React from "react";

const Loading = ({ message = "در حال بارگذاری..." }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <div className="loader mb-4"></div>
      <p className="text-[#002a3a] font-semibold">{message}</p>
    </div>
  );
};

export default Loading;
