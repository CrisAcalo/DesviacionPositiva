import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            {/* Three ascending bars: at-risk → medium → high */}
            <rect x="2" y="28" width="8" height="10" rx="1.5" fill="currentColor" />
            <rect x="15" y="20" width="8" height="18" rx="1.5" fill="currentColor" />
            <rect x="28" y="12" width="8" height="26" rx="1.5" fill="currentColor" />
            {/* Upward arrow launching from the tallest bar — positive deviation */}
            <path
                d="M32 2 L39 12 H25 Z"
                fill="currentColor"
            />
        </svg>
    );
}
