// src/components/Admin/UsersManagement.jsx

import React from 'react';
import { deleteAdminUser } from '../../api/admin';
import { Users } from '../common/Icon';

const UsersManagement = ({ users, adminToken, fetchDashboardData, showNotification }) => {

    const handleDeleteUser = async (userId) => {
        if (!window.confirm(`Bạn có chắc muốn xóa người dùng #${userId}?\n\nHành động này sẽ:\n- Xóa vĩnh viễn người dùng\n- Xóa TẤT CẢ đơn hàng của người dùng này\n\nKhông thể hoàn tác!`)) {
            return;
        }

        try {
            const data = await deleteAdminUser(userId, adminToken);

            if (data.success) {
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

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Quản lý người dùng ({users.length})
            </h2>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số đơn hàng</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng chi tiêu</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày đăng ký</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">{user.id}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
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
                                            onClick={() => handleDeleteUser(user.id)}
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
    );
};

export default UsersManagement;