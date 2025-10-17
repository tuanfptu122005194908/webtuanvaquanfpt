// src/api/admin.js

import { API_URL } from "../constants";

// Hàm đăng nhập Admin
export const adminLogin = async (email, password) => {
  const response = await fetch(`${API_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

// Hàm lấy dữ liệu Dashboard (stats, orders, users)
export const fetchAdminDashboardData = async (token) => {
  const headers = { Authorization: `Bearer ${token}` };
  const [statsRes, ordersRes, usersRes] = await Promise.all([
    fetch(`${API_URL}/api/admin/stats`, { headers }),
    fetch(`${API_URL}/api/admin/orders`, { headers }),
    fetch(`${API_URL}/api/admin/users`, { headers }),
  ]);

  const statsData = await statsRes.json();
  const ordersData = await ordersRes.json();
  const usersData = await usersRes.json();

  return { statsData, ordersData, usersData };
};

// Hàm cập nhật trạng thái đơn hàng
export const updateAdminOrderStatus = async (orderId, newStatus, token) => {
  const response = await fetch(`${API_URL}/api/admin/orders/${orderId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status: newStatus }),
  });
  return response.json();
};

// Hàm xóa đơn hàng
export const deleteAdminOrder = async (orderId, token) => {
  const response = await fetch(`${API_URL}/api/admin/orders/${orderId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

// Hàm xóa người dùng
export const deleteAdminUser = async (userId, token) => {
  // Lưu ý: Endpoint trong code gốc có vẻ bị thiếu /api/
  const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.json();
};
