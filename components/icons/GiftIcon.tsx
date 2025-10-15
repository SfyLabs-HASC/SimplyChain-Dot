import React from 'react';

export const GiftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
    <path fill="#FFFFFF" d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H9L3 7V9H21ZM3 11V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V11H3ZM5 13H7V19H5V13ZM9 13H11V19H9V13ZM13 13H15V19H13V13ZM17 13H19V19H17V13Z"/>
  </svg>
);