import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const ConfirmationModal = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Delete',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(3px)' }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
          <div className="modal-body p-4 text-center">
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                background: confirmVariant === 'danger' ? '#FEE2E2' : '#FEF3C7',
                color: confirmVariant === 'danger' ? '#DC2626' : '#D97706',
              }}
            >
              <AlertTriangle size={28} />
            </div>
            <h5 className="fw-bold mb-2 text-main">{title}</h5>
            <p className="text-secondary small mb-4">{message}</p>
            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                className="btn btn-secondary-ct px-4"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn btn-${confirmVariant === 'danger' ? 'danger' : 'primary'} px-4`}
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? 'Processing...' : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
