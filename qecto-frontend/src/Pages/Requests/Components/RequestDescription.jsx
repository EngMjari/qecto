import React from "react";
import Card from "./Card";
import CardHeader from "./CardHeader";

function RequestDescription({ description }) {
  return (
    <Card>
      <CardHeader>توضیحات پروژه</CardHeader>
      <div className="px-5 py-3 text-sm text-gray-700 whitespace-pre-line">
        {description || "توضیحی ثبت نشده است."}
      </div>
    </Card>
  );
}

export default RequestDescription;
