import React from 'react';
import { ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';

const priorityIcons = {
  High: ArrowUp,
  Medium: ArrowRight,
  Low: ArrowDown,
};

export const PriorityBadge = ({ priority = 'Medium', size = 'normal' }) => {
  const Icon = priorityIcons[priority] || ArrowRight;
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className={`badge-status badge-priority-${priority} ${
        size === 'sm' ? 'py-1 px-2 text-xs' : ''
      }`}
    >
      <Icon size={iconSize} />
      <span>{priority}</span>
    </span>
  );
};
