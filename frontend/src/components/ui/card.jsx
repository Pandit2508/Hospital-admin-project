import React from "react";

export function Card({ className = "", children }) {
  return (
    <div
      className={`rounded-2xl shadow-md border border-gray-200 bg-white p-4 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children }) {
  return (
    <div className={`mb-2 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children }) {
  return (
    <h2 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h2>
  );
}

export function CardDescription({ className = "", children }) {
  return (
    <p className={`text-sm text-gray-600 ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ className = "", children }) {
  return (
    <div className={`mt-2 ${className}`}>
      {children}
    </div>
  );
}
