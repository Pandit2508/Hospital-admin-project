import React from "react";
import clsx from "clsx";

/**
 * Button Component
 * 
 * Props:
 * - variant: "default" | "outline" | "destructive" | "ghost"
 * - size: "sm" | "md" | "lg"
 * - className: string (extra Tailwind classes)
 * - onClick: function
 * - children: content inside the button
 */

export const Button = ({
  children,
  variant = "default",
  size = "md",
  className = "",
  onClick,
  ...props
}) => {
  const baseStyles =
    "font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    default:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-300",
    destructive:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost:
      "text-gray-600 hover:bg-gray-100 focus:ring-gray-200",
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const classes = clsx(baseStyles, variants[variant], sizes[size], className);

  return (
    <button onClick={onClick} className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;
