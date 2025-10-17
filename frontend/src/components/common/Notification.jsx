// src/components/common/Notification.jsx (CẬP NHẬT)

import React from 'react';
// Thay thế import từ 'lucide-react'
import { X, Check, XCircle, AlertTriangle, Info } from './Icon';

const Notification = ({ message, type, onClose }) => {
    // ... (logic giữ nguyên)
    if (!message) return null;

    const typeConfig = {
        success: { bg: "bg-green-500", icon: Check, title: "Thành công" },
        error: { bg: "bg-red-500", icon: XCircle, title: "Lỗi" },
        warning: { bg: "bg-yellow-500", icon: AlertTriangle, title: "Cảnh báo" },
        info: { bg: "bg-blue-500", icon: Info, title: "Thông báo" },
    };
    // ... (phần còn lại giữ nguyên)
    return (
        <div 
        // ... (phần còn lại giữ nguyên)
        >
            <div className="p-4 flex items-start text-white">
                <div className="flex-shrink-0 pt-0.5"><Icon className="h-6 w-6" /></div>
                <div className="ml-3 w-0 flex-1 pt-0.5"><p className="text-sm font-medium">{config.title}</p><p className="mt-1 text-sm">{message}</p></div>
                <div className="ml-4 flex-shrink-0 flex">
                    <button 
                        type="button" 
                        className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2" 
                        onClick={onClose}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Notification;