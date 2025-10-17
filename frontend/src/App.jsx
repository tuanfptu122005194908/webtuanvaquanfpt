// src/App.jsx

import React, { useState } from "react";

// Hooks
import { useNotification } from "./hooks/useNotification";
import { useAuth } from "./hooks/useAuth";
import { useCart } from "./hooks/useCart";

// Components
import Notification from "./components/common/Notification";
import Header from "./components/Client/Header";
import Footer from "./components/Client/Footer";
import CartModal from "./components/Client/CartModal";
import AuthModal from "./components/Client/AuthModal";
import OrderHistoryModal from "./components/Client/OrderHistoryModal";
import AdminDashboard from "./components/Admin/AdminDashboard";

// Admin Component (Giả định đã có, không cần thay đổi)
import AdminDashboard from "./components/Admin/AdminDashboard"; 

// Sections
import HeroSection from "./sections/HeroSection.jsx"; // SỬA: Thêm .jsx
import CoursesSection from "./sections/CoursesSection.jsx"; // SỬA
import EnglishSection from "./sections/EnglishSection.jsx"; // SỬA
import DocumentsSection from "./sections/DocumentsSection.jsx"; // SỬA
import CourseraSection from "./sections/CourseraSection.jsx"; // SỬA
import ContactSection from "./sections/ContactSection.jsx"; // SỬA


const App = () => {
  // Global States
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Custom Hooks
  const { notification, showNotification, closeNotification } = useNotification();
  const { 
    currentUser, 
    loading: authLoading, 
    handleLogin, 
    handleRegister, 
    handleLogout 
  } = useAuth(showNotification);
  
  const {
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
    setDiscountAmount, 
    setCouponMessage,
  } = useCart(showNotification);


  // Wrapper for Auth Handlers
  const loginWrapper = async (e) => {
    const { success } = await handleLogin(e);
    if (success) setShowLogin(false);
  }

  const registerWrapper = async (e) => {
    const { success } = await handleRegister(e);
    if (success) setShowRegister(false);
  }


  // Render Admin Dashboard
  if (showAdminDashboard) {
    return (
      <AdminDashboard 
        onBackToMain={() => setShowAdminDashboard(false)} 
        showNotification={showNotification} 
      />
    );
  }

  // Render Client App
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      
      {/* 1. Global Notification */}
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={closeNotification} 
      />
      
      {/* 2. Header */}
      <Header
        currentUser={currentUser}
        handleLogout={handleLogout}
        cartLength={cart.length}
        setShowCart={setShowCart}
        setShowLogin={setShowLogin}
        setShowOrderHistory={setShowOrderHistory}
        setShowAdminDashboard={setShowAdminDashboard}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* 3. Main Content Sections */}
      <HeroSection />
      <CoursesSection addToCart={addToCart} />
      <EnglishSection addToCart={addToCart} />
      <DocumentsSection addToCart={addToCart} />
      <CourseraSection addToCart={addToCart} showNotification={showNotification} />
      <ContactSection />
      
      {/* 4. Footer */}
      <Footer />

      {/* 5. Modals */}
      {showCart && (
        <CartModal
          cart={cart}
          removeFromCart={removeFromCart}
          totalPrice={totalPrice}
          finalPrice={finalPrice}
          discountAmount={discountAmount}
          couponCode={couponCode}
          couponMessage={couponMessage}
          couponLoading={couponLoading}
          isSubmitting={isSubmitting}
          setCouponCode={setCouponCode}
          handleApplyCoupon={handleApplyCoupon}
          handleCheckout={handleCheckout}
          currentUser={currentUser}
          setShowCart={setShowCart}
          setShowLogin={setShowLogin}
        />
      )}

      {showLogin && (
        <AuthModal
          type="login"
          onClose={() => setShowLogin(false)}
          onSwitch={() => { setShowLogin(false); setShowRegister(true); }}
          onSubmit={loginWrapper}
          loading={authLoading}
        />
      )}

      {showRegister && (
        <AuthModal
          type="register"
          onClose={() => setShowRegister(false)}
          onSwitch={() => { setShowRegister(false); setShowLogin(true); }}
          onSubmit={registerWrapper}
          loading={authLoading}
        />
      )}
      
      {showOrderHistory && currentUser && (
        <OrderHistoryModal 
          userId={currentUser.id} 
          onClose={() => setShowOrderHistory(false)} 
          showNotification={showNotification} 
        />
      )}
    </div>
  );
};

export default App;