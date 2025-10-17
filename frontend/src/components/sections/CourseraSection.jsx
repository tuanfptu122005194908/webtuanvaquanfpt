// src/sections/CourseraSection.jsx

import React from "react";
import { Award } from "../components/common/Icon";
import CourseraForm from "../components/Client/CourseraForm";

const CourseraSection = ({ addToCart, showNotification }) => {
  return (
    <section
      id="coursera"
      className="py-20 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 relative overflow-hidden"
    >
      {/* Background hiệu ứng */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-12 text-center transform hover:scale-105 transition-transform duration-300 border-4 border-transparent hover:border-purple-200">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl transform -rotate-6 hover:rotate-0 transition-transform duration-300">
            <Award className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Hỗ trợ Rush Coursera
          </h2>

          <p className="text-gray-600 mb-10 text-xl leading-relaxed max-w-2xl mx-auto">
            Dịch vụ hỗ trợ hoàn thành MOOC nhanh chóng, đúng hạn và chất lượng
            — chỉ 30.000đ mỗi MOOC 🎯
          </p>

          {/* Form Coursera */}
          <CourseraForm addToCart={addToCart} showNotification={showNotification} />
        </div>
      </div>
    </section>
  );
};

export default CourseraSection;