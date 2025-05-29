import React from "react";

const Spinner = ({
  size = "md",
  color = "border-blue-500",
  className = "",
}) => {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-10 w-10",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-4 border-t-transparent ${sizeMap[size]} ${color}`}
      ></div>
    </div>
  );
};

export default Spinner;
