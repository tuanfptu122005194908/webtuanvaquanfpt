// src/components/Admin/AdminDashboard.jsx

import React, { useState, useEffect } from "react";
import { LogOut, BarChart3, ShoppingBag, Users, DollarSign, Clock, RefreshCw } from '../common/Icon';
import { adminLogin, fetchAdminDashboardData } from "../../api/admin";
import OrdersManagement from "./OrdersManagement";
import UsersManagement from "./UsersManagement";

// Hàm hiển thị Badge cho status (có thể để trong một file util)
const getStatusBadge = (status) => {
    const statusConfig = {
        pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Chờ xử lý" },
        processing: { bg: "bg-blue-100", text: "text-blue-800", label: "Đang xử lý" },
        completed: { bg: "bg-green-100", text: "text-green-800", label: "Hoàn thành" },
        cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Đã hủy" },
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

    const fetchDashboardData = async (token) => {
        try {
            const { statsData, ordersData, usersData } = await fetchAdminDashboardData(token);
            
            if (statsData.success) setStats(statsData.stats);
            if (ordersData.success) setOrders(ordersData.orders);
            if (usersData.success) setUsers(usersData.users);

            // Xử lý lỗi token hết hạn/invalid
            if (statsData.message === "Unauthorized" || ordersData.message === "Unauthorized" || usersData.message === "Unauthorized") {
                handleLogout();
                showNotification("Phiên đăng nhập Admin đã hết hạn!", "warning");
            }

        } catch (error) {
            console.error("Fetch dashboard error:", error);
            showNotification("Lỗi kết nối server khi tải dữ liệu!", "error");
        }
    };

    const handleLogin = async () => {
        if (!loginEmail || !loginPassword) {
            showNotification("Vui lòng nhập đầy đủ thông tin!", "warning");
            return;
        }

        setLoading(true);

        try {
            const data = await adminLogin(loginEmail, loginPassword);
            
            if (data.success) {
                setAdminToken(data.token);
                setIsAuthenticated(true);
                localStorage.setItem("adminToken", data.token);
                fetchDashboardData(data.token);
                setLoginEmail("");
                setLoginPassword("");
                showNotification("Đăng nhập Admin thành công!", "success");
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
        setStats({ totalOrders: 0, totalRevenue: 0, totalUsers: 0, pendingOrders: 0 });
        setOrders([]);
        setUsers([]);
        showNotification("Đã đăng xuất Admin!", "info");
    };

    // --- UI RENDER ---

    if (!isAuthenticated) {
        // Login UI
        return (
             <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                    <button onClick={onBackToMain} className="mb-4 text-blue-600 hover:text-blue-800 flex items-center">
                        ← Quay lại trang chính
                    </button>

                    <div className="text-center mb-8">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <BarChart3 className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h2>
                        <p className="text-gray-600">Đăng nhập để quản lý hệ thống</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="admin@gmail.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
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

    // Main Dashboard UI
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
                                <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                                <p className="text-sm text-gray-600">Quản lý hệ thống</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button onClick={onBackToMain} className="text-sm text-blue-600 hover:text-blue-800">
                                ← Trang chính
                            </button>
                            <button onClick={() => fetchDashboardData(adminToken)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                                <RefreshCw className="w-5 h-5 text-gray-600" />
                            </button>
                            <button onClick={handleLogout} className="flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition">
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
                        {[{ id: "dashboard", label: "Tổng quan", icon: BarChart3 },
                         { id: "orders", label: "Đơn hàng", icon: ShoppingBag },
                         { id: "users", label: "Người dùng", icon: Users },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 py-4 border-b-2 transition ${
                                        activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"
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
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Thống kê tổng quan</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {[
                                { label: "Tổng đơn hàng", value: stats.totalOrders, icon: ShoppingBag, color: "blue" },
                                { label: "Doanh thu", value: `${stats.totalRevenue.toLocaleString()}đ`, icon: DollarSign, color: "green" },
                                { label: "Người dùng", value: stats.totalUsers, icon: Users, color: "purple" },
                                { label: "Đơn chờ", value: stats.pendingOrders, icon: Clock, color: "yellow" },
                            ].map((stat, idx) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={idx} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`bg-${stat.color}-100 p-3 rounded-lg`}>
                                                <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                                        <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Đơn hàng gần đây</h3>
                            <div className="space-y-3">
                                {orders.slice(0, 5).map((order) => (
                                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-semibold text-gray-800">Đơn #{order.id}</p>
                                            <p className="text-sm text-gray-600">{order.customerInfo.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-blue-600 mb-1">{order.total.toLocaleString()}đ</p>
                                            {getStatusBadge(order.status)}
                                        </div>
                                    </div>
                                ))}
                                {orders.length === 0 && (
                                    <p className="text-center text-gray-500 py-4">Chưa có đơn hàng nào</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "orders" && (
                    <OrdersManagement
                        orders={orders}
                        adminToken={adminToken}
                        fetchDashboardData={fetchDashboardData}
                        showNotification={showNotification}
                    />
                )}

                {activeTab === "users" && (
                    <UsersManagement
                        users={users}
                        adminToken={adminToken}
                        fetchDashboardData={fetchDashboardData}
                        showNotification={showNotification}
                    />
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;