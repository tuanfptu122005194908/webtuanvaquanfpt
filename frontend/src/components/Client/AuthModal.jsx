// src/components/Client/AuthModal.jsx

import React from "react";
import { X, RefreshCw } from "../common/Icon";

const AuthModal = ({ 
  type, 
  onClose, 
  onSwitch, 
  onSubmit, 
  loading 
}) => {
  const isLogin = type === 'login';
  const title = isLogin ? "Đăng nhập" : "Đăng ký tài khoản";
  const buttonText = isLogin ? "Đăng nhập" : "Đăng ký";
  const switchText = isLogin 
    ? "Chưa có tài khoản? Đăng ký ngay" 
    : "Đã có tài khoản? Đăng nhập";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Họ và tên"
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />

          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            required
            minLength={isLogin ? "1" : "6"}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
                <span className="flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Đang xử lý...
                </span>
            ) : (
                buttonText
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={onSwitch}
            className="text-blue-600 hover:text-blue-700"
            disabled={loading}
          >
            {switchText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;