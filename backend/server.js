const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise"); // SỬ DỤNG mysql2/promise
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Danh sách các nguồn gốc (origins) được phép truy cập
const allowedOrigins = [
  process.env.CLIENT_URL, // Ví dụ: 'https://webtuanvaquanfpt-frontend.onrender.com'
  "http://localhost:5173", // Môi trường phát triển của bạn
  "http://localhost:3000", // Cổng phát triển phổ biến khác
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Cho phép các request không có origin (như Postman hoặc mobile apps)
      if (!origin) return callback(null, true);

      // Cho phép nếu origin nằm trong danh sách
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
    port: process.env.DB_PORT, // <== SỬ DỤNG PORT
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // THÊM SSL ĐỂ ĐÁP ỨNG YÊU CẦU BẢO MẬT CỦA CÁC HOSTING CLOUD (NHƯ RAILWAY)
    ssl: {
      rejectUnauthorized: false,
    },
  });
  console.log("✅ MySQL Pool created successfully");

  // Kiểm tra kết nối
  dbPool
    .getConnection()
    .then((connection) => {
      console.log("🚀 Connected to MySQL database!");
      connection.release(); // Trả lại kết nối
    })
    .catch((err) => {
      console.error("❌ Failed to connect to MySQL database:", err.message);
      process.exit(1); // Thoát nếu không thể kết nối
    });
} catch (error) {
  console.error("❌ MySQL setup error:", error.message);
  process.exit(1);
}
// Email Transporter
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

// Verify email configuration
// transporter.verify((error, success) => {
//   if (error) {
//     console.log("❌ Email configuration error:", error);
//   } else {
//     console.log("✅ Email server is ready to send messages");
//   }
// });

// ⚠️ QUAN TRỌNG: Đọc admin credentials từ .env
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "tuan0112";

console.log("🔐 Admin Credentials Loaded:");
console.log("   Email:", ADMIN_EMAIL);
console.log(
  "   Password:",
  ADMIN_PASSWORD ? "***" + ADMIN_PASSWORD.slice(-4) : "NOT SET"
);

// server.js (Thêm gần các biến ADMIN_EMAIL/PASSWORD)

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
// =======================================================
// ===================== ADMIN ROUTES =====================

// Đăng nhập admin
app.post("/api/admin/login", (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔍 Admin login attempt:");
    console.log("   Received email:", email);
    console.log("   Expected email:", ADMIN_EMAIL);
    console.log("   Password match:", password === ADMIN_PASSWORD);

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminToken = Buffer.from(`${email}:${Date.now()}`).toString(
        "base64"
      );

      console.log("✅ Admin login successful");

      res.json({
        success: true,
        message: "Đăng nhập admin thành công!",
        token: adminToken,
        admin: { email: ADMIN_EMAIL, role: "admin" },
      });
    } else {
      console.log("❌ Admin login failed - credentials mismatch");
      res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu admin không đúng!",
      });
    }
  } catch (error) {
    console.error("❌ Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server!",
    });
  }
});

// Middleware kiểm tra admin token - IMPROVED VERSION
const checkAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("🔐 Auth check:");
  console.log("   Header:", authHeader ? "Present" : "Missing");

  if (!authHeader) {
    console.log("❌ No authorization header");
    return res.status(401).json({
      success: false,
      message: "Không có quyền truy cập! (Missing token)",
    });
  }

  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    console.log("❌ No token after Bearer");
    return res.status(401).json({
      success: false,
      message: "Không có quyền truy cập! (Invalid format)",
    });
  }

  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    console.log(
      "   Decoded token starts with:",
      decoded.substring(0, 20) + "..."
    );

    if (decoded.startsWith(ADMIN_EMAIL + ":")) {
      console.log("✅ Admin authenticated");
      next();
    } else {
      console.log("❌ Token does not match admin email");
      res.status(401).json({
        success: false,
        message: "Token không hợp lệ!",
      });
    }
  } catch (error) {
    console.log("❌ Token decode error:", error.message);
    res.status(401).json({
      success: false,
      message: "Token không hợp lệ!",
    });
  }
};
// Xóa người dùng (admin only)
// server.js (Tìm đến route app.delete("/api/admin/users/:id", ...) )

app.delete("/api/admin/users/:id", checkAdminAuth, async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "ID người dùng không hợp lệ!",
      });
    }

    // 1. Kiểm tra tồn tại và đếm số đơn hàng cần xóa
    const [userOrders] = await dbPool.query(
      "SELECT COUNT(id) as count FROM orders WHERE userId = ?",
      [userId]
    );
    const deletedOrdersCount = userOrders[0].count;

    // 2. Xóa người dùng (Orders sẽ tự động xóa nhờ ON DELETE CASCADE)
    const [deleteResult] = await dbPool.query(
      "DELETE FROM users WHERE id = ?",
      [userId]
    );

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng!",
      });
    }

    console.log(
      `✅ Người dùng #${userId} đã bị xóa bởi admin. Xóa ${deletedOrdersCount} đơn hàng liên quan.`
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
// Lấy dashboard stats
// server.js (Tìm đến route app.get("/api/admin/stats", ...) )

app.get("/api/admin/stats", checkAdminAuth, async (req, res) => {
  try {
    // 1. Lấy tổng đơn hàng
    const [totalOrdersResult] = await dbPool.query(
      "SELECT COUNT(id) AS count FROM orders"
    );
    const totalOrders = totalOrdersResult[0].count;

    // 2. Lấy tổng doanh thu (chỉ các đơn đã hoàn thành)
    const [totalRevenueResult] = await dbPool.query(
      "SELECT SUM(total) AS sum FROM orders WHERE status = 'completed'"
    );
    const totalRevenue = Number(totalRevenueResult[0].sum) || 0; // Chuyển sang Number, nếu NULL thì là 0

    // 3. Lấy tổng người dùng
    const [totalUsersResult] = await dbPool.query(
      "SELECT COUNT(id) AS count FROM users"
    );
    const totalUsers = totalUsersResult[0].count;

    // 4. Lấy đơn chờ xử lý
    const [pendingOrdersResult] = await dbPool.query(
      "SELECT COUNT(id) AS count FROM orders WHERE status = 'pending'"
    );
    const pendingOrders = pendingOrdersResult[0].count;

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue,
        totalUsers,
        pendingOrders,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê!",
    });
  }
});
// Endpoint kiểm tra một đơn hàng cụ thể
app.get("/api/admin/orders/:id/check", checkAdminAuth, async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    // Tìm đơn hàng trong MySQL
    const [orders] = await dbPool.query("SELECT * FROM orders WHERE id = ?", [
      orderId,
    ]);
    const order = orders[0];

    res.json({
      requestedId: req.params.id,
      convertedId: orderId,
      found: !!order,
      order: order || null,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi kiểm tra đơn hàng!" });
  }
});
// server.js (Khôi phục endpoint LẤY TẤT CẢ ĐƠN HÀNG)

app.get("/api/orders", checkAdminAuth, async (req, res) => {
  try {
    // 1. Lấy tất cả đơn hàng, sắp xếp mới nhất trước
    const [allOrders] = await dbPool.query(
      "SELECT id, userId, items, customerName, customerPhone, customerEmail, customerNote, total, status, createdAt FROM orders ORDER BY createdAt DESC"
    );

    const formattedOrders = allOrders.map((order) => ({
      id: order.id,
      userId: order.userId,
      items: JSON.parse(order.items), // Rất quan trọng: Chuyển JSON string thành Object
      customerInfo: {
        name: order.customerName,
        phone: order.customerPhone,
        email: order.customerEmail,
        note: order.customerNote,
      },
      total: Number(order.total), // Chuyển Decimal/String sang Number
      status: order.status,
      createdAt: order.createdAt,
    }));

    res.json({ success: true, orders: formattedOrders });
  } catch (error) {
    console.error("Get /api/orders error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đơn hàng!",
    });
  }
});

// server.js (Khôi phục endpoint LẤY ĐƠN HÀNG CỦA USER)

app.get("/api/users/:userId/orders", async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "ID người dùng không hợp lệ!",
      });
    } // 1. Lấy đơn hàng của user, sắp xếp mới nhất trước

    const [userOrders] = await dbPool.query(
      "SELECT id, userId, items, customerName, customerPhone, customerEmail, customerNote, total, status, createdAt FROM orders WHERE userId = ? ORDER BY createdAt DESC",
      [userId]
    ); // 2. Format lại dữ liệu cho frontend (chuyển JSON string thành Object)

    const formattedOrders = userOrders.map((order) => ({
      id: order.id,
      userId: order.userId,
      items: JSON.parse(order.items),
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
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đơn hàng!",
    });
  }
});
// Xóa đơn hàng (admin only) - FIXED VERSION
app.delete("/api/admin/orders/:id", checkAdminAuth, async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "ID đơn hàng không hợp lệ!",
      });
    }

    // Xóa đơn hàng khỏi MySQL
    const [deleteResult] = await dbPool.query(
      "DELETE FROM orders WHERE id = ?",
      [orderId]
    );

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng!",
      });
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
// Lấy tất cả đơn hàng (admin only)
app.get("/api/admin/orders", checkAdminAuth, async (req, res) => {
  try {
    // 1. Lấy tất cả đơn hàng, sắp xếp mới nhất trước
    const [allOrders] = await dbPool.query(
      "SELECT id, userId, items, customerName, customerPhone, customerEmail, customerNote, total, status, createdAt FROM orders ORDER BY createdAt DESC"
    );

    // 2. Format lại dữ liệu cho frontend
    const formattedOrders = allOrders.map((order) => ({
      id: order.id,
      userId: order.userId,
      items: JSON.parse(order.items),
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
    });
  } catch (error) {
    console.error("Admin get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đơn hàng!",
    });
  }
});

// Lấy tất cả users (admin only) - PHIÊN BẢN MỚI VỚI TOTALSPENT
app.get("/api/admin/users", checkAdminAuth, async (req, res) => {
  try {
    // Lấy thông tin user (đã có totalSpent và orderCount trong bảng)
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

    res.json({
      success: true,
      users: formattedUsers,
    });
  } catch (error) {
    console.error("Admin get users error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách người dùng!",
    });
  }
});

// Cập nhật trạng thái đơn hàng
app.patch("/api/admin/orders/:id", checkAdminAuth, async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;

    // 1. Cập nhật trạng thái
    const [updateResult] = await dbPool.query(
      "UPDATE orders SET status = ? WHERE id = ?",
      [status, orderId]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng!",
      });
    }

    // 2. Nếu trạng thái là 'completed', CẬP NHẬT THÔNG TIN USER
    if (status === "completed") {
      // a. Lấy thông tin đơn hàng vừa cập nhật
      const [orders] = await dbPool.query(
        "SELECT userId, total FROM orders WHERE id = ?",
        [orderId]
      );
      const order = orders[0];

      if (order) {
        const userId = order.userId;

        // b. Tính toán lại tổng chi tiêu và số đơn hoàn thành của user
        const [stats] = await dbPool.query(
          "SELECT COUNT(id) AS orderCount, SUM(total) AS totalSpent FROM orders WHERE userId = ? AND status = 'completed'",
          [userId]
        );

        const { orderCount, totalSpent } = stats[0];

        // c. Cập nhật lại user
        await dbPool.query(
          "UPDATE users SET totalSpent = ?, orderCount = ? WHERE id = ?",
          [Number(totalSpent) || 0, orderCount, userId]
        );

        console.log(
          `✅ Cập nhật user #${userId}: ${orderCount} đơn, ${Number(
            totalSpent
          ).toLocaleString()}đ`
        );
      }
    }

    res.json({
      success: true,
      message:
        "Cập nhật trạng thái đơn hàng và thông tin người dùng thành công!", // Cần lấy lại dữ liệu mới nhất để frontend cập nhật
      order: { id: orderId, status },
    });
  } catch (error) {
    console.error("❌ Update order error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật đơn hàng!",
    });
  }
});

// ===================== USER ROUTES =====================
// Lấy đơn hàng của user hiện tại
app.get("/api/users/:userId/orders", async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "ID người dùng không hợp lệ!",
      });
    }

    // 1. Lấy đơn hàng của user, sắp xếp mới nhất trước
    const [userOrders] = await dbPool.query(
      "SELECT id, userId, items, customerName, customerPhone, customerEmail, customerNote, total, status, createdAt FROM orders WHERE userId = ? ORDER BY createdAt DESC",
      [userId]
    );

    // 2. Format lại dữ liệu cho frontend (chuyển JSON string thành Object)
    const formattedOrders = userOrders.map((order) => ({
      id: order.id,
      userId: order.userId,
      // Chuyển JSON string trong cột `items` thành JavaScript object
      items: JSON.parse(order.items),
      customerInfo: {
        name: order.customerName,
        phone: order.customerPhone,
        email: order.customerEmail,
        note: order.customerNote,
      },
      total: Number(order.total), // Chuyển Decimal sang Number
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
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đơn hàng!",
    });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Kiểm tra email đã tồn tại
    const [existingUsers] = await dbPool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email đã được sử dụng!",
      });
    }

    // 2. Tạo user mới
    const [result] = await dbPool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password]
    );

    const newUserId = result.insertId;

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công!",
      user: { id: newUserId, name, email },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server!",
    });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await dbPool.query(
      "SELECT id, name, email FROM users WHERE email = ? AND password = ?",
      [email, password]
    );
    const user = users[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng!",
      });
    }

    // 🔥 LOGIC THÀNH CÔNG BỊ THIẾU
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
// ===================== ORDER ROUTES =====================

app.post("/api/orders", async (req, res) => {
  try {
    const {
      userId,
      items,
      customerInfo,
      total,
      discountAmount = 0,
      couponCode = null,
    } = req.body; // <-- NHẬN DỮ LIỆU MỚI

    const newOrderId = Date.now();
    const itemsJson = JSON.stringify(items); // 2. Chèn đơn hàng (Thêm 2 cột mới vào truy vấn)

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
        discountAmount, // <-- Cột mới
        couponCode, // <-- Cột mới
      ]
    );

    res.status(201).json({
      success: true,
      message: "Đơn hàng đã được tạo thành công!",
      order: { id: newOrderId, ...req.body },
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo đơn hàng!",
    });
  }
});

app.get("/api/orders", checkAdminAuth, async (req, res) => {
  try {
    // 1. Lấy tất cả đơn hàng, sắp xếp mới nhất trước
    const [allOrders] = await dbPool.query(
      "SELECT id, userId, items, customerName, customerPhone, customerEmail, customerNote, total, status, createdAt FROM orders ORDER BY createdAt DESC"
    ); // 2. THÊM LOGIC FORMAT DỮ LIỆU

    const formattedOrders = allOrders.map((order) => ({
      id: order.id,
      userId: order.userId,
      items: JSON.parse(order.items), // Rất quan trọng: Chuyển JSON string thành Object
      customerInfo: {
        name: order.customerName,
        phone: order.customerPhone,
        email: order.customerEmail,
        note: order.customerNote,
      },
      total: Number(order.total), // Chuyển Decimal/String sang Number
      status: order.status,
      createdAt: order.createdAt,
    }));

    res.json({ success: true, orders: formattedOrders });
  } catch (error) {
    console.error("Get /api/orders error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đơn hàng!",
    });
  }
});

// ===================== CONTACT ROUTE =====================

// app.post("/api/contact", async (req, res) => {
//   try {
//     const { name, email, subject, message } = req.body;

//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
//       subject: `📧 Tin nhắn liên hệ: ${subject}`,
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2>📧 Tin nhắn liên hệ mới</h2>
//           <div style="background: #F3F4F6; padding: 20px; border-radius: 8px;">
//             <p><strong>Từ:</strong> ${name}</p>
//             <p><strong>Email:</strong> ${email}</p>
//             <p><strong>Chủ đề:</strong> ${subject}</p>
//           </div>
//           <div style="margin: 20px 0; padding: 20px; background: white; border-left: 4px solid #4F46E5;">
//             <h3>Nội dung:</h3>
//             <p>${message}</p>
//           </div>
//         </div>
//       `,
//     });

//     res.json({
//       success: true,
//       message: "Tin nhắn đã được gửi thành công!",
//     });
//   } catch (error) {
//     console.error("Contact error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Lỗi khi gửi tin nhắn!",
//     });
//   }
// });

// ===================== HEALTH CHECK =====================

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});
// server.js (Thêm route này vào cuối file, trước app.listen)

// ===================== COUPON ROUTES =====================

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
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📧 Email: ${process.env.EMAIL_USER}`);
  console.log(`🔐 Admin Email: ${ADMIN_EMAIL}`);
});
