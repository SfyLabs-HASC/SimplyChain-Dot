
import React from 'react';

export const NetworkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="7" height="7" rx="2" ry="2" />
    <rect x="15" y="2" width="7" height="7" rx="2" ry="2" />
    <rect x="15" y="15" width="7" height="7" rx="2" ry="2" />
    <rect x="2" y="15" width="7" height="7" rx="2" ry="2" />
    <path d="M5.5 9v4" />
    <path d="M18.5 9v4" />
    <path d="M9 5.5h4" />
    <path d="M9 18.5h4" />
  </svg>
);
