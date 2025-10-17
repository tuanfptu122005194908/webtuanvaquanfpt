// src/api/client.js

// Lưu ý: Các hàm login/register/validate coupon/checkout đã được
// tích hợp trong các hooks tương ứng (useAuth.js, useCart.js)
// Tuy nhiên, nếu muốn tách biệt hoàn toàn logic API, ta có thể định nghĩa lại:

import { API_URL } from "../constants";

export const clientLogin = async (email, password) => {
  const response = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

export const clientRegister = async (name, email, password) => {
  const response = await fetch(`${API_URL}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return response.json();
};

export const validateCoupon = async (couponCode) => {
  const response = await fetch(`${API_URL}/api/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ couponCode }),
  });
  return response.json();
};

export const createOrder = async (orderData) => {
  const response = await fetch(`${API_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
  return response.json();
};

export const fetchUserOrders = async (userId) => {
  // Endpoint đã sửa từ code gốc để đảm bảo khớp với API
  const response = await fetch(`${API_URL}/api/users/${userId}/orders`);
  return response.json();
};
