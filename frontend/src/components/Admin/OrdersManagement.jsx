// src/components/Admin/OrdersManagement.jsx

import React from 'react';
import { deleteAdminOrder, updateAdminOrderStatus } from '../../api/admin';
import { Calendar, Users, Mail, Phone, ShoppingBag } from '../common/Icon';

const getStatusBadge = (status) => {
    // ... (Hàm getStatusBadge giống trong AdminDashboard.js)
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

const OrdersManagement = ({ orders, adminToken, fetchDashboardData, showNotification }) => {

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const data = await updateAdminOrderStatus(orderId, newStatus, adminToken);
            if (data.success) {
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

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm(`Bạn có chắc muốn xóa đơn hàng #${orderId}?\nHành động này không thể hoàn tác!`)) {
            return;
        }
        try {
            const data = await deleteAdminOrder(orderId, adminToken);
            if (data.success) {
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


    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Quản lý đơn hàng ({orders.length})
            </h2>

            <div className="space-y-4">
                {orders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Chưa có đơn hàng nào</p>
                    </div>
                ) : (
                    orders.map((order) => (
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
                                {/* Customer Info */}
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-800">Thông tin khách hàng</h4>
                                    <div className="space-y-1 text-sm">
                                        <p className="flex items-center text-gray-600"><Users className="w-4 h-4 mr-2" />{order.customerInfo.name}</p>
                                        <p className="flex items-center text-gray-600"><Mail className="w-4 h-4 mr-2" />{order.customerInfo.email}</p>
                                        <p className="flex items-center text-gray-600"><Phone className="w-4 h-4 mr-2" />{order.customerInfo.phone}</p>
                                        {order.customerInfo.note && (<p className="text-gray-600 mt-2"><span className="font-medium">Ghi chú:</span> {order.customerInfo.note}</p>)}
                                    </div>
                                </div>

                                {/* Products & Total */}
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-800">Sản phẩm ({order.items.length})</h4>
                                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                                                <span className="text-gray-700">{item.name}</span>
                                                <span className="font-semibold text-gray-800">{item.price.toLocaleString()}đ</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                        <span>Tổng cộng</span>
                                        <span className="text-blue-600">{order.total.toLocaleString()}đ</span>
                                    </div>
                                    {order.discountAmount > 0 && (
                                        <div className="flex justify-between text-red-500 font-medium text-sm">
                                            <span>Giảm giá ({order.couponCode})</span>
                                            <span>- {order.discountAmount.toLocaleString()}đ</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2 pt-4 border-t">
                                <button
                                    onClick={() => handleUpdateStatus(order.id, "processing")}
                                    disabled={order.status === "processing"}
                                    className="flex-1 min-w-[150px] bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Đang xử lý
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(order.id, "completed")}
                                    disabled={order.status === "completed"}
                                    className="flex-1 min-w-[150px] bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Hoàn thành
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(order.id, "cancelled")}
                                    disabled={order.status === "cancelled"}
                                    className="flex-1 min-w-[150px] bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Hủy đơn
                                </button>
                                <button
                                    onClick={() => handleDeleteOrder(order.id)}
                                    className="flex-1 min-w-[150px] bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-semibold"
                                >
                                    Xóa đơn
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default OrdersManagement;