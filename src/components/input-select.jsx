import { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ChevronDown, Loader2, X } from "lucide-react";
import api from "@/lib/api";

export function InputSelect({
  apiUrl,
  labelKey,
  valueKey,
  value,
  onChange,
  placeholder = "Select...",
  debounceTime = 300,
  enableSearch = true,
  disabled = false,
  error,
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef();
  const inputRef = useRef(null);

  // Focus input when popover opens (if not disabled)
  useEffect(() => {
    if (open && inputRef.current && !disabled) {
      inputRef.current.focus();
    } else if (disabled) {
      setOpen(false);
    }
  }, [open, disabled]);

  // Fetch items from API
  useEffect(() => {
    if (!open || disabled) return;

    const fetchItems = async () => {
      try {
        setLoading(true);
        const url =
          enableSearch && searchTerm
            ? `${apiUrl}${
                apiUrl.includes("?") ? "&" : "?"
              }query=${encodeURIComponent(searchTerm)}`
            : apiUrl;

        const response = await api.get(url);
        const responseData = await response.data;

        if (responseData?.body?.data) {
          setItems(responseData.body.data);
        } else {
          setItems([]);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the API call only if search is enabled
    if (enableSearch) {
      debounceTimer.current = setTimeout(fetchItems, debounceTime);
    } else {
      fetchItems();
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchTerm, open, apiUrl, debounceTime, enableSearch, disabled]);

  const handleInputChange = (e) => {
    if (enableSearch && !disabled) {
      setSearchTerm(e.target.value);
      if (!open) setOpen(true);
    }
  };

  const handleSelectItem = (item) => {
    if (!disabled) {
      onChange(item);
      setSearchTerm("");
      setOpen(false);
    }
  };

  const handleClearSelection = (e) => {
    e.stopPropagation();
    if (!disabled) {
      onChange(null);
      setSearchTerm("");
      setOpen(false);
    }
  };

  const handleTriggerClick = () => {
    if (!disabled) {
      setOpen(true);
    }
  };

  const displayValue =
    open && enableSearch ? searchTerm : value?.[labelKey] || "";

  return (
    <Popover
      open={open && !disabled}
      onOpenChange={(open) => !disabled && setOpen(open)}
    >
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            ref={inputRef}
            value={displayValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            onClick={handleTriggerClick}
            readOnly={!enableSearch || disabled}
            disabled={disabled}
            className={`h-[51px] !text-base text-white border-gray-700 bg-[#242424] px-6 pr-10 ${
              !enableSearch || disabled ? "cursor-pointer" : "cursor-text"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <div className="absolute right-6 top-[50%] -translate-y-[50%] flex items-center gap-1">
            {value && !disabled && (
              <X
                color="#fff"
                className="h-4 w-4 cursor-pointer hover:opacity-80"
                onClick={handleClearSelection}
              />
            )}
            <ChevronDown
              color="#fff"
              className={`h-4 w-4 ${disabled ? "opacity-50" : ""}`}
            />
          </div>
        </div>
      </PopoverTrigger>
      {!disabled && (
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0 bg-[#242424] border-gray-700"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
              <span className="text-white">Loading...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="p-4 text-sm text-gray-400">
              {enableSearch && searchTerm
                ? "No matches found"
                : "No options available"}
            </div>
          ) : (
            <ul className="max-h-60 overflow-auto">
              {items.map((item) => (
                <li
                  key={item?.[valueKey]}
                  className="cursor-pointer px-4 py-2 hover:bg-[#333] text-white"
                  onClick={() => handleSelectItem(item)}
                >
                  {item?.[labelKey]}
                </li>
              ))}
            </ul>
          )}
        </PopoverContent>
      )}
    </Popover>
  );
}
