import React from 'react';

export const PageHeader = ({ title, subtitle, children }) => {
  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
      <div>
        <h2 className="fw-bold mb-1 text-main fs-3 tracking-tight">{title}</h2>
        {subtitle && <p className="text-secondary small mb-0">{subtitle}</p>}
      </div>
      {children && <div className="d-flex align-items-center gap-2 flex-wrap">{children}</div>}
    </div>
  );
};
