// src/hooks/useCart.js

import { useState } from "react";
import { API_URL } from "../constants";

export const useCart = (showNotification) => {
  const [cart, setCart] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
  const finalPrice = Math.max(0, totalPrice - discountAmount);

  const addToCart = (item) => {
    setCart([...cart, item]);
    showNotification(`Đã thêm ${item.name} vào giỏ hàng!`, "success");
    setDiscountAmount(0); // Reset coupon
    setCouponMessage("");
    setCouponCode("");
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    setDiscountAmount(0); // Reset coupon
    setCouponMessage("");
    setCouponCode("");
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode) return;

    setCouponLoading(true);
    setDiscountAmount(0);
    setCouponMessage("");

    try {
      const response = await fetch(`${API_URL}/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponCode }),
      });
      const data = await response.json();
      const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

      if (data.success) {
        const minTotal = data.discount;
        if (cartTotal < minTotal) {
          setCouponMessage(
            `❌ Mã này chỉ áp dụng cho đơn hàng trên ${minTotal.toLocaleString()}đ.`
          );
          setDiscountAmount(0);
          showNotification(
            `Mã cần đơn hàng tối thiểu ${minTotal.toLocaleString()}đ.`,
            "warning"
          );
        } else {
          setDiscountAmount(data.discount);
          setCouponMessage(data.message);
          showNotification(data.message, "success");
        }
      } else {
        setCouponMessage(data.message);
        showNotification(data.message || "Mã giảm giá không hợp lệ.", "error");
      }
    } catch (error) {
      console.error("Coupon error:", error);
      setCouponMessage("Lỗi kết nối khi kiểm tra mã.");
      showNotification("Lỗi kết nối khi kiểm tra mã.", "error");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = async (e, currentUser, onOrderSuccess) => {
    e.preventDefault();

    if (!currentUser) {
      showNotification("Vui lòng đăng nhập để thanh toán!", "warning");
      return;
    }

    if (cart.length === 0) {
      showNotification("Giỏ hàng trống, không thể thanh toán!", "warning");
      return;
    }

    setIsSubmitting(true);

    const orderData = {
      userId: currentUser.id,
      items: [...cart],
      customerInfo: {
        name: e.target.customerName.value,
        phone: e.target.phone.value,
        email: e.target.customerEmail.value,
        note: e.target.note.value,
      },
      total: finalPrice,
      discountAmount: discountAmount,
      couponCode: discountAmount > 0 ? couponCode : null,
    };

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        setCart([]);
        setDiscountAmount(0);
        setCouponCode("");
        setCouponMessage("");
        showNotification(
          "Đơn hàng đã được tạo thành công! Vui lòng kiểm tra email.",
          "success"
        );
        onOrderSuccess(); // Callback để đóng modal giỏ hàng
      } else {
        showNotification(data.message || "Tạo đơn hàng thất bại!", "error");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      showNotification("Lỗi kết nối server!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    cart,
    totalPrice,
    finalPrice,
    discountAmount,
    couponCode,
    couponMessage,
    couponLoading,
    isSubmitting,
    addToCart,
    removeFromCart,
    handleApplyCoupon,
    handleCheckout,
    setCouponCode,
    setDiscountAmount, // Để AdminDashboard có thể reset
    setCouponMessage, // Để AdminDashboard có thể reset
  };
};
