import React from 'react';

export const LoadingSkeleton = ({ rows = 4, height = 36 }) => {
  return (
    <div className="w-100 py-3">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="placeholder-glow mb-3 rounded"
          style={{ width: '100%', height }}
        >
          <span
            className="placeholder col-12 rounded"
            style={{ height: '100%', background: '#EAEFF8' }}
          ></span>
        </div>
      ))}
    </div>
  );
};
