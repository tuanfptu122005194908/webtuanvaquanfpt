// src/hooks/useNotification.js

import { useState } from "react";

export const useNotification = () => {
  const [notification, setNotification] = useState({ message: "", type: "" });

  const showNotification = (message, type = "info", duration = 3000) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, duration);
  };

  const closeNotification = () => {
    setNotification({ message: "", type: "" });
  };

  return {
    notification,
    showNotification,
    closeNotification,
  };
};
