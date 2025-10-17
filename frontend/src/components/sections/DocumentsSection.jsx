// src/sections/DocumentsSection.jsx

import React from "react";
import { Book } from "../components/common/Icon";
import { GROUPED_DOCUMENTS } from "../constants";

const DocumentsSection = ({ addToCart }) => {
  return (
    <section
      id="documents"
      className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
            📄 TÀI LIỆU HỌC TẬP
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Tài liệu ôn thi từng môn
          </h2>
          <p className="text-gray-600 text-lg">
            Tài liệu chi tiết, chuẩn bị tốt nhất cho mọi kỳ thi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.keys(GROUPED_DOCUMENTS).map((semester, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-4 border-transparent hover:border-blue-400"
            >
              <h3 className="text-3xl font-extrabold text-blue-600 mb-6 border-b pb-3">
                {semester}
              </h3>
              <div className="space-y-4">
                {GROUPED_DOCUMENTS[semester].map((doc, cidx) => (
                  <div
                    key={cidx}
                    className="bg-gray-50 p-4 rounded-xl flex justify-between items-center shadow-sm hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <Book className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <span className="font-semibold text-gray-800">
                        {doc.code}
                      </span>
                      <span className="text-sm text-gray-600 hidden md:inline">
                        ({doc.name})
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        addToCart({
                          id: `doc-${doc.code}`,
                          name: `Tài liệu: ${doc.code} - ${doc.name}`,
                          code: doc.code,
                          price: doc.price,
                          type: "document",
                        })
                      }
                      className="bg-purple-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-purple-700 transition font-semibold flex-shrink-0"
                    >
                      {doc.price.toLocaleString()}đ
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <h4 className="text-2xl font-bold text-gray-800 mb-4">Xem Tài liệu mẫu</h4>
          <a
            href="https://docs.google.com/document/d/1THKvW20D4o-bPxCyrillclf1R5Z_29Os5EpOX6G--dw/edit?tab=t.0"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition transform hover:scale-105 shadow-lg"
          >
            📖 Xem Demo Tài Liệu
          </a>
        </div>
      </div>
    </section>
  );
};

export default DocumentsSection;