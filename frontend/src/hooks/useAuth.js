// src/hooks/useAuth.js

import { useState, useEffect } from "react";
import { API_URL } from "../constants";

export const useAuth = (showNotification) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    const password = e.target.password.value.trim();

    if (!email || !password) {
      showNotification("Vui lòng nhập đầy đủ email và mật khẩu!", "warning");
      return { success: false };
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/login`, {
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
        showNotification("Đăng nhập thành công!", "success");
        return { success: true };
      } else {
        showNotification(data.message || "Đăng nhập thất bại!", "error");
        return { success: false };
      }
    } catch (error) {
      console.error("Login error:", error);
      showNotification(
        "Không thể kết nối đến server. Vui lòng kiểm tra lại!",
        "error"
      );
      return { success: false };
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
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentUser(data.user);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        showNotification("Đăng ký thành công!", "success");
        return { success: true };
      } else {
        showNotification(data.message || "Đăng ký thất bại!", "error");
        return { success: false };
      }
    } catch (error) {
      console.error("Register error:", error);
      showNotification("Lỗi kết nối server!", "error");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    showNotification("Đã đăng xuất!", "info");
  };

  return {
    currentUser,
    loading,
    handleLogin,
    handleRegister,
    handleLogout,
  };
};
