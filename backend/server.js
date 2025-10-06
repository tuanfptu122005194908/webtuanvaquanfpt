const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// In-memory database
let users = [];
let orders = [];

// ⚠️ QUAN TRỌNG: Đọc admin credentials từ .env
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "tuan0112";

console.log("🔐 Admin Credentials Loaded:");
console.log("   Email:", ADMIN_EMAIL);
console.log(
  "   Password:",
  ADMIN_PASSWORD ? "***" + ADMIN_PASSWORD.slice(-4) : "NOT SET"
);

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

// Middleware kiểm tra admin token
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

// Lấy dashboard stats
app.get("/api/admin/stats", checkAdminAuth, (req, res) => {
  try {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalUsers = users.length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;

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
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê!",
    });
  }
});

// Endpoint kiểm tra một đơn hàng cụ thể
app.get("/api/admin/orders/:id/check", checkAdminAuth, (req, res) => {
  const orderId = Number(req.params.id);
  const order = orders.find((o) => o.id === orderId);

  res.json({
    requestedId: req.params.id,
    convertedId: orderId,
    found: !!order,
    order: order || null,
    totalOrders: orders.length,
    allOrderIds: orders.map((o) => o.id),
  });
});

// Xóa đơn hàng (admin only)
app.delete("/api/admin/orders/:id", checkAdminAuth, (req, res) => {
  try {
    const orderId = Number(req.params.id);

    console.log("🔍 Delete request received:");
    console.log("   Order ID from params:", req.params.id);
    console.log("   Converted to number:", orderId);
    console.log("   Total orders in DB:", orders.length);

    if (isNaN(orderId)) {
      console.log("❌ Invalid order ID");
      return res.status(400).json({
        success: false,
        message: "ID đơn hàng không hợp lệ!",
      });
    }

    const orderIndex = orders.findIndex((o) => o.id === orderId);

    console.log("   Order index found:", orderIndex);

    if (orderIndex === -1) {
      console.log("❌ Order not found");
      console.log(
        "   Available order IDs:",
        orders.map((o) => o.id)
      );
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng!",
      });
    }

    const deletedOrder = orders[orderIndex];
    orders.splice(orderIndex, 1);

    console.log(`✅ Đơn hàng #${orderId} đã bị xóa bởi admin`);
    console.log(`   Remaining orders: ${orders.length}`);

    res.json({
      success: true,
      message: "Xóa đơn hàng thành công!",
      deletedOrder: {
        id: deletedOrder.id,
        customerName: deletedOrder.customerInfo.name,
        total: deletedOrder.total,
        status: deletedOrder.status,
      },
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
app.get("/api/admin/orders", checkAdminAuth, (req, res) => {
  try {
    res.json({
      success: true,
      orders: orders.sort((a, b) => b.id - a.id),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đơn hàng!",
    });
  }
});

// Lấy tất cả users (admin only)
app.get("/api/admin/users", checkAdminAuth, (req, res) => {
  try {
    const safeUsers = users.map((u) => {
      const userOrders = orders.filter(
        (o) => o.userId === u.id && o.status === "completed"
      );
      const totalSpent = userOrders.reduce(
        (sum, order) => sum + order.total,
        0
      );
      const orderCount = userOrders.length;

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt,
        totalSpent: totalSpent,
        orderCount: orderCount,
      };
    });

    res.json({
      success: true,
      users: safeUsers.sort((a, b) => b.id - a.id),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách người dùng!",
    });
  }
});

// Cập nhật trạng thái đơn hàng
app.patch("/api/admin/orders/:id", checkAdminAuth, (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    const orderIndex = orders.findIndex((o) => o.id === orderId);

    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng!",
      });
    }

    orders[orderIndex].status = status;

    if (status === "completed") {
      const order = orders[orderIndex];
      const userIndex = users.findIndex((u) => u.id === order.userId);

      if (userIndex !== -1) {
        const completedOrders = orders.filter(
          (o) => o.userId === order.userId && o.status === "completed"
        );

        const totalSpent = completedOrders.reduce((sum, o) => sum + o.total, 0);
        const orderCount = completedOrders.length;

        users[userIndex].totalSpent = totalSpent;
        users[userIndex].orderCount = orderCount;

        console.log(
          `✅ Cập nhật user #${
            users[userIndex].id
          }: ${orderCount} đơn, ${totalSpent.toLocaleString()}đ`
        );
      }
    }

    res.json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công!",
      order: orders[orderIndex],
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

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (users.find((u) => u.email === email)) {
      return res.status(400).json({
        success: false,
        message: "Email đã được sử dụng!",
      });
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công!",
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server!",
    });
  }
});

app.post("/api/login", (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng!",
      });
    }

    res.json({
      success: true,
      message: "Đăng nhập thành công!",
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server!",
    });
  }
});

// ===================== ORDER ROUTES =====================

app.post("/api/orders", async (req, res) => {
  try {
    const { userId, items, customerInfo, total } = req.body;

    const newOrder = {
      id: Date.now(),
      userId,
      items,
      customerInfo,
      total,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    orders.push(newOrder);

    console.log(`✅ Đơn hàng mới #${newOrder.id} đã được tạo`);
    console.log(`   Khách hàng: ${customerInfo.name}`);
    console.log(`   Tổng tiền: ${total.toLocaleString()}đ`);

    res.status(201).json({
      success: true,
      message: "Đơn hàng đã được tạo thành công!",
      order: newOrder,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo đơn hàng!",
    });
  }
});

app.get("/api/orders", (req, res) => {
  try {
    res.json({
      success: true,
      orders: orders.sort((a, b) => b.id - a.id),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đơn hàng!",
    });
  }
});

// ===================== CONTACT ROUTE =====================

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    console.log(`📧 Tin nhắn liên hệ mới:`);
    console.log(`   Từ: ${name} (${email})`);
    console.log(`   Chủ đề: ${subject}`);
    console.log(`   Nội dung: ${message}`);

    res.json({
      success: true,
      message: "Tin nhắn đã được ghi nhận! Chúng tôi sẽ phản hồi sớm.",
    });
  } catch (error) {
    console.error("Contact error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi gửi tin nhắn!",
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

// Debug endpoints
app.get("/api/debug/users", (req, res) => {
  res.json({
    totalUsers: users.length,
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt,
    })),
  });
});

app.get("/api/debug/orders", (req, res) => {
  res.json({
    totalOrders: orders.length,
    orders: orders.map((o) => ({
      id: o.id,
      userId: o.userId,
      status: o.status,
      total: o.total,
    })),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔐 Admin Email: ${ADMIN_EMAIL}`);
  console.log(`⚠️ Email service disabled - orders will be logged only`);
});
