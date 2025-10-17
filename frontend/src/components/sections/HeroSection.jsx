// src/sections/HeroSection.jsx

import React from "react";
import avt from "../assets/images/avt.png"; // Import avt image

const HeroSection = () => {
  return (
    <section
      id="hero"
      className="relative bg-gradient-to-br from-blue-50 via-white to-pink-50 text-gray-800 py-24"
      style={{
        backgroundImage: `url(${avt})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay để làm mờ ảnh */}
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="container mx-auto px-6 text-center relative z-10">
        {/* Heading */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight text-white drop-shadow-lg">
          Nâng cao kiến thức, <br className="hidden md:block" /> Vững bước tương lai
        </h2>

        {/* Subheading */}
        <p className="text-lg md:text-xl mb-10 text-gray-100 opacity-90">
          Khóa học chất lượng cao với giá cả phải chăng
        </p>

        {/* Call to Action */}
        <a
          href="#courses"
          onClick={(e) => { e.preventDefault(); document.getElementById('courses')?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
          className="inline-block bg-gradient-to-r from-purple-500 to-pink-400 text-white px-10 py-4 rounded-xl font-semibold shadow-lg hover:shadow-2xl transition transform hover:scale-105 hover:-translate-y-1"
        >
          Khám phá ngay
        </a>
      </div>
    </section>
  );
};

export default HeroSection;