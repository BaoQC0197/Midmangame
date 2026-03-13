import React from 'react';

interface LogoProps {
    size?: number;
    className?: string;
    style?: React.CSSProperties;
}

export default function Logo({ size = 24, className, style }: LogoProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={style}
        >
            {/* Outline Shield Shape */}
            <path
                d="M12 2L4 5V11C4 16.1 7.4 20.8 12 22C16.6 20.8 20 16.1 20 11V5L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Stylized 'E' */}
            <path
                d="M14 8H9V12H13M9 12V16H14"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.95"
            />
            {/* Stylized 'T' integrated into center line */}
            <path
                d="M12 8V16M8 8H16"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="1"
                style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.3))' }}
            />
        </svg>
    );
}
