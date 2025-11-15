const express = require("express");
const cors = require("cors");
// ⚠️ THAY THẾ MYSQL BẰNG PG (POSTGRESQL)
const { Pool } = require("pg");
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

// ⚙️ CẤU HÌNH KẾT NỐI POSTGRESQL (Dùng DATABASE_URL của Render)
let dbPool;
try {
  // Ưu tiên dùng DATABASE_URL để đơn giản hóa deploy trên Render
  dbPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // BẮT BUỘC cho Render: Cấu hình SSL
    ssl: {
      rejectUnauthorized: false,
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  console.log("✅ PostgreSQL Pool created successfully");

  dbPool
    .connect()
    .then((client) => {
      console.log("🚀 Connected to PostgreSQL database!");
      client.release();
    })
    .catch((err) => {
      console.error(
        "❌ Failed to connect to PostgreSQL database:",
        err.message
      );
      process.exit(1);
    });
} catch (error) {
  console.error("❌ PostgreSQL setup error:", error.message);
  process.exit(1);
}

// ===================== HÀM HỖ TRỢ QUERY CHO POSTGRESQL =====================

/**
 * Hàm thực thi SELECT query và trả về mảng rows.
 * @param {string} sql - Câu lệnh SQL (dùng $1, $2, ...)
 * @param {Array<any>} params - Mảng tham số
 * @returns {Promise<Array<any>>}
 */
async function query(sql, params = []) {
  const client = await dbPool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Hàm thực thi INSERT/UPDATE/DELETE.
 * @param {string} sql - Câu lệnh SQL (dùng $1, $2, ...)
 * @param {Array<any>} params - Mảng tham số
 * @returns {Promise<{affectedRows: number, insertId: number|null}>}
 */
async function execute(sql, params = []) {
  const client = await dbPool.connect();
  try {
    const result = await client.query(sql, params);
    // Lấy ID vừa insert nếu có (cần thêm RETURNING id trong SQL)
    const insertId = result.rows[0] ? result.rows[0].id : null;
    return { affectedRows: result.rowCount, insertId };
  } finally {
    client.release();
  }
}

// ===================== BIẾN VÀ DỮ LIỆU CỐ ĐỊNH =====================

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "tuan0112";
console.log("📌 Admin Credentials Loaded:");
console.log("   Email:", ADMIN_EMAIL);
console.log(
  "   Password:",
  ADMIN_PASSWORD ? "***" + ADMIN_PASSWORD.slice(-4) : "NOT SET"
);

// COUPON DATA
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

// ===================== ADMIN ROUTES =====================

// Đăng nhập admin
app.post("/api/admin/login", (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔎 Admin login attempt:");
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

// Middleware kiểm tra admin token
const checkAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Không có quyền truy cập! (Missing token)",
    });
  }

  const token = authHeader.replace("Bearer ", "");
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

// Xóa người dùng (admin only)
app.delete("/api/admin/users/:id", checkAdminAuth, async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "ID người dùng không hợp lệ!",
      });
    }

    // 1. Kiểm tra tồn tại và đếm số đơn hàng cần xóa (dùng $1)
    const userOrders = await query(
      'SELECT COUNT(id) as count FROM orders WHERE "userId" = $1',
      [userId]
    );

    const deletedOrdersCount = userOrders[0].count;

    // 2. Xóa người dùng (dùng $1)
    const deleteResult = await execute("DELETE FROM users WHERE id = $1", [
      userId,
    ]);

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
app.get("/api/admin/stats", checkAdminAuth, async (req, res) => {
  try {
    // 1. Lấy tổng đơn hàng
    const totalOrdersResult = await query(
      "SELECT COUNT(id) AS count FROM orders"
    );
    const totalOrders = totalOrdersResult[0].count;

    // 2. Lấy tổng doanh thu (chỉ các đơn đã hoàn thành)
    const totalRevenueResult = await query(
      "SELECT SUM(total) AS sum FROM orders WHERE status = 'completed'"
    );
    const totalRevenue = Number(totalRevenueResult[0].sum) || 0;

    // 3. Lấy tổng người dùng
    const totalUsersResult = await query(
      "SELECT COUNT(id) AS count FROM users"
    );
    const totalUsers = totalUsersResult[0].count;

    // 4. Lấy đơn chờ xử lý
    const pendingOrdersResult = await query(
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

// Lấy thống kê theo tháng
app.get("/api/admin/monthly-stats", checkAdminAuth, async (req, res) => {
  try {
    // ⚠️ Thay thế DATE_FORMAT bằng TO_CHAR và dùng dấu nháy kép cho "createdAt"
    const monthlyStatsResult = await query(`
            SELECT 
                TO_CHAR("createdAt", 'YYYY-MM') AS month,
                SUM(total) AS "totalRevenue",
                COUNT(id) AS "totalOrders"
            FROM 
                orders 
            WHERE 
                status = 'completed'
            GROUP BY 
                month
            ORDER BY 
                month DESC; 
        `);

    const monthlyStats = monthlyStatsResult.map((stat) => ({
      month: stat.month,
      totalRevenue: Number(stat.totalRevenue) || 0,
      totalOrders: Number(stat.totalOrders) || 0,
    }));

    res.json({
      success: true,
      monthlyStats: monthlyStats,
    });
  } catch (error) {
    console.error("Admin monthly stats error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê doanh thu theo tháng!",
    });
  }
});

// Lấy thống kê theo ngày
app.get("/api/admin/daily-stats", checkAdminAuth, async (req, res) => {
  try {
    // ⚠️ Thay thế DATE(createdAt) bằng DATE("createdAt")
    const dailyStatsResult = await query(`
            SELECT 
                DATE("createdAt") AS date,
                SUM(total) AS "totalRevenue",
                COUNT(id) AS "totalOrders"
            FROM 
                orders 
            WHERE 
                status = 'completed'
            GROUP BY 
                DATE("createdAt")
            ORDER BY 
                date DESC
            LIMIT 30;
        `);

    const dailyStats = dailyStatsResult.map((stat) => ({
      date: stat.date,
      totalRevenue: Number(stat.totalRevenue) || 0,
      totalOrders: Number(stat.totalOrders) || 0,
    }));

    res.json({
      success: true,
      dailyStats: dailyStats,
    });
  } catch (error) {
    console.error("Admin daily stats error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê doanh thu theo ngày!",
    });
  }
});

// Xóa đơn hàng (admin only)
app.delete("/api/admin/orders/:id", checkAdminAuth, async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "ID đơn hàng không hợp lệ!",
      });
    }

    // ⚠️ Dùng $1
    const deleteResult = await execute("DELETE FROM orders WHERE id = $1", [
      orderId,
    ]);

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
    // ⚠️ Dùng dấu nháy kép cho các cột tên hỗn hợp
    const allOrders = await query(
      'SELECT id, "userId", items, "customerName", "customerPhone", "customerEmail", "customerNote", total, status, "createdAt" FROM orders ORDER BY "createdAt" DESC'
    );

    const formattedOrders = allOrders.map((order) => ({
      id: order.id,
      userId: order.userId,
      // items đã được pg parse tự động
      items: order.items || [],
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

// Lấy tất cả users (admin only)
app.get("/api/admin/users", checkAdminAuth, async (req, res) => {
  try {
    // ⚠️ Dùng dấu nháy kép
    const safeUsers = await query(
      'SELECT id, name, email, phone, "createdAt", "totalSpent", "orderCount" FROM users ORDER BY "createdAt" DESC'
    );

    const formattedUsers = safeUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      createdAt: u.createdAt,
      totalSpent: Number(u.totalSpent) || 0,
      orderCount: Number(u.orderCount) || 0,
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

    // 1. Cập nhật trạng thái (dùng $1, $2)
    const updateResult = await execute(
      "UPDATE orders SET status = $1 WHERE id = $2",
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
      // a. Lấy thông tin đơn hàng vừa cập nhật (dùng dấu nháy kép)
      const orders = await query(
        'SELECT "userId", total FROM orders WHERE id = $1',
        [orderId]
      );
      const order = orders[0];

      if (order) {
        const userId = order.userId;

        // b. Tính toán lại tổng chi tiêu và số đơn hoàn thành của user (dùng dấu nháy kép)
        const stats = await query(
          'SELECT COUNT(id) AS "orderCount", SUM(total) AS "totalSpent" FROM orders WHERE "userId" = $1 AND status = \'completed\'',
          [userId]
        );
        const { orderCount, totalSpent } = stats[0];

        // c. Cập nhật lại user (dùng dấu nháy kép)
        await execute(
          'UPDATE users SET "totalSpent" = $1, "orderCount" = $2 WHERE id = $3',
          [Number(totalSpent) || 0, Number(orderCount) || 0, userId]
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
        "Cập nhật trạng thái đơn hàng và thông tin người dùng thành công!",
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

    // ⚠️ Dùng $1 và dấu nháy kép
    const userOrders = await query(
      'SELECT id, "userId", items, "customerName", "customerPhone", "customerEmail", "customerNote", total, status, "createdAt" FROM orders WHERE "userId" = $1 ORDER BY "createdAt" DESC',
      [userId]
    );

    const formattedOrders = userOrders.map((order) => ({
      id: order.id,
      userId: order.userId,
      items: order.items || [],
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

// Đăng ký user
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // 1. Kiểm tra email đã tồn tại (dùng $1)
    const existingUsers = await query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email đã được sử dụng!",
      });
    }

    // 2. Tạo user mới
    // ⚠️ BẮT BUỘC dùng RETURNING id để lấy ID vừa tạo
    const result = await execute(
      'INSERT INTO users (name, email, password, phone, "totalSpent", "orderCount") VALUES ($1, $2, $3, $4, 0, 0) RETURNING id',
      [name, email, password, phone]
    );

    const newUserId = result.insertId;

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công!",
      user: { id: newUserId, name, email, phone },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server!",
    });
  }
});

// Đăng nhập user
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ⚠️ Dùng $1, $2
    const users = await query(
      "SELECT id, name, email, phone FROM users WHERE email = $1 AND password = $2",
      [email, password]
    );

    const user = users[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng!",
      });
    }

    res.json({
      success: true,
      message: "Đăng nhập thành công!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
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
    } = req.body;

    const newOrderId = Date.now();
    // PostgreSQL (pg) có thể tự xử lý object/array thành JSONB,
    // nhưng JSON.stringify vẫn là cách an toàn nhất khi truyền vào params.
    const itemsJson = JSON.stringify(items);

    // 1. CHÈN ĐƠN HÀNG VÀO BẢNG ORDERS (Dùng $1 đến $10 và dấu nháy kép)
    // Thêm cột "createdAt" với giá trị NOW() nếu bạn không truyền vào
    await execute(
      'INSERT INTO orders (id, "userId", items, "customerName", "customerPhone", "customerEmail", "customerNote", total, status, "discountAmount", "couponCode", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, \'pending\', $9, $10, NOW())',
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

    // 2. CẬP NHẬT CỘT PHONE CHO USER
    if (customerInfo.phone) {
      await execute(
        "UPDATE users SET phone = $1 WHERE id = $2 AND (phone IS NULL OR phone = '')",
        [customerInfo.phone, userId]
      );
      console.log(`✅ Cập nhật SĐT cho User #${userId}: ${customerInfo.phone}`);
    }

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

// ===================== HEALTH CHECK =====================

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  // PORT được lấy từ biến môi trường
  console.log(`📧 Email: ${process.env.EMAIL_USER}`);
  console.log(`📌 Admin Email: ${ADMIN_EMAIL}`);
});
