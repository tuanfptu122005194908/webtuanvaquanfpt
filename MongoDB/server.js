const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ===================== MONGODB CONNECTION =====================
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/tuanquan", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ===================== MONGOOSE SCHEMAS =====================

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
});

// Order Schema
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [
    {
      id: String,
      name: String,
      code: String,
      price: Number,
      quantity: Number,
      type: String,
    },
  ],
  customerInfo: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    note: String,
  },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "cancelled"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  completedAt: Date,
});

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ["new", "replied", "closed"],
    default: "new",
  },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Order = mongoose.model("Order", orderSchema);
const Contact = mongoose.model("Contact", contactSchema);

// ===================== EMAIL CONFIGURATION =====================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Email configuration error:", error);
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

// ===================== USER ROUTES =====================

// Đăng ký người dùng
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã được sử dụng!",
      });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    // Gửi email cho admin
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: "🎉 Người dùng mới đăng ký - Học cùng Tuấn và Quân",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">👤 Người dùng mới đăng ký</h2>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px;">
            <p><strong>Tên:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Thời gian:</strong> ${new Date().toLocaleString(
              "vi-VN"
            )}</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(adminMailOptions);

    // Gửi email chào mừng
    const welcomeMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Chào mừng đến với Học cùng Tuấn và Quân! 🎓",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Xin chào ${name}! 👋</h2>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>Học cùng Tuấn và Quân</strong>.</p>
        </div>
      `,
    };

    await transporter.sendMail(welcomeMailOptions);

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công!",
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại!",
    });
  }
});

// Đăng nhập người dùng
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng!",
      });
    }

    res.json({
      success: true,
      message: "Đăng nhập thành công!",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại!",
    });
  }
});

// ===================== ORDER ROUTES =====================

// Tạo đơn hàng mới
app.post("/api/orders", async (req, res) => {
  try {
    const { userId, items, customerInfo, total } = req.body;

    const newOrder = new Order({
      userId,
      items,
      customerInfo,
      total,
      status: "pending",
    });

    await newOrder.save();

    // Cập nhật thông tin user nếu có userId
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $inc: { totalOrders: 1, totalSpent: total },
      });
    }

    // Format danh sách sản phẩm
    const itemsList = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #E5E7EB;">
          ${item.name} ${item.code ? `(${item.code})` : ""}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; text-align: right;">
          ${item.price.toLocaleString()}đ
        </td>
      </tr>
    `
      )
      .join("");

    // Gửi email cho admin
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `🛒 Đơn hàng mới #${newOrder._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🎉 Đơn hàng mới #${newOrder._id}</h2>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>👤 Thông tin khách hàng</h3>
            <p><strong>Tên:</strong> ${customerInfo.name}</p>
            <p><strong>Số điện thoại:</strong> ${customerInfo.phone}</p>
            <p><strong>Email:</strong> ${customerInfo.email}</p>
            ${
              customerInfo.note
                ? `<p><strong>Ghi chú:</strong> ${customerInfo.note}</p>`
                : ""
            }
          </div>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>🛍️ Sản phẩm</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tbody>${itemsList}</tbody>
              <tfoot>
                <tr style="background: #DBEAFE;">
                  <td style="padding: 10px; font-weight: bold;">TỔNG CỘNG</td>
                  <td style="padding: 10px; text-align: right; font-weight: bold;">
                    ${total.toLocaleString()}đ
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      `,
    });

    // Gửi email cho khách hàng
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: customerInfo.email,
      subject: `Xác nhận đơn hàng #${newOrder._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Cảm ơn bạn đã đặt hàng! 🎉</h2>
          <p>Xin chào <strong>${customerInfo.name}</strong>,</p>
          <p>Đơn hàng của bạn đã được ghi nhận thành công!</p>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Mã đơn:</strong> #${newOrder._id}</p>
            <p><strong>Tổng tiền:</strong> ${total.toLocaleString()}đ</p>
          </div>
          <p>Chúng tôi sẽ liên hệ với bạn sớm nhất!</p>
        </div>
      `,
    });

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

// Lấy danh sách đơn hàng
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đơn hàng!",
    });
  }
});

// Cập nhật trạng thái đơn hàng
app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      {
        status,
        ...(status === "completed" ? { completedAt: new Date() } : {}),
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Cập nhật trạng thái thành công!",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật trạng thái!",
    });
  }
});

// ===================== STATISTICS ROUTES =====================

// Thống kê tổng quan
app.get("/api/statistics/overview", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $in: ["completed", "processing"] } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const completedOrders = await Order.countDocuments({ status: "completed" });

    res.json({
      success: true,
      statistics: {
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders,
        completedOrders,
      },
    });
  } catch (error) {
    console.error("Statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê!",
    });
  }
});

// Thống kê doanh thu theo thời gian
app.get("/api/statistics/revenue", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = {
      status: { $in: ["completed", "processing"] },
    };

    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const revenue = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          totalRevenue: { $sum: "$total" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    res.json({
      success: true,
      revenue,
    });
  } catch (error) {
    console.error("Revenue statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê doanh thu!",
    });
  }
});

// Thống kê sản phẩm bán chạy
app.get("/api/statistics/products", async (req, res) => {
  try {
    const products = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalSold: { $sum: 1 },
          totalRevenue: { $sum: "$items.price" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Product statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê sản phẩm!",
    });
  }
});

// ===================== CONTACT ROUTE =====================

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const newContact = new Contact({ name, email, subject, message });
    await newContact.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `📧 Tin nhắn liên hệ: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>📧 Tin nhắn liên hệ mới</h2>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px;">
            <p><strong>Từ:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Chủ đề:</strong> ${subject}</p>
          </div>
          <div style="margin: 20px 0; padding: 20px; background: white; border-left: 4px solid #4F46E5;">
            <h3>Nội dung:</h3>
            <p>${message}</p>
          </div>
        </div>
      `,
    });

    res.json({
      success: true,
      message: "Tin nhắn đã được gửi thành công!",
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
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📧 Email: ${process.env.EMAIL_USER}`);
  console.log(
    `💾 Database: ${
      mongoose.connection.readyState === 1 ? "Connected" : "Connecting..."
    }`
  );
});
