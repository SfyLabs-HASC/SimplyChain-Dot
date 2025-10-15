
import React from 'react';

export const PuzzleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 7V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h2" />
    <path d="M14 12v2h2c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2h-2v2z" />
    <path d="M20 12h2v2c0 1.1-.9 2-2 2h-2v-2h2z" />
    <path d="M12 14h-2v2h2c1.1 0 2 .9 2 2v2c0 1.1.9 2 2 2h2v-2h-2c-1.1 0-2-.9-2-2v-2z" />
    <path d="M8 12H6v2c0 1.1.9 2 2 2h2v-2H8z" />
  </svg>
);
