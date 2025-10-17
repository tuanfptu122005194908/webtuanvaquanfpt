// src/components/Client/CourseCard.jsx

import React from "react";

const CourseCard = ({ course, addToCart }) => {
  return (
    <div
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-3 hover:scale-105 overflow-hidden flex flex-col h-[28rem]"
    >
      {/* Ảnh chiếm nửa box */}
      <div
        className="h-1/2 w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${course.img})` }}
      ></div>

      {/* Nội dung */}
      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          <p className="text-purple-600 font-semibold mb-1">
            {course.code}
          </p>
          <h4 className="font-bold text-gray-900 text-lg mb-2">
            {course.name}
          </h4>
          <p className="text-gray-700 text-sm leading-relaxed">
            {course.desc}
          </p>
        </div>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-2xl font-bold text-purple-600">
            {course.price.toLocaleString()}đ
          </span>
          <button
            onClick={() => addToCart({ ...course, type: "course" })}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 shadow-md hover:shadow-lg transition transform hover:scale-105"
          >
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;