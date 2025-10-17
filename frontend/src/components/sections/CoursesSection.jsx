// src/sections/CoursesSection.jsx

import React from "react";
import CourseCard from "../components/Client/CourseCard";
import { COURSE_DATA } from "../constants";

const CoursesSection = ({ addToCart }) => {
  return (
    <section id="courses" className="py-20 font-sans bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Danh sách khóa học
          </h2>
          <p className="text-gray-600 text-lg md:text-xl">
            Các khóa học được thiết kế đặc biệt để giúp bạn đạt điểm cao
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {COURSE_DATA.map((course) => (
            <CourseCard key={course.id} course={course} addToCart={addToCart} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;