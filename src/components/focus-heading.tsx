"use client";

import { useEffect, useRef } from "react";

// A page title that takes focus on load. The page opens by navigation, so a
// keyboard or screen reader user starts at the title, not at the header.
export function FocusHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <h1 ref={ref} tabIndex={-1} className={className}>
      {children}
    </h1>
  );
}
