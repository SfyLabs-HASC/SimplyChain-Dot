import React from 'react';

export const AgentIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm-7 16a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-2Zm14 0h2v2h-2v-2ZM3 18h2v2H3v-2Z"/>
  </svg>
);

