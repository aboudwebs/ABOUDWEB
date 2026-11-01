import React from 'react';

export function Logo({ className = '' }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      className={`h-7 w-7 hover:opacity-80 transition-opacity duration-200 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M50 0 L96.7 100 L83.7 100 L50 28.1 L16.4 100 L3.4 100 Z" />
      <path d="M50 54.8 L73.1 100 L62.8 100 L50 75.6 L37.3 100 L26.9 100 Z" />
    </svg>
  );
}
