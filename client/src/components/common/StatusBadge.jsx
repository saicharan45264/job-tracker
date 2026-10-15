import React from 'react';
import {
  Bookmark,
  Send,
  FileCheck,
  CalendarCheck,
  Sparkles,
  XCircle,
  CornerUpLeft,
} from 'lucide-react';

const statusIcons = {
  Wishlist: Bookmark,
  Applied: Send,
  Assessment: FileCheck,
  Interview: CalendarCheck,
  Offer: Sparkles,
  Rejected: XCircle,
  Withdrawn: CornerUpLeft,
};

export const StatusBadge = ({ status = 'Applied', size = 'normal' }) => {
  const Icon = statusIcons[status] || Send;
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span className={`badge-status badge-${status} ${size === 'sm' ? 'py-1 px-2 text-xs' : ''}`}>
      <Icon size={iconSize} />
      <span>{status}</span>
    </span>
  );
};
