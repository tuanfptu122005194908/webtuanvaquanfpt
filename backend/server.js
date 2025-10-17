const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt"); // 🔥 FIX: Imported bcrypt correctly at the top
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());

// 🚀 CẤU HÌNH KẾT NỐI MYSQL
let dbPool;
try {
  dbPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  console.log("✅ MySQL Pool created successfully");

  dbPool
    .getConnection()
    .then((connection) => {
      console.log("🚀 Connected to MySQL database!");
      connection.release();
    })
    .catch((err) => {
      console.error("❌ Failed to connect to MySQL database:", err.message);
      process.exit(1);
    });
} catch (error) {
  console.error("❌ MySQL setup error:", error.message);
  process.exit(1);
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "tuan0112";

console.log("🔐 Admin Credentials Loaded:");
console.log("   Email:", ADMIN_EMAIL);
console.log(
  "   Password:",
  ADMIN_PASSWORD ? "***" + ADMIN_PASSWORD.slice(-4) : "NOT SET"
);

// ===================== COUPON DATA =====================
const COUPONS = [
  { code: "TQ10-CHILL", discount: 10000 },
  { code: "TQ20-VUIVE", discount: 20000 },
  { code: "TQ30-XINCHAO", discount: 30000 },
  { code: "TQ40-TUANQ", discount: 40000 },
  { code: "TQ50-LIXI", discount: 50000 },
  { code: "TQ60-MEMEME", discount: 60000 },
  { code: "TQ70-MUAHE", discount: 70000 },
  { code: "TQ80-ZUIZUI", discount: 80000 },
  { code: "TQ90-DANGCAP", discount: 90000 },
  { code: "TQ100-QUADINH", discount: 100000 },
];

// ===================== HELPER FUNCTIONS =====================

/**
 * Hàm giúp parse JSON an toàn cho các trường 'items' của orders.
 */
const safeParseJson = (jsonString, defaultValue = []) => {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("JSON parse error:", e.message);
    return defaultValue;
  }
};

// ===================== ADMIN MIDDLEWARE =====================

const checkAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Không có quyền truy cập! (Missing token)",
    });
  }

  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Không có quyền truy cập! (Invalid format)",
    });
  }

  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    if (decoded.startsWith(ADMIN_EMAIL + ":")) {
      next();
    } else {
      res.status(401).json({
        success: false,
        message: "Token không hợp lệ!",
      });
    }
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token không hợp lệ!",
    });
  }
};

// ===================== ADMIN AUTH ROUTE =====================

app.post("/api/admin/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminToken = Buffer.from(`${email}:${Date.now()}`).toString(
        "base64"
      );
      res.json({
        success: true,
        message: "Đăng nhập admin thành công!",
        token: adminToken,
        admin: { email: ADMIN_EMAIL, role: "admin" },
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu admin không đúng!",
      });
    }
  } catch (error) {
    console.error("❌ Admin login error:", error);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
});

// ===================== ADMIN DASHBOARD ROUTES =====================

// Lấy thống kê
app.get("/api/admin/stats", checkAdminAuth, async (req, res) => {
  try {
    const [totalOrdersResult] = await dbPool.query(
      "SELECT COUNT(id) AS count FROM orders"
    );
    const totalOrders = totalOrdersResult[0].count;

    const [totalRevenueResult] = await dbPool.query(
      "SELECT SUM(total) AS sum FROM orders WHERE status = 'completed'"
    );
    const totalRevenue = Number(totalRevenueResult[0].sum) || 0;

    const [totalUsersResult] = await dbPool.query(
      "SELECT COUNT(id) AS count FROM users"
    );
    const totalUsers = totalUsersResult[0].count;

    const [pendingOrdersResult] = await dbPool.query(
      "SELECT COUNT(id) AS count FROM orders WHERE status = 'pending'"
    );
    const pendingOrders = pendingOrdersResult[0].count;

    res.json({
      success: true,
      stats: { totalOrders, totalRevenue, totalUsers, pendingOrders },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ success: false, message: "Lỗi khi lấy thống kê!" });
  }
});

// Quản lý Đơn hàng
app.get("/api/admin/orders", checkAdminAuth, async (req, res) => {
  try {
    const [allOrders] = await dbPool.query(
      "SELECT id, userId, items, customerName, customerPhone, customerEmail, customerNote, total, status, createdAt FROM orders ORDER BY createdAt DESC"
    );

    const formattedOrders = allOrders.map((order) => ({
      id: order.id,
      userId: order.userId,
      items: safeParseJson(order.items), // Sử dụng helper
      customerInfo: {
        name: order.customerName,
        phone: order.customerPhone,
        email: order.customerEmail,
        note: order.customerNote,
      },
      total: Number(order.total),
      status: order.status,
      createdAt: order.createdAt,
    }));

    res.json({ success: true, orders: formattedOrders });
  } catch (error) {
    console.error("Admin get orders error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi lấy danh sách đơn hàng!" });
  }
});

app.patch("/api/admin/orders/:id", checkAdminAuth, async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body; // Cập nhật trạng thái

    const [updateResult] = await dbPool.query(
      "UPDATE orders SET status = ? WHERE id = ?",
      [status, orderId]
    );

    if (updateResult.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng!" });
    } // Cập nhật thông tin User nếu status là 'completed'

    if (status === "completed") {
      const [orders] = await dbPool.query(
        "SELECT userId FROM orders WHERE id = ?",
        [orderId]
      );
      const userId = orders[0]?.userId;

      if (userId) {
        const [stats] = await dbPool.query(
          "SELECT COUNT(id) AS orderCount, SUM(total) AS totalSpent FROM orders WHERE userId = ? AND status = 'completed'",
          [userId]
        );
        const { orderCount, totalSpent } = stats[0];

        await dbPool.query(
          "UPDATE users SET totalSpent = ?, orderCount = ? WHERE id = ?",
          [Number(totalSpent) || 0, orderCount, userId]
        );
      }
    }

    res.json({
      success: true,
      message: "Cập nhật trạng thái thành công!",
      order: { id: orderId, status },
    });
  } catch (error) {
    console.error("❌ Update order error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi cập nhật đơn hàng!" });
  }
});

app.delete("/api/admin/orders/:id", checkAdminAuth, async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const [deleteResult] = await dbPool.query(
      "DELETE FROM orders WHERE id = ?",
      [orderId]
    );

    if (deleteResult.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng!" });
    }

    console.log(`✅ Đơn hàng #${orderId} đã bị xóa bởi admin`);
    res.json({
      success: true,
      message: "Xóa đơn hàng thành công!",
      deletedOrder: { id: orderId },
    });
  } catch (error) {
    console.error("❌ Delete order error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa đơn hàng!",
      error: error.message,
    });
  }
});

// Quản lý Người dùng
app.get("/api/admin/users", checkAdminAuth, async (req, res) => {
  try {
    const [safeUsers] = await dbPool.query(
      "SELECT id, name, email, createdAt, totalSpent, orderCount FROM users ORDER BY createdAt DESC"
    );

    const formattedUsers = safeUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt,
      totalSpent: Number(u.totalSpent) || 0,
      orderCount: u.orderCount || 0,
    }));

    res.json({ success: true, users: formattedUsers });
  } catch (error) {
    console.error("Admin get users error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi lấy danh sách người dùng!" });
  }
});

app.delete("/api/admin/users/:id", checkAdminAuth, async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (isNaN(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "ID người dùng không hợp lệ!" });
    } // Đếm số đơn hàng cần xóa

    const [userOrders] = await dbPool.query(
      "SELECT COUNT(id) as count FROM orders WHERE userId = ?",
      [userId]
    );
    const deletedOrdersCount = userOrders[0].count; // Xóa người dùng (Orders sẽ tự động xóa nhờ ON DELETE CASCADE nếu bạn đã thiết lập)

    const [deleteResult] = await dbPool.query(
      "DELETE FROM users WHERE id = ?",
      [userId]
    );

    if (deleteResult.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng!" });
    }

    console.log(
      `✅ Người dùng #${userId} đã bị xóa. Xóa ${deletedOrdersCount} đơn hàng liên quan.`
    );

    res.json({
      success: true,
      message: "Xóa người dùng thành công!",
      deletedOrdersCount: deletedOrdersCount,
    });
  } catch (error) {
    console.error("❌ Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa người dùng!",
      error: error.message,
    });
  }
});

// ===================== CLIENT API (Courses, Services, Docs) =====================

/** Lấy TẤT CẢ Khóa học */
app.get("/api/courses", async (req, res) => {
  try {
    const [courses] = await dbPool.query(
      "SELECT id, code, name, description, price, img, bgImg FROM courses ORDER BY code ASC"
    );
    res.json({ success: true, courses });
  } catch (error) {
    console.error("Get courses error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi lấy danh sách khóa học!" });
  }
});

/** Lấy TẤT CẢ Dịch vụ Tiếng Anh */
app.get("/api/english-services", async (req, res) => {
  try {
    const [services] = await dbPool.query(
      "SELECT id, code, name, services, price, icon, img, bgImg FROM english_services ORDER BY price DESC"
    );

    const formattedServices = services.map((service) => ({
      ...service,
      services: safeParseJson(
        service.services,
        service.services ? [service.services] : []
      ), // Chuyển JSON string services thành mảng
      price: Number(service.price),
    }));

    res.json({ success: true, services: formattedServices });
  } catch (error) {
    console.error("Get english services error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách dịch vụ tiếng Anh!",
    });
  }
});

/** Lấy TẤT CẢ Tài liệu */
app.get("/api/documents", async (req, res) => {
  try {
    const [documents] = await dbPool.query(
      "SELECT id, code, name, price, semester, img FROM documents ORDER BY semester, code ASC"
    );

    const formattedDocuments = documents.map((doc) => ({
      ...doc,
      price: Number(doc.price),
    }));

    res.json({ success: true, documents: formattedDocuments });
  } catch (error) {
    console.error("Get documents error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi lấy danh sách tài liệu!" });
  }
});

// ===================== ADMIN CRUD ROUTES (NEW) =====================

// --- COURSES CRUD ---

app.post("/api/admin/courses", checkAdminAuth, async (req, res) => {
  try {
    const { code, name, description, price, img, bgImg } = req.body;
    if (!code || !name || !price) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin bắt buộc (Code, Name, Price)!",
      });
    }

    const finalDescription = description || null;
    const finalImg = img || null;
    const finalBgImg = bgImg || null;

    const [result] = await dbPool.query(
      "INSERT INTO courses (code, name, description, price, img, bgImg) VALUES (?, ?, ?, ?, ?, ?)",
      [code, name, finalDescription, price, finalImg, finalBgImg] // Đã sửa
    );
    res.status(201).json({
      success: true,
      message: "Thêm khóa học thành công!",
      courseId: result.insertId,
    });
  } catch (error) {
    console.error("Admin add course error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi thêm khóa học! (Có thể Code đã tồn tại)",
    });
  }
});

app.put("/api/admin/courses/:id", checkAdminAuth, async (req, res) => {
  try {
    const courseId = Number(req.params.id);
    const { code, name, description, price, img, bgImg } = req.body;
    if (!code || !name || !price) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin bắt buộc!",
      });
    }
    const finalDescription = description || null;
    const finalImg = img || null;
    const finalBgImg = bgImg || null;

    const [result] = await dbPool.query(
      "UPDATE courses SET code = ?, name = ?, description = ?, price = ?, img = ?, bgImg = ? WHERE id = ?",
      [code, name, finalDescription, price, finalImg, finalBgImg, courseId] // Đã sửa
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy khóa học!" });
    }

    res.json({ success: true, message: "Cập nhật khóa học thành công!" });
  } catch (error) {
    console.error("Admin update course error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật khóa học! (Có thể Code bị trùng)",
    });
  }
});

app.delete("/api/admin/courses/:id", checkAdminAuth, async (req, res) => {
  try {
    const courseId = Number(req.params.id);
    const [result] = await dbPool.query("DELETE FROM courses WHERE id = ?", [
      courseId,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy khóa học!" });
    }

    res.json({ success: true, message: "Xóa khóa học thành công!" });
  } catch (error) {
    console.error("Admin delete course error:", error);
    res.status(500).json({ success: false, message: "Lỗi khi xóa khóa học!" });
  }
});

// --- ENGLISH SERVICES CRUD ---

app.post("/api/admin/english-services", checkAdminAuth, async (req, res) => {
  try {
    const { code, name, services, price, icon, img, bgImg } = req.body;
    if (!code || !name || !price || !services) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin bắt buộc!",
      });
    }

    const servicesJson = JSON.stringify(services); // 🔥 SỬA: Xử lý giá trị null
    const finalIcon = icon || null;
    const finalImg = img || null;
    const finalBgImg = bgImg || null;

    const [result] = await dbPool.query(
      "INSERT INTO english_services (code, name, services, price, icon, img, bgImg) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        code,
        name,
        servicesJson,
        price,
        finalIcon, // Đã sửa
        finalImg, // Đã sửa
        finalBgImg, // Đã sửa
      ]
    );
    res.status(201).json({
      success: true,
      message: "Thêm dịch vụ thành công!",
      serviceId: result.insertId,
    });
  } catch (error) {
    console.error("Admin add service error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi thêm dịch vụ! (Có thể Code đã tồn tại)",
    });
  }
});

app.put("/api/admin/english-services/:id", checkAdminAuth, async (req, res) => {
  try {
    const serviceId = Number(req.params.id);
    const { code, name, services, price, icon, img, bgImg } = req.body;
    if (!code || !name || !price || !services) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin bắt buộc!",
      });
    }
    const servicesJson = JSON.stringify(services); // 🔥 SỬA: Xử lý giá trị null

    const finalIcon = icon || null;
    const finalImg = img || null;
    const finalBgImg = bgImg || null;

    const [result] = await dbPool.query(
      "UPDATE english_services SET code = ?, name = ?, services = ?, price = ?, icon = ?, img = ?, bgImg = ? WHERE id = ?",
      [
        code,
        name,
        servicesJson,
        price,
        finalIcon, // Đã sửa
        finalImg, // Đã sửa
        finalBgImg, // Đã sửa
        serviceId,
      ]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy dịch vụ!" });
    }

    res.json({ success: true, message: "Cập nhật dịch vụ thành công!" });
  } catch (error) {
    console.error("Admin update service error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật dịch vụ! (Có thể Code bị trùng)",
    });
  }
});

app.delete(
  "/api/admin/english-services/:id",
  checkAdminAuth,
  async (req, res) => {
    try {
      const serviceId = Number(req.params.id);
      const [result] = await dbPool.query(
        "DELETE FROM english_services WHERE id = ?",
        [serviceId]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy dịch vụ!" });
      }

      res.json({ success: true, message: "Xóa dịch vụ thành công!" });
    } catch (error) {
      console.error("Admin delete service error:", error);
      res.status(500).json({ success: false, message: "Lỗi khi xóa dịch vụ!" });
    }
  }
);

// --- DOCUMENTS CRUD ---

app.post("/api/admin/documents", checkAdminAuth, async (req, res) => {
  try {
    const { code, name, price, semester, img } = req.body;
    if (!code || !name || !price || !semester) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin bắt buộc!",
      });
    }
    const finalImg = img || null;

    const [result] = await dbPool.query(
      "INSERT INTO documents (code, name, price, semester, img) VALUES (?, ?, ?, ?, ?)",
      [code, name, price, semester, finalImg] // Đã sửa
    );

    res.status(201).json({
      success: true,
      message: "Thêm tài liệu thành công!",
      documentId: result.insertId,
    });
  } catch (error) {
    console.error("Admin add document error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi thêm tài liệu! (Có thể Code đã tồn tại)",
    });
  }
});

app.put("/api/admin/documents/:id", checkAdminAuth, async (req, res) => {
  try {
    const docId = Number(req.params.id);
    const { code, name, price, semester, img } = req.body;
    if (!code || !name || !price || !semester) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin bắt buộc!",
      });
    }
    const finalImg = img || null;

    const [result] = await dbPool.query(
      "UPDATE documents SET code = ?, name = ?, price = ?, semester = ?, img = ? WHERE id = ?",
      [code, name, price, semester, finalImg, docId] // Đã sửa
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tài liệu!" });
    }

    res.json({ success: true, message: "Cập nhật tài liệu thành công!" });
  } catch (error) {
    console.error("Admin update document error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật tài liệu! (Có thể Code bị trùng)",
    });
  }
});

app.delete("/api/admin/documents/:id", checkAdminAuth, async (req, res) => {
  try {
    const docId = Number(req.params.id);
    const [result] = await dbPool.query("DELETE FROM documents WHERE id = ?", [
      docId,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy tài liệu!" });
    }

    res.json({ success: true, message: "Xóa tài liệu thành công!" });
  } catch (error) {
    console.error("Admin delete document error:", error);
    res.status(500).json({ success: false, message: "Lỗi khi xóa tài liệu!" });
  }
});

// ===================== USER AUTH & ORDER ROUTES (EXISTING) =====================

app.post("/api/register", async (req, res) => {
  try {
    // ⚠️ LƯU Ý: Phải thêm const bcrypt = require('bcrypt'); vào đầu file.
    // Nếu bạn không thể làm điều đó, code này sẽ không hoạt động.
    //  const bcrypt = require("bcrypt"); // Chỉ thêm tạm thời nếu bạn không thể thêm ở đầu file

    const { name, email, password } = req.body;
    const [existingUsers] = await dbPool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existingUsers.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Email đã được sử dụng!" });
    } // 🔥 HASH MẬT KHẨU TRƯỚC KHI LƯU

    const saltRounds = 10;
    // ❌ LỖI: Dòng này sẽ crash vì bcrypt không được import ở đây
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result] = await dbPool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword] // LƯU MẬT KHẨU ĐÃ HASH
    );
    res.status(201).json({
      success: true,
      message: "Đăng ký thành công!",
      user: { id: result.insertId, name, email },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    // ⚠️ LƯU Ý: Phải thêm const bcrypt = require('bcrypt'); vào đầu file.
    // const bcrypt = require("bcrypt"); // Chỉ thêm tạm thời nếu bạn không thể thêm ở đầu file

    const { email, password } = req.body;
    const [users] = await dbPool.query(
      "SELECT id, name, email, password FROM users WHERE email = ?", // CHỈ LẤY THEO EMAIL
      [email]
    );
    const user = users[0];

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Email hoặc mật khẩu không đúng!" });
    } // 🔥 SO SÁNH MẬT KHẨU BẰNG bcrypt // ❌ LỖI: Dòng này sẽ crash vì bcrypt không được import ở đây

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Email hoặc mật khẩu không đúng!" });
    } // Nếu match thành công

    res.json({
      success: true,
      message: "Đăng nhập thành công!",
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
});
app.post("/api/orders", async (req, res) => {
  try {
    const {
      userId,
      items,
      customerInfo,
      total,
      discountAmount = 0,
      couponCode = null,
    } = req.body;
    const newOrderId = Date.now();
    const itemsJson = JSON.stringify(items);

    await dbPool.query(
      "INSERT INTO orders (id, userId, items, customerName, customerPhone, customerEmail, customerNote, total, status, discountAmount, couponCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)",
      [
        newOrderId,
        userId,
        itemsJson,
        customerInfo.name,
        customerInfo.phone,
        customerInfo.email,
        customerInfo.note,
        total,
        discountAmount,
        couponCode,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Đơn hàng đã được tạo thành công!",
      order: { id: newOrderId, ...req.body },
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ success: false, message: "Lỗi khi tạo đơn hàng!" });
  }
});

app.get("/api/users/:userId/orders", async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (isNaN(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "ID người dùng không hợp lệ!" });
    }

    const [userOrders] = await dbPool.query(
      "SELECT id, userId, items, customerName, customerPhone, customerEmail, customerNote, total, status, createdAt FROM orders WHERE userId = ? ORDER BY createdAt DESC",
      [userId]
    );

    const formattedOrders = userOrders.map((order) => ({
      id: order.id,
      userId: order.userId,
      items: safeParseJson(order.items), // Sử dụng helper
      customerInfo: {
        name: order.customerName,
        phone: order.customerPhone,
        email: order.customerEmail,
        note: order.customerNote,
      },
      total: Number(order.total),
      status: order.status,
      createdAt: order.createdAt,
    }));

    res.json({
      success: true,
      orders: formattedOrders,
      total: formattedOrders.length,
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi lấy danh sách đơn hàng!" });
  }
});

// ===================== COUPON ROUTE (EXISTING) =====================

app.post("/api/coupons/validate", (req, res) => {
  const { couponCode } = req.body;
  const codeUpper = (couponCode || "").toUpperCase();

  const coupon = COUPONS.find((c) => c.code === codeUpper);

  if (coupon) {
    res.json({
      success: true,
      discount: coupon.discount,
      message: `Áp dụng mã ${
        coupon.code
      } thành công! Giảm ${coupon.discount.toLocaleString()}đ.`,
    });
  } else {
    res.status(404).json({
      success: false,
      discount: 0,
      message: "Mã giảm giá không hợp lệ.",
    });
  }
});

// ===================== SERVER START =====================

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
