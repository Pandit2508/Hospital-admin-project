import React from "react";

const Textarea = React.forwardRef(({ className = "", ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={`w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-900 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[120px] resize-y ${className}`}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };
