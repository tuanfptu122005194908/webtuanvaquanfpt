// src/components/Client/CartModal.jsx

import React from "react";
import { X, RefreshCw, ShoppingCart } from "../common/Icon";
import QR from "../../assets/images/QR.png"; // Import QR code image

const CartModal = ({
  cart,
  removeFromCart,
  totalPrice,
  finalPrice,
  discountAmount,
  couponCode,
  couponMessage,
  couponLoading,
  isSubmitting,
  setCouponCode,
  handleApplyCoupon,
  handleCheckout,
  currentUser,
  setShowCart,
  setShowLogin
}) => {

  const handleCheckoutWrapper = (e) => {
    const onOrderSuccess = () => setShowCart(false);
    handleCheckout(e, currentUser, onOrderSuccess);
  };
  
  if (!cart) return null;

  return (
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

              {/* FORM NHẬP MÃ GIẢM GIÁ */}
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

              {/* TỔNG KẾT VÀ TÍNH TOÁN CUỐI CÙNG */}
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

              {/* Form Checkout */}
              <form onSubmit={handleCheckoutWrapper} className="space-y-4">
                <h4 className="font-semibold text-lg text-gray-800 mb-4">
                  Thông tin khách hàng
                </h4>

                <input
                  type="text"
                  name="customerName"
                  placeholder="Họ và tên *"
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  defaultValue={currentUser ? currentUser.name : ''}
                  disabled={isSubmitting}
                />

                <input
                  type="tel"
                  name="phone"
                  placeholder="Số điện thoại *"
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                />

                <input
                  type="email"
                  name="customerEmail"
                  placeholder="Email *"
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  defaultValue={currentUser ? currentUser.email : ''}
                  disabled={isSubmitting}
                />

                <textarea
                  name="note"
                  placeholder="Ghi chú (không bắt buộc)"
                  rows="3"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
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
                  disabled={isSubmitting || cart.length === 0}
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
  );
};

export default CartModal;