import React from 'react';

export default function EhrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col">
        {children}
      </div>
    </div>
  );
} 