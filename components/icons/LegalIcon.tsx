import React from 'react';

export const LegalIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2a1 1 0 0 1 1 1v2h4a1 1 0 1 1 0 2h-4v6.268a3 3 0 1 1-2 0V7H7a1 1 0 1 1 0-2h4V3a1 1 0 0 1 1-1Z"/>
    <path d="M6 20a1 1 0 0 1-1-1v-2h14v2a1 1 0 0 1-1 1H6Z"/>
  </svg>
);

