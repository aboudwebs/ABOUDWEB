import React from 'react';

export function Logo({ className = '' }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      className={`h-7 w-7 hover:opacity-80 transition-opacity duration-200 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M46.73 100L5.7 76.31L5.7 23.71L18.16 16.51L18.16 69.12L23.02 71.92L23.02 13.66L46.68 0L87.65 23.65L87.65 76.25L80.83 80.18L75.19 74.54L75.19 30.75L46.66 14.28L35.27 20.86L35.27 26.43L46.67 19.85L70.33 33.51L70.33 69.68L58.08 57.43L58.08 46.42A11.41 11.41 0 0 0 46.67 35.01A11.41 11.41 0 0 0 35.27 46.42L35.27 79.03L46.66 85.61L52.48 82.25L61.63 91.4Z" />
      <path d="M39.17 62.39L56.71 62.39L94.3 99.99L76.77 99.99Z" />
    </svg>
  );
}
