"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useUserStore } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function AddStockModal({ isOpen, onClose, onSave, selectedInventory }) {
  const { user } = useUserStore();
  const [formData, setFormData] = useState({
    items: "",
    delimiter: "",
    stock_name: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e, opName) => {
    if (opName) {
      setFormData({ ...formData, [opName]: e });
    } else {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: typeof e !== "object" ? e : value,
      }));
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.stock_name.trim())
      newErrors.stock_name = "Stock name is required";
    if (!formData.items) newErrors.items = "Items are required";
    if (!formData.delimiter) newErrors.delimiter = "Delimiter is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form", {
        description: "Some required fields are missing or invalid.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare data for API
      const apiData = {
        delimiter: formData.delimiter,
        name: formData.stock_name,
        items: formData.items,
      };

      await onSave(apiData);
      onClose();
    } catch (error) {
      console.error("Error saving inventory:", error);
      // Error is handled by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        stock_name: "",
        items: "",
        delimiter: "",
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedInventory) {
      console.log(selectedInventory.delimiter);

      setFormData({
        stock_name: selectedInventory.name,
        delimiter: `${selectedInventory.delimiter}`,
        items: "",
      });
    }
  }, [selectedInventory]);

  useEffect(() => {
    if (isOpen) {
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#161616] rounded-xl w-full max-w-[742px] p-6 border border-purple-600">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[2rem] font-bold text-white">
            {selectedInventory ? "Restock Inventory" : "Add Stock"}
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                name="stock_name"
                value={formData.stock_name}
                onChange={handleChange}
                placeholder="Stock Name"
                disabled={selectedInventory !== null}
                className={`w-full bg-[#242424] border ${
                  errors.stock_name ? "border-red-500" : "border-gray-700"
                } rounded-md p-3 text-white placeholder-gray-400`}
              />
              {errors.stock_name && (
                <p className="text-red-500 text-xs mt-1">{errors.stock_name}</p>
              )}
            </div>
            <div>
              <textarea
                className={`w-full bg-[#242424] border ${
                  errors.items ? "border-red-500" : "border-gray-700"
                } rounded-md p-3 text-white placeholder-gray-400`}
                name="items"
                value={formData.items}
                onChange={handleChange}
                placeholder="Items"
              ></textarea>
              {errors.items && (
                <p className="text-red-500 text-xs mt-1">{errors.items}</p>
              )}
            </div>

            {/* Delimiter */}

            <div>
              <Select
                name="delimiter"
                value={formData.delimiter}
                onValueChange={(e) => handleChange(e, "delimiter")}
              >
                <SelectTrigger
                  className={`w-full bg-[#242424] text-base cursor-pointer border ${
                    errors.delimiter ? "border-red-500" : "border-gray-700"
                  } rounded-md p-6 text-white placeholder-gray-400`}
                >
                  <SelectValue placeholder="Select a Delimiter" />
                </SelectTrigger>
                <SelectContent className={"text-white"}>
                  <SelectItem value="all" className={"p-4 text-base"}>
                    all
                  </SelectItem>
                  <SelectItem value="," className={"p-4 text-base"}>
                    ,
                  </SelectItem>
                  <SelectItem value=";" className={"p-4 text-base"}>
                    ;
                  </SelectItem>
                  <SelectItem value={"\n"} className={"p-4 text-base"}>
                    \n
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.delimiter && (
                <p className="text-red-500 text-xs mt-1">{errors.delimiter}</p>
              )}
            </div>
            {/* Form Error */}
            {errors.form && (
              <p className="text-red-500 text-sm">{errors.form}</p>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="btn-gradient-gray text-white py-3 rounded-md hover:bg-gray-600 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-gradient-paint text-white py-3 rounded-md transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
