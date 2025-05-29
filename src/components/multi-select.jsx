import { ChevronDownIcon } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

const MultiSelect = ({
  options,
  selectedValues = [],
  onChange,
  placeholder = "Select...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(selectedValues);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (option) => {
    const isSelected = selected.some((item) => item.value === option.value);
    const newSelected = isSelected
      ? selected.filter((item) => item.value !== option.value)
      : [...selected, option];
    setSelected(newSelected);
    onChange(newSelected);
  };

  const removeTag = (optionToRemove) => {
    const newSelected = selected.filter(
      (option) => option.value !== optionToRemove.value
    );
    setSelected(newSelected);
    onChange(newSelected);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex flex-wrap items-center bg-[#ffffff0d] border rounded p-3 cursor-pointer border-gray-700"
        onClick={toggleDropdown}
      >
        {selected.length > 0 ? (
          selected.map((option) => (
            <span
              key={option.value}
              className="flex items-center bg-gray-200 rounded px-2 m-1"
            >
              {option.label}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(option);
                }}
                className="ml-1 text-blue-500 hover:text-blue-700"
              >
                ×
              </span>
            </span>
          ))
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <span className="ml-auto pl-2">
          <ChevronDownIcon className="size-6" color="#fff" />
        </span>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 border rounded bg-[#1F1F1F] shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleOptionClick(option)}
              className={`p-4 cursor-pointer hover:bg-white hover:text-black  ${
                selected.some((item) => item.value === option.value)
                  ? "bg-gray-100 font-semibold"
                  : "text-white"
              }`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
