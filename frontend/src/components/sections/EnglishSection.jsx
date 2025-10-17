// src/sections/EnglishSection.jsx

import React from "react";
import ServiceCard from "../components/Client/ServiceCard";
import { ENGLISH_SERVICE_DATA } from "../constants";

const EnglishSection = ({ addToCart }) => {
  return (
    <section
      id="english"
      className="py-24 bg-gradient-to-r from-purple-50 via-purple-100 to-blue-50"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
            🎓 Hỗ trợ học Tiếng Anh
          </h2>
          <p className="text-gray-600 text-lg md:text-xl">
            Dịch vụ toàn diện cho sinh viên học tiếng Anh
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {ENGLISH_SERVICE_DATA.map((service) => (
            <ServiceCard key={service.id} service={service} addToCart={addToCart} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default EnglishSection;