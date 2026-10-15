import React from 'react';
import { FolderOpen } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No records found',
  description = 'There are no items to display matching your criteria.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="ct-card text-center py-5 my-3 d-flex flex-column align-items-center justify-content-center">
      <div
        className="mb-3 d-flex align-items-center justify-content-center"
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'var(--primary-subtle)',
          color: 'var(--primary)',
        }}
      >
        <Icon size={32} />
      </div>
      <h5 className="fw-bold mb-1 text-main">{title}</h5>
      <p className="text-secondary small mb-3 max-w-sm" style={{ maxWidth: 420 }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary-ct btn-sm">
          {actionLabel}
        </button>
      )}
    </div>
  );
};
