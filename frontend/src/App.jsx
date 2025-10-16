import React, { useState, useEffect } from "react";
import mas291 from "./mas291.png";
import csd201 from "./csd201.png";
import mae101 from "./mae101.png";
import mad101 from "./mad101.png";
import dbi202 from "./dbi202.png";
import lab211 from "./lab211.png";
import pro192 from "./pro192.png";
import wed201 from "./wed201.png";
import QR from "./QR.png";
import avt from "./avt.png";
import avt2 from "./avt2.png";
import avt1 from "./avt1.png"; 
import {
  ShoppingCart,
  LogOut,
  Menu,
  X,
  Book,
  CheckCircle,
  BarChart3,
  Users,
  ShoppingBag,
  DollarSign,
  RefreshCw,
  Clock,
  XCircle,
  Package,
  Mail,
  Phone,
  Calendar,
  Award,
  Facebook,Info,
  AlertTriangle,
  Check,
} from "lucide-react";

const API_URL = "https://webtuanvaquanfpt.onrender.com";
// 🔥 THÊM COMPONENT NOTIFICATION VÀO ĐÂY
const Notification = ({ message, type, onClose }) => {
    if (!message) return null;
    const typeConfig = {
        success: { bg: "bg-green-500", icon: Check, title: "Thành công" },
        error: { bg: "bg-red-500", icon: XCircle, title: "Lỗi" },
        warning: { bg: "bg-yellow-500", icon: AlertTriangle, title: "Cảnh báo" },
        info: { bg: "bg-blue-500", icon: Info, title: "Thông báo" },
    };
    const config = typeConfig[type] || typeConfig.info;
    const Icon = config.icon;
    return (
        <div 
            className={`fixed top-4 right-4 z-[100] max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden text-white ${config.bg}`} 
            style={{ minWidth: 300 }}
        >
            <div className="p-4 flex items-start">
                <div className="flex-shrink-0 pt-0.5"><Icon className="h-6 w-6" /></div>
                <div className="ml-3 w-0 flex-1 pt-0.5"><p className="text-sm font-medium">{config.title}</p><p className="mt-1 text-sm">{message}</p></div>
                <div className="ml-4 flex-shrink-0 flex"><button type="button" className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2" onClick={onClose}><X className="h-5 w-5" /></button></div>
            </div>
        </div>
    );
};

// ============ ADMIN DASHBOARD COMPONENT ============
const AdminDashboard = ({ onBackToMain, showNotification }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminToken, setAdminToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [stats, setStats] = useState({
    
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingOrders: 0,
  });
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");


  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setAdminToken(token);
      setIsAuthenticated(true);
      fetchDashboardData(token);
    }
  }, []);

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      showNotification("Vui lòng nhập đầy đủ thông tin!", "warning");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (data.success) {
        setAdminToken(data.token);
        setIsAuthenticated(true);
        localStorage.setItem("adminToken", data.token);
        fetchDashboardData(data.token);
        setLoginEmail("");
        setLoginPassword("");
      } else {
        showNotification(data.message || "Đăng nhập thất bại!", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
     showNotification("Lỗi kết nối server!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminToken(null);
    localStorage.removeItem("adminToken");
    setStats({
      totalOrders: 0,
      totalRevenue: 0,
      totalUsers: 0,
      pendingOrders: 0,
    });
    setOrders([]);
    setUsers([]);
  };

  const fetchDashboardData = async (token) => {
    try {
      const [statsRes, ordersRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/admin/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const statsData = await statsRes.json();
      const ordersData = await ordersRes.json();
      const usersData = await usersRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (ordersData.success) setOrders(ordersData.orders);
      if (usersData.success) setUsers(usersData.users);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setOrders(
          orders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        fetchDashboardData(adminToken);
        showNotification("Cập nhật trạng thái thành công!", "success");
      } else {
        showNotification(data.message || "Cập nhật thất bại!", "error");
      }
    } catch (error) {
      console.error("Update error:", error);
      showNotification("Lỗi kết nối server!", "error");
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm(`Bạn có chắc muốn xóa đơn hàng #${orderId}?\nHành động này không thể hoàn tác!`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
        fetchDashboardData(adminToken);
        showNotification(data.message || 'Xóa đơn hàng thành công!', 'success');
      } else {
        showNotification(data.message || 'Không thể xóa đơn hàng!', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('Lỗi khi xóa đơn hàng: ' + error.message, 'error');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm(`Bạn có chắc muốn xóa người dùng #${userId}?\n\nHành động này sẽ:\n- Xóa vĩnh viễn người dùng\n- Xóa TẤT CẢ đơn hàng của người dùng này\n\nKhông thể hoàn tác!`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        fetchDashboardData(adminToken);
        const message = data.deletedOrdersCount > 0 
          ? `Đã xóa người dùng và ${data.deletedOrdersCount} đơn hàng liên quan!`
          : `Đã xóa người dùng thành công!`;
        showNotification(message, 'success');
      } else {
        showNotification(data.message || 'Không thể xóa người dùng!', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('Lỗi khi xóa người dùng: ' + error.message, 'error');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Chờ xử lý",
      },
      processing: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Đang xử lý",
      },
      completed: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Hoàn thành",
      },
      cancelled: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Đã hủy",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
          <button
            onClick={onBackToMain}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← Quay lại trang chính
          </button>

          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Admin Dashboard
            </h2>
            <p className="text-gray-600">Đăng nhập để quản lý hệ thống</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">Quản lý hệ thống</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={onBackToMain}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                ← Trang chính
              </button>
              <button
                onClick={() => fetchDashboardData(adminToken)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8">
            {[
              { id: "dashboard", label: "Tổng quan", icon: BarChart3 },
              { id: "orders", label: "Đơn hàng", icon: ShoppingBag },
              { id: "users", label: "Người dùng", icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        {activeTab === "dashboard" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Thống kê tổng quan
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                {
                  label: "Tổng đơn hàng",
                  value: stats.totalOrders,
                  icon: ShoppingBag,
                  color: "blue",
                },
                {
                  label: "Doanh thu",
                  value: `${stats.totalRevenue.toLocaleString()}đ`,
                  icon: DollarSign,
                  color: "green",
                },
                {
                  label: "Người dùng",
                  value: stats.totalUsers,
                  icon: Users,
                  color: "purple",
                },
                {
                  label: "Đơn chờ",
                  value: stats.pendingOrders,
                  icon: Clock,
                  color: "yellow",
                },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`bg-${stat.color}-100 p-3 rounded-lg`}>
                        <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Đơn hàng gần đây
              </h3>
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        Đơn #{order.id}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.customerInfo.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600 mb-1">
                        {order.total.toLocaleString()}đ
                      </p>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    Chưa có đơn hàng nào
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Quản lý đơn hàng
            </h2>

            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        Đơn hàng #{order.id}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(order.createdAt).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800">
                        Thông tin khách hàng
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          {order.customerInfo.name}
                        </p>
                        <p className="flex items-center text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          {order.customerInfo.email}
                        </p>
                        <p className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {order.customerInfo.phone}
                        </p>
                        {order.customerInfo.note && (
                          <p className="text-gray-600 mt-2">
                            <span className="font-medium">Ghi chú:</span>{" "}
                            {order.customerInfo.note}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800">Sản phẩm</h4>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm bg-gray-50 p-2 rounded"
                          >
                            <span className="text-gray-700">{item.name}</span>
                            <span className="font-semibold text-gray-800">
                              {item.price.toLocaleString()}đ
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                          <span>Tổng cộng</span>
                          <span className="text-blue-600">
                            {order.total.toLocaleString()}đ
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    <button
                      onClick={() => updateOrderStatus(order.id, "processing")}
                      disabled={order.status === "processing"}
                      className="flex-1 min-w-[150px] bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Đang xử lý
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, "completed")}
                      disabled={order.status === "completed"}
                      className="flex-1 min-w-[150px] bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Hoàn thành
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, "cancelled")}
                      disabled={order.status === "cancelled"}
                      className="flex-1 min-w-[150px] bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Hủy đơn
                    </button>
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="flex-1 min-w-[150px] bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-semibold"
                    >
                      Xóa đơn
                    </button>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Chưa có đơn hàng nào</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Quản lý người dùng
            </h2>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Số đơn hàng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tổng chi tiêu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ngày đăng ký
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {user.id}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user.orderCount || 0} đơn
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-600">
                          {(user.totalSpent || 0).toLocaleString()}đ
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition font-semibold text-sm"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {users.length === 0 && (
                <div className="p-12 text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Chưa có người dùng nào</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
// ============ ORDER HISTORY COMPONENT ============
const OrderHistory = ({ userId, onClose, showNotification }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserOrders();
  }, [userId]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/users/${userId}/orders`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Fetch orders error:", error);
      showNotification("Không thể tải lịch sử đơn hàng!", "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "⏳ Chờ xử lý",
        icon: Clock,
      },
      processing: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "📦 Đang xử lý",
        icon: Package,
      },
      completed: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "✅ Hoàn thành",
        icon: CheckCircle,
      },
      cancelled: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "❌ Đã hủy",
        icon: XCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
      >
        <Icon className="w-4 h-4 mr-1" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <ShoppingBag className="w-8 h-8" />
            <div>
              <h3 className="text-2xl font-bold">Lịch sử đơn hàng</h3>
              <p className="text-blue-100 text-sm">
                Tổng cộng: {orders.length} đơn hàng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Bạn chưa có đơn hàng nào</p>
              <button
                onClick={onClose}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Đi mua sắm
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4 pb-4 border-b">
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 mb-1">
                        Đơn hàng #{order.id}
                      </h4>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(order.createdAt).toLocaleString("vi-VN")}
                      </div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="space-y-2 mb-4">
                    <h5 className="font-semibold text-gray-700 text-sm">
                      Sản phẩm:
                    </h5>
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.name}
                          </p>
                          {item.code && (
                            <p className="text-xs text-gray-500">{item.code}</p>
                          )}
                        </div>
                        <span className="font-semibold text-blue-600">
                          {item.price.toLocaleString()}đ
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-gray-700 font-semibold">
                      Tổng cộng:
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      {order.total.toLocaleString()}đ
                    </span>
                  </div>

                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Xem thông tin giao hàng
                    </summary>
                    <div className="mt-3 bg-gray-50 p-4 rounded-lg space-y-1 text-sm">
                      <p className="text-gray-700">
                        <span className="font-medium">Người nhận:</span>{" "}
                        {order.customerInfo.name}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Điện thoại:</span>{" "}
                        {order.customerInfo.phone}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Email:</span>{" "}
                        {order.customerInfo.email}
                      </p>
                      {order.customerInfo.note && (
                        <p className="text-gray-700">
                          <span className="font-medium">Ghi chú:</span>{" "}
                          {order.customerInfo.note}
                        </p>
                      )}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 flex justify-end border-t">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
// ============ MAIN APP COMPONENT ============
const App = () => {
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
const [notification, setNotification] = useState({ message: '', type: '' });

    const showNotification = (message, type = 'info', duration = 3000) => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification({ message: '', type: '' });
        }, duration);
    };
    // 🔥 THÊM CÁC STATES MỚI CHO COUPON
    const [couponCode, setCouponCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [couponMessage, setCouponMessage] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
// Khôi phục component Notification (Cần có trong file của bạn)
    const Notification = ({ message, type, onClose }) => {
        if (!message) return null;
        const typeConfig = {
            success: { bg: "bg-green-500", icon: Check, title: "Thành công" },
            error: { bg: "bg-red-500", icon: XCircle, title: "Lỗi" },
            warning: { bg: "bg-yellow-500", icon: AlertTriangle, title: "Cảnh báo" },
            info: { bg: "bg-blue-500", icon: Info, title: "Thông báo" },
        };
        const config = typeConfig[type] || typeConfig.info;
        const Icon = config.icon;
        return (
            <div className={`fixed top-4 right-4 z-[100] max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${config.bg}`} style={{ minWidth: 300 }}>
                <div className="p-4 flex items-start text-white">
                    <div className="flex-shrink-0 pt-0.5"><Icon className="h-6 w-6" /></div>
                    <div className="ml-3 w-0 flex-1 pt-0.5"><p className="text-sm font-medium">{config.title}</p><p className="mt-1 text-sm">{message}</p></div>
                    <div className="ml-4 flex-shrink-0 flex"><button type="button" className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2" onClick={onClose}><X className="h-5 w-5" /></button></div>
                </div>
            </div>
        );
    };
    
    


    // 🔥 LOGIC COUPON MỚI
    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        if (!couponCode) return;

        setCouponLoading(true);
        setDiscountAmount(0);
        setCouponMessage('');

       try {
            const response = await fetch(`${API_URL}/coupons/validate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ couponCode }),
            });
            const data = await response.json();

            const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

            if (data.success) {
                // Kiểm tra tổng tiền tối thiểu (Mã 10k chỉ áp dụng cho đơn > 10k)
                const minTotal = data.discount; 
                
                if (cartTotal < minTotal) {
                    setCouponMessage(`❌ Mã này chỉ áp dụng cho đơn hàng trên ${minTotal.toLocaleString()}đ.`);
                    setDiscountAmount(0);
                    showNotification(`Mã cần đơn hàng tối thiểu ${minTotal.toLocaleString()}đ.`, 'warning');
                } else {
                    setDiscountAmount(data.discount);
                    setCouponMessage(data.message);
                    showNotification(data.message, 'success');
                }
            } else {
                setCouponMessage(data.message);
                showNotification(data.message || 'Mã giảm giá không hợp lệ.', 'error');
            }
        } catch (error) {
            console.error("Coupon error:", error);
            setCouponMessage("Lỗi kết nối khi kiểm tra mã.");
            showNotification("Lỗi kết nối khi kiểm tra mã.", 'error');
        } finally {
            setCouponLoading(false);
        }
    };
  // Component nhỏ: Form Coursera
  const CourseraForm = ({ addToCart }) => {
    const PRICE_PER_MOOC = 30000;
    const [courseName, setCourseName] = useState("");
    const [moocCount, setMoocCount] = useState(1);
    const [error, setError] = useState("");

  
    const handleAdd = () => {
      if (!courseName.trim()) {
        setError("⚠️ Vui lòng nhập tên khóa học!");
        return;
      }
      setError("");
      const total = PRICE_PER_MOOC * moocCount;
      addToCart({
        id: `coursera-${Date.now()}`,
        name: `Coursera: ${courseName}`,
        price: total,
        quantity: moocCount,
        type: "coursera",
      });
      showNotification(`Đã thêm ${moocCount} MOOC (${courseName}) vào giỏ hàng!`, "success");
      setCourseName("");
      setMoocCount(1);
    };

    const handleChangeCount = (newCount) => {
      if (newCount < 1) newCount = 1;
      setMoocCount(newCount);
    };

    const totalPrice = PRICE_PER_MOOC * moocCount;
    
    return (
      <div className="max-w-lg mx-auto bg-gray-50 p-8 rounded-2xl shadow-inner border border-purple-200">
        <div className="mb-6 text-left">
          <label className="block text-gray-700 font-semibold mb-2">
            Tên khóa học / MOOC:
          </label>
          <input
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="Nhập tên khóa học (vd: Machine Learning Coursera)"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <div className="flex items-center justify-between mb-6">
          <label className="text-gray-700 font-semibold">Số lượng MOOC:</label>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleChangeCount(moocCount - 1)}
              className="bg-purple-100 px-3 py-1 rounded-lg hover:bg-purple-200"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={moocCount}
              onChange={(e) => handleChangeCount(Number(e.target.value))}
              className="w-16 text-center border rounded-lg py-1"
            />
            <button
              onClick={() => handleChangeCount(moocCount + 1)}
              className="bg-purple-100 px-3 py-1 rounded-lg hover:bg-purple-200"
            >
              +
            </button>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-gray-700 font-medium">
            💰 Công thức: {moocCount} × {PRICE_PER_MOOC.toLocaleString("vi-VN")}
            đ ={" "}
            <span className="text-purple-700 font-bold">
              {totalPrice.toLocaleString("vi-VN")}đ
            </span>
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold text-lg hover:shadow-lg transition transform hover:scale-105"
        >
          ➕ Thêm vào giỏ hàng
        </button>
      </div>
    );
  };

  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Dữ liệu khóa học
  const courses = [
    {
      id: 1,
      code: "MAE101",
      name: "Mathematics for Engineers",
      desc: "Môn Toán ứng dụng cho kỹ sư, cung cấp kiến thức toán học nền tảng để giải quyết các bài toán kỹ thuật.",
      price: 150000,
      img: mae101,
      bgImg: mae101,
    },
    {
      id: 2,
      code: "MAS291",
      name: "Mathematical Statistics",
      desc: "Môn Xác suất – Thống kê, giúp sinh viên phân tích và xử lý dữ liệu, áp dụng trong CNTT và phần mềm.",
      price: 150000,
      img: mas291,
      bgImg: mas291,
    },
    {
      id: 3,
      code: "MAD101",
      name: "Discrete Mathematics",
      desc: "Môn Toán rời rạc, trang bị tư duy logic, tập hợp, quan hệ, đồ thị, ứng dụng trong cấu trúc dữ liệu và thuật toán.",
      price: 150000,
      img: mad101,
      bgImg: mad101,
    },
    {
      id: 4,
      code: "PRO192",
      name: "Object-Oriented Programming with Java",
      desc: "Môn Lập trình hướng đối tượng, làm quen với Java, class, object, kế thừa, đa hình.",
      price: 250000,
      img: pro192,
      bgImg: pro192,
    },
    {
      id: 5,
      code: "LAB211",
      name: "Advanced Programming Lab",
      desc: "Môn Thực hành lập trình nâng cao, rèn luyện kỹ năng code Java thông qua bài tập và dự án nhỏ.",
      price: 250000,
      img: lab211,
      bgImg: lab211,
    },
    {
      id: 6,
      code: "WED201",
      name: "Web Design & Development",
      desc: "Môn Phát triển Web, học HTML, CSS, JavaScript và xây dựng website cơ bản đến nâng cao.",
      price: 250000,
      img: wed201,
      bgImg: wed201,
    },
    {
      id: 7,
      code: "DBI202",
      name: "Database Systems",
      desc: "Môn Cơ sở dữ liệu, học SQL, thiết kế và quản lý hệ thống cơ sở dữ liệu quan hệ.",
      price: 250000,
      img: dbi202,
      bgImg: dbi202,
    },
    {
      id: 8,
      code: "CSD201",
      name: "Data Structures & Algorithms",
      desc: "Môn Cấu trúc dữ liệu và giải thuật, học về mảng, danh sách, ngăn xếp, cây, đồ thị và thuật toán tìm kiếm/sắp xếp.",
      price: 250000,
      img: csd201,
      bgImg: csd201,
    },
  ];

  // Dữ liệu dịch vụ tiếng Anh
  const englishServices = [
    {
      id: "luk-video",
      name: "Edit Video LUK",
      code: "LUK-VIDEO",
      services: ["Chỉnh sửa video chuyên nghiệp", "Thêm phụ đề, hiệu ứng", "Xuất file chất lượng cao"],
      price: 70000,
      icon: "🎬",
      img: avt2,
      bgImg: avt2,
    },
    {
      id: "luk-script",
      name: "Làm Kịch Bản LUK",
      code: "LUK-SCRIPT",
      services: ["Viết kịch bản theo yêu cầu", "Nội dung logic, mạch lạc", "Phù hợp với thời lượng"],
      price: 40000,
      icon: "📝",
      img: avt2,
      bgImg: avt2,
    },
    {
      id: "luk-transcript",
      name: "Làm Transcript LUK",
      code: "LUK-TRANSCRIPT",
      services: ["Chuyển audio thành text", "Định dạng chuẩn", "Nhanh chóng, chính xác"],
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
      services: ["Chuẩn bị luận điểm", "Luyện tập tranh luận", "Tư vấn chiến thuật"],
      price: 150000,
      icon: "🗣️",
      img: avt2,
      bgImg: avt2,
    },
    {
      id: "luk-full-check2",
      name: "Hỗ Trợ Full Check 2",
      code: "LUK-FULL",
      services: ["Kiểm tra toàn bộ project", "Đảm bảo đạt điểm cao", "Hỗ trợ tổng thể"],
      price: 90000,
      icon: "✅",
      img: avt2,
      bgImg: avt2,
    },
    {
      id: "trans",
      name: "Học TRANS",
      code: "TRANS",
      services: ["Hỗ Trợ Tài Liệu Ôn Thi", "Đề cương chi tiết", "Bài tập có lời giải"],
      price: 70000,
      icon: "📖",
      img: avt1,
      bgImg: avt1,
    },
  ];

  // Dữ liệu tài liệu
  const documents = [
    {
      semester: "Kỳ 1",
      courses: ["SSL101", "CEA201", "CSI106", "PRF192", "MAE101"],
    },
    {
      semester: "Kỳ 2",
      courses: ["NWC204", "OSG202", "MAD101", "WED201", "PRO192"],
    },
    {
      semester: "Kỳ 3",
      courses: ["LAB211", "JPD113", "DBI202", "CSD201", "MAS291"],
    },
  ];

  const addToCart = (item) => {
        setCart([...cart, item]);
        showNotification(`Đã thêm ${item.name} vào giỏ hàng!`, 'success');
        setDiscountAmount(0); 
        setCouponMessage('');
    };

 const removeFromCart = (index) => {
        const newCart = cart.filter((_, i) => i !== index);
        setCart(newCart);
        setDiscountAmount(0); // Reset coupon
        setCouponMessage('');
    };
const handleLogin = async (e) => {
  e.preventDefault();
  
  const email = e.target.email.value.trim();
  const password = e.target.password.value.trim();

  if (!email || !password) {
    showNotification("Vui lòng nhập đầy đủ email và mật khẩu!", "warning");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      setCurrentUser(data.user);
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      setShowLogin(false);
      showNotification("Đăng nhập thành công!", "success");
    } else {
      showNotification(data.message || "Đăng nhập thất bại!", "error");
    }
  } catch (error) {
    console.error("Login error:", error);
    showNotification("Không thể kết nối đến server. Vui lòng kiểm tra lại!",  "error");
  } finally {
    setLoading(false);
  }
};

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentUser(data.user);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        setShowRegister(false);
        showNotification("Đăng ký thành công!", "success");
      } else {
        showNotification(data.message || "Đăng ký thất bại!", "error");
      }
    } catch (error) {
      console.error("Register error:", error);
      showNotification("Lỗi kết nối server!", 'error');
    } finally {
      setLoading(false);
    }
  };

 const handleCheckout = async (e) => {
        e.preventDefault()

    if (!currentUser) {
      showNotification("Vui lòng đăng nhập để thanh toán!", "warning");
      setShowCart(false);
      setShowLogin(true);
      return;
    }

    setIsSubmitting(true); 

    const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
        const finalTotal = Math.max(0, cartTotal - discountAmount); // Đảm bảo tổng tiền không âm

        const orderData = {
            userId: currentUser.id,
            items: [...cart],
            customerInfo: {
                name: e.target.customerName.value,
                phone: e.target.phone.value,
                email: e.target.customerEmail.value,
                note: e.target.note.value,
            },
            total: finalTotal, // GỬI TỔNG TIỀN ĐÃ GIẢM
            discountAmount: discountAmount, // GỬI SỐ TIỀN GIẢM
            couponCode: discountAmount > 0 ? couponCode : null, // GỬI MÃ COUPON NẾU CÓ
        };

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        setCart([]);
        setShowCart(false);
        showNotification("Đơn hàng đã được tạo thành công! Vui lòng kiểm tra email.", "success");
setDiscountAmount(0); 
            setCouponCode('');
            setCouponMessage('');
      } else {
        showNotification(data.message || "Tạo đơn hàng thất bại!",  "error");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      showNotification("Lỗi kết nối server!", 'error');
    } finally {
      setIsSubmitting(false); // Thêm dòng này
    }
  };

  const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem("currentUser");
        showNotification("Đã đăng xuất!", 'info');
    };

    const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
    const finalPrice = totalPrice - discountAmount; // Giá cuối cùng hiển thị

 if (showAdminDashboard) {
    return (
      <AdminDashboard 
        onBackToMain={() => setShowAdminDashboard(false)} 
        showNotification={showNotification} // 🔥 THÊM DÒNG NÀY
      />
    );
  }
  return (
   <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
  <Notification 
    message={notification.message} 
    type={notification.type} 
    onClose={() => setNotification({ message: '', type: '' })} 
  />   {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg shadow-md">
                <Book className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Học cùng Tuấn và Quân
                </h1>
                <p className="text-xs md:text-sm text-gray-500">
                  Nền tảng học tập chất lượng
                </p>
              </div>
            </div>

            {/* Desktop Menu */}

            <div className="hidden md:flex items-center space-x-6 font-medium">
              {[
                { name: "Khóa học", id: "courses" },
                { name: "Tiếng Anh", id: "english" },
                { name: "Tài liệu", id: "documents" },
                { name: "Coursera", id: "coursera" },
                { name: "Liên hệ", id: "contact" },
              ].map((item, idx) => (
                <a
                  key={idx}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(item.id)?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                    setMobileMenuOpen(false);
                  }}
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-300"
                >
                  {item.name}
                </a>
              ))}
              <button
                onClick={() => setShowAdminDashboard(true)}
                className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium"
              >
                Admin
              </button>
              {/* Cart */}
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                    {cart.length}
                  </span>
                )}
              </button>

             {/* User */}
{currentUser ? (
  <div className="flex items-center space-x-3">
    <button
      onClick={() => setShowOrderHistory(true)}
      className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition px-3 py-2 rounded-lg hover:bg-gray-100"
    >
      <ShoppingBag className="w-5 h-5" />
      <span className="text-sm font-medium">Đơn hàng</span>
    </button>
    <span className="text-sm text-gray-700">
      Xin chào, {currentUser.name}
    </span>
    <button
      onClick={handleLogout}
      className="p-2 hover:bg-gray-100 rounded-lg transition"
    >
      <LogOut className="w-5 h-5 text-gray-700" />
    </button>
  </div>
) : (
  <button
    onClick={() => setShowLogin(true)}
    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition transform hover:-translate-y-0.5"
  >
    Đăng nhập
  </button>
)}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 transition"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 space-y-3 pb-4 border-t border-gray-200">
              {["Khóa học", "Tiếng Anh", "Tài liệu", "Coursera", "Liên hệ"].map(
                (item, idx) => (
                  <a
                    key={idx}
                    href={`#${item.toLowerCase().replace(" ", "")}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(item.toLowerCase().replace(" ", ""))?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                      setMobileMenuOpen(false);
                    }}
                    className="block text-gray-700 hover:text-blue-600 py-2 font-medium"
                  >
                    {item}
                  </a>
                )
              )}
              
              {/* Admin button for mobile */}
              <button
                onClick={() => {
                  setShowAdminDashboard(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left text-gray-700 hover:text-blue-600 py-2 font-medium"
              >
                Admin
              </button>

              {/* Cart button for mobile */}
              <button
                onClick={() => {
                  setShowCart(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between bg-gray-100 px-4 py-3 rounded-lg hover:bg-gray-200 transition"
              >
                <span className="font-medium text-gray-700">Giỏ hàng</span>
                <div className="flex items-center space-x-2">
                  {cart.length > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {cart.length}
                    </span>
                  )}
                  <ShoppingCart className="w-5 h-5 text-gray-700" />
                </div>
              </button>

             {/* User section for mobile */}
{currentUser ? (
  <div className="space-y-2">
    <button
      onClick={() => {
        setShowOrderHistory(true);
        setMobileMenuOpen(false);
      }}
      className="w-full flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-3 rounded-lg hover:bg-blue-100 transition"
    >
      <ShoppingBag className="w-5 h-5" />
      <span className="font-medium">Lịch sử đơn hàng</span>
    </button>
    <div className="flex items-center justify-between bg-gray-100 px-4 py-3 rounded-lg">
      <span className="text-sm text-gray-700">
        Xin chào, {currentUser.name}
      </span>
      <button
        onClick={() => {
          handleLogout();
          setMobileMenuOpen(false);
        }}
        className="p-2 hover:bg-gray-200 rounded-lg transition"
      >
        <LogOut className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  </div>
) : (
  <button
    onClick={() => {
      setShowLogin(true);
      setMobileMenuOpen(false);
    }}
    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-md transition transform hover:-translate-y-0.5"
  >
    Đăng nhập
  </button>
)}
            </div>
          )}
        </nav>
      </header>

     <section
  className="relative bg-gradient-to-br from-blue-50 via-white to-pink-50 text-gray-800 py-24"
  style={{
    backgroundImage: `url(${avt})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
  {/* Overlay để làm mờ ảnh */}
 <div className="absolute inset-0 bg-black/30"></div> 

  <div className="container mx-auto px-6 text-center relative z-10">
    {/* Heading */}
    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight text-white drop-shadow-lg">
  Nâng cao kiến thức, <br className="hidden md:block" /> Vững bước tương lai
</h2>

    {/* Subheading */}
    <p className="text-lg md:text-xl mb-10 text-gray-100 opacity-90">
      Khóa học chất lượng cao với giá cả phải chăng
    </p>

    {/* Call to Action */}
    <a
      href="#courses"
      className="inline-block bg-gradient-to-r from-purple-500 to-pink-400 text-white px-10 py-4 rounded-xl font-semibold shadow-lg hover:shadow-2xl transition transform hover:scale-105 hover:-translate-y-1"
    >
      Khám phá ngay
    </a>
  </div>
</section>

      {/* Courses Section */}
      <section id="courses" className="py-20 font-sans bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Danh sách khóa học
            </h2>
            <p className="text-gray-600 text-lg md:text-xl">
              Các khóa học được thiết kế đặc biệt để giúp bạn đạt điểm cao
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-3 hover:scale-105 overflow-hidden flex flex-col h-[28rem]"
              >
                {/* Ảnh chiếm nửa box */}
                <div
                  className="h-1/2 w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${course.img})` }}
                ></div>

                {/* Nội dung */}
                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <p className="text-purple-600 font-semibold mb-1">
                      {course.code}
                    </p>
                    <h4 className="font-bold text-gray-900 text-lg mb-2">
                      {course.name}
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {course.desc}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-2xl font-bold text-purple-600">
                      {course.price.toLocaleString()}đ
                    </span>
                    <button
                      onClick={() => addToCart({ ...course, type: "course" })}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 shadow-md hover:shadow-lg transition transform hover:scale-105"
                    >
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* English Services */}
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
            {englishServices.map((service) => (
              <div
                key={service.id}
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
            ))}
          </div>
        </div>
      </section>

      {/* Documents Section */}
      <section
        id="documents"
        className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
              📄 TÀI LIỆU HỌC TẬP
            </div>
            <h2 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Tài liệu ôn thi
            </h2>
            <p className="text-gray-600 text-lg">
              Tài liệu đầy đủ từ kỳ 1 đến kỳ 3
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {documents.map((doc, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-blue-400 relative overflow-hidden"
              >
                <h3 className="text-2xl font-bold text-blue-600 mb-4">
                  {doc.semester}
                </h3>
                <div className="space-y-2">
                  {doc.courses.map((course, cidx) => (
                    <div
                      key={cidx}
                      className="flex items-center text-gray-700 bg-gray-50 p-3 rounded-lg"
                    >
                      <Book className="w-5 h-5 text-blue-500 mr-2" />
                      {course}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() =>
                    addToCart({
                      id: `doc-${idx}`,
                      name: `Tài liệu ${doc.semester}`,
                      price: 70000,
                      type: "document",
                      courses: doc.courses,
                    })
                  }
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Mua tài liệu - 70.000đ
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <a
              href="https://docs.google.com/document/d/1THKvW20D4o-bPxCyrillclf1R5Z_29Os5EpOX6G--dw/edit?tab=t.0"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition transform hover:scale-105"
            >
              📖 Xem Demo Tài Liệu
            </a>
          </div>
        </div>
      </section>

      {/* Coursera Section */}
      <section
        id="coursera"
        className="py-20 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 relative overflow-hidden"
      >
        {/* Background hiệu ứng */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-12 text-center transform hover:scale-105 transition-transform duration-300 border-4 border-transparent hover:border-purple-200">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl transform -rotate-6 hover:rotate-0 transition-transform duration-300">
              <Award className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Hỗ trợ Rush Coursera
            </h2>

            <p className="text-gray-600 mb-10 text-xl leading-relaxed max-w-2xl mx-auto">
              Dịch vụ hỗ trợ hoàn thành MOOC nhanh chóng, đúng hạn và chất lượng
              — chỉ 30.000đ mỗi MOOC 🎯
            </p>

            {/* Form Coursera */}
            <CourseraForm addToCart={addToCart} />
          </div>
        </div>
      </section>

      {/* Contact Section */}
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

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2025 Học cùng Tuấn và Quân. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Shopping Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">
                🛒 Giỏ hàng của bạn
              </h3>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Giỏ hàng trống</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-gray-50 p-4 rounded-lg"
                      >
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {item.code || item.type}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="font-bold text-blue-600">
                            {item.price.toLocaleString()}đ
                          </span>
                          <button
                            onClick={() => removeFromCart(idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
{/* 🔥 FORM NHẬP MÃ GIẢM GIÁ */}
             {/* 🔥 KHỐI TÍNH TOÁN GIÁ (ĐÃ HỢP NHẤT VÀ CHÍNH XÁC) */}

<form onSubmit={handleApplyCoupon} className="space-y-3 mb-4 p-4 border rounded-lg bg-gray-50">
    <label className="block text-sm font-semibold text-gray-700">Mã giảm giá (Coupon)</label>
    <div className="flex space-x-2">
        <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nhập mã..."
            disabled={couponLoading}
        />
        <button
            type="submit"
            disabled={couponLoading || discountAmount > 0}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
        >
            {couponLoading ? '...' : 'Áp dụng'}
        </button>
    </div>
    {couponMessage && (
        <p className={`text-xs font-medium ${discountAmount > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {couponMessage}
        </p>
    )}
</form>

{/* 🔥 TỔNG KẾT VÀ TÍNH TOÁN CUỐI CÙNG */}
<div className="border-t pt-4 mb-6 space-y-2">
    {/* 1. TỔNG TIỀN HÀNG (Giá gốc) */}
    <div className="flex justify-between items-center text-md text-gray-600">
        <span>Tổng tiền hàng:</span>
        <span className="font-semibold">
            {totalPrice.toLocaleString()}đ
        </span>
    </div>
    
    {/* 2. GIẢM GIÁ */}
    {discountAmount > 0 && (
        <div className="flex justify-between items-center text-red-500 font-bold">
            <span>Giảm giá ({couponCode}):</span>
            <span className="">
                - {discountAmount.toLocaleString()}đ
            </span>
        </div>
    )}

    {/* 3. THANH TOÁN CUỐI CÙNG (Giá đã trừ giảm giá) */}
    <div className="flex justify-between items-center text-xl font-bold pt-2 border-t border-dashed border-gray-300">
        <span>Thanh toán:</span>
        <span className="text-blue-600">
            {finalPrice.toLocaleString()}đ
        </span>
    </div>
</div>

                {/* ---------------------------------- */}
                 

                  <form onSubmit={handleCheckout} className="space-y-4">
                    <h4 className="font-semibold text-lg text-gray-800 mb-4">
                      Thông tin khách hàng
                    </h4>

                    <input
                      type="text"
                      name="customerName"
                      placeholder="Họ và tên *"
                      required
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />

                    <input
                      type="tel"
                      name="phone"
                      placeholder="Số điện thoại *"
                      required
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />

                    <input
                      type="email"
                      name="customerEmail"
                      placeholder="Email *"
                      required
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />

                    <textarea
                      name="note"
                      placeholder="Ghi chú (không bắt buộc)"
                      rows="3"
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-2">
                        💳 Thông tin thanh toán
                      </h5>
                      <p className="text-sm text-gray-600 mb-3">
                        Vui lòng quét mã QR bên dưới để thanh toán và gửi ảnh
                        xác nhận cho chúng tôi
                      </p>
                      <div className="bg-white p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-600 mb-2">
                          QR Code thanh toán sẽ hiển thị tại đây
                        </p>
                       <img
  src={QR}
  alt="QR Code thanh toán"
  className="w-full max-w-sm mx-auto rounded-lg object-contain"
/>

                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-lg hover:shadow-xl transition transform hover:scale-105 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          Đang xử lý đơn hàng...
                        </span>
                      ) : (
                        "Xác nhận đặt hàng"
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Đăng nhập</h3>
              <button
                onClick={() => setShowLogin(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <input
                type="password"
                name="password"
                placeholder="Mật khẩu"
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Đăng nhập
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setShowLogin(false);
                  setShowRegister(true);
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                Chưa có tài khoản? Đăng ký ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Đăng ký tài khoản
              </h3>
              <button
                onClick={() => setShowRegister(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Họ và tên"
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <input
                type="password"
                name="password"
                placeholder="Mật khẩu"
                required
                minLength="6"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition font-semibold"
              >
                Đăng ký
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setShowRegister(false);
                  setShowLogin(true);
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                Đã có tài khoản? Đăng nhập
              </button>
            </div>
          </div>
        </div>
        
      )}

      {/* Order History Modal */}
      {showOrderHistory && currentUser && (
        <OrderHistory 
          userId={currentUser.id} 
          onClose={() => setShowOrderHistory(false)} 
            showNotification={showNotification} // 🔥 THÊM DÒNG NÀY
        />
      )}
    </div>
  );
};


export default App;
