// src/components/Client/OrderHistoryModal.jsx

import React, { useState, useEffect } from "react";
import { X, ShoppingBag, RefreshCw, Clock, Package, CheckCircle, XCircle, Calendar, Users, Mail, Phone } from "../common/Icon";
import { API_URL } from "../../constants";

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

const OrderHistoryModal = ({ userId, onClose, showNotification }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserOrders();
    }, [userId]);

    const fetchUserOrders = async () => {
        try {
            setLoading(true);
            // Sửa lại endpoint API theo đường dẫn bạn cung cấp
            const response = await fetch(`${API_URL}/api/users/${userId}/orders`); 
            const data = await response.json();

            if (data.success) {
                setOrders(data.orders);
            } else {
                 showNotification(data.message || "Không thể tải lịch sử đơn hàng!", "error");
            }
        } catch (error) {
            console.error("Fetch orders error:", error);
            showNotification("Lỗi kết nối server khi tải đơn hàng!", "error");
        } finally {
            setLoading(false);
        }
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
                                    
                                    {/* Coupon Info */}
                                    {order.discountAmount > 0 && (
                                        <div className="flex justify-between items-center pt-2 text-red-500 font-medium">
                                            <span className="text-sm">Mã giảm giá ({order.couponCode}):</span>
                                            <span className="text-lg font-bold">
                                                - {order.discountAmount.toLocaleString()}đ
                                            </span>
                                        </div>
                                    )}

                                    <details className="mt-4">
                                        <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium">
                                            Xem thông tin giao hàng
                                        </summary>
                                        <div className="mt-3 bg-gray-50 p-4 rounded-lg space-y-1 text-sm">
                                            <p className="text-gray-700">
                                                <span className="font-medium">Người nhận:</span>{" "}
                                                {order.customerInfo.name}
                                            </p>
                                            <p className="flex items-center text-gray-700">
                                                <Phone className="w-3 h-3 mr-2" />
                                                <span className="font-medium">Điện thoại:</span>{" "}
                                                {order.customerInfo.phone}
                                            </p>
                                            <p className="flex items-center text-gray-700">
                                                <Mail className="w-3 h-3 mr-2" />
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

export default OrderHistoryModal;