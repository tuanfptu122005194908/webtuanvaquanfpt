// src/components/Client/CourseraForm.jsx

import React, { useState } from "react";

const PRICE_PER_MOOC = 30000;

const CourseraForm = ({ addToCart, showNotification }) => {
  const [courseName, setCourseName] = useState("");
  const [moocCount, setMoocCount] = useState(1);
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!courseName.trim()) {
      setError("⚠️ Vui lòng nhập tên khóa học!");
      return;
    }
    setError("");
    const total = PRICE_PER_MOOC * moocCount;
    addToCart({
      id: `coursera-${Date.now()}`,
      name: `Coursera: ${courseName}`,
      price: total,
      quantity: moocCount,
      type: "coursera",
    });
    showNotification(`Đã thêm ${moocCount} MOOC (${courseName}) vào giỏ hàng!`, "success");
    setCourseName("");
    setMoocCount(1);
  };

  const handleChangeCount = (newCount) => {
    if (newCount < 1) newCount = 1;
    setMoocCount(newCount);
  };

  const totalPrice = PRICE_PER_MOOC * moocCount;

  return (
    <div className="max-w-lg mx-auto bg-gray-50 p-8 rounded-2xl shadow-inner border border-purple-200">
      <div className="mb-6 text-left">
        <label className="block text-gray-700 font-semibold mb-2">
          Tên khóa học / MOOC:
        </label>
        <input
          type="text"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          placeholder="Nhập tên khóa học (vd: Machine Learning Coursera)"
          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>

      <div className="flex items-center justify-between mb-6">
        <label className="text-gray-700 font-semibold">Số lượng MOOC:</label>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => handleChangeCount(moocCount - 1)}
            className="bg-purple-100 px-3 py-1 rounded-lg hover:bg-purple-200"
          >
            -
          </button>
          <input
            type="number"
            min="1"
            value={moocCount}
            onChange={(e) => handleChangeCount(Number(e.target.value))}
            className="w-16 text-center border rounded-lg py-1"
          />
          <button
            type="button"
            onClick={() => handleChangeCount(moocCount + 1)}
            className="bg-purple-100 px-3 py-1 rounded-lg hover:bg-purple-200"
          >
            +
          </button>
        </div>
      </div>

      <div className="text-center mb-6">
        <p className="text-gray-700 font-medium">
          💰 Công thức: {moocCount} × {PRICE_PER_MOOC.toLocaleString("vi-VN")}
          đ ={" "}
          <span className="text-purple-700 font-bold">
            {totalPrice.toLocaleString("vi-VN")}đ
          </span>
        </p>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold text-lg hover:shadow-lg transition transform hover:scale-105"
      >
        ➕ Thêm vào giỏ hàng
      </button>
    </div>
  );
};

export default CourseraForm;