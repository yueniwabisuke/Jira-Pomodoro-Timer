import React from 'react';

const RefreshIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21.5 2v6h-6" />
    <path d="M2.5 22v-6h6" />
    <path d="M2 12a10 10 0 0 1 10-10c4.4 0 8.1 2.8 9.5 6.7" />
    <path d="M22 12a10 10 0 0 1-10 10c-4.4 0-8.1-2.8-9.5-6.7" />
  </svg>
);

export default RefreshIcon;
