import React from 'react';

export default function Logo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Hexagon Shape */}
        <path
          d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
          fill="#FFC72C"
        />
        {/* Brackets */}
        <text
          x="50"
          y="62"
          textAnchor="middle"
          fontSize="45"
          fontWeight="bold"
          fill="black"
          fontFamily="monospace"
        >
          {"{ }"}
        </text>
      </svg>
    </div>
  );
}
