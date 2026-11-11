'use client';

import { useCallback, useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: ToastItem;
  onClose: (id: string) => void;
  duration?: number;
}

function ToastNode({ toast, onClose, duration = 3200 }: ToastProps) {
  useEffect(() => {
    const exit = setTimeout(() => onClose(toast.id), duration);
    return () => clearTimeout(exit);
  }, [duration, onClose, toast.id]);

  return (
    <div className={`toast toast--${toast.type}`} role="status">
      <span>{toast.message}</span>
      <button type="button" onClick={() => onClose(toast.id)} aria-label="Dismiss">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M2 2l8 8M10 2l-8 8" />
        </svg>
      </button>
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts(prev => [...prev.slice(-2), { id, message, type }]);
  }, []);

  const ToastContainer = useCallback(
    () => (
      <div className="toasts" aria-live="polite">
        {toasts.map(toast => (
          <ToastNode key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    ),
    [toasts, removeToast]
  );

  return { addToast, ToastContainer };
}
