// src/components/Client/Header.jsx

import React from "react";
import { ShoppingCart, LogOut, Menu, X, Book, ShoppingBag, BarChart3 } from '../common/Icon';

const Header = ({ 
  currentUser, 
  handleLogout, 
  cartLength, 
  setShowCart, 
  setShowLogin, 
  setShowOrderHistory, 
  setShowAdminDashboard,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  const navItems = [
    { name: "Khóa học", id: "courses" },
    { name: "Tiếng Anh", id: "english" },
    { name: "Tài liệu", id: "documents" },
    { name: "Coursera", id: "coursera" },
    { name: "Liên hệ", id: "contact" },
  ];

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setMobileMenuOpen(false);
  };

  return (
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
            {navItems.map((item, idx) => (
              <a
                key={idx}
                href={`#${item.id}`}
                onClick={(e) => { e.preventDefault(); scrollToSection(item.id); }}
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
              {cartLength > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {cartLength}
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
            {navItems.map((item, idx) => (
              <a
                key={idx}
                href={`#${item.id}`}
                onClick={(e) => { e.preventDefault(); scrollToSection(item.id); }}
                className="block text-gray-700 hover:text-blue-600 py-2 font-medium"
              >
                {item.name}
              </a>
            ))}
            <button
              onClick={() => { setShowAdminDashboard(true); setMobileMenuOpen(false); }}
              className="w-full text-left text-gray-700 hover:text-blue-600 py-2 font-medium"
            >
              Admin
            </button>
            {/* Cart button for mobile */}
            <button
              onClick={() => { setShowCart(true); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-between bg-gray-100 px-4 py-3 rounded-lg hover:bg-gray-200 transition"
            >
              <span className="font-medium text-gray-700">Giỏ hàng</span>
              <div className="flex items-center space-x-2">
                {cartLength > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {cartLength}
                  </span>
                )}
                <ShoppingCart className="w-5 h-5 text-gray-700" />
              </div>
            </button>
            {/* User section for mobile */}
            {currentUser ? (
              <div className="space-y-2">
                <button
                  onClick={() => { setShowOrderHistory(true); setMobileMenuOpen(false); }}
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
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="p-2 hover:bg-gray-200 rounded-lg transition"
                  >
                    <LogOut className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setShowLogin(true); setMobileMenuOpen(false); }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-md transition transform hover:-translate-y-0.5"
              >
                Đăng nhập
              </button>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;