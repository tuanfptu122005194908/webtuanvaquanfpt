// src/constants.js

import mas291 from "./assets/images/mas291.png";
import csd201 from "./assets/images/csd201.png";
import mae101 from "./assets/images/mae101.png";
import mad101 from "./assets/images/mad101.png";
import dbi202 from "./assets/images/dbi202.png";
import lab211 from "./assets/images/lab211.png";
import pro192 from "./assets/images/pro192.png";
import wed201 from "./assets/images/wed201.png";
import avt2 from "./assets/images/avt2.png"; // Giả định avt2 là ảnh đại diện chung cho dịch vụ tiếng Anh
import avt1 from "./assets/images/avt1.png"; // Giả định avt1 là ảnh đại diện chung cho dịch vụ tiếng Anh khác

// 🔥 API URL
export const API_URL = "https://webtuanvaquanfpt.onrender.com";

// 🔥 COURSE DATA
export const COURSE_DATA = [
  {
    id: 1,
    code: "MAE101",
    name: "Mathematics for Engineers",
    desc: "Môn Toán ứng dụng cho kỹ sư, cung cấp kiến thức toán học nền tảng để giải quyết các bài toán kỹ thuật.",
    price: 150000,
    img: mae101,
  },
  {
    id: 2,
    code: "MAS291",
    name: "Mathematical Statistics",
    desc: "Môn Xác suất – Thống kê, giúp sinh viên phân tích và xử lý dữ liệu, áp dụng trong CNTT và phần mềm.",
    price: 150000,
    img: mas291,
  },
  {
    id: 3,
    code: "MAD101",
    name: "Discrete Mathematics",
    desc: "Môn Toán rời rạc, trang bị tư duy logic, tập hợp, quan hệ, đồ thị, ứng dụng trong cấu trúc dữ liệu và thuật toán.",
    price: 150000,
    img: mad101,
  },
  {
    id: 4,
    code: "PRO192",
    name: "Object-Oriented Programming with Java",
    desc: "Môn Lập trình hướng đối tượng, làm quen với Java, class, object, kế thừa, đa hình.",
    price: 250000,
    img: pro192,
  },
  {
    id: 5,
    code: "LAB211",
    name: "Advanced Programming Lab",
    desc: "Môn Thực hành lập trình nâng cao, rèn luyện kỹ năng code Java thông qua bài tập và dự án nhỏ.",
    price: 250000,
    img: lab211,
  },
  {
    id: 6,
    code: "WED201",
    name: "Web Design & Development",
    desc: "Môn Phát triển Web, học HTML, CSS, JavaScript và xây dựng website cơ bản đến nâng cao.",
    price: 250000,
    img: wed201,
  },
  {
    id: 7,
    code: "DBI202",
    name: "Database Systems",
    desc: "Môn Cơ sở dữ liệu, học SQL, thiết kế và quản lý hệ thống cơ sở dữ liệu quan hệ.",
    price: 250000,
    img: dbi202,
  },
  {
    id: 8,
    code: "CSD201",
    name: "Data Structures & Algorithms",
    desc: "Môn Cấu trúc dữ liệu và giải thuật, học về mảng, danh sách, ngăn xếp, cây, đồ thị và thuật toán tìm kiếm/sắp xếp.",
    price: 250000,
    img: csd201,
  },
];

// 🔥 ENGLISH SERVICE DATA
export const ENGLISH_SERVICE_DATA = [
  {
    id: "luk-video",
    name: "Edit Video LUK",
    code: "LUK-VIDEO",
    services: [
      "Chỉnh sửa video chuyên nghiệp",
      "Thêm phụ đề, hiệu ứng",
      "Xuất file chất lượng cao",
    ],
    price: 70000,
    icon: "🎬",
    img: avt2,
    bgImg: avt2,
  },
  {
    id: "luk-script",
    name: "Làm Kịch Bản LUK",
    code: "LUK-SCRIPT",
    services: [
      "Viết kịch bản theo yêu cầu",
      "Nội dung logic, mạch lạc",
      "Phù hợp với thời lượng",
    ],
    price: 40000,
    icon: "📝",
    img: avt2,
    bgImg: avt2,
  },
  {
    id: "luk-transcript",
    name: "Làm Transcript LUK",
    code: "LUK-TRANSCRIPT",
    services: [
      "Chuyển audio thành text",
      "Định dạng chuẩn",
      "Nhanh chóng, chính xác",
    ],
    price: 10000,
    icon: "📄",
    img: avt2,
    bgImg: avt2,
  },
  {
    id: "luk-slide",
    name: "Làm Slide LUK",
    code: "LUK-SLIDE",
    services: ["Thiết kế slide đẹp mắt", "Nội dung đầy đủ", "Hỗ trợ trình bày"],
    price: 70000,
    icon: "📊",
    img: avt2,
    bgImg: avt2,
  },
  {
    id: "luk-debate",
    name: "Hỗ Trợ Debate LUK",
    code: "LUK-DEBATE",
    services: [
      "Chuẩn bị luận điểm",
      "Luyện tập tranh luận",
      "Tư vấn chiến thuật",
    ],
    price: 150000,
    icon: "🗣️",
    img: avt2,
    bgImg: avt2,
  },
  {
    id: "luk-full-check2",
    name: "Hỗ Trợ Full Check 2",
    code: "LUK-FULL",
    services: [
      "Kiểm tra toàn bộ project",
      "Đảm bảo đạt điểm cao",
      "Hỗ trợ tổng thể",
    ],
    price: 90000,
    icon: "✅",
    img: avt2,
    bgImg: avt2,
  },
  {
    id: "trans",
    name: "Học TRANS",
    code: "TRANS",
    services: [
      "Hỗ Trợ Tài Liệu Ôn Thi",
      "Đề cương chi tiết",
      "Bài tập có lời giải",
    ],
    price: 70000,
    icon: "📖",
    img: avt1,
    bgImg: avt1,
  },
];

// 🔥 DOCUMENT DATA
export const DOCUMENT_DATA = [
  // Kỳ 1
  {
    code: "SSL101",
    name: "Soft Skill Learning 1",
    price: 70000,
    semester: "Kỳ 1",
    img: mas291,
  },
  {
    code: "CEA201",
    name: "Introduction to Computer Architecture",
    price: 70000,
    semester: "Kỳ 1",
    img: mas291,
  },
  {
    code: "CSI106",
    name: "Introduction to Computer Science",
    price: 70000,
    semester: "Kỳ 1",
    img: mas291,
  },
  {
    code: "PRF192",
    name: "Programming Fundamentals",
    price: 70000,
    semester: "Kỳ 1",
    img: mas291,
  },
  {
    code: "MAE101",
    name: "Mathematics for Engineers",
    price: 70000,
    semester: "Kỳ 1",
    img: mae101,
  },

  // Kỳ 2
  {
    code: "NWC204",
    name: "Networking with Windows Server",
    price: 70000,
    semester: "Kỳ 2",
    img: lab211,
  },
  {
    code: "OSG202",
    name: "Operating Systems",
    price: 70000,
    semester: "Kỳ 2",
    img: lab211,
  },
  {
    code: "MAD101",
    name: "Discrete Mathematics",
    price: 70000,
    semester: "Kỳ 2",
    img: mad101,
  },
  {
    code: "WED201",
    name: "Web Design & Development",
    price: 70000,
    semester: "Kỳ 2",
    img: wed201,
  },
  {
    code: "PRO192",
    name: "Object-Oriented Programming with Java",
    price: 70000,
    semester: "Kỳ 2",
    img: pro192,
  },

  // Kỳ 3
  {
    code: "LAB211",
    name: "Advanced Programming Lab",
    price: 70000,
    semester: "Kỳ 3",
    img: lab211,
  },
  {
    code: "JPD113",
    name: "Japanese 1.1",
    price: 70000,
    semester: "Kỳ 3",
    img: csd201,
  },
  {
    code: "DBI202",
    name: "Database Systems",
    price: 70000,
    semester: "Kỳ 3",
    img: dbi202,
  },
  {
    code: "CSD201",
    name: "Data Structures & Algorithms",
    price: 70000,
    semester: "Kỳ 3",
    img: csd201,
  },
  {
    code: "MAS291",
    name: "Mathematical Statistics",
    price: 70000,
    semester: "Kỳ 3",
    img: mas291,
  },
];

export const GROUPED_DOCUMENTS = DOCUMENT_DATA.reduce((acc, doc) => {
  (acc[doc.semester] = acc[doc.semester] || []).push(doc);
  return acc;
}, {});
