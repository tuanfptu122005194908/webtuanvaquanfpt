// src/sections/ContactSection.jsx

import React from "react";
import { Facebook, Mail } from "../components/common/Icon";

const ContactSection = () => {
  return (
    <section id="contact" className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            📞 Liên hệ với chúng tôi
          </h2>
          <p className="text-gray-300">
            Hãy kết nối để nhận tư vấn và hỗ trợ
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center space-y-6 md:space-y-0 md:space-x-12">
          <a
            href="https://www.facebook.com/tuanvaquan"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 bg-blue-600 px-8 py-4 rounded-lg hover:bg-blue-700 transition transform hover:scale-105"
          >
            <Facebook className="w-6 h-6" />
            <span className="font-semibold">Facebook: Tuấn và Quân</span>
          </a>

          <a
            href="mailto:lequan12305@gmail.com"
            className="flex items-center space-x-3 bg-red-600 px-8 py-4 rounded-lg hover:bg-red-700 transition transform hover:scale-105"
          >
            <Mail className="w-6 h-6" />
            <span className="font-semibold">lequan12305@gmail.com</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;