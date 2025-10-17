// src/components/Client/ServiceCard.jsx

import React from "react";
import { CheckCircle } from "../common/Icon";

const ServiceCard = ({ service, addToCart }) => {
  return (
    <div
      className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-2 flex flex-col min-h-[32rem] overflow-hidden"
    >
      {/* Image - chiếm nửa trên, giữ tỉ lệ */}
      <div
        className="bg-cover bg-center aspect-[2/1] md:aspect-[3/2]"
        style={{ backgroundImage: `url(${service.bgImg})` }}
      ></div>

      {/* Content - nửa dưới */}
      <div className="p-6 flex flex-col flex-1 justify-between">
        {/* Mã môn & tên môn */}
        <div className="text-center mb-4">
          <h4 className="text-purple-600 font-bold text-lg">
            {service.code}
          </h4>
          <h3 className="text-gray-800 text-2xl font-semibold">
            {service.name}
          </h3>
        </div>

        {/* List of Services */}
        <ul className="space-y-2 mb-6">
          {service.services.map((item, idx) => (
            <li key={idx} className="flex items-center text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        {/* Footer: Price & Button */}
        <div className="flex justify-between items-center mt-auto">
          <span className="text-xl md:text-2xl font-bold text-purple-600">
            {service.price.toLocaleString()}đ
          </span>
          <button
            onClick={() => addToCart({ ...service, type: "english" })}
            className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700 transition-all font-semibold shadow-md hover:shadow-lg"
          >
            Đăng ký
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;