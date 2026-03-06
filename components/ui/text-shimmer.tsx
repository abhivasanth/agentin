import type { CSSProperties } from "react";

interface TextShimmerProps {
  children: string;
  className?: string;
  duration?: number;
}

export function TextShimmer({ children, className = "", duration = 1 }: TextShimmerProps) {
  return (
    <span
      className={`inline-block bg-clip-text text-transparent bg-[length:250%_100%] ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(90deg, var(--base-color, #8b949e) 0%, var(--base-gradient-color, #f0f6fc) 50%, var(--base-color, #8b949e) 100%)",
        animation: `shimmer ${duration}s linear infinite`,
      } as CSSProperties}
    >
      {children}
    </span>
  );
}
