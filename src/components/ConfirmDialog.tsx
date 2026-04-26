import React from 'react';
import '../pages/labs/LabsLayout.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

const AlertTriangleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="labs-modal-overlay" onClick={onClose}>
      <div className="labs-modal labs-modal-confirm" onClick={(e) => e.stopPropagation()}>
        <div className="labs-modal-confirm-icon">
          <AlertTriangleIcon />
        </div>
        
        <h2 className="labs-modal-confirm-title">{title}</h2>
        <p className="labs-modal-confirm-message">{message}</p>
        
        <div className="labs-modal-footer">
          <button
            type="button"
            className="labs-modal-btn labs-modal-btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="labs-modal-btn labs-modal-btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
