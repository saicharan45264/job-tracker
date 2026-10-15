import React from 'react';
import { motion } from 'framer-motion';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  accentColor = 'var(--primary)',
  accentBg = 'var(--primary-subtle)',
  subtitle,
}) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="ct-card d-flex align-items-center justify-content-between h-100"
    >
      <div>
        <p className="text-secondary small fw-medium mb-1 text-uppercase tracking-wider">
          {title}
        </p>
        <h3 className="fw-bold mb-0 text-main display-6 fs-2">{value}</h3>
        {subtitle && <p className="text-muted small mt-1 mb-0">{subtitle}</p>}
      </div>
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          background: accentBg,
          color: accentColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={26} strokeWidth={2.2} />
      </div>
    </motion.div>
  );
};
